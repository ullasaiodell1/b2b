import axios from './httpRequest';
import {
  LeaveParams,
  LeaveTypeParams,
  CreateLeavePayload,
  UpdateLeaveStatusPayload,
  UpdateLeavePayload,
} from '@/types/leave';

// GET /leaves — list leave requests
export const getLeaves = (params?: LeaveParams) => {
  return axios({
    method: 'GET',
    url: `/leaves`,
    params,
  });
};

// GET /leaves/types — list leave types
export const getLeaveTypes = (params?: LeaveTypeParams) => {
  return axios({
    method: 'GET',
    url: `/leaves/types`,
    params,
  });
};

// POST /leaves — create/apply a leave request
export const createLeave = (data: CreateLeavePayload) => {
  return axios({
    method: 'POST',
    url: `/leaves`,
    data,
  });
};

// PATCH /leaves/:leave_id/status — update status of a leave request
export const updateLeaveStatus = (
  leaveId: string,
  data: UpdateLeaveStatusPayload
) => {
  return axios({
    method: 'PATCH',
    url: `/leaves/${leaveId}/status`,
    data,
  });
};

// PATCH /leaves/:leave_id — update a leave request
export const updateLeave = (
  leaveId: string,
  data: UpdateLeavePayload
) => {
  return axios({
    method: 'PATCH',
    url: `/leaves/${leaveId}`,
    data,
  });
};

// DELETE /leaves/:leave_id — delete/cancel a leave request
export const deleteLeave = (leaveId: string) => {
  return axios({
    method: 'DELETE',
    url: `/leaves/${leaveId}`,
  });
};
