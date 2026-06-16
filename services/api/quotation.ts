import { CreateQuotationPayload, QuotationFilterState } from '@/types/quotation';
import axios from './httpRequest';

// GET /quotation — list all quotations
// Backend returns: { total: N, data: [...] }
export const listQuotation = (params?: Partial<QuotationFilterState>) => {
  console.log(`[API listQuotation] raw params:`, params);
  const cleanedParams: any = {};
  if (params) {
    const allowedParams = [
      'company_id',
      'lead_id',
      'dealer_id',
      'user_id',
      'status',
      'search',
      'offset',
      'limit',
      'startDate',
      'endDate',
      'exclude_dealer',
      'dealer_only',
      'sort_by',
      'sort_direction'
    ];

    allowedParams.forEach((key) => {
      const value = params[key as keyof QuotationFilterState];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        cleanedParams[key] = value;
      }
    });
  }
  console.log(`[API listQuotation] cleaned params sent to axios:`, cleanedParams);
  const url = `quotation`;
  return axios({ method: "GET", url, params: cleanedParams });
};

// GET /quotation/:id — single quotation with items
// Backend returns: { data: { ...quotation, items: [] } }
export const getQuotationDetails = (id: string, params?: any) => {
  console.log(`[API getQuotationDetails] ID: ${id}, params:`, params);
  const url = `quotation/${id}`;
  return axios({ method: "GET", url, params });
};

// POST /quotation — create new quotation
// Backend returns: { data: { id, quotation_number, ... } }
export const createQuotation = (data: CreateQuotationPayload) => {
  console.log(`[API createQuotation] data:`, data);
  const url = `quotation`;
  return axios({ method: "POST", url, data });
};

// PATCH /quotation/:id — update quotation (backend uses PATCH, not PUT)
// Backend returns: { data: { id, quotation_number, ... } }
export const updateQuotation = ({ id, ...data }: { id: string } & Partial<CreateQuotationPayload> & { status?: string }) => {
  console.log(`[API updateQuotation] ID: ${id}, data:`, data);
  const url = `quotation/${id}`;
  return axios({ method: "PATCH", url, data });
};

// DELETE /quotation/:id
export const deleteQuotation = (id: string) => {
  console.log(`[API deleteQuotation] ID: ${id}`);
  const url = `quotation/${id}`;
  return axios({ method: "DELETE", url });
};

// PATCH /quotation/:id/status — update status only
// Backend returns: { data: { id, quotation_number, status, ... } }
export const updateQuotationStatus = ({
  id,
  status,
  reject_remarks,
}: {
  id: string;
  status: string;
  reject_remarks?: string;
}) => {
  console.log(`[API updateQuotationStatus] ID: ${id}, status: ${status}, reject_remarks: ${reject_remarks}`);
  const url = `quotation/${id}/status`;
  return axios({ method: "PATCH", url, data: { status, reject_remarks } });
};

// GET /quotation/:id/download — download quotation PDF/blob
export const downloadQuotation = (id: string, params?: any) => {
  console.log(`[API downloadQuotation] ID: ${id}, params:`, params);
  const url = `quotation/${id}/download`;
  return axios({ method: "GET", url, params, responseType: "blob" });
};

// POST /quotation/:id/send-email — send quotation email
export const sendQuotationEmail = (id: string, params?: any) => {
  console.log(`[API sendQuotationEmail] ID: ${id}, params:`, params);
  const url = `quotation/${id}/send-email`;
  return axios({ method: "POST", url, params });
};
