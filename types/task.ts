export type TaskStatus = 'Completed' | 'Not Started' | 'waiting for input' | 'in progress';
export type TaskPriority = 'High' | 'Normal' | 'Lowest';

export interface TaskRecord {
  id: string;
  title: string;
  due: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface TaskFilterState {
  status: string;
  priority: string;
  dateRange: string;
}
