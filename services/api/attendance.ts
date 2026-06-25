import {
  AttendanceHistoryQueryParams,
  PunchInPayload,
  PunchOutPayload,
  buildPunchInData,
  buildPunchOutData,
} from '@/types/attendance';
import axios from './httpRequest';

// GET /users/attendance — get today's attendance status/summary
export const getAttendanceStatus = (params: { user_id: string; startDate: string; endDate: string }) => {
  return axios({
    method: 'GET',
    url: `/users/attendance`,
    params,
  });
};

// GET /users/attendance — get attendance history list
export const getAttendanceHistory = (params?: AttendanceHistoryQueryParams) => {
  return axios({
    method: 'GET',
    url: `/users/attendance`,
    params,
  });
};

// POST /users/attendance/check-in — punch in with selfie image
export const punchIn = (data: PunchInPayload) => {
  return axios({
    method: 'POST',
    url: `/users/attendance/check-in`,
    data: buildPunchInData(data),
  });
};

// PATCH /users/attendance/check-out — punch out with selfie image
export const punchOut = (data: PunchOutPayload) => {
  return axios({
    method: 'PATCH',
    url: `/users/attendance/check-out`,
    data: buildPunchOutData(data),
  });
};
