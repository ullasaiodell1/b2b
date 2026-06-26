export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'not_marked' | 'working';

export const BACKEND_STATUS_MAP: Record<string, string> = {
  Present: 'PRESENT',
  Absent: 'ABSENT',
  Leave: 'LEAVE',
  'Half Day': 'HALF_DAY',
  'On Time': 'ON_TIME',
  Late: 'LATE',
};

// Matches backend GET /attendance/summary response
export interface AttendanceStatusResponse {
  is_checked_in: boolean;
  is_checked_out: boolean;
  check_in_time: string | null;    // ISO string or "HH:mm"
  check_out_time: string | null;
  work_duration: string | null;
  checkin_image: string | null;    // URL
  checkout_image: string | null;
  checkin_location: string | null;
  checkout_location: string | null;
  attendance_status?: string | null;
}

// Matches backend GET /attendance list item
export interface AttendanceRecord {
  id: number;
  day: string;
  date: string;
  status: AttendanceStatus;
  inTime: string;
  outTime: string;
  workTime: string;
  inPhoto: string | null;
  outPhoto: string | null;
}

// Local UI state (used by AttendanceState store)
export interface AttendanceState {
  stampedIn: boolean;
  stampedOut: boolean;
  inTime: string;
  outTime: string;
  workTime: string;
  inPhoto: string | null;
  outPhoto: string | null;
  inLocation: string | null;
  outLocation: string | null;
  attendanceStatus?: AttendanceStatus;
}

export interface AttendanceHistoryParams {
  month?: number;
  year?: number;
  user_id?: string;
  attendance_status?: string;
}

export interface AttendanceHistoryQueryParams {
  user_id?: string;
  attendance_status?: string;
  startDate?: string;
  endDate?: string;
}

export interface PunchInPayload {
  checkin_image: string;
  latitude: number;
  longitude: number;
  location?: string;
}

export interface PunchOutPayload {
  checkout_image: string;
  latitude: number;
  longitude: number;
  location?: string;
  work_summary?: string;
}

export function buildPunchInData(data: PunchInPayload) {
  return {
    checkin_latitude: data.latitude,
    checkin_longitude: data.longitude,
    checkin_image: data.checkin_image,
  };
}

export function buildPunchOutData(data: PunchOutPayload) {
  return {
    checkout_latitude: data.latitude,
    checkout_longitude: data.longitude,
    checkout_image: data.checkout_image,
    work_summary: data.work_summary,
  };
}
