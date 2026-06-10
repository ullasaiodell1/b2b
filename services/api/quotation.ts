import { CreateQuotationPayload, QuotationFilterState } from '@/types/quotation';
import axios from './httpRequest';

// GET /quotation — list all quotations
// Backend returns: { total: N, data: [...] }
export const getQuotations = (params?: Partial<QuotationFilterState>) => {
  console.log(`[API getQuotations] params:`, params);
  return axios({
    method: 'GET',
    url: `/quotation`,
    params,
  });
};

// GET /quotation/:id — single quotation with items
// Backend returns: { data: { ...quotation, items: [] } }
export const getQuotationDetails = (id: string) => {
  console.log(`[API getQuotationDetails] ID: ${id}`);
  return axios({
    method: 'GET',
    url: `/quotation/${id}`,
  });
};

// POST /quotation — create new quotation
// Backend returns: { data: { id, quotation_number, ... } }
export const createQuotation = (data: CreateQuotationPayload) => {
  console.log(`[API createQuotation] data:`, data);
  return axios({
    method: 'POST',
    url: `/quotation`,
    data,
  });
};

// PATCH /quotation/:id — update quotation (backend uses PATCH, not PUT)
// Backend returns: { data: { id, quotation_number, ... } }
export const updateQuotation = (id: string, data: Partial<CreateQuotationPayload> & { status: string }) => {
  console.log(`[API updateQuotation] ID: ${id}, data:`, data);
  return axios({
    method: 'PATCH',
    url: `/quotation/${id}`,
    data,
  });
};

// PATCH /quotation/:id/status — update status only
// Backend returns: { data: { id, quotation_number, status, ... } }
export const updateQuotationStatus = (id: string, status: string, reject_remarks?: string) => {
  console.log(`[API updateQuotationStatus] ID: ${id}, status: ${status}, reject_remarks: ${reject_remarks}`);
  return axios({
    method: 'PATCH',
    url: `/quotation/${id}/status`,
    data: { status, reject_remarks },
  });
};

// DELETE /quotation/:id
export const deleteQuotation = (id: string) => {
  console.log(`[API deleteQuotation] ID: ${id}`);
  return axios({
    method: 'DELETE',
    url: `/quotation/${id}`,
  });
};
