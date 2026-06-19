import {
    createLeadContact,
    deleteLeadContact,
    getLeadContacts,
    updateLeadContact,
} from '@/services/api/contacts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const contactKeys = {
  all: ['contacts'] as const,
  lead: (leadId: string) => [...contactKeys.all, 'lead', leadId] as const,
};

// ── Normalised shape used throughout the app ──────────────────────
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

function normalizeContact(item: any): LeadContact {
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

// ── READ ──────────────────────────────────────────────────────────
export const useLeadContacts = (leadId: string) => {
  return useQuery({
    queryKey: contactKeys.lead(leadId),
    queryFn: async () => {
      const res = await getLeadContacts(leadId);
      const raw = res as any;
      // API shape: { total, data: [...] }
      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
        ? raw.data.data
        : Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
        ? raw.results
        : [];
      return list.map(normalizeContact) as LeadContact[];
    },
    enabled: !!leadId,
  });
};

// ── CREATE ────────────────────────────────────────────────────────
export const useCreateLeadContact = (leadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone: string;
      designation?: string;
      department?: string;
      notes?: string;
      is_primary?: boolean;
    }) => createLeadContact(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lead(leadId) });
    },
  });
};

// ── UPDATE ────────────────────────────────────────────────────────
export const useUpdateLeadContact = (leadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contactId,
      data,
    }: {
      contactId: string;
      data: {
        name?: string;
        email?: string;
        phone?: string;
        designation?: string;
        department?: string;
        notes?: string;
        is_primary?: boolean;
      };
    }) => updateLeadContact(leadId, contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lead(leadId) });
    },
  });
};

// ── DELETE ────────────────────────────────────────────────────────
export const useDeleteLeadContact = (leadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => deleteLeadContact(leadId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lead(leadId) });
    },
  });
};
