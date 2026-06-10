import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchRawLeads, fetchRawCallLogs, addCallRaw, updateCall, deleteCall } from '@/services/api/call';
import { CallRecord, CallFilterState } from '@/types/call';
import { updateCallsState, activeCallFilter, updateCallFilterState, subscribeToCalls } from '@/components/CallState';

export function useCalls(params?: Partial<CallFilterState>) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<CallFilterState>(activeCallFilter);

  useEffect(() => {
    return subscribeToCalls(() => {
      setFilter({ ...activeCallFilter });
    });
  }, []);

  const query = useQuery({
    queryKey: ['calls', params],
    queryFn: async (): Promise<CallRecord[]> => {
      try {
        // 1. Fetch leads raw response
        const leadsResponse = await fetchRawLeads();
        const leads = (leadsResponse as any)?.data || leadsResponse || [];

        const leadMap: Record<string, { name: string; phone: string }> = {};
        leads.forEach((l: any) => {
          leadMap[String(l.id)] = {
            name: l.name || 'Unknown',
            phone: l.phone || l.mobile || '',
          };
        });

        // 2. Fetch call logs for all leads in parallel
        const callLogsPromises = leads.map(async (lead: any) => {
          try {
            const res = await fetchRawCallLogs(lead.id);
            const logsArray = (res as any)?.data || res || [];
            return Array.isArray(logsArray) ? logsArray : [];
          } catch (err) {
            console.error(`[useCalls] Error fetching call logs for lead ${lead.id}:`, err);
            return [];
          }
        });

        const nestedCallLogs = await Promise.all(callLogsPromises);
        const allLogs = nestedCallLogs.flat();

        // 3. Map to CallRecord structure
        const mapped: CallRecord[] = allLogs.map((item: any) => {
          const leadInfo = leadMap[String(item.lead_id)] || { name: 'Unknown', phone: '' };

          let type: 'Incoming' | 'Outgoing' | 'Missed' = 'Incoming';
          if (item.call_type === 'INBOUND') type = 'Incoming';
          else if (item.call_type === 'OUTBOUND') type = 'Outgoing';
          else if (item.call_type === 'MISSED') type = 'Missed';

          let duration = '00:00 min';
          if (item.duration_seconds !== undefined && item.duration_seconds !== null) {
            const mins = Math.floor(item.duration_seconds / 60);
            const secs = item.duration_seconds % 60;
            duration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
          }

          let dateTime = '';
          if (item.call_start_time) {
            const date = new Date(item.call_start_time);
            const options: Intl.DateTimeFormatOptions = {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            };
            dateTime = date.toLocaleDateString('en-IN', options).replace(' pm', 'pm').replace(' am', 'am');
          }

          return {
            id: String(item.id),
            name: leadInfo.name,
            phoneNumber: leadInfo.phone,
            dateTime: dateTime || 'Unknown',
            duration,
            type,
            lead_id: item.lead_id,
            remarks: item.remarks || '',
            ...item,
          };
        });

        // Sort by call_start_time DESC
        mapped.sort((a: any, b: any) => {
          const dateA = a.call_start_time ? new Date(a.call_start_time).getTime() : 0;
          const dateB = b.call_start_time ? new Date(b.call_start_time).getTime() : 0;
          return dateB - dateA;
        });

        console.log('[useCalls] Aggregated and mapped calls successfully:', mapped.length);
        return mapped;
      } catch (error) {
        console.error('[useCalls queryFn Error]', error);
        return [];
      }
    },
  });

  const calls = query.data || [];

  // Keep CallState synchronized for backward compatibility
  useEffect(() => {
    if (query.data) {
      updateCallsState(query.data);
    }
  }, [query.data]);

  const addCallMutation = useMutation({
    mutationFn: async (data: Partial<CallRecord> & { lead_id: string }) => {
      const leadId = data.lead_id;
      if (!leadId) {
        throw new Error('lead_id is required to log a call');
      }

      let call_type = 'INBOUND';
      if (data.type === 'Incoming') call_type = 'INBOUND';
      else if (data.type === 'Outgoing') call_type = 'OUTBOUND';
      else if (data.type === 'Missed') call_type = 'MISSED';

      let duration_seconds = 0;
      if (data.duration) {
        const parts = data.duration.split(':');
        if (parts.length === 2) {
          duration_seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
      }

      const { lead_id: _, ...rest } = data;

      const payload = {
        lead_id: leadId,
        call_type,
        call_start_time: new Date().toISOString(),
        duration_seconds,
        subject: data.name || 'Call log',
        remarks: data.remarks || '',
        is_auto_logged: false,
        ...rest
      };

      return addCallRaw(leadId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    }
  });

  return {
    calls,
    filter,
    updateFilter: updateCallFilterState,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    addCall: addCallMutation.mutateAsync,
    isAdding: addCallMutation.isPending,
  };
}
