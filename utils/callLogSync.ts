import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addCallRaw, fetchRawLeads } from '@/services/api/call';

// react-native-call-log is a native module — not available in Expo Go.
// Use a safe dynamic require to avoid crashing the bundle.
let CallLogs: any = null;
try {
  CallLogs = require('react-native-call-log').default ?? require('react-native-call-log');
} catch {
  CallLogs = null;
}


const LAST_SYNC_KEY = '@last_call_log_sync_time';

/**
 * Normalizes phone numbers to compare them accurately.
 * Extracts only digits and takes the last 10 digits to match.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Request READ_CALL_LOG permission on Android.
 */
export async function requestCallLogPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  try {
    const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
    );
    if (isGranted) {
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      {
        title: 'Call Log Permission Required',
        message: 'This app needs access to your call logs to automatically sync client interactions with leads.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('[CallLogSync] Permission request failed:', err);
    return false;
  }
}

/**
 * Reads call logs from the device and syncs new call logs of matching leads to the server.
 */
export async function syncDeviceCallLogs(): Promise<void> {
  if (Platform.OS !== 'android') {
    console.log('[CallLogSync] Skipping: Call log sync is only supported on Android.');
    return;
  }

  // Ensure permission is granted
  const hasPermission = await requestCallLogPermission();
  if (!hasPermission) {
    console.log('[CallLogSync] Skipping: Permission denied.');
    return;
  }

  try {
    console.log('[CallLogSync] Checking for sync...');
    
    // Fetch last sync timestamp
    const lastSyncTimeStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
    // If no last sync time, sync from the past 7 days by default to avoid syncing thousands of historic logs
    const defaultSince = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const lastSyncTime = lastSyncTimeStr ? parseInt(lastSyncTimeStr, 10) : defaultSince;

    console.log(`[CallLogSync] Syncing calls since: ${new Date(lastSyncTime).toLocaleString()}`);

    // Fetch leads to match against
    const leadsResponse = await fetchRawLeads();
    const leads = (leadsResponse as any)?.data || leadsResponse || [];
    
    if (!Array.isArray(leads) || leads.length === 0) {
      console.log('[CallLogSync] No leads found to sync call logs for.');
      return;
    }

    // Build normalized phone number map: normalizedPhone -> Lead object
    const leadMap = new Map<string, any>();
    leads.forEach((lead: any) => {
      const rawPhone = lead.phone || lead.mobile;
      if (rawPhone) {
        const normalized = normalizePhone(rawPhone);
        if (normalized && normalized.length >= 7) {
          leadMap.set(normalized, lead);
        }
      }
    });

    // Read device call logs
    if (!CallLogs || typeof CallLogs.loadAll !== 'function') {
      console.log('[CallLogSync] react-native-call-log native module is not available.');
      return;
    }
    const logs = await CallLogs.loadAll();
    if (!Array.isArray(logs)) {
      console.log('[CallLogSync] No device call logs returned or incorrect format.');
      return;
    }

    // Filter logs that are new (timestamp > lastSyncTime) and belong to our leads
    const matchingLogs = logs.filter((log: any) => {
      const logTimestamp = log.timestamp ? parseInt(log.timestamp, 10) : 0;
      if (logTimestamp <= lastSyncTime) {
        return false;
      }
      
      const normalizedLogPhone = normalizePhone(log.phoneNumber);
      return leadMap.has(normalizedLogPhone);
    });

    console.log(`[CallLogSync] Found ${matchingLogs.length} new matching call logs to upload.`);

    if (matchingLogs.length === 0) {
      // Even if no matching logs, update sync time to avoid re-scanning older logs
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      return;
    }

    // Sync each log sequentially to prevent race conditions or heavy load
    let successCount = 0;
    for (const log of matchingLogs) {
      const normalizedLogPhone = normalizePhone(log.phoneNumber);
      const lead = leadMap.get(normalizedLogPhone);
      
      try {
        const logTimestamp = log.timestamp ? parseInt(log.timestamp, 10) : Date.now();
        
        // Determine type
        let type = 'Incoming';
        if (log.type === 'OUTGOING' || log.type === 'Outgoing') {
          type = 'Outgoing';
        } else if (log.type === 'MISSED' || log.type === 'Missed') {
          type = 'Missed';
        }

        const callPayload = {
          type,
          duration_seconds: log.duration ? parseInt(String(log.duration), 10) : 0,
          call_start_time: new Date(logTimestamp).toISOString(),
          name: lead.name || log.name || 'Call Log',
          remarks: `Auto synced device call log (${type})`,
          is_auto_logged: true,
        };

        const normalizedPayload = normalizeCallPayload(lead.id, callPayload);
        await addCallRaw(lead.id, normalizedPayload);
        successCount++;
      } catch (err) {
        console.error(`[CallLogSync] Failed to upload call log for lead ${lead.id}:`, err);
      }
    }

    console.log(`[CallLogSync] Successfully synced ${successCount}/${matchingLogs.length} call logs.`);

    // Save current time as last synced time
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error('[CallLogSync] Error during call log syncing:', error);
  }
}

/**
 * Normalizes call payload structure for the backend API.
 */
export function normalizeCallPayload(leadId: string, data: any) {
  let call_type = 'INBOUND';
  if (data.type === 'Incoming' || data.call_type === 'INBOUND') call_type = 'INBOUND';
  else if (data.type === 'Outgoing' || data.call_type === 'OUTBOUND') call_type = 'OUTBOUND';
  else if (data.type === 'Missed' || data.call_type === 'MISSED') call_type = 'MISSED';

  let duration_seconds = 0;
  if (data.duration) {
    const parts = data.duration.split(':');
    if (parts.length === 2) {
      duration_seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
  } else if (data.duration_seconds !== undefined) {
    duration_seconds = data.duration_seconds;
  }

  const payload: any = {
    lead_id: leadId,
    call_type,
    call_start_time: data.call_start_time || new Date().toISOString(),
    duration_seconds,
    subject: data.name || data.subject || 'Call log',
    remarks: data.remarks || '',
    is_auto_logged: !!data.is_auto_logged,
  };

  if (data.recordingUrl || data.recording_url) {
    payload.recording_url = data.recordingUrl || data.recording_url;
  }

  return payload;
}
