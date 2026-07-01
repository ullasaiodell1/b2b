import { ProformaFilterState, ProformaRecord } from '@/types/proforma';
import axios from './httpRequest';

// GET /proforma — list all proformas
export const listProforma = (params?: Partial<ProformaFilterState>) => {
  const url = `proforma`;
  return axios({
    method: "GET",
    url,
    params
  });
};

// GET /proforma/:id — single proforma detail
export const getProformaDetails = (id: string, params?: any) => {
  const url = `proforma/${id}`;
  return axios({
    method: "GET",
    url,
    params
  });
};

// POST /proforma — create new proforma
export const createProforma = (data: Partial<ProformaRecord>) => {
  const url = `proforma`;
  return axios({
    method: "POST",
    url,
    data
  });
};

// PATCH /proforma/:id — update proforma
export const updateProforma = ({ id, ...data }: Partial<ProformaRecord> & { id: string }) => {
  const url = `proforma/${id}`;
  return axios({
    method: "PATCH",
    url,
    data
  });
};

// DELETE /proforma/:id
export const deleteProforma = (id: string) => {
  const url = `proforma/${id}`;
  return axios({
    method: "DELETE",
    url
  });
};

// PATCH /proforma/:id/status — update status
export const updateProformaStatus = ({ id, status, reject_remarks }: { id: string; status: string; reject_remarks?: string }) => {
  const url = `proforma/${id}/status`;
  return axios({
    method: "PATCH",
    url,
    data: {
      status,
      reject_remarks
    }
  });
};
