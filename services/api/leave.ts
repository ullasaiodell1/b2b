import axios from './httpRequest';

// GET /leaves — list leave requests
export const getLeaves = async (params?: {
  search?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  user_id?: string;
  limit?: number;
  offset?: number;
}) => {
  console.log('[API getLeaves] Fetching leaves with params:', params);
  try {
    const response = await axios({
      method: 'GET',
      url: `/leaves`,
      params,
    });
    console.log('[API getLeaves] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API getLeaves] Error:', error);
    throw error;
  }
};

// GET /leaves/types — list leave types
export const getLeaveTypes = async (params?: {
  search?: string;
  is_active?: boolean;
  type?: 'PAID' | 'UNPAID';
  limit?: number;
  offset?: number;
}) => {
  console.log('[API getLeaveTypes] Fetching leave types with params:', params);
  try {
    const response = await axios({
      method: 'GET',
      url: `/leaves/types`,
      params,
    });
    console.log('[API getLeaveTypes] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API getLeaveTypes] Error:', error);
    throw error;
  }
};

// POST /leaves — create/apply a leave request
export const createLeave = async (data: {
  type_id: string;
  start_date: string;
  end_date: string;
  leave_duration?: 'FULL_DAY' | 'HALF_DAY';
  approval_from_email: string;
  remark: string;
}) => {
  console.log('[API createLeave] Creating leave request with data:', data);
  try {
    const response = await axios({
      method: 'POST',
      url: `/leaves`,
      data,
    });
    console.log('[API createLeave] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API createLeave] Error:', error);
    throw error;
  }
};

// PATCH /leaves/:leave_id/status — update status of a leave request
export const updateLeaveStatus = async (
  leaveId: string,
  data: {
    status: 'APPROVED' | 'REJECTED';
    action_remark?: string;
  }
) => {
  console.log(`[API updateLeaveStatus] Updating status of leave ${leaveId} with:`, data);
  try {
    const response = await axios({
      method: 'PATCH',
      url: `/leaves/${leaveId}/status`,
      data,
    });
    console.log('[API updateLeaveStatus] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API updateLeaveStatus] Error:', error);
    throw error;
  }
};

// PATCH /leaves/:leave_id — update a leave request
export const updateLeave = async (
  leaveId: string,
  data: {
    type_id?: string;
    start_date?: string;
    end_date?: string;
    leave_duration?: 'FULL_DAY' | 'HALF_DAY';
    approval_from_email?: string;
    remark?: string;
  }
) => {
  console.log(`[API updateLeave] Updating leave ${leaveId} with:`, data);
  try {
    const response = await axios({
      method: 'PATCH',
      url: `/leaves/${leaveId}`,
      data,
    });
    console.log('[API updateLeave] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API updateLeave] Error:', error);
    throw error;
  }
};

// DELETE /leaves/:leave_id — delete/cancel a leave request
export const deleteLeave = async (leaveId: string) => {
  console.log(`[API deleteLeave] Deleting leave: ${leaveId}`);
  try {
    const response = await axios({
      method: 'DELETE',
      url: `/leaves/${leaveId}`,
    });
    console.log('[API deleteLeave] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API deleteLeave] Error:', error);
    throw error;
  }
};
