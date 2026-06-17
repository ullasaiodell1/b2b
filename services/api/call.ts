import axios from './httpRequest';

// GET /leads — fetch raw leads
export const fetchRawLeads = async () => {
  return axios({
    method: 'GET',
    url: '/leads'
  });
};

// GET /leads/:leadId/call-logs — fetch raw call logs
export const fetchRawCallLogs = async (leadId: string) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/call-logs`,
    params: { lead_id: leadId }
  });
};

// POST /leads/:leadId/call-logs — add call log
export const addCallRaw = async (leadId: string, data: any) => {
  const res = await axios({
    method: 'POST',
    url: `/leads/${leadId}/call-logs`,
    data
  });
  return res as any;
};

// PATCH /leads/call-logs/:id — update call log
export const updateCall = async (id: string, data: any) => {
  const res = await axios({
    method: 'PATCH',
    url: `/leads/call-logs/${id}`,
    data
  });
  return res as any;
};

// DELETE /leads/call-logs/:id — delete call log
export const deleteCall = async (id: string) => {
  const res = await axios({
    method: 'DELETE',
    url: `/leads/call-logs/${id}`
  });
  return res;
};
