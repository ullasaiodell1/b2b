export type LeadPriority = 'High' | 'Normal' | 'Low';

export interface LeadRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  tag: string;
  priority: LeadPriority;
  owner: string;
}

export interface LeadFilterState {
  priority: string;
  tag: string;
  owner: string;
}
