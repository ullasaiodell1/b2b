import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MeetingDetailsComponent } from '@/components/meeting/MeetingDetailsComponent';

export default function LeadMeetingDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();

  return (
    <MeetingDetailsComponent id={params.id || ''} />
  );
}
