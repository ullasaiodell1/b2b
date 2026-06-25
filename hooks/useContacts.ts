import {
    createLeadContact,
    deleteLeadContact,
    getLeadContacts,
    updateLeadContact,
} from '@/services/api/contacts';
import { CreateContactPayload, LeadContact, normalizeContact, UpdateContactPayload } from '@/types/contact';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type { LeadContact };

export const contactKeys = {
  all: ['contacts'] as const,
  lead: (leadId: string) => [...contactKeys.all, 'lead', leadId] as const,
};

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
    mutationFn: (data: CreateContactPayload) => createLeadContact(leadId, data),
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
      data: UpdateContactPayload;
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
