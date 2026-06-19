import { serverDetails } from '@/config';
import {
    createLeadAttachment,
    deleteLeadAttachment,
    getLeadAttachments,
    uploadAttachmentFile,
} from '@/services/api/attachment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Resolve a relative S3 path to a full URL
// e.g. "attachments/uuid.jpg" → "https://basaltbucket.s3.us-east-1.amazonaws.com/attachments/uuid.jpg"
const resolveFileUrl = (raw: string): string => {
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = serverDetails.s3BucketURL.replace(/\/$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
};

export const attachmentKeys = {
  all: ['attachments'] as const,
  lead: (leadId: string) => [...attachmentKeys.all, 'lead', leadId] as const,
};

// ── Normalize raw API item to a consistent shape ──────────────────
export interface AttachmentFile {
  id: string;
  name: string;
  type: string;   // e.g. 'PDF', 'JPEG'
  size: string;   // formatted e.g. '484.71 KB'
  uploadedBy: string;
  uploadedAt: string; // ISO string
  url: string;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function normalizeAttachment(item: any, index: number): AttachmentFile {
  const rawName =
    item.file_name || item.name || item.filename || item.original_name || `file_${index}`;

  // Derive short type label from mime type or file extension
  const mimeType = item.file_type || item.type || item.mime_type || '';
  const extFromName = (rawName.split('.').pop() || 'FILE').toUpperCase();
  const extFromMime = mimeType.split('/').pop()?.toUpperCase() || '';
  // Normalise common mime suffixes
  const mimeLabel =
    extFromMime === 'JPEG' ? 'JPG' :
    extFromMime === 'PDF'  ? 'PDF' :
    extFromMime || extFromName;
  const type = mimeLabel || extFromName;

  // file_size_bytes comes as a string from the API
  const sizeBytes = parseInt(String(item.file_size_bytes || item.file_size || item.size || '0'), 10);

  return {
    id: String(item.id ?? item.attachment_id ?? index),
    name: rawName,
    type,
    size: formatBytes(sizeBytes),
    uploadedBy:
      item.uploaded_by_name ||
      item.uploaded_by ||
      item.created_by_name ||
      item.user_name ||
      'You',
    uploadedAt: item.uploaded_at || item.created_at || item.date || new Date().toISOString(),
    url: resolveFileUrl(item.file_url || item.url || item.path || ''),
  };
}

// ── READ ──────────────────────────────────────────────────────────
export const useLeadAttachments = (leadId: string) => {
  return useQuery({
    queryKey: attachmentKeys.lead(leadId),
    queryFn: async () => {
      const res = await getLeadAttachments(leadId);
      console.log('[useLeadAttachments] API Response:', JSON.stringify(res, null, 2));
      const raw = res as any;
      // API shape: { total: number, data: [...] }
      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
        ? raw.data.data
        : Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
        ? raw.results
        : Array.isArray(raw?.attachments)
        ? raw.attachments
        : [];
      return list.map(normalizeAttachment) as AttachmentFile[];
    },
    enabled: !!leadId,
  });
};

// ── UPLOAD + CREATE (two-step) ────────────────────────────────────
export const useCreateLeadAttachment = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: {
      uri: string;
      type?: string;
      fileName?: string;
      size?: number;
    }) => {
      // Step 1 — upload file to storage
      // Response shape: { file: "attachments/uuid.jpg", url: "https://...s3...jpg", fileName: "..." }
      const uploadRes = await uploadAttachmentFile({
        uri: file.uri,
        type: file.type,
        fileName: file.fileName,
      });
      const raw = uploadRes as any;

      // Prefer the relative S3 key for storage (matches what GET returns in file_url)
      // Fall back to full URL or local URI
      const fileUrl =
        raw?.file   ||   // relative path  e.g. "attachments/uuid.jpg"
        raw?.data?.file ||
        raw?.url    ||   // full S3 URL
        raw?.data?.url  ||
        raw?.file_url   ||
        raw?.data?.file_url ||
        file.uri;

      // Step 2 — link the uploaded file to the lead
      const linkRes = await createLeadAttachment(leadId, {
        file_url: fileUrl,
        file_name: file.fileName || 'upload',
        file_type: file.type || 'application/octet-stream',
        file_size_bytes: file.size ?? 0,
      });

      return linkRes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lead(leadId) });
    },
  });
};

// ── DELETE ────────────────────────────────────────────────────────
export const useDeleteLeadAttachment = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      console.log(`[useDeleteLeadAttachment] Deleting attachmentId: ${attachmentId} for leadId: ${leadId}`);
      const res = await deleteLeadAttachment(attachmentId);
      console.log('[useDeleteLeadAttachment] delete res:', JSON.stringify(res, null, 2));
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lead(leadId) });
    },
    onError: (err: any) => {
      console.error('[useDeleteLeadAttachment] error:', err);
      console.error('[useDeleteLeadAttachment] error response:', JSON.stringify(err?.response?.data || err, null, 2));
    },
  });
};
