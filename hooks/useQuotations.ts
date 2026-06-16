import {
  createQuotation,
  deleteQuotation,
  getQuotationDetails,
  listQuotation,
  updateQuotation,
  updateQuotationStatus,
} from '@/services/api/quotation';
import { CreateQuotationPayload, QuotationFilterState, QuotationRecord } from '@/types/quotation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const quotationKeys = {
  all: ['quotations'] as const,
  lists: () => [...quotationKeys.all, 'list'] as const,
  list: () => [...quotationKeys.lists()] as const,
  quotationFilter: (params?: any) => [...quotationKeys.lists(), params] as const,
  details: (id: string) => [...quotationKeys.all, 'details', id] as const,
};

// ─── List Quotations ───────────────────────────────────────────────────────────
export const useQuotations = (params?: Partial<QuotationFilterState>) => {
  return useQuery({
    queryKey: quotationKeys.quotationFilter(params),
    queryFn: async (): Promise<QuotationRecord[]> => {
      const res = await listQuotation(params) as any;
      const raw = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res?.data?.data)
            ? res.data.data
            : []));
      return raw as QuotationRecord[];
    },
  });
};

// ─── Single Quotation Details ──────────────────────────────────────────────────
export const useQuotationDetails = (id: string) => {
  return useQuery({
    queryKey: quotationKeys.details(id),
    queryFn: async (): Promise<QuotationRecord | null> => {
      if (!id) return null;
      const res = await getQuotationDetails(id) as any;
      const detail = res?.data || res || null;
      return detail as QuotationRecord;
    },
    enabled: !!id,
  });
};

// ─── Create Quotation ──────────────────────────────────────────────────────────
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuotationPayload) => createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
};

// ─── Update Quotation ──────────────────────────────────────────────────────────
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuotationPayload> & { status: string } }) =>
      updateQuotation({ id, ...data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quotationKeys.details(variables.id) });
    },
  });
};

// ─── Update Status Only ────────────────────────────────────────────────────────
export const useUpdateQuotationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reject_remarks }: { id: string; status: string; reject_remarks?: string }) =>
      updateQuotationStatus({ id, status, reject_remarks }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quotationKeys.details(variables.id) });
    },
  });
};

// ─── Delete Quotation ──────────────────────────────────────────────────────────
export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
};
