import { AttendanceState, attendanceState, subscribeToAttendance, updateAttendanceState } from '@/components/attendance/AttendanceState';
import { useEffect, useState } from 'react';

export function useAttendance() {
  const [attendance, setAttendance] = useState<AttendanceState>(attendanceState);

  useEffect(() => {
    return subscribeToAttendance(() => {
      setAttendance({ ...attendanceState });
    });
  }, []);

  return {
    attendance,
    updateAttendance: updateAttendanceState,
  };
}
