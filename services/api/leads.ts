import axios from './httpRequest';

export const getLeads = async (params?: any) => {
  const res = await axios({
    method: 'GET',
    url: `/leads`,
    params
  });
  console.log('[API getLeads] Response type:', typeof res, '| is array:', Array.isArray(res));
  if (res && typeof res === 'object') {
    console.log('[API getLeads] Response keys:', Object.keys(res));
    console.log('[API getLeads] total:', (res as any).total, '| data length:', Array.isArray((res as any).data) ? (res as any).data.length : 'not array');
  }
  return res;
};

export const getLeadDetails = async (id: string) => {
  const res = await axios({
    method: 'GET',
    url: `/leads/${id}`
  });
  console.log(`[API getLeadDetails] ID: ${id} Response:`, res?.data || res);
  return res;
};

export const createLead = async (data: any) => {
  console.log('[API createLead] Request data:', data);
  const res = await axios({
    method: 'POST',
    url: `/leads`,
    data
  });
  console.log('[API createLead] Response:', res?.data || res);
  return res;
};

export const updateLead = async (id: string, data: any) => {
  console.log(`[API updateLead] ID: ${id} Request data:`, data);
  const res = await axios({
    method: 'PATCH',
    url: `/leads/${id}`,
    data
  });
  console.log(`[API updateLead] ID: ${id} Response:`, res?.data || res);
  return res;
};

export const deleteLead = async (id: string) => {
  const res = await axios({
    method: 'DELETE',
    url: `/leads/${id}`
  });
  console.log(`[API deleteLead] ID: ${id} Response:`, res?.data || res);
  return res;
};

export const getLeadStatuses = async () => {
  const res = await axios({
    method: 'GET',
    url: `/leads/lead-status`,
    params: { combobox: true }
  });
  console.log('[API getLeadStatuses] Response:', res?.data || res);
  return res;
};

export const getLeadSources = async () => {
  const res = await axios({
    method: 'GET',
    url: `/leads/lead-source`,
    params: { combobox: true }
  });
  console.log('[API getLeadSources] Response:', res?.data || res);
  return res;
};
