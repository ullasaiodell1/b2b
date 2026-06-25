import {
  createLeave,
  getLeaveTypes,
  getLeaves,
  deleteLeave,
  updateLeaveStatus,
} from '@/services/api/leave';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserData } from '@/utils/storage';
import {
  LeaveParams,
  ApprovalsParams,
  LeaveTypeParams,
  CreateLeavePayload,
  UpdateLeaveStatusMutationPayload,
} from '@/types/leave';

export const leaveKeys = {
  all: ['leaves'] as const,
  lists: () => [...leaveKeys.all, 'list'] as const,
  list: (params?: any) => [...leaveKeys.lists(), params] as const,
  types: (params?: any) => [...leaveKeys.all, 'types', params] as const,
};

// Hook to fetch personal leaves — only enabled when user_id is available
export function useLeaves(params?: LeaveParams) {
  const resolvedUserId = params?.user_id;

  return useQuery({
    queryKey: leaveKeys.list(params),
    // Only fire when we have a definite user_id — avoids forbidden errors during initial load
    enabled: !!resolvedUserId,
    // Do NOT retry on failure — forbidden errors should not be retried
    retry: false,
    queryFn: async () => {
      const response = await getLeaves(params);
      return (response as any) || { total: 0, data: [] };
    },
  });
}

// Hook to fetch leaves pending approval for the current user (acting as approver)
export function useApprovals(params?: ApprovalsParams) {
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

      const response = await getLeaves(params);
      const allLeaves = (response as any)?.data || [];
      // Client-side: keep only leaves where the logged-in user is the designated approver
      const filtered = allLeaves.filter(
        (row: any) => row.approval_from_email === userEmail && row.user_id !== userId
      );

      return { total: filtered.length, data: filtered };
    },
  });
}

// Hook to fetch leave types
export function useLeaveTypes(params?: LeaveTypeParams) {
  return useQuery({
    queryKey: leaveKeys.types(params),
    retry: false,
    queryFn: async () => {
      const response = await getLeaveTypes({
        is_active: true,
        ...params,
      });
      return (response as any)?.data || [];
    },
  });
}

// Mutation to create/apply for a leave
export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeavePayload) => createLeave(data),
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
    }: UpdateLeaveStatusMutationPayload) => updateLeaveStatus(leaveId, { status, action_remark }),
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
