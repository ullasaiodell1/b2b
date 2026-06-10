export type CallType = 'Incoming' | 'Outgoing' | 'Missed';

export interface CallRecord {
  id: string;
  name: string;
  phoneNumber: string;
  dateTime: string;
  duration: string;
  type: CallType;
  callType?: string;
  dueDate?: string;
  lead_id?: string;
  remarks?: string;
}

export interface CallFilterState {
  status: 'All' | 'Incoming' | 'Outgoing' | 'Missed' | '';
  dateRange: string;
}
