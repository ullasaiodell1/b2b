import { addCallRaw, fetchRawCallLogs, fetchRawLeads } from '@/services/api/call';
import { CallFilterState, CallRecord } from '@/types/call';
import { syncDeviceCallLogs, normalizeCallPayload } from '@/utils/callLogSync';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const callKeys = {
  all: ['calls'] as const,
  lists: () => [...callKeys.all, 'list'] as const,
  list: () => [...callKeys.lists()] as const,
  callFilter: (params?: any) => [...callKeys.lists(), params] as const,
};

// ── READ ───────────────────────────────────────────────────────────
export function useCalls(params?: Partial<CallFilterState>) {
  return useQuery({
    queryKey: callKeys.callFilter(params),
    queryFn: async () => {
      try {
        await syncDeviceCallLogs();
      } catch (err) {
        console.error('[useCalls] Failed to sync device call logs during query:', err);
      }
      const leadsResponse = await fetchRawLeads();
      const leads = (leadsResponse as any)?.data || leadsResponse || [];
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
      return { leads, allLogs };
    },
  });
}

// ── CREATE ────────────────────────────────────────────────────────
export function useCreateCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CallRecord> & { lead_id: string }) => {
      const leadId = data.lead_id;
      if (!leadId) {
        throw new Error('lead_id is required to log a call');
      }
      const normalizedPayload = normalizeCallPayload(leadId, data);
      return addCallRaw(leadId, normalizedPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callKeys.lists() });
    }
  });
}

export function useSyncCallLogs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return syncDeviceCallLogs();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callKeys.lists() });
    }
  });
}
