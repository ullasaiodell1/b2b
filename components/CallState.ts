import { CallRecord, CallFilterState } from '../types/call';
export { CallRecord, CallFilterState };

export const INITIAL_CALLS: CallRecord[] = [
  {
    id: '1',
    name: 'Khushal Nadiyapara',
    phoneNumber: '+91 12345 67890',
    dateTime: '20 Jan 2026, 6:03pm',
    duration: '50:00 min',
    type: 'Incoming',
  },
  {
    id: '2',
    name: 'Parth Solanki',
    phoneNumber: '+91 12345 67890',
    dateTime: '20 Jan 2026, 6:03pm',
    duration: '50:00 min',
    type: 'Outgoing',
  },
  {
    id: '3',
    name: 'Jigar Kalariya',
    phoneNumber: '+91 12345 67890',
    dateTime: '20 Jan 2026, 6:03pm',
    duration: '00:00 min',
    type: 'Missed',
  },
];

export let callsState: CallRecord[] = [...INITIAL_CALLS];
export let activeCallFilter: CallFilterState = {
  status: '',
  dateRange: '28 Dec 22 - 10 Jan 23',
};

const listeners = new Set<() => void>();

export const updateCallsState = (newCalls: CallRecord[]) => {
  callsState = newCalls;
  listeners.forEach((listener) => listener());
};

export const updateCallFilterState = (newFilter: CallFilterState) => {
  activeCallFilter = newFilter;
  listeners.forEach((listener) => listener());
};

export const subscribeToCalls = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
