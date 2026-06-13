import { MeetingRecord, updateMeetingsState } from '@/components/MeetingState';
import { getLeads } from '@/services/api/leads';
import { createMeeting, deleteMeeting, getMeetings, updateMeeting } from '@/services/api/meeting';
import { MeetingStatus } from '@/types/meeting';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const mapToMeetingRecord = (item: any): MeetingRecord => {
  // Parse scheduled_at
  const dateObj = item.scheduled_at ? new Date(item.scheduled_at) : new Date();
  
  // Format fromTime and toTime
  const fromTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  // Set toTime as 1 hour later
  const toDateObj = new Date(dateObj);
  toDateObj.setHours(toDateObj.getHours() + 1);
  const toTime = toDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Format scheduled date display (human-readable)
  const scheduledAt = item.scheduled_at
    ? dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  // YYYY-MM-DD string for date comparison (local time, not UTC)
  const pad = (n: number) => String(n).padStart(2, '0');
  const scheduledDate = item.scheduled_at
    ? `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`
    : '';

  let status: MeetingStatus = 'Pending';
  if (item.status === 'COMPLETED') status = 'Complete';
  else if (item.status === 'IN_PROGRESS' || item.status === 'RESCHEDULED') status = 'In-Process';

  return {
    id: String(item.id || ''),
    title: item.purpose || item.follow_up_method || 'Follow-up',
    venue: item.remarks || '',
    location: item.follow_up_method || 'Hybrid',
    isAllDay: false,
    fromTime,
    toTime,
    host: item.assigned_to_name || item.lead_name || '',
    status,
    notes: item.remarks ? [item.remarks] : [],
    attachments: [],
    createdTime: item.created_at || '',
    modifiedTime: item.updated_at || '',
    // Extra fields
    purpose: item.purpose || '',
    method: item.follow_up_method || '',
    scheduledAt,
    scheduledDate,
    leadId: item.lead_id ? String(item.lead_id) : undefined,
  };
};

// ── READ (fetch from backend & sync to local state) ────────────────
export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: () => [...meetingKeys.lists()] as const,
  meetingFilter: (dateParam?: string, leadId?: string) => [...meetingKeys.lists(), dateParam, leadId] as const,
};

export function useMeetings(selectedDate?: Date, leadId?: string) {
  // Format selected date as YYYY-MM-DD using LOCAL time (not UTC)
  // Using toISOString() would shift the date for IST/non-UTC timezones
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateParam = selectedDate
    ? `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`
    : undefined;

  const query = useQuery({
    queryKey: meetingKeys.meetingFilter(dateParam, leadId),
    queryFn: async () => {
      // Send date param to backend so it can filter server-side
      const apiParams: any = {};
      if (dateParam) apiParams.startDate = dateParam;
      if (leadId) apiParams.lead_id = leadId;
      const response: any = await getMeetings(apiParams);

      let rawData: any[] = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (Array.isArray(response?.data)) {
        rawData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        rawData = response.data.data;
      } else if (Array.isArray(response?.followups)) {
        rawData = response.followups;
      } else if (Array.isArray(response?.results)) {
        rawData = response.results;
      }

      const mapped = rawData.map(mapToMeetingRecord);

      // Client-side date filter (fallback if backend doesn't filter by date)
      if (dateParam) {
        return mapped.filter((m) => m.scheduledDate === dateParam);
      }
      return mapped;
    }
  });

  const meetings = query.data || [];

  useEffect(() => {
    if (query.data) {
      updateMeetingsState(query.data);
    }
  }, [query.data]);

  return {
    meetings,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

// ── CREATE meeting ─────────────────────────────────────────────
export function useCreateMeeting() {
  const queryClient = useQueryClient();

  const mutateAsync = async (data: Partial<MeetingRecord> & { leadId?: string }) => {
    let targetLeadId = data.leadId;
    if (!targetLeadId) {
      try {
        const leadsRes = await getLeads({ limit: 1 });
        const firstLead = Array.isArray(leadsRes) ? leadsRes[0] : (leadsRes?.data?.[0] || leadsRes?.data?.data?.[0]);
        if (firstLead) {
          targetLeadId = firstLead.id;
        }
      } catch (err) {
        console.error('Failed to get fallback lead:', err);
      }
    }
    if (!targetLeadId) {
      throw new Error('A valid Lead ID is required to create a meeting.');
    }

    let scheduledAtStr = new Date().toISOString();
    if (data.fromTime) {
      try {
        const timePart = data.fromTime;
        const [time, ampm] = timePart.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (ampm?.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (ampm?.toLowerCase() === 'am' && hours === 12) hours = 0;
        
        const scheduledDate = new Date();
        scheduledDate.setHours(hours, minutes, 0, 0);
        scheduledAtStr = scheduledDate.toISOString();
      } catch (e) {
        scheduledAtStr = new Date().toISOString();
      }
    }

    // Support explicit backend fields passed via underscore-prefixed keys
    const d = data as any;
    const payload = {
      scheduled_at: d._scheduledAt || scheduledAtStr,
      follow_up_method: d._followUpMethod || data.location || 'Online',
      status: d._status || 'SCHEDULED',
      purpose: d._purpose || data.title || '',
      remarks: d._remarks || data.venue || '',
    };

    const res = await createMeeting(targetLeadId, payload);
    queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    return res;
  };

  return { mutateAsync, isPending: false };
}

// ── UPDATE meeting ─────────────────────────────────────────────
export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  const mutateAsync = async ({ id, data }: { id: string; data: Partial<MeetingRecord> & { leadId?: string } }) => {
    let targetLeadId = data.leadId;
    if (!targetLeadId) {
      try {
        const leadsRes = await getLeads({ limit: 1 });
        const firstLead = Array.isArray(leadsRes) ? leadsRes[0] : (leadsRes?.data?.[0] || leadsRes?.data?.data?.[0]);
        if (firstLead) {
          targetLeadId = firstLead.id;
        }
      } catch (err) {
        console.error('Failed to get fallback lead:', err);
      }
    }
    if (!targetLeadId) {
      throw new Error('A valid Lead ID is required to update a meeting.');
    }

    const payload: any = {};
    if (data.title !== undefined) payload.purpose = data.title;
    if (data.venue !== undefined) payload.remarks = data.venue;
    if (data.location !== undefined) payload.follow_up_method = data.location;
    if (data.status !== undefined) {
      payload.status = data.status === 'Complete' ? 'COMPLETED' : 'SCHEDULED';
    }

    if (data.fromTime) {
      try {
        const timePart = data.fromTime;
        const [time, ampm] = timePart.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (ampm?.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (ampm?.toLowerCase() === 'am' && hours === 12) hours = 0;
        
        const scheduledDate = new Date();
        scheduledDate.setHours(hours, minutes, 0, 0);
        payload.scheduled_at = scheduledDate.toISOString();
      } catch (e) {
        // Keep existing
      }
    }

    const res = await updateMeeting(targetLeadId, id, payload);
    queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    return res;
  };

  return { mutateAsync, isPending: false };
}

// ── DELETE meeting ─────────────────────────────────────────────
export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  const mutateAsync = async (id: string) => {
    let targetLeadId = '';
    try {
      const leadsRes = await getLeads({ limit: 1 });
      const firstLead = Array.isArray(leadsRes) ? leadsRes[0] : (leadsRes?.data?.[0] || leadsRes?.data?.data?.[0]);
      if (firstLead) {
        targetLeadId = firstLead.id;
      }
    } catch (err) {
      console.error('Failed to get fallback lead:', err);
    }
    
    if (!targetLeadId) {
      throw new Error('A valid Lead ID is required to delete a meeting.');
    }

    await deleteMeeting(targetLeadId, id);
    queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
  };

  return { mutateAsync, isPending: false };
}
