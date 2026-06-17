import { CreateQuotationPayload, QuotationFilterState, UpdateQuotationPayload, UpdateQuotationStatusPayload } from '@/types/quotation';
import axios from './httpRequest';

// GET /quotation — list all quotations
export const listQuotation = (params?: Partial<QuotationFilterState>) => {
  const url = `quotation`;
  return axios({
    method: "GET",
    url,
    params
  });
};

// GET /quotation/:id — single quotation with items
export const getQuotationDetails = (id: string, params?: any) => {
  const url = `quotation/${id}`;
  return axios({
    method: "GET",
    url,
    params
  });
};

// POST /quotation — create new quotation
export const createQuotation = (data: CreateQuotationPayload) => {
  const url = `quotation`;
  return axios({
    method: "POST",
    url,
    data
  });
};

// PATCH /quotation/:id — update quotation
export const updateQuotation = ({ id, ...data }: UpdateQuotationPayload) => {
  const url = `quotation/${id}`;
  return axios({
    method: "PATCH",
    url,
    data
  });
};

// DELETE /quotation/:id
export const deleteQuotation = (id: string) => {
  const url = `quotation/${id}`;
  return axios({
    method: "DELETE",
    url
  });
};

// PATCH /quotation/:id/status — update status only
export const updateQuotationStatus = ({ id, status, reject_remarks }: UpdateQuotationStatusPayload) => {
  const url = `quotation/${id}/status`;
  return axios({
    method: "PATCH",
    url,
    data: {
      status,
      reject_remarks
    }
  });
};

// GET /quotation/:id/download — download quotation PDF/blob
export const downloadQuotation = (id: string, params?: any) => {
  const url = `quotation/${id}/download`;
  return axios({
    method: "GET",
    url,
    params,
    responseType: "blob"
  });
};

// POST /quotation/:id/send-email — send quotation email
export const sendQuotationEmail = (id: string, params?: any) => {
  const url = `quotation/${id}/send-email`;
  return axios({
    method: "POST",
    url,
    params
  });
};


