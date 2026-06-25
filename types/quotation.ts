// Backend quotation status values
export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVISED'
  | 'CANCELLED'
  | 'APPROVED'
  | 'ORDER_CREATED'
  | 'PROFORMA_CREATED';

export interface QuotationItem {
  id?: string;
  product_id?: string | null;
  kit_id?: string | null;
  item_code?: string | null;
  item_name: string;
  item_description?: string | null;
  fragrance_name?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  item_discount?: number;
  mrp?: number;
  quantity: number;
  unit_price: number;
  gst_percentage?: number;
  amount: number;
  gst_amount: number;
  images?: string[] | null;
  base_unit?: string | null;
}

export interface QuotationRecord {
  id: string;
  quotation_number?: number;
  lead_id?: string | null;
  dealer_id?: string | null;
  lead_name?: string | null;
  lead_company_name?: string | null;
  lead_email?: string | null;
  lead_phone?: string | null;
  dealer_company_name?: string | null;
  dealer_contact_name?: string | null;
  company_name?: string | null;
  quotation_date?: string;
  date?: string;
  status: QuotationStatus;
  subtotal?: number;
  tax_total?: number;
  grand_total?: number;
  discount_percentage?: number;
  discount_amount?: number;
  amount_in_words?: string | null;
  notes?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  gst_number?: string | null;
  pan_number?: string | null;
  additional_charges?: { name: string; amount: number }[] | null;
  items?: QuotationItem[];
  total_items?: number;
  prefix?: string | null;
  terms?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationFilterState {
  status?: QuotationStatus | '';
  search?: string;
  startDate?: string;
  endDate?: string;
  lead_id?: string;
  exclude_dealer?: boolean;
  dealer_only?: boolean;
  company_id?: string;
  dealer_id?: string;
  user_id?: string;
  offset?: number;
  limit?: number;
  sort_by?: string;
  sort_direction?: string;
}

export interface CreateQuotationPayload {
  lead_id?: string | null;
  company_id?: string | null;
  dealer_id?: string | null;
  quotation_date?: string;
  status?: QuotationStatus;
  amount_in_words?: string | null;
  notes?: string | null;
  company_name?: string | null;
  company_address?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  gst_number?: string | null;
  pan_number?: string | null;
  discount_percentage?: number;
  discount_amount?: number;
  additional_charges?: { name: string; amount: number }[] | null;
  terms?: string | null;
  subtotal: number;
  sub_total?: number;
  tax_total?: number;
  grand_total: number;
  items: QuotationItem[];
}

export interface UpdateQuotationStatusPayload {
  id: string;
  status: string;
  reject_remarks?: string;
}

export interface UpdateQuotationPayload extends Omit<Partial<CreateQuotationPayload>, 'status'> {
  id: string;
  status?: string;
}


