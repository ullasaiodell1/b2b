export interface LeadContact {
  id: string;
  fullName: string;   // mapped from API "name"
  email: string;
  phone: string;
  designation: string;
  department: string;
  isPrimary: boolean; // mapped from API "is_primary"
  notes: string;
  // raw fields preserved
  lead_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateContactPayload {
  name: string;
  email: string;
  phone: string;
  designation?: string;
  department?: string;
  notes?: string;
  is_primary?: boolean;
}

export interface UpdateContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  notes?: string;
  is_primary?: boolean;
}

export function normalizeContact(item: any): LeadContact {
  return {
    id: String(item.id ?? ''),
    fullName: item.name || item.full_name || item.fullName || '',
    email: item.email || '',
    phone: item.phone || '',
    designation: item.designation || '',
    department: item.department || '',
    isPrimary: item.is_primary ?? item.isPrimary ?? false,
    notes: item.notes || '',
    lead_id: item.lead_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}
