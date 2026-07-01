export interface ProformaFilterState {
  search?: string;
  startDate?: string;
  endDate?: string;
  offset?: number;
  limit?: number;
  status?: string;
  lead_id?: string;
  dealer_id?: string;
}

export interface ProformaRecord {
  id: string;
  proforma_number: number;
  source_quotation_id: string | null;
  order_id: string | null;
  parent_id: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  deleted_at: string | null;
  quotation_number: number;
  lead_id: string | null;
  company_id: string | null;
  dealer_id: string | null;
  dealer_po_id: string | null;
  quotation_date: string;
  status: string;
  amount_in_words: string | null;
  notes: string | null;
  company_name: string | null;
  company_address: string | null;
  register_number: string | null;
  gst_number: string | null;
  pan_number: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  discount_percentage: number;
  discount_amount: number;
  subtotal: number;
  tax_total: number;
  grand_total: number;
  additional_charges: any[];
  service_gst: number;
  service_tax_total: number;
  terms: string | null;
  reject_remarks: string | null;
  approval_from: string | null;
  service_total: number;
  proforma_prefix: string;
  lead_name: string | null;
  lead_company_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  dealer_company_name: string | null;
  dealer_contact_name: string | null;
  dealer_contact_email: string | null;
  dealer_contact_phone: string | null;
  formatted_source_number: string;
  source_id: string | null;
  client_name: string | null;
  client_company: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  source_type: string;
  formatted_proforma_number: string;
  proforma_invoice_id?: string | null;
  items?: ProformaItem[];
}

export interface ProformaItem {
  id?: string;
  proforma_id?: string;
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
  total_amount?: number;
  images?: string[] | null;
  base_unit?: string | null;
  created_at?: string;
  hsn_sac?: string | null;
}

