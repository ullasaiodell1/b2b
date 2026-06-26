import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { EditTaskComponent } from '@/components/task/EditTaskComponent';

export default function LeadEditTaskScreen() {
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; id: string }>();

  return (
    <EditTaskComponent
      id={params.id}
      leadId={params.leadId}
      leadName={params.leadName}
    />
  );
}
