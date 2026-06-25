import { CallFilterState, CallRecord } from '@/types/call';
export { CallFilterState, CallRecord };

export const INITIAL_CALLS: CallRecord[] = [];

export let callsState: CallRecord[] = [...INITIAL_CALLS];
export let activeCallFilter: CallFilterState = {
  status: '',
  dateRange: '',
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

export const resetCallsState = () => {
  callsState = [...INITIAL_CALLS];
  activeCallFilter = {
    status: '',
    dateRange: '',
  };
  listeners.forEach((listener) => listener());
};

export const subscribeToCalls = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
