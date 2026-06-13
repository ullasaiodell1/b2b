import { listAllProducts } from '@/services/api/products';
import { useQuery } from '@tanstack/react-query';

export interface Product {
  id: string;
  product_name: string;
  code: string;
  product_type: 'RAW_MATERIAL' | 'SEMI_FINISHED' | 'FINISHED_GOOD';
  base_unit?: string | null;
  cost_price?: number;
  dealer_price?: number;
  selling_price?: number;
  tax_rate?: number;
  category_name?: string | null;
  fragrance_name?: string | null;
  brand_name?: string | null;
  description?: string | null;
  images?: string[] | null;
}

export function resolveS3Url(key: string | null | undefined): string {
  if (!key) return '';
  if (
    key.startsWith('http://') ||
    key.startsWith('https://') ||
    key.startsWith('file://') ||
    key.startsWith('data:')
  ) {
    return key;
  }
  // Trim any leading slash to avoid double slashes in constructed S3 URL
  const cleanKey = key.replace(/^\//, '');
  return `https://basaltbucket.s3.us-east-1.amazonaws.com/${cleanKey}`;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: () => [...productKeys.lists()] as const,
  productFilter: (params?: any) => [...productKeys.lists(), params] as const,
};

export function useProducts(params?: any) {
  const query = useQuery({
    queryKey: productKeys.productFilter(params),
    queryFn: async () => {
      // httpRequest interceptor unwraps response.data → res = JSON body
      // Backend returns: { data: { products: [...], kits: [...] } }
      const res = await listAllProducts(params) as any;
      console.log('[useProducts] raw response keys:', res ? Object.keys(res) : 'null');
      
      const rawData = res?.data?.products || res?.products || [];
      console.log('[useProducts] data count:', rawData.length);
      
      const mappedData = rawData.map((prod: any) => ({
        ...prod,
        images: Array.isArray(prod.images)
          ? prod.images.map((img: string) => resolveS3Url(img)).filter(Boolean)
          : [],
      }));
      
      return mappedData as Product[];
    },
  });

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
