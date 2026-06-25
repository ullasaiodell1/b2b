import { getLeadLedger } from '@/services/api/ledger';
import { useQuery } from '@tanstack/react-query';
import { LedgerData } from '@/types/ledger';

export const ledgerKeys = {
  all: ['ledger'] as const,
  lead: (leadId: string, params?: any) => [...ledgerKeys.all, 'lead', leadId, params] as const,
};

export function useLeadLedger(leadId: string, params?: any) {
  return useQuery({
    queryKey: ledgerKeys.lead(leadId, params),
    queryFn: async (): Promise<LedgerData> => {
      if (!leadId) return { items: [], openingBalance: 0, total: 0 };
      const res = await getLeadLedger(leadId, params);
      const raw = res as any;

      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
        ? raw.data.data
        : Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
        ? raw.results
        : [];

      return {
        items: list,
        openingBalance: Number(raw?.opening_balance ?? 0),
        total: Number(raw?.total ?? list.length),
      };
    },
    enabled: !!leadId,
  });
}
