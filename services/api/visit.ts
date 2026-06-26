import { VisitFilterState, VisitRecord } from '@/types/visit';
import axios from './httpRequest';

// GET /visits — list visits
export const getVisits = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/visits`,
    params
  }) as Promise<VisitRecord[]>;
};

// GET /leads/:leadId/visits — list lead visits
export const getLeadVisits = (leadId: string, params?: any) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/visits`,
    params
  }) as Promise<VisitRecord[]>;
};

// GET /leads/:leadId/visits/:id — get visit details
export const getVisitDetails = (leadId: string, id: string) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/visits/${id}`
  }) as Promise<VisitRecord>;
};

// GET /visits/:id — get visit details directly
export const getVisitByIdDirect = (id: string) => {
  return axios({
    method: 'GET',
    url: `/visits/${id}`
  }) as Promise<VisitRecord>;
};

// POST /leads/:leadId/visits — create visit
export const createVisit = (leadId: string, data: Partial<VisitRecord>) => {
  return axios({
    method: 'POST',
    url: `/leads/${leadId}/visits`,
    data
  }) as Promise<VisitRecord>;
};

// PUT /leads/:leadId/visits/:id — update visit
export const updateVisit = (leadId: string, id: string, data: Partial<VisitRecord>) => {
  return axios({
    method: 'PUT',
    url: `/leads/${leadId}/visits/${id}`,
    data
  }) as Promise<VisitRecord>;
};

// DELETE /leads/:leadId/visits/:id — delete visit
export const deleteVisit = (leadId: string, id: string) => {
  return axios({
    method: 'DELETE',
    url: `/leads/${leadId}/visits/${id}`
  });
};

