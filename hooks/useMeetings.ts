import { useState, useEffect } from 'react';
import { MeetingRecord, meetingsState, subscribeToMeetings, updateMeetingsState } from '@/components/MeetingState';

export function useMeetings() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>(meetingsState);

  useEffect(() => {
    return subscribeToMeetings(() => {
      setMeetings([...meetingsState]);
    });
  }, []);

  return {
    meetings,
    updateMeetings: updateMeetingsState,
  };
}
