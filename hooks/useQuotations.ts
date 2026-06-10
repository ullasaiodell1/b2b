import {
    createQuotation,
    deleteQuotation,
    getQuotationDetails,
    getQuotations,
    updateQuotation,
    updateQuotationStatus,
} from '@/services/api/quotation';
import { CreateQuotationPayload, QuotationFilterState, QuotationRecord } from '@/types/quotation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ─── List Quotations ───────────────────────────────────────────────────────────
export function useQuotations(params?: Partial<QuotationFilterState>) {
  const query = useQuery({
    queryKey: ['quotations', params],
    queryFn: async (): Promise<QuotationRecord[]> => {
      const res = await getQuotations(params) as any;
      console.log('[useQuotations] raw response keys:', res ? Object.keys(res) : 'null');

      // Backend returns { total, data: [...] }
      // After axios interceptor: res = { total, data: [...] }
      let rawData: any[] = [];
      if (Array.isArray(res)) {
        rawData = res;
      } else if (Array.isArray(res?.data)) {
        rawData = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        rawData = res.data.data;
      }

      console.log('[useQuotations] data count:', rawData.length);
      return rawData as QuotationRecord[];
    },
  });

  return {
    quotations: query.data ?? [],
    total: (query.data ?? []).length,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Single Quotation Details ──────────────────────────────────────────────────
export function useQuotationDetails(id: string) {
  return useQuery({
    queryKey: ['quotationDetails', id],
    queryFn: async (): Promise<QuotationRecord | null> => {
      if (!id) return null;
      const res = await getQuotationDetails(id) as any;
      console.log('[useQuotationDetails] raw response:', JSON.stringify(res)?.slice(0, 200));

      // Backend returns: { data: { ...quotation, items: [] } }
      // After axios interceptor: res = { data: {...} }
      const detail = res?.data || res || null;
      return detail as QuotationRecord;
    },
    enabled: !!id,
  });
}

// ─── Create Quotation ──────────────────────────────────────────────────────────
export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuotationPayload) => createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}

// ─── Update Quotation ──────────────────────────────────────────────────────────
export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuotationPayload> & { status: string } }) =>
      updateQuotation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotationDetails', variables.id] });
    },
  });
}

// ─── Update Status Only ────────────────────────────────────────────────────────
export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reject_remarks }: { id: string; status: string; reject_remarks?: string }) =>
      updateQuotationStatus(id, status, reject_remarks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotationDetails', variables.id] });
    },
  });
}

// ─── Delete Quotation ──────────────────────────────────────────────────────────
export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}
