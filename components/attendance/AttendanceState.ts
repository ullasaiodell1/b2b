import { AttendanceState } from '../../types/attendance';
export { AttendanceState };

export let attendanceState: AttendanceState = {
  stampedIn: false,
  stampedOut: false,
  inTime: '--:--',
  outTime: '--:--',
  workTime: '--',
  inPhoto: null,
  outPhoto: null,
  inLocation: null,
  outLocation: null,
  attendanceStatus: 'not_marked',
};

const listeners = new Set<() => void>();

export const updateAttendanceState = (updates: Partial<AttendanceState>) => {
  attendanceState = { ...attendanceState, ...updates };
  listeners.forEach((listener) => listener());
};

export const resetAttendanceState = () => {
  attendanceState = {
    stampedIn: false,
    stampedOut: false,
    inTime: '--:--',
    outTime: '--:--',
    workTime: '--',
    inPhoto: null,
    outPhoto: null,
    inLocation: null,
    outLocation: null,
    attendanceStatus: 'not_marked',
  };
  listeners.forEach((listener) => listener());
};

export const subscribeToAttendance = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
