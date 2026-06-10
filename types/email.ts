export type EmailStatus = 'Opend' | 'Sent' | 'Draft' | 'Bounce';

export interface EmailItem {
  id: string;
  subject: string;
  company: string;
  sentTo: string;
  status: EmailStatus;
  date: string;
  deliveryStatus: string;
}

export interface EmailFilterState {
  status: string;
  company: string;
}
