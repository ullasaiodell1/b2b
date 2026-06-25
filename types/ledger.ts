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
  items: any[];
  openingBalance: number;
  total: number;
}
