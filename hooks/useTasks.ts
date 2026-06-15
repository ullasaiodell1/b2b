import { createTask, deleteTask, getTaskById, getTasks, updateTask } from '@/services/api/task';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: () => [...taskKeys.lists()] as const,
  taskFilter: (params?: any) => [...taskKeys.lists(), params] as const,
  details: (id: string) => [...taskKeys.all, 'details', id] as const,
};

// ── GET all tasks ─────────────────────────────────────────────────
export function useTasks(params?: any) {
  const query = useQuery({
    queryKey: taskKeys.taskFilter(params),
    queryFn: async () => {
      const res = await getTasks(params);
      return res;
    },
  });

  return query;
}

// ── GET single task details ────────────────────────────────────────
export function useTask(id: string) {
  const query = useQuery({
    queryKey: taskKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await getTaskById(id) as any;
      return res;
    },
    enabled: !!id,
  });

  return query;
}

// ── CREATE task ───────────────────────────────────────────────────
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await createTask(data) as any;
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
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
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await updateTask(id, data) as any;
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (err: any) => {
      console.error('[useDeleteTask] error:', err);
    },
  });
}
