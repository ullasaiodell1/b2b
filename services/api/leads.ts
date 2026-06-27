import axios from './httpRequest';

// GET /leads — list leads
export const getLeads = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/leads`,
    params
  });
};

// GET /leads/:id — get lead details
export const getLeadDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/leads/${id}`
  });
};

// POST /leads — create lead
export const createLead = (data: any) => {
  return axios({
    method: 'POST',
    url: `/leads`,
    data
  });
};

// PATCH /leads/:id — update lead
export const updateLead = (id: string, data: any) => {
  return axios({
    method: 'PATCH',
    url: `/leads/${id}`,
    data
  });
};

// DELETE /leads/:id — delete lead
export const deleteLead = (id: string) => {
  return axios({
    method: 'DELETE',
    url: `/leads/${id}`
  });
};

// GET /leads/lead-status — list lead statuses
export const getLeadStatuses = () => {
  return axios({
    method: 'GET',
    url: `/leads/lead-status`,
    params: { offset: 0, limit: 20 }
  });
};

// GET /leads/lead-source — list lead sources
export const getLeadSources = () => {
  return axios({
    method: 'GET',
    url: `/leads/lead-source`,
    params: { combobox: true }
  });
};

// GET /leads/tags — list lead tags
export const getLeadTags = () => {
  return axios({
    method: 'GET',
    url: `/leads/tags`,
    params: { limit: 100 }
  });
};

// POST /leads/:id/verification — verify lead
export const verifyLead = (id: string, data: {
  number_of_properties: number;
  cities_of_operation: string[];
  currently_purchasing_from: string;
  verification_notes: string;
}) => {
  return axios({
    method: 'POST',
    url: `/leads/${id}/verification`,
    data
  });
};

// PATCH /leads/:id/verification — update lead verification
export const updateLeadVerification = (id: string, data: {
  number_of_properties: number;
  cities_of_operation: string[];
  currently_purchasing_from: string;
  verification_notes: string;
}) => {
  return axios({
    method: 'PATCH',
    url: `/leads/${id}/verification`,
    data
  });
};

// POST /leads/:id/convert-to-customer — convert lead to customer
export const convertLeadToCustomer = (id: string, data?: any) => {
  return axios({
    method: 'POST',
    url: `/leads/${id}/convert-to-customer`,
    data
  });
};




