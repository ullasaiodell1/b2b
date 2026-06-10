export type TaskStatus = 'Completed' | 'Not Started' | 'waiting for input' | 'in progress';
export type TaskPriority = 'High' | 'Normal' | 'Lowest';

export interface TaskRecord {
  id: string;
  title: string;
  due: string;
  priority: TaskPriority | string;
  status: TaskStatus | string;
  description?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  lead_id?: string;
}

export interface TaskFilterState {
  status: string;
  priority: string;
  dateRange: string;
}
