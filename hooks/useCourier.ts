import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCouriers, createCourier } from '@/services/api/courier';

export const courierKeys = {
  all: ['couriers'] as const,
  lists: () => [...courierKeys.all, 'list'] as const,
  list: () => [...courierKeys.lists()] as const,
  courierFilter: (params?: any) => [...courierKeys.lists(), params] as const,
};

export function useCouriers(params?: any) {
  return useQuery({
    queryKey: courierKeys.courierFilter(params),
    queryFn: async () => {
      const res = await getCouriers({ pageSize: 10, ...params });
      return (res && Array.isArray(res)) ? res : (res && Array.isArray((res as any).data)) ? (res as any).data : [];
    }
  });
}

export function useCreateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createCourier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.lists() });
    }
  });
}
