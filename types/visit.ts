export type VisitStatus = 'Pending' | 'Complete' | 'Draft' | 'Bounce';

export interface VisitRecord {
  id: string;
  name: string;
  company: string;
  location: string;
  status: VisitStatus;
  lat: string;
  lng: string;
  avatar: any;
}

export interface VisitFilterState {
  status: string;
  company: string;
  dateRange: string;
}
