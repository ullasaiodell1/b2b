export type MeetingStatus = 'In-Process' | 'Complete' | 'Pending';

export interface MeetingAttachment {
  name: string;
  size: string;
}

export interface MeetingRecord {
  id: string;
  title: string;
  venue: string;
  location: string;
  isAllDay: boolean;
  fromTime: string;
  toTime: string;
  host: string;
  status: MeetingStatus;
  notes: string[];
  attachments: MeetingAttachment[];
  createdTime: string;
  modifiedTime: string;
  // Extra backend fields
  purpose: string;
  method: string;
  scheduledAt: string;     // human-readable: "10 Jun 2026 · 02:30 PM"
  scheduledDate: string;   // YYYY-MM-DD for date comparison
  leadId?: string;
  created_by_name?: string;
  modified_by_name?: string;
}
