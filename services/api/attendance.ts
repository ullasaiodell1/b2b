import { AttendanceRecord, AttendanceState } from '@/types/attendance';
import axios from './httpRequest';

// GET /attendance/status — get current attendance status
export const getAttendanceStatus = () => {
  return axios({
    method: 'GET',
    url: `/attendance/status`
  });
};

// POST /attendance/punch-in — punch in attendance
export const punchIn = (data: Partial<AttendanceState>) => {
  return axios({
    method: 'POST',
    url: `/attendance/punch-in`,
    data
  });
};

// POST /attendance/punch-out — punch out attendance
export const punchOut = (data: Partial<AttendanceState>) => {
  return axios({
    method: 'POST',
    url: `/attendance/punch-out`,
    data
  });
};

// GET /attendance/history — get attendance history
export const getAttendanceHistory = () => {
  return axios({
    method: 'GET',
    url: `/attendance/history`
  }) as Promise<AttendanceRecord[]>;
};
