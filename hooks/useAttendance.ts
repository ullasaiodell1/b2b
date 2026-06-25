import { updateAttendanceState } from '@/components/attendance/AttendanceState';
import {
    getAttendanceHistory,
    getAttendanceStatus,
    punchIn,
    punchOut,
} from '@/services/api/attendance';
import {
  AttendanceRecord,
  AttendanceState,
  AttendanceStatusResponse,
  BACKEND_STATUS_MAP,
  PunchInPayload,
  PunchOutPayload,
} from '@/types/attendance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserData } from '@/utils/storage';
import {
  mapStatusToState,
  mapRecordToStatusResponse,
  mapBackendRecordToFrontend,
  buildAttendanceHistoryParams,
} from '@/app/(tabs)/attendance';

export const attendanceKeys = {
  all: ['attendance'] as const,
  status: () => [...attendanceKeys.all, 'status'] as const,
  history: (month?: number, year?: number, statusFilter?: string) =>
    [...attendanceKeys.all, 'history', month, year, statusFilter] as const,
};

// ── READ: today's status ───────────────────────────────────────────────
export function useAttendanceStatus() {
  return useQuery({
    queryKey: attendanceKeys.status(),
    queryFn: async () => {
      const user = await getUserData();
      const userId = user?.id;
      if (!userId) throw new Error('User not logged in');

      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const response = await getAttendanceStatus({ user_id: userId, startDate: todayStr, endDate: todayStr });
      const data = mapRecordToStatusResponse((response as any)?.data?.[0]);

      updateAttendanceState(mapStatusToState(data));
      return data;
    },
  });
}

// ── READ: history list ─────────────────────────────────────────────────
export function useAttendanceHistory(month?: number, year?: number, statusFilter?: string) {
  const backendStatus = statusFilter ? BACKEND_STATUS_MAP[statusFilter] : undefined;

  return useQuery({
    queryKey: attendanceKeys.history(month, year, statusFilter),
    queryFn: async () => {
      const user = await getUserData();
      const userId = user?.id;
      if (!userId) throw new Error('User not logged in');

      const res = await getAttendanceHistory(
        buildAttendanceHistoryParams({ month, year, user_id: userId, attendance_status: backendStatus })
      );
      return ((res as any)?.data || [])
        .filter((row: any) => row.user_id === userId)
        .map(mapBackendRecordToFrontend) as AttendanceRecord[];
    },
  });
}

// ── MUTATION: punch in ─────────────────────────────────────────────────
export function usePunchIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PunchInPayload) => punchIn(data),
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
    mutationFn: (data: PunchOutPayload) => punchOut(data),
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


