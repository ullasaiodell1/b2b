import { useQuery } from '@tanstack/react-query';
import { getDealers, getDealerDetails } from '@/services/api/dealer';

export const dealerKeys = {
  all: ['dealers'] as const,
  lists: (params?: any) => [...dealerKeys.all, 'list', params] as const,
  details: (id: string) => [...dealerKeys.all, 'detail', id] as const,
};

export function useDealers(params?: any) {
  return useQuery({
    queryKey: dealerKeys.lists(params),
    queryFn: async () => {
      const response = await getDealers(params);
      let rawData: any[] = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (Array.isArray(response?.data)) {
        rawData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        rawData = response.data.data;
      }
      return rawData;
    }
  });
}

export function useDealerDetails(id: string) {
  return useQuery({
    queryKey: dealerKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await getDealerDetails(id);
      return res;
    },
    enabled: !!id
  });
}
