import axios from './httpRequest';

export const fetchRawLeads = async () => {
  return axios({ method: 'GET', url: '/leads' });
};

export const fetchRawCallLogs = async (leadId: string) => {
  return axios({ method: 'GET', url: `/leads/${leadId}/call-logs`, params: { lead_id: leadId } });
};

export const addCallRaw = async (leadId: string, payload: any) => {
  console.log('[API addCall] Request to /leads/:id/call-logs:', payload);
  const res = await axios({
    method: 'POST',
    url: `/leads/${leadId}/call-logs`,
    data: payload
  });
  console.log('[API addCall] Response:', res?.data || res);
  return res as any;
};

export const updateCall = async (id: string, data: any) => {
  console.log(`[API updateCall] ID: ${id} Request data:`, data);
  const res = await axios({
    method: 'PATCH',
    url: `/leads/call-logs/${id}`,
    data
  });
  console.log(`[API updateCall] ID: ${id} Response:`, res?.data || res);
  return res as any;
};

export const deleteCall = async (id: string) => {
  const res = await axios({
    method: 'DELETE',
    url: `/leads/call-logs/${id}`
  });
  console.log(`[API deleteCall] ID: ${id} Response:`, res?.data || res);
  return res;
};
