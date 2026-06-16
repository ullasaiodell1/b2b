import { createVisit, deleteVisit, getVisitByIdDirect, getVisitDetails, getVisits, updateVisit } from '@/services/api/visit';
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
    queryFn: async () => {
      console.log('[useVisits] Fetching visits with params:', JSON.stringify(params));
      const res = await getVisits(params);
      console.log('[useVisits] Raw API Response:', JSON.stringify(res));
      return res;
    },
  });
};



// ── CREATE ────────────────────────────────────────────────────────
export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, apiPayload }: { leadId: string; apiPayload: any }) => {
      console.log(`[useCreateVisit] Creating visit for lead: ${leadId} with payload:`, JSON.stringify(apiPayload));
      const res = await createVisit(leadId, apiPayload);
      console.log('[useCreateVisit] Raw API Response:', JSON.stringify(res));
      return res;
    },
    onSuccess: (data) => {
      console.log('[useCreateVisit] Success. Invalidate lists. Data:', JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
    },
  });
};

// ── UPDATE ────────────────────────────────────────────────────────
export const useUpdateVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, id, data }: { leadId: string; id: string; data: any }) => {
      console.log(`[useUpdateVisit] Updating visit ID: ${id} for lead: ${leadId} with data:`, JSON.stringify(data));
      const res = await updateVisit(leadId, id, data);
      console.log('[useUpdateVisit] Raw API Response:', JSON.stringify(res));
      return res;
    },
    onSuccess: (data, variables) => {
      console.log(`[useUpdateVisit] Success for ID: ${variables.id}. Invalidate lists and detail. Data:`, JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: visitKeys.detail(variables.id) });
    },
  });
};

// ── DELETE ────────────────────────────────────────────────────────
export const useDeleteVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, id }: { leadId: string; id: string }) => {
      console.log(`[useDeleteVisit] Deleting visit ID: ${id} for lead: ${leadId}`);
      const res = await deleteVisit(leadId, id);
      console.log('[useDeleteVisit] Raw API Response:', JSON.stringify(res));
      return res;
    },
    onSuccess: (data) => {
      console.log('[useDeleteVisit] Success. Invalidate lists. Data:', JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
    },
  });
};

export const useVisitDetails = (leadId?: string, id?: string) => {
  return useQuery({
    queryKey: visitKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Visit ID is required');
      let activeLeadId = leadId;
      console.log(`[useVisitDetails] queryFn started. id: ${id}, leadId input: ${leadId}`);
      const unpack = (res: any) => {
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
      };

      // TIER 1: Try the nested API endpoint
      if (activeLeadId) {
        try {
          console.log(`[useVisitDetails] Tier 1: Fetching nested detail. lead: ${activeLeadId}, visit: ${id}`);
          const res = await getVisitDetails(activeLeadId, id);
          const raw = unpack(res);
          if (raw && typeof raw === 'object' && Object.keys(raw).length > 2) {
            console.log(`[useVisitDetails] Tier 1 Success. Returning resolved visit data.`);
            return raw;
          }
        } catch (err: any) {
          console.log(`[useVisitDetails] Tier 1 nested detail API failed. Error:`, err?.message || err);
        }
      }

      // TIER 2: Try flat direct visit endpoint (/visits/:id)
      try {
        console.log(`[useVisitDetails] Tier 2: Fetching flat direct detail. visit: ${id}`);
        const res = await getVisitByIdDirect(id);
        const raw = unpack(res);
        if (raw && typeof raw === 'object' && Object.keys(raw).length > 2) {
          console.log(`[useVisitDetails] Tier 2 Success. Returning resolved visit data.`);
          return raw;
        }
      } catch (err: any) {
        console.log(`[useVisitDetails] Tier 2 flat direct detail API failed. Error:`, err?.message || err);
      }

      // TIER 3: Fetch all visits and search in list (since the list API response has full details)
      try {
        console.log(`[useVisitDetails] Tier 3: Fetching all visits and searching in list for visit: ${id}`);
        const allVisits = await getVisits();
        const visitsList = Array.isArray(allVisits)
          ? allVisits
          : (Array.isArray((allVisits as any)?.data)
            ? (allVisits as any).data
            : (Array.isArray((allVisits as any)?.data?.data)
              ? (allVisits as any).data.data
              : []));
        const matched = visitsList.find((v: any) => String(v.id) === String(id));
        if (matched) {
          console.log(`[useVisitDetails] Tier 3 Success. Found matched visit in list.`);
          return matched;
        }
      } catch (err: any) {
        console.log(`[useVisitDetails] Tier 3 visits list fallback failed. Error:`, err?.message || err);
      }

      throw new Error(`Failed to fetch visit details for ID: ${id} from all API tiers.`);
    },
    enabled: !!id,
  });
};