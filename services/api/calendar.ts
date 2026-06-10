import { CalendarMeeting, CalendarTask } from '@/types/calendar';
import axios from './httpRequest';

export const getCalendarMeetings = (dateStr: string) => {
  return axios({
    method: 'GET',
    url: `/calendar/meetings`,
    params: { date: dateStr }
  }) as Promise<CalendarMeeting[]>;
};

export const getCalendarTasks = (dateStr: string) => {
  return axios({
    method: 'GET',
    url: `/calendar/tasks`, params: { date: dateStr }
  }) as Promise<CalendarTask[]>;
};
