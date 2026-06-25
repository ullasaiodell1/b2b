import {
  createLeadAttachment,
  deleteLeadAttachment,
  getLeadAttachments,
  uploadAttachmentFile,
} from '@/services/api/attachment';
import {
  AttachmentFile,
  UploadAttachmentPayload,
  UploadAttachmentResponse,
  CreateLeadAttachmentPayload,
} from '@/types/attachment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  normalizeAttachment,
  getUploadedFileUrl,
  buildCreateAttachmentPayload,
} from '@/app/(tabs)/leads/lead-attachments';

export type { AttachmentFile };

export const attachmentKeys = {
  all: ['attachments'] as const,
  lead: (leadId: string) => [...attachmentKeys.all, 'lead', leadId] as const,
};

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
      return list.map((item: any, idx: number) => normalizeAttachment(item, idx)) as AttachmentFile[];
    },
    enabled: !!leadId,
  });
};

// ── UPLOAD + CREATE (two-step) ────────────────────────────────────
export const useCreateLeadAttachment = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: UploadAttachmentPayload) => {
      const uploadRes: UploadAttachmentResponse = await uploadAttachmentFile(file);
      const fileUrl = getUploadedFileUrl(uploadRes, file.uri);
      const linkRes = await createLeadAttachment(leadId, buildCreateAttachmentPayload(fileUrl, file));

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
