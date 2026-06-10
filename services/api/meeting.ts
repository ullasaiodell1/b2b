import axios from './httpRequest';

export const getMeetings = (params?: any) => {
  console.log(`[API getMeetings] params:`, params);
  return axios({
    method: 'GET',
    url: `/followups`,
    params,
  });
};

export const getMeetingDetails = (leadId: string, id: string) => {
  console.log(`[API getMeetingDetails] ID: ${id}`);
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/follow-ups/${id}`,
  });
};

export const createMeeting = (leadId: string, data: any) => {
  console.log(`[API createMeeting] data:`, data);
  return axios({
    method: 'POST',
    url: `/leads/${leadId}/follow-ups`,
    data,
  });
};

export const updateMeeting = (leadId: string, id: string, data: any) => {
  console.log(`[API updateMeeting] ID: ${id}, data:`, data);
  return axios({
    method: 'PATCH',
    url: `/leads/${leadId}/follow-ups/${id}`,
    data,
  });
};

export const deleteMeeting = (leadId: string, id: string) => {
  console.log(`[API deleteMeeting] ID: ${id}`);
  return axios({
    method: 'DELETE',
    url: `/leads/${leadId}/follow-ups/${id}`,
  });
};
