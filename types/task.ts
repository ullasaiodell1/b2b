export interface TaskRecord {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assigned_to?: string;
  assigned_to_fullname?: string;
  assigned_to_name?: string;
  lead_id?: string;
}

export interface TaskFilterState {
  status: string;
  priority: string;
  dateRange: string;
}
