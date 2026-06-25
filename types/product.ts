export interface InterestedProduct {
  id: string;
  product_name: string;
  code: string;
  selling_price: number | null;
  // preserve extra fields for display
  [key: string]: any;
}

export function normalizeProduct(item: any): InterestedProduct {
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
