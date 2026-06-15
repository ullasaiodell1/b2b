import { createVisit, deleteVisit, getVisitDetails, getVisits, updateVisit } from '@/services/api/visit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const visitKeys = {
  all: ['visits'] as const,
  lists: () => [...visitKeys.all, 'list'] as const,
  list: () => [...visitKeys.lists()] as const,
  visitFilter: (params?: any) => [...visitKeys.lists(), params] as const,
  detail: (id: string) => [...visitKeys.all, 'detail', id] as const,
};

// ── READ ───────────────────────────────────────────────────────────
export const useVisits = (params?: any) => {
  return useQuery({
    queryKey: visitKeys.visitFilter(params),
    queryFn: () => getVisits(params),
  });
};



// ── CREATE ────────────────────────────────────────────────────────
export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, apiPayload }: { leadId: string; apiPayload: any }) => createVisit(leadId, apiPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
    },
  });
};

// ── UPDATE ────────────────────────────────────────────────────────
export const useUpdateVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, id, data }: { leadId: string; id: string; data: any }) => updateVisit(leadId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: visitKeys.detail(variables.id) });
    },
  });
};

// ── DELETE ────────────────────────────────────────────────────────
export const useDeleteVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, id }: { leadId: string; id: string }) => deleteVisit(leadId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
    },
  });
};

export const useVisitDetails = (leadId: string, id: string) => {
  return useQuery({
    queryKey: visitKeys.detail(id),
    queryFn: async () => {
      const res = await getVisitDetails(leadId, id);
      console.log(`[useVisitDetails] Raw API Response for ID: ${id}:`, JSON.stringify(res));
      let raw = res;
      if (res && typeof res === 'object') {
        const nestedData = (res as any).data;
        if (nestedData !== undefined && nestedData !== null) {
          if (Array.isArray(nestedData)) {
            raw = nestedData[0];
          } else if (nestedData.data !== undefined && nestedData.data !== null) {
            raw = Array.isArray(nestedData.data) ? nestedData.data[0] : nestedData.data;
          } else {
            raw = nestedData;
          }
        }
      }
      return raw;
    },
    enabled: !!leadId && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
  });
};