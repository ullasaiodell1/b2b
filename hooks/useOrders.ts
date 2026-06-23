import { getOrderField } from '@/utils/orderHelper';
import { OrderFilterState } from '@/components/order&quotations/OrderState';
import { createOrder, deleteOrder, getInventoryReservations, getOrderBarcodes, getOrderDetails, getOrders, updateOrder } from '@/services/api/order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: () => [...orderKeys.lists()] as const,
  orderFilter: (params?: any) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export function useOrders(params?: Partial<OrderFilterState>) {
  return useQuery({
    queryKey: orderKeys.orderFilter(params),
    queryFn: async () => {
      const res = await getOrders(params);
      const raw = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
      const mapped = (Array.isArray(raw) ? raw : []).map(getOrderField);
      return mapped;
    },
  });
}

// ── BARCODES ──────────────────────────────────────────────────────
export function useOrderBarcodes(id?: string) {
  return useQuery({
    queryKey: [...orderKeys.detail(id || ''), 'barcodes'] as const,
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const res = await getOrderBarcodes(id);
      const data = Array.isArray(res) ? res :
        (Array.isArray(res?.data) ? res.data :
          (Array.isArray(res?.data?.data) ? res.data.data : []));
      return data;
    },
    enabled: !!id,
  });
}

// ── RESERVATIONS ──────────────────────────────────────────────────
export function useInventoryReservations(refId?: string) {
  return useQuery({
    queryKey: ['inventory', 'reservations', refId || ''] as const,
    queryFn: async () => {
      if (!refId) throw new Error('Reference ID is required');
      const res = await getInventoryReservations(refId);
      const data = Array.isArray(res) ? res :
        (Array.isArray(res?.data) ? res.data :
          (Array.isArray(res?.data?.data) ? res.data.data : []));
      return data;
    },
    enabled: !!refId,
  });
}

// ── DETAILS ───────────────────────────────────────────────────────
export function useOrderDetails(id?: string, limit = 10, offset = 0) {
  return useQuery({
    queryKey: [...orderKeys.detail(id || ''), { limit, offset }] as const,
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const res = await getOrderDetails(id, { limit, offset });
      let raw: any = res;
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
      const mapped = raw ? getOrderField(raw) : null;
      return mapped;
    },
    enabled: !!id,
  });
}

// ── CREATE ────────────────────────────────────────────────────────
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await createOrder(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// ── UPDATE ────────────────────────────────────────────────────────
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await updateOrder(id, data);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
    },
  });
}

// ── DELETE ────────────────────────────────────────────────────────
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteOrder(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
