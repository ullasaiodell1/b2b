import axios from './httpRequest';

// GET /leads/:leadId/activities — full activity log for a lead
export const getLeadActivity = (leadId: string, params?: any) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/activities`,
    params: { limit: 50, offset: 0, ...params },
  });
};

// GET /leads/:leadId/timeline — alternate endpoint (fallback)
export const getLeadTimeline = (leadId: string, params?: any) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/timeline`,
    params,
  });
};
