export interface CalendarMeeting {
  id: string;
  title: string;
  time: string;
  team: string;
  type: string;
}

export interface CalendarTask {
  id: string;
  title: string;
  status: string;
  statusColor: string;
  time: string;
  priority: string;
  priorityColor: string;
  icon: string;
  priorityIcon: string;
}

export interface CalendarDayItem {
  name: string;
  date: number;
  fullDate: Date;
}
