import { CreateQuotationPayload, QuotationFilterState } from '@/types/quotation';
import axios from './httpRequest';

// GET /quotation — list all quotations
// Backend returns: { total: N, data: [...] }
export const getQuotations = (params?: Partial<QuotationFilterState>) => {
  return axios({
    method: 'GET',
    url: `/quotation`,
    params,
  });
};

// GET /quotation/:id — single quotation with items
// Backend returns: { data: { ...quotation, items: [] } }
export const getQuotationDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/quotation/${id}`,
  });
};

// POST /quotation — create new quotation
// Backend returns: { data: { id, quotation_number, ... } }
export const createQuotation = (data: CreateQuotationPayload) => {
  return axios({
    method: 'POST',
    url: `/quotation`,
    data,
  });
};

// PATCH /quotation/:id — update quotation (backend uses PATCH, not PUT)
// Backend returns: { data: { id, quotation_number, ... } }
export const updateQuotation = (id: string, data: Partial<CreateQuotationPayload> & { status: string }) => {
  return axios({
    method: 'PATCH',
    url: `/quotation/${id}`,
    data,
  });
};

// PATCH /quotation/:id/status — update status only
// Backend returns: { data: { id, quotation_number, status, ... } }
export const updateQuotationStatus = (id: string, status: string, reject_remarks?: string) => {
  return axios({
    method: 'PATCH',
    url: `/quotation/${id}/status`,
    data: { status, reject_remarks },
  });
};

// DELETE /quotation/:id
export const deleteQuotation = (id: string) => {
  return axios({
    method: 'DELETE',
    url: `/quotation/${id}`,
  });
};
