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
      await syncDeviceCallLogs().catch(err => console.error('[useCalls] Failed to sync call logs:', err));
      const res = await fetchRawLeads();
      const leads = (res as any)?.data || res || [];
      
      const nestedCallLogs = await Promise.all(
        leads.map(async (lead: any) => {
          const callLogs = await fetchRawCallLogs(lead.id).catch(() => ({ data: [] }));
          return (callLogs as any)?.data || callLogs || [];
        })
      );
      
      return { leads, allLogs: nestedCallLogs.flat() };
    },
  });
}

// ── CREATE ────────────────────────────────────────────────────────
export function useCreateCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CallRecord> & { lead_id: string }) => {
      if (!data.lead_id) throw new Error('lead_id is required to log a call');
      return addCallRaw(data.lead_id, normalizeCallPayload(data.lead_id, data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callKeys.lists() });
    }
  });
}

export function useSyncCallLogs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncDeviceCallLogs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callKeys.lists() });
    }
  });
}
