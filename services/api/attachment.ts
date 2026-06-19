import axios from './httpRequest';

// GET /leads/:leadId/attachments
export const getLeadAttachments = (leadId: string, params?: { limit?: number; offset?: number }) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/attachments`,
    params: { limit: 10, offset: 0, ...params },
  });
};

// POST /files/uploads?folder=attachments — upload file to storage
export const uploadAttachmentFile = (data: {
  uri: string;
  type?: string;
  fileName?: string;
}): Promise<any> => {
  const formData = new FormData();
  // @ts-ignore
  formData.append('file', {
    uri: data.uri,
    name: data.fileName || 'upload',
    type: data.type || 'application/octet-stream',
  });
  return axios({
    method: 'POST',
    url: '/files/uploads',
    params: { folder: 'attachments' },
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// POST /leads/:leadId/attachments — link uploaded file to lead
export const createLeadAttachment = (leadId: string, data: {
  file_url: string;
  file_name: string;
  file_type: string;
  file_size_bytes?: number;
}) => {
  return axios({
    method: 'POST',
    url: `/leads/${leadId}/attachments`,
    data,
  });
};

// DELETE /leads/attachments/:attachmentId
export const deleteLeadAttachment = (attachmentId: string) => {
  return axios({
    method: 'DELETE',
    url: `/leads/attachments/${attachmentId}`,
  });
};
