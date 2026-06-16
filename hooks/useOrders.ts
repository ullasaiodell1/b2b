import { getOrderField } from '@/app/(tabs)/Order/orderHelper';
import { OrderFilterState, activeOrderFilter, subscribeToOrders, updateOrderFilterState } from '@/components/OrderState';
import { createOrder, deleteOrder, getInventoryReservations, getOrderBarcodes, getOrderDetails, getOrders, updateOrder } from '@/services/api/order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: () => [...orderKeys.lists()] as const,
  orderFilter: (params?: any) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export function useOrders(params?: Partial<OrderFilterState>) {
  const [filter, setFilter] = useState<OrderFilterState>(activeOrderFilter);

  useEffect(() => {
    return subscribeToOrders(() => {
      setFilter({ ...activeOrderFilter });
    });
  }, []);

  const query = useQuery({
    queryKey: orderKeys.orderFilter(params || filter),
    queryFn: async () => {
      const res = await getOrders(params || filter);
      let rawData: any[] = [];
      if (Array.isArray(res)) {
        rawData = res;
      } else if (Array.isArray(res?.data)) {
        rawData = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        rawData = res.data.data;
      }
      return rawData.map(getOrderField);
    },
  });

  return {
    ...query,
    orders: query.data || [],
    filter,
    updateFilter: updateOrderFilterState,
  };
}

export function useOrderDetails(id?: string, limit = 10, offset = 0) {
  return useQuery({
    queryKey: [...orderKeys.detail(id || ''), { limit, offset }] as const,
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');

      const [detailsResult, barcodesResult, reservationsResult] = await Promise.allSettled([
        getOrderDetails(id, { limit, offset }),
        getOrderBarcodes(id),
        getInventoryReservations(id),
      ]);

      let raw: any = {};
      if (detailsResult.status === 'fulfilled') {
        const res = detailsResult.value;
        raw = res;
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
      } else {
        throw detailsResult.reason;
      }

      let barcodes: any[] = [];
      if (barcodesResult.status === 'fulfilled') {
        const res = barcodesResult.value;
        barcodes = Array.isArray(res)
          ? res
          : (Array.isArray(res?.data)
            ? res.data
            : (Array.isArray(res?.data?.data)
              ? res.data.data
              : []));
      }

      let reservations: any[] = [];
      if (reservationsResult.status === 'fulfilled') {
        const res = reservationsResult.value;
        reservations = Array.isArray(res)
          ? res
          : (Array.isArray(res?.data)
            ? res.data
            : (Array.isArray(res?.data?.data)
              ? res.data.data
              : []));
      }

      if (raw && typeof raw === 'object') {
        raw = getOrderField(raw);
        raw.barcodes = barcodes;
        raw.reservations = reservations;
      }
      return raw;
    },
    enabled: !!id,
  });
}

export function useOrderBarcodes(id?: string) {
  return useQuery({
    queryKey: [...orderKeys.detail(id || ''), 'barcodes'] as const,
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const res = await getOrderBarcodes(id);
      return Array.isArray(res)
        ? res
        : (Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res?.data?.data)
            ? res.data.data
            : []));
    },
    enabled: !!id,
  });
}

export function useInventoryReservations(refId?: string) {
  return useQuery({
    queryKey: ['inventory', 'reservations', refId || ''] as const,
    queryFn: async () => {
      if (!refId) throw new Error('Reference ID is required');
      const res = await getInventoryReservations(refId);
      return Array.isArray(res)
        ? res
        : (Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res?.data?.data)
            ? res.data.data
            : []));
    },
    enabled: !!refId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return createOrder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return updateOrder(id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteOrder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

