import { createMeeting, deleteMeeting, getMeetings, updateMeeting } from '@/services/api/meeting';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: () => [...meetingKeys.lists()] as const,
  meetingFilter: (params?: any) => [...meetingKeys.lists(), params] as const,
};

// ── READ ───────────────────────────────────────────────────────────
export const useMeetings = (params?: any) => {
  return useQuery({
    queryKey: meetingKeys.meetingFilter(params),
    queryFn: async () => {
      const response: any = await getMeetings(params);
      return response;
    }
  });
};

// ── CREATE ────────────────────────────────────────────────────────
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, ...payload }: any) => createMeeting(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// ── UPDATE ────────────────────────────────────────────────────────
export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, leadId, ...payload }: any) => updateMeeting(leadId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// ── DELETE ────────────────────────────────────────────────────────
export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, leadId }: { id: string; leadId: string }) => deleteMeeting(leadId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
