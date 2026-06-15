export type VisitStatus = 'Pending' | 'Complete' | 'Draft' | 'Bounce';

export interface VisitRecord {
  id: string;
  title: string;
  description?: string;
  visit_type: string;
  status: string;
  scheduled_time: string;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  outcome_summary?: string;
  next_steps?: string;
  contact_person_name?: string;
  contact_person_designation?: string;
  contact_person_phone?: string;
  image_url?: string;
  company?: string;
  lead_company_name?: string;
}

export interface VisitFilterState {
  status: string;
  company: string;
  dateRange: string;
}
