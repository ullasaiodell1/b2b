import { MeetingRecord } from '@/types/meeting';
export { MeetingRecord };

export const INITIAL_MEETINGS: MeetingRecord[] = [
];

export let meetingsState: MeetingRecord[] = [...INITIAL_MEETINGS];

const listeners = new Set<() => void>();

export const updateMeetingsState = (newMeetings: MeetingRecord[]) => {
  meetingsState = newMeetings;
  listeners.forEach((listener) => listener());
};

export const subscribeToMeetings = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
