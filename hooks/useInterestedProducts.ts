import {
    addLeadInterestedProducts,
    getLeadInterestedProducts,
    removeLeadInterestedProduct,
} from '@/services/api/interestedProducts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const interestedProductKeys = {
  all: ['interestedProducts'] as const,
  lead: (leadId: string) => [...interestedProductKeys.all, 'lead', leadId] as const,
};

// Normalise a raw API item to a consistent shape
export interface InterestedProduct {
  id: string;
  product_name: string;
  code: string;
  selling_price: number | null;
  // preserve extra fields for display
  [key: string]: any;
}

function normalizeProduct(item: any): InterestedProduct {
  return {
    ...item,
    id: String(item.id ?? ''),
    product_name: item.product_name || item.name || '',
    code: item.code || item.sku || '',
    selling_price:
      item.selling_price != null
        ? Number(item.selling_price)
        : item.price != null
        ? Number(item.price)
        : null,
  };
}

// ── READ ──────────────────────────────────────────────────────────
export const useLeadInterestedProducts = (leadId: string) => {
  return useQuery({
    queryKey: interestedProductKeys.lead(leadId),
    queryFn: async () => {
      const res = await getLeadInterestedProducts(leadId);
      const raw = res as any;
      // API shape: { total, data: [...] }
      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
        ? raw.data.data
        : Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
        ? raw.results
        : [];
      return list.map(normalizeProduct) as InterestedProduct[];
    },
    enabled: !!leadId,
  });
};

// ── ADD (POST) ────────────────────────────────────────────────────
// Sends a product ID; refetches the list on success
export const useAddLeadInterestedProduct = (leadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string | number) =>
      addLeadInterestedProducts(leadId, String(productId)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interestedProductKeys.lead(leadId),
      });
    },
  });
};

// ── REMOVE (DELETE) ───────────────────────────────────────────────
export const useRemoveLeadInterestedProduct = (leadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      removeLeadInterestedProduct(leadId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interestedProductKeys.lead(leadId),
      });
    },
  });
};
