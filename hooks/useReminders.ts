import {
    createReminder,
    deleteReminder,
    getReminderById,
    getReminders,
    updateReminder,
} from '@/services/api/reminder';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const reminderKeys = {
  all: ['reminders'] as const,
  lists: () => [...reminderKeys.all, 'list'] as const,
  list: (params?: any) => [...reminderKeys.lists(), params] as const,
  lead: (leadId: string) => [...reminderKeys.all, 'lead', leadId] as const,
  detail: (id: string) => [...reminderKeys.all, 'detail', id] as const,
};

// ── READ ─────────────────────────────────────────────────────────
// If params.leadId provided → GET /leads/:leadId/reminders
// Otherwise               → GET /reminders (global, all leads)
export const useReminders = (params?: any) => {
  return useQuery({
    queryKey: reminderKeys.list(params),
    queryFn: async () => {
      console.log('[useReminders] Fetching reminders with params:', JSON.stringify(params));
      const res = await getReminders(params);
      console.log('[useReminders] Raw API Response:', JSON.stringify(res));
      return res;
    },
    // Always enabled — when no leadId, fetches global list
    enabled: true,
  });
};

// ── DETAIL ────────────────────────────────────────────────────────
export const useReminderDetail = (id?: string, leadId?: string) => {
  return useQuery({
    queryKey: reminderKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Reminder ID is required');
      const res = await getReminderById(id, leadId);
      console.log('[useReminderDetail] Raw API Response:', JSON.stringify(res));
      return res;
    },
    enabled: !!id,
  });
};

// ── CREATE ────────────────────────────────────────────────────────
// data must include lead_id
export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('[useCreateReminder] Creating reminder with payload:', JSON.stringify(data));
      const res = await createReminder(data);
      console.log('[useCreateReminder] Raw API Response:', JSON.stringify(res));
      return res;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      if (variables?.lead_id) {
        queryClient.invalidateQueries({ queryKey: reminderKeys.lead(variables.lead_id) });
      }
    },
  });
};

// ── UPDATE ────────────────────────────────────────────────────────
// data must include lead_id
export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log(`[useUpdateReminder] Updating reminder ID: ${id} with data:`, JSON.stringify(data));
      const res = await updateReminder(id, data);
      console.log('[useUpdateReminder] Raw API Response:', JSON.stringify(res));
      return res;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.detail(variables.id) });
      if (variables?.data?.lead_id) {
        queryClient.invalidateQueries({ queryKey: reminderKeys.lead(variables.data.lead_id) });
      }
    },
  });
};

// ── DELETE ────────────────────────────────────────────────────────
export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, leadId }: { id: string; leadId: string }) => {
      console.log(`[useDeleteReminder] Deleting reminder ID: ${id}`);
      const res = await deleteReminder(id, leadId);
      console.log('[useDeleteReminder] Raw API Response:', JSON.stringify(res));
      return res;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      if (variables?.leadId) {
        queryClient.invalidateQueries({ queryKey: reminderKeys.lead(variables.leadId) });
      }
    },
  });
};
