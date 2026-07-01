import {
  createProforma,
  deleteProforma,
  getProformaDetails,
  listProforma,
  updateProforma,
  updateProformaStatus,
} from '@/services/api/proforma';
import { ProformaFilterState, ProformaRecord } from '@/types/proforma';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const proformaKeys = {
  all: ['proformas'] as const,
  lists: () => [...proformaKeys.all, 'list'] as const,
  list: () => [...proformaKeys.lists()] as const,
  proformaFilter: (params?: any) => [...proformaKeys.lists(), params] as const,
  details: (id: string) => [...proformaKeys.all, 'details', id] as const,
};

// ─── List Proformas ───────────────────────────────────────────────────────────
export const useProformas = (params?: Partial<ProformaFilterState>) => {
  return useQuery({
    queryKey: proformaKeys.proformaFilter(params),
    queryFn: async (): Promise<ProformaRecord[]> => {
      const apiParams = {
        limit: 100,
        offset: 0,
        ...params,
      };
      const res = await listProforma(apiParams) as any;
      const raw = Array.isArray(res) ? res :
        (Array.isArray(res?.data) ? res.data :
          (Array.isArray(res?.data?.data) ? res.data.data : []));
      return raw as ProformaRecord[];
    },
  });
};

// ─── Single Proforma Details ──────────────────────────────────────────────────
export const useProformaDetails = (id: string) => {
  return useQuery({
    queryKey: proformaKeys.details(id),
    queryFn: async (): Promise<ProformaRecord | null> => {
      if (!id) return null;
      const res = await getProformaDetails(id, { limit: 10, offset: 0 }) as any;
      const detail = res?.data?.data || res?.data || res || null;
      return detail as ProformaRecord;
    },
    enabled: !!id,
  });
};

// ─── Create Proforma ──────────────────────────────────────────────────────────
export const useCreateProforma = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProformaRecord>) => createProforma(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proformaKeys.lists() });
    },
  });
};

// ─── Update Proforma ──────────────────────────────────────────────────────────
export const useUpdateProforma = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProformaRecord> & { id: string }) =>
      updateProforma(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: proformaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proformaKeys.details(variables.id) });
    },
  });
};

// ─── Update Status Only ────────────────────────────────────────────────────────
export const useUpdateProformaStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reject_remarks }: { id: string; status: string; reject_remarks?: string }) =>
      updateProformaStatus({ id, status, reject_remarks }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: proformaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proformaKeys.details(variables.id) });
    },
  });
};

// ─── Delete Proforma ──────────────────────────────────────────────────────────
export const useDeleteProforma = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProforma(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proformaKeys.lists() });
    },
  });
};
