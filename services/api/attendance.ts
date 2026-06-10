import axios from './httpRequest';
import { AttendanceState, AttendanceRecord } from '@/types/attendance';

export const getAttendanceStatus = () => {
  return axios({ method: 'GET', url: `/attendance/status` });
};

export const punchIn = (data: Partial<AttendanceState>) => {
  return axios({ method: 'POST', url: `/attendance/punch-in`, data });
};

export const punchOut = (data: Partial<AttendanceState>) => {
  return axios({ method: 'POST', url: `/attendance/punch-out`, data });
};

export const getAttendanceHistory = () => {
  return axios({ method: 'GET', url: `/attendance/history` }) as Promise<AttendanceRecord[]>;
};
