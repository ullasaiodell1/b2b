import { EmailFilterState, EmailItem } from '@/types/email';
import axios from './httpRequest';

// GET /emails — list emails
export const getEmails = (params?: Partial<EmailFilterState>) => {
  return axios({
    method: 'GET',
    url: `/emails`,
    params
  }) as Promise<EmailItem[]>;
};

// GET /emails/:id — get email details
export const getEmailDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/emails/${id}`
  }) as Promise<EmailItem>;
};

// POST /emails — send email
export const sendEmail = (data: Partial<EmailItem>) => {
  return axios({
    method: 'POST',
    url: `/emails`,
    data
  }) as Promise<EmailItem>;
};
