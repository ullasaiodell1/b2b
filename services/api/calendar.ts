import { CalendarMeeting, CalendarTask } from '@/types/calendar';
import axios from './httpRequest';

// GET /calendar/meetings — get calendar meetings
export const getCalendarMeetings = (dateStr: string) => {
  return axios({
    method: 'GET',
    url: '/calendar/meetings',
    params: { date: dateStr }
  }) as Promise<CalendarMeeting[]>;
};

// GET /calendar/tasks — get calendar tasks
export const getCalendarTasks = (dateStr: string) => {
  return axios({
    method: 'GET',
    url: '/calendar/tasks',
    params: { date: dateStr }
  }) as Promise<CalendarTask[]>;
};
