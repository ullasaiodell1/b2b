export type AttendanceStatus = 'present' | 'absent' | 'late' | 'not_marked';

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
