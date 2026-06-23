import { updateAttendanceState } from '@/components/attendance/AttendanceState';
import {
    getAttendanceHistory,
    getAttendanceStatus,
    punchIn,
    punchOut,
} from '@/services/api/attendance';
import { AttendanceRecord, AttendanceState, AttendanceStatusResponse } from '@/types/attendance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserData } from '@/utils/storage';

export const attendanceKeys = {
  all: ['attendance'] as const,
  status: () => [...attendanceKeys.all, 'status'] as const,
  history: (month?: number, year?: number, statusFilter?: string) =>
    [...attendanceKeys.all, 'history', month, year, statusFilter] as const,
};

// ── Helper: map backend summary → local AttendanceState ──────────────
function mapStatusToState(data: AttendanceStatusResponse): Partial<AttendanceState> {
  const formatTime = (raw: string | null): string => {
    if (!raw) return '--:--';
    // Handle ISO or "HH:mm" strings
    if (raw.includes('T')) {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return '--:--';
      // Shift to IST timezone (+5.5 hours)
      const istDate = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
      const h = String(istDate.getUTCHours()).padStart(2, '0');
      const m = String(istDate.getUTCMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }
    return raw;
  };

  return {
    stampedIn: data.is_checked_in,
    stampedOut: data.is_checked_out,
    inTime: formatTime(data.check_in_time),
    outTime: formatTime(data.check_out_time),
    workTime: data.work_duration ?? '--',
    inPhoto: data.checkin_image ?? null,
    outPhoto: data.checkout_image ?? null,
    inLocation: data.checkin_location ?? null,
    outLocation: data.checkout_location ?? null,
  };
}

// ── Helper: map backend record → AttendanceStatusResponse ──────────────
function mapRecordToStatusResponse(row: any): AttendanceStatusResponse {
  if (!row) {
    return {
      is_checked_in: false,
      is_checked_out: false,
      check_in_time: null,
      check_out_time: null,
      work_duration: null,
      checkin_image: null,
      checkout_image: null,
      checkin_location: null,
      checkout_location: null,
    };
  }

  // Row status can be CHECKED_IN or CHECKED_OUT
  const isCheckedIn = row.status === 'CHECKED_IN' || row.status === 'CHECKED_OUT';
  const isCheckedOut = row.status === 'CHECKED_OUT';

  return {
    is_checked_in: isCheckedIn,
    is_checked_out: isCheckedOut,
    check_in_time: row.checkin_time || null,
    check_out_time: row.checkout_time || null,
    work_duration: row.work_duration || null,
    checkin_image: row.checkin_image_url || row.checkin_image || null,
    checkout_image: row.checkout_image_url || row.checkout_image || null,
    checkin_location: row.checkin_location || null,
    checkout_location: row.checkout_location || null,
  };
}

// ── READ: today's status ───────────────────────────────────────────────
export function useAttendanceStatus() {
  return useQuery({
    queryKey: attendanceKeys.status(),
    queryFn: async () => {
      const user = await getUserData();
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not logged in');
      }

      const pad = (n: number) => String(n).padStart(2, '0');
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

      const response = await getAttendanceStatus({
        user_id: userId,
        startDate: todayStr,
        endDate: todayStr,
      });

      const list = (response as any)?.data || [];
      const todayRecord = list[0] || null;

      const data = mapRecordToStatusResponse(todayRecord);

      // Sync into local store so the UI reacts immediately
      updateAttendanceState(mapStatusToState(data));
      return data;
    },
  });
}

// ── Helper: parse UTC timestamp to IST timezone ────────────────────
const parseDateInIST = (raw: string | null): Date | null => {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  if (raw.length === 10 && raw.indexOf('-') === 4) {
    return new Date(`${raw}T12:00:00Z`);
  }
  return new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
};

// ── Helper: map backend record → local AttendanceRecord ─────────────
function mapBackendRecordToFrontend(row: any): AttendanceRecord {
  const checkinDate = parseDateInIST(row.checkin_time);
  const checkoutDate = parseDateInIST(row.checkout_time);

  // Day name (e.g. "Monday")
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = checkinDate ? dayNames[checkinDate.getUTCDay()] : '--';

  // Date (e.g. "22 Jun")
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = checkinDate ? `${checkinDate.getUTCDate()} ${monthNamesShort[checkinDate.getUTCMonth()]}` : '--';

  // Map status:
  // Backend attendance_status: 'PRESENT', 'HALF_DAY', 'ON_TIME', 'LATE', 'ABSENT', 'LEAVE'
  // Frontend expects: 'present' | 'absent' | 'leave' | 'not_marked'
  let status: 'present' | 'absent' | 'leave' | 'not_marked' = 'not_marked';
  const backendStatus = row.attendance_status ? row.attendance_status.toUpperCase() : '';
  if (
    backendStatus === 'PRESENT' ||
    backendStatus === 'ON_TIME' ||
    backendStatus === 'HALF_DAY'
  ) {
    status = 'present';
  } else if (backendStatus === 'LEAVE' || backendStatus === 'LATE') {
    status = 'leave';
  } else if (backendStatus === 'ABSENT') {
    status = 'absent';
  }

  // Format times as HH:mm
  const formatTime = (d: Date | null): string => {
    if (!d) return '--:--';
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const inTime = row.checkin_time && row.status !== 'MISSED' ? formatTime(checkinDate) : '--:--';
  const outTime = checkoutDate ? formatTime(checkoutDate) : '--:--';

  // Calculate work duration
  let workTime = '--';
  if (checkinDate && checkoutDate) {
    const diffMs = checkoutDate.getTime() - checkinDate.getTime();
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      workTime = diffHours === 0 ? `${remainingMins}m` : `${diffHours}h ${remainingMins}m`;
    }
  }

  return {
    id: row.id,
    day,
    date: dateStr,
    status,
    inTime,
    outTime,
    workTime,
    inPhoto: row.checkin_image_url || row.checkin_image || null,
    outPhoto: row.checkout_image_url || row.checkout_image || null,
  };
}

// ── READ: history list ─────────────────────────────────────────────────
export function useAttendanceHistory(month?: number, year?: number, statusFilter?: string) {
  // Map frontend filter label to backend attendance_status values
  const toBackendStatus = (filter?: string): string | undefined => {
    switch (filter) {
      case 'Present': return 'PRESENT';
      case 'Absent':  return 'ABSENT';
      case 'Leave':   return 'LEAVE';
      default:        return undefined; // 'All' => no filter sent
    }
  };

  const backendStatus = toBackendStatus(statusFilter);

  return useQuery({
    queryKey: attendanceKeys.history(month, year, statusFilter),
    queryFn: async () => {
      const user = await getUserData();
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not logged in');
      }
      const response = await getAttendanceHistory({
        month,
        year,
        user_id: userId,
        attendance_status: backendStatus,
      });
      let responseData = (response as any)?.data || [];
      // Filter list to keep only the personal records of the logged-in user
      responseData = responseData.filter((row: any) => row.user_id === userId);
      return responseData.map(mapBackendRecordToFrontend) as AttendanceRecord[];
    },
  });
}

// ── MUTATION: punch in ─────────────────────────────────────────────────
export function usePunchIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { checkin_image: string; latitude: number; longitude: number; location?: string }) => punchIn(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.status() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      if (data) {
        // Backend may return the updated record — sync if possible
        const mapped = mapStatusToState(data as AttendanceStatusResponse);
        updateAttendanceState(mapped);
      }
    },
  });
}

// ── MUTATION: punch out ────────────────────────────────────────────────
export function usePunchOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { checkout_image: string; latitude: number; longitude: number; location?: string }) => punchOut(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.status() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      if (data) {
        const mapped = mapStatusToState(data as AttendanceStatusResponse);
        updateAttendanceState(mapped);
      }
    },
  });
}


