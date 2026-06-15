import axios from './httpRequest';

export const fetchRawLeads = async () => {
  return axios({ method: 'GET', url: '/leads' });
};

export const fetchRawCallLogs = async (leadId: string) => {
  return axios({ method: 'GET', url: `/leads/${leadId}/call-logs`, params: { lead_id: leadId } });
};

export const addCallRaw = async (leadId: string, data: any) => {
  let call_type = 'INBOUND';
  if (data.type === 'Incoming' || data.call_type === 'INBOUND') call_type = 'INBOUND';
  else if (data.type === 'Outgoing' || data.call_type === 'OUTBOUND') call_type = 'OUTBOUND';
  else if (data.type === 'Missed' || data.call_type === 'MISSED') call_type = 'MISSED';

  let duration_seconds = 0;
  if (data.duration) {
    const parts = data.duration.split(':');
    if (parts.length === 2) {
      duration_seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
  } else if (data.duration_seconds !== undefined) {
    duration_seconds = data.duration_seconds;
  }

  const payload: any = {
    lead_id: leadId,
    call_type,
    call_start_time: data.call_start_time || new Date().toISOString(),
    duration_seconds,
    subject: data.name || data.subject || 'Call log',
    remarks: data.remarks || '',
    is_auto_logged: !!data.is_auto_logged,
  };

  if (data.recordingUrl || data.recording_url) {
    payload.recording_url = data.recordingUrl || data.recording_url;
  }

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
