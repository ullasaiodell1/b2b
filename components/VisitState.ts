export interface VisitRecord {
  id: string;
  name: string;      // Title of the visit
  visitType: string; // Type of visit e.g. Site Visit
  scheduledDateTime: string; // Format: DD-MM-YYYY HH:mm
  imageUri?: string; // Selected/uploaded image URI
  description?: string;
  locationAddress: string;
  lat: string;       // Latitude (e.g. 18.4729° N)
  lng: string;       // Longitude (e.g. 73.8567° E)
  status: 'Pending' | 'Complete' | 'Draft' | 'Bounce';
  avatar?: any;
  contactPersonName?: string;
  designation?: string;
  phone?: string;
  outcomeSummary?: string;
  nextSteps?: string;
  company?: string;
  location?: string;
}

export const INITIAL_VISITS: VisitRecord[] = [];

export let visitsState: VisitRecord[] = [...INITIAL_VISITS];

const listeners = new Set<() => void>();

export const updateVisitsState = (newVisits: VisitRecord[]) => {
  visitsState = newVisits;
  listeners.forEach((listener) => listener());
};

export const subscribeToVisits = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
