import React from 'react';
import { useRoute } from '@react-navigation/native';
import { MeetingDetailsComponent } from '@/components/meeting/MeetingDetailsComponent';

export default function MeetingDetailsScreen() {
  const route = useRoute<any>();
  const id = route.params?.id || '';

  return (
    <MeetingDetailsComponent id={id} />
  );
}
