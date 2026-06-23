import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AddMeetingComponent } from '@/components/meeting/AddMeetingComponent';

export default function AddMeetingScreen() {
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; company?: string }>();

  return (
    <AddMeetingComponent
      initialLeadId={params.leadId}
      initialLeadName={params.leadName}
      initialLeadCompany={params.company}
    />
  );
}
