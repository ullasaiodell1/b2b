import { VisitFilterState, VisitRecord } from '@/types/visit';
import axios from './httpRequest';

export const getVisits = (params?: Partial<VisitFilterState>) => {
  return axios({
    method: 'GET',
    url: `/visits`,
    params
  }) as Promise<VisitRecord[]>;
};

export const getVisitDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/visits/${id}`
  }) as Promise<VisitRecord>;
};

export const createVisit = (data: Partial<VisitRecord>) => {
  return axios({
    method: 'POST',
    url: `/visits`,
    data
  }) as Promise<VisitRecord>;
};

export const updateVisit = (id: string, data: Partial<VisitRecord>) => {
  return axios({
    method: 'PUT',
    url: `/visits/${id}`,
    data
  }) as Promise<VisitRecord>;
};

export const deleteVisit = (id: string) => {
  return axios({
    method: 'DELETE',
    url: `/visits/${id}`
  });
};
