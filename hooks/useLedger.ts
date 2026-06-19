import { getLeadLedger } from '@/services/api/ledger';
import { useQuery } from '@tanstack/react-query';

export const ledgerKeys = {
  all: ['ledger'] as const,
  lead: (leadId: string, params?: any) => [...ledgerKeys.all, 'lead', leadId, params] as const,
};

export interface LedgerEntry {
  id: string;
  date: string;           // ISO string from API e.g. "2026-06-19T05:30:00+05:30"
  entryType: 'credit' | 'debit';   // from API "type" field
  _type: string;          // "payment" | "transaction"
  category: string;       // "customer_payment" | "sale"
  amount: number;         // always positive
  closingBalance: number;
  previousBalance: number;
  prefix: string;         // "TX" | "SI"
  serialNumber: string;
  refNo: string;          // e.g. "TX/9" or "SI/231"
  accountName: string;
  createdByName: string;
}

export interface LedgerData {
  items: LedgerEntry[];
  openingBalance: number;
  total: number;
}

function normalizeLedgerEntry(item: any, index: number): LedgerEntry {
  const prefix = item.prefix || '';
  const serial = item.serial_number || '';
  const refNo = prefix && serial ? `${prefix}/${serial}` : String(item.id ?? index);

  return {
    id: String(item.id ?? index),
    date: item.date || item.created_at || new Date().toISOString(),
    entryType: String(item.type || '').toLowerCase() === 'credit' ? 'credit' : 'debit',
    _type: item._type || '',
    category: item.category || '',
    amount: Math.abs(Number(item.amount || 0)),
    closingBalance: Number(item.closing_balance ?? 0),
    previousBalance: Number(item.previous_balance ?? 0),
    prefix,
    serialNumber: String(serial),
    refNo,
    accountName: item.account_name || '',
    createdByName: item.created_by_name || '',
  };
}

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
        items: list.map((item: any, idx: number) => normalizeLedgerEntry(item, idx)),
        openingBalance: Number(raw?.opening_balance ?? 0),
        total: Number(raw?.total ?? list.length),
      };
    },
    enabled: !!leadId,
  });
}
