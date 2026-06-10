import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskRecord, TaskFilterState } from '@/types/task';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@/services/api/task';

const TASKS_QUERY_KEY = 'tasks';

// Backend status & priority enums
export const TASK_STATUS_MAP: Record<string, string> = {
  'Not Started': 'TODO',
  'in progress': 'IN_PROGRESS',
  'waiting for input': 'IN_REVIEW',
  'Completed': 'COMPLETED',
};

export const TASK_PRIORITY_MAP: Record<string, string> = {
  'Lowest': 'LOW',
  'Normal': 'MEDIUM',
  'High': 'HIGH',
};

export const STATUS_FROM_BACKEND: Record<string, string> = {
  'TODO': 'Not Started',
  'IN_PROGRESS': 'in progress',
  'IN_REVIEW': 'waiting for input',
  'COMPLETED': 'Completed',
  'CANCELLED': 'Not Started',
};

export const PRIORITY_FROM_BACKEND: Record<string, string> = {
  'LOW': 'Lowest',
  'MEDIUM': 'Normal',
  'HIGH': 'High',
  'URGENT': 'High',
};

// Helper: map backend record to TaskRecord
export const mapToTaskRecord = (item: any): TaskRecord => ({
  id: String(item.id || ''),
  title: item.title || '',
  due: item.due_date ? new Date(item.due_date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '',
  priority: (PRIORITY_FROM_BACKEND[item.priority] || item.priority || 'Normal') as any,
  status: (STATUS_FROM_BACKEND[item.status] || item.status || 'Not Started') as any,
  description: item.description || '',
  assigned_to: item.assigned_to || '',
  assigned_to_name: item.assigned_to_fullname || item.assigned_to_name || item.assigned_to?.name || '',
  lead_id: item.lead_id || '',
});

// ── GET all tasks ─────────────────────────────────────────────────
export function useTasks(params?: Partial<TaskFilterState>) {
  const query = useQuery({
    queryKey: [TASKS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await getTasks(params) as any;
      const list = res?.data || res || [];
      return Array.isArray(list) ? list.map(mapToTaskRecord) : [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    error: query.error,
  };
}

// ── CREATE task ───────────────────────────────────────────────────
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<TaskRecord>) => {
      let backendStatus = data.status || 'TODO';
      if (TASK_STATUS_MAP[backendStatus]) {
        backendStatus = TASK_STATUS_MAP[backendStatus];
      }

      let backendPriority = data.priority || 'MEDIUM';
      if (TASK_PRIORITY_MAP[backendPriority]) {
        backendPriority = TASK_PRIORITY_MAP[backendPriority];
      }

      // due_date must be ISO format - parse the friendly date string if needed
      let dueDateISO: string;
      try {
        dueDateISO = data.due ? new Date(data.due).toISOString() : new Date().toISOString();
      } catch {
        dueDateISO = new Date().toISOString();
      }

      const payload: any = {
        title: data.title,
        due_date: dueDateISO,
        priority: backendPriority,
        status: backendStatus,
      };

      if (data.description !== undefined) payload.description = data.description;
      if (data.assigned_to !== undefined) payload.assigned_to = data.assigned_to ? data.assigned_to : null;
      if (data.lead_id !== undefined) payload.lead_id = data.lead_id ? data.lead_id : null;

      const res = await createTask(payload) as any;
      return mapToTaskRecord(res?.data || res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
    onError: (err: any) => {
      console.error('[useCreateTask] error:', err);
    },
  });
}

// ── UPDATE task ───────────────────────────────────────────────────
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskRecord> }) => {
      const payload: any = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.due !== undefined) {
        try { payload.due_date = new Date(data.due).toISOString(); } catch { payload.due_date = data.due; }
      }
      
      if (data.priority !== undefined) {
        payload.priority = TASK_PRIORITY_MAP[data.priority] || data.priority;
      }
      if (data.status !== undefined) {
        payload.status = TASK_STATUS_MAP[data.status] || data.status;
      }
      
      if (data.description !== undefined) payload.description = data.description;
      if (data.assigned_to !== undefined) payload.assigned_to = data.assigned_to ? data.assigned_to : null;
      if (data.lead_id !== undefined) payload.lead_id = data.lead_id ? data.lead_id : null;

      const res = await updateTask(id, payload) as any;
      return mapToTaskRecord(res?.data || res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
    onError: (err: any) => {
      console.error('[useUpdateTask] error:', err);
    },
  });
}

// ── DELETE task ───────────────────────────────────────────────────
export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
    onError: (err: any) => {
      console.error('[useDeleteTask] error:', err);
    },
  });
}
