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

export const INITIAL_VISITS: VisitRecord[] = [];

export let visitsState: VisitRecord[] = [...INITIAL_VISITS];

const listeners = new Set<() => void>();

export const updateVisitsState = (newVisits: VisitRecord[]) => {
  visitsState = newVisits;
  listeners.forEach((listener) => listener());
};

export const resetVisitsState = () => {
  visitsState = [...INITIAL_VISITS];
  listeners.forEach((listener) => listener());
};

export const subscribeToVisits = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
