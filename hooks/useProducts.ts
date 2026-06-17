import { listAllProducts } from '@/services/api/products';
import { useQuery } from '@tanstack/react-query';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: () => [...productKeys.lists()] as const,
  productFilter: (params?: any) => [...productKeys.lists(), params] as const,
};

// ── READ ───────────────────────────────────────────────────────────
export function useProducts(params?: any) {
  return useQuery({
    queryKey: productKeys.productFilter(params),
    queryFn: async () => {
      const res = await listAllProducts(params) as any;
      return res?.data?.products || res?.products || [];
    },
  });
}
