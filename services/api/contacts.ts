import { CreateContactPayload, UpdateContactPayload } from '@/types/contact';
import axios from './httpRequest';

// GET /leads/:leadId/contacts
export const getLeadContacts = (
  leadId: string,
  params?: { limit?: number; offset?: number }
) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/contacts`,
    params: { limit: 10, offset: 0, ...params },
  });
};

// POST /leads/:leadId/contacts
export const createLeadContact = (
  leadId: string,
  data: CreateContactPayload
) => {
  return axios({
    method: 'POST',
    url: `/leads/${leadId}/contacts`,
    data,
  });
};

// PATCH /leads/:leadId/contacts/:contactId
export const updateLeadContact = (
  leadId: string,
  contactId: string,
  data: UpdateContactPayload
) => {
  return axios({
    method: 'PATCH',
    url: `/leads/${leadId}/contacts/${contactId}`,
    data,
  });
};

// DELETE /leads/:leadId/contacts/:contactId
export const deleteLeadContact = (leadId: string, contactId: string) => {
  return axios({
    method: 'DELETE',
    url: `/leads/${leadId}/contacts/${contactId}`,
  });
};
