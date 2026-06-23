import {
  createLeave,
  getLeaveTypes,
  getLeaves,
  deleteLeave,
  updateLeaveStatus,
} from '@/services/api/leave';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserData } from '@/utils/storage';

export const leaveKeys = {
  all: ['leaves'] as const,
  lists: () => [...leaveKeys.all, 'list'] as const,
  list: (params?: any) => [...leaveKeys.lists(), params] as const,
  types: (params?: any) => [...leaveKeys.all, 'types', params] as const,
};

// Helper: detect forbidden errors from the backend
const isForbiddenError = (error: any): boolean => {
  const code = error?.code || error?.response?.data?.code || '';
  const status = error?.response?.status || error?.status;
  return code === 'forbidden' || status === 403;
};

// Hook to fetch personal leaves — only enabled when user_id is available
export function useLeaves(params?: {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  user_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const resolvedUserId = params?.user_id;

  return useQuery({
    queryKey: leaveKeys.list(params),
    // Only fire when we have a definite user_id — avoids forbidden errors during initial load
    enabled: !!resolvedUserId,
    // Do NOT retry on failure — forbidden errors should not be retried
    retry: false,
    queryFn: async () => {
      try {
        const response = await getLeaves(params);
        return (response as any) || { total: 0, data: [] };
      } catch (error: any) {
        if (isForbiddenError(error)) {
          // Return empty state instead of throwing — UI shows empty list gracefully
          return { total: 0, data: [] };
        }
        throw error;
      }
    },
  });
}

// Hook to fetch leaves pending approval for the current user (acting as approver)
export function useApprovals(params?: {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: leaveKeys.list({ ...params, type: 'approvals' }),
    retry: false,
    queryFn: async () => {
      const user = await getUserData();
      const userId = user?.id;
      const userEmail = user?.email;
      if (!userId || !userEmail) {
        return { total: 0, data: [] };
      }

      try {
        const response = await getLeaves({
          ...params,
          user_id: userId,
        });

        const allLeaves = (response as any)?.data || [];
        // Client-side: keep only leaves where the logged-in user is the designated approver
        const filtered = allLeaves.filter(
          (row: any) => row.approval_from_email === userEmail && row.user_id !== userId
        );

        return { total: filtered.length, data: filtered };
      } catch (error: any) {
        if (isForbiddenError(error)) {
          // User's role doesn't have leave approval permission — return empty gracefully
          return { total: 0, data: [] };
        }
        throw error;
      }
    },
  });
}

// Hook to fetch leave types
export function useLeaveTypes(params?: {
  search?: string;
  is_active?: boolean;
  type?: 'PAID' | 'UNPAID';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: leaveKeys.types(params),
    retry: false,
    queryFn: async () => {
      try {
        const response = await getLeaveTypes({
          is_active: true,
          ...params,
        });
        return (response as any)?.data || [];
      } catch (error: any) {
        if (isForbiddenError(error)) {
          // Return empty list — the leave type picker will show "No active leave types found"
          return [];
        }
        throw error;
      }
    },
  });
}

// Mutation to create/apply for a leave
export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type_id: string;
      start_date: string;
      end_date: string;
      leave_duration?: 'FULL_DAY' | 'HALF_DAY';
      approval_from_email: string;
      remark: string;
    }) => createLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

// Mutation to approve/reject a leave
export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leaveId,
      status,
      action_remark,
    }: {
      leaveId: string;
      status: 'APPROVED' | 'REJECTED';
      action_remark?: string;
    }) => updateLeaveStatus(leaveId, { status, action_remark }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      // Invalidate attendance history since leaves modify attendance state
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

// Mutation to delete/cancel a leave request
export function useDeleteLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaveId: string) => deleteLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}
