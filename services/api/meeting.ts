import { MeetingRecord } from '@/types/meeting';
import axios from './httpRequest';

export const getMeetings = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/meetings`,
    params
  }) as Promise<MeetingRecord[]>;
};

export const getMeetingDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/meetings/${id}`
  }) as Promise<MeetingRecord>;
};

export const createMeeting = (data: Partial<MeetingRecord>) => {
  return axios({
    method: 'POST',
    url: `/meetings`,
    data
  }) as Promise<MeetingRecord>;
};

export const updateMeeting = (id: string, data: Partial<MeetingRecord>) => {
  return axios({
    method: 'PUT',
    url: `/meetings/${id}`,
    data
  }) as Promise<MeetingRecord>;
};

export const deleteMeeting = (id: string) => {
  return axios({ method: 'DELETE', url: `/meetings/${id}` });
};
