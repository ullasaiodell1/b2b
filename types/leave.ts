export interface LeaveParams {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  user_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ApprovalsParams {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LeaveTypeParams {
  search?: string;
  is_active?: boolean;
  type?: 'PAID' | 'UNPAID';
  limit?: number;
  offset?: number;
}

export interface CreateLeavePayload {
  type_id: string;
  start_date: string;
  end_date: string;
  leave_duration?: 'FULL_DAY' | 'HALF_DAY';
  approval_from_email: string;
  remark: string;
}

export interface UpdateLeaveStatusPayload {
  status: 'APPROVED' | 'REJECTED';
  action_remark?: string;
}

export interface UpdateLeaveStatusMutationPayload {
  leaveId: string;
  status: 'APPROVED' | 'REJECTED';
  action_remark?: string;
}

export interface UpdateLeavePayload {
  type_id?: string;
  start_date?: string;
  end_date?: string;
  leave_duration?: 'FULL_DAY' | 'HALF_DAY';
  approval_from_email?: string;
  remark?: string;
}
