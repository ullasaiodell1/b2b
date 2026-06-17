import {
  getAttendanceStatus,
  punchIn,
  punchOut,
  getAttendanceHistory,
} from '@/services/api/attendance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AttendanceState } from '@/types/attendance';
import {
  updateAttendanceState,
} from '@/components/attendance/AttendanceState';

export const attendanceKeys = {
  all: ['attendance'] as const,
  status: () => [...attendanceKeys.all, 'status'] as const,
  history: () => [...attendanceKeys.all, 'history'] as const,
};



// ── READ (API STATUS) ──────────────────────────────────────────────
export function useAttendanceStatus() {
  return useQuery({
    queryKey: attendanceKeys.status(),
    queryFn: async () => {
      const response = await getAttendanceStatus();
      return response as unknown as AttendanceState;
    },
  });
}

// ── READ (API HISTORY) ─────────────────────────────────────────────
export function useAttendanceHistory() {
  return useQuery({
    queryKey: attendanceKeys.history(),
    queryFn: async () => {
      const response = await getAttendanceHistory();
      return response;
    },
  });
}

// ── CREATE / UPDATE (PUNCH IN / OUT MUTATIONS) ─────────────────────
export function usePunchIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AttendanceState>) => punchIn(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.status() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.history() });
      if (data) {
        updateAttendanceState(data);
      }
    },
  });
}

export function usePunchOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AttendanceState>) => punchOut(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.status() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.history() });
      if (data) {
        updateAttendanceState(data);
      }
    },
  });
}

