export interface AttachmentFile {
  id: string;
  name: string;
  type: string;   // e.g. 'PDF', 'JPEG'
  size: string;   // formatted e.g. '484.71 KB'
  uploadedBy: string;
  uploadedAt: string; // ISO string
  url: string;
}

export interface UploadAttachmentPayload {
  uri: string;
  type?: string;
  fileName?: string;
  size?: number;
}

export interface UploadAttachmentResponse {
  file?: string;
  url?: string;
  file_url?: string;
  location?: string;
  path?: string;
  key?: string;
  data?: {
    file?: string;
    url?: string;
    file_url?: string;
    location?: string;
    path?: string;
    key?: string;
  };
}

export interface CreateLeadAttachmentPayload {
  file_url: string;
  file_name: string;
  file_type: string;
  file_size_bytes?: number;
}
