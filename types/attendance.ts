export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'not_marked';

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
}
