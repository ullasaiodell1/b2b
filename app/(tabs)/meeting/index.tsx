import React from 'react';
import { useRoute } from '@react-navigation/native';
import { MeetingsComponent } from '@/components/meeting/MeetingsComponent';

export default function MeetingScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <MeetingsComponent
      leadId={params.leadId}
      leadName={params.leadName}
      company={params.company}
      phone={params.phone}
      email={params.email}
    />
  );
}
