import { EmailFilterState, EmailItem } from '@/types/email';
import axios from './httpRequest';

export const getEmails = (params?: Partial<EmailFilterState>) => {
  return axios({
    method: 'GET',
    url: `/emails`,
    params
  }) as Promise<EmailItem[]>;
};

export const getEmailDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/emails/${id}`
  }) as Promise<EmailItem>;
};

export const sendEmail = (data: Partial<EmailItem>) => {
  return axios({
    method: 'POST',
    url: `/emails`,
    data
  }) as Promise<EmailItem>;
};
