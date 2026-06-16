import { VisitFilterState, VisitRecord } from '@/types/visit';
import axios from './httpRequest';

export const getVisits = (params?: Partial<VisitFilterState>) => {
  console.log(`[API getVisits] params:`, params);
  return axios({
    method: 'GET',
    url: `/visits`,
    params
  }) as Promise<VisitRecord[]>;
};

export const getVisitDetails = (leadId: string, id: string) => {
  console.log(`[API getVisitDetails] ID: ${id}`);
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/visits/${id}`
  }) as Promise<VisitRecord>;
};

export const getVisitByIdDirect = (id: string) => {
  console.log(`[API getVisitByIdDirect] ID: ${id}`);
  return axios({
    method: 'GET',
    url: `/visits/${id}`
  }) as Promise<VisitRecord>;
};

export const createVisit = (leadId: string, data: Partial<VisitRecord>) => {
  console.log(`[API createVisit] data:`, data);
  return axios({
    method: 'POST',
    url: `/leads/${leadId}/visits`,
    data
  }) as Promise<VisitRecord>;
};

export const updateVisit = (leadId: string, id: string, data: Partial<VisitRecord>) => {
  console.log(`[API updateVisit] ID: ${id}, data:`, data);
  return axios({
    method: 'PUT',
    url: `/leads/${leadId}/visits/${id}`,
    data
  }) as Promise<VisitRecord>;
};

export const deleteVisit = (leadId: string, id: string) => {
  console.log(`[API deleteVisit] ID: ${id}`);
  return axios({
    method: 'DELETE',
    url: `/leads/${leadId}/visits/${id}`
  });
};
