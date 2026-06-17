import axios from './httpRequest';

// GET /followups — list meetings
export const getMeetings = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/followups`,
    params,
  });
};

// GET /leads/:leadId/follow-ups/:id — get meeting details
export const getMeetingDetails = (leadId: string, id: string) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/follow-ups/${id}`,
  });
};

// POST /leads/:leadId/follow-ups — create meeting
export const createMeeting = (leadId: string, data: any) => {
  return axios({
    method: 'POST',
    url: `/leads/${leadId}/follow-ups`,
    data,
  });
};

// PATCH /leads/:leadId/follow-ups/:id — update meeting
export const updateMeeting = (leadId: string, id: string, data: any) => {
  return axios({
    method: 'PATCH',
    url: `/leads/${leadId}/follow-ups/${id}`,
    data,
  });
};

// DELETE /leads/:leadId/follow-ups/:id — delete meeting
export const deleteMeeting = (leadId: string, id: string) => {
  return axios({
    method: 'DELETE',
    url: `/leads/${leadId}/follow-ups/${id}`,
  });
};

