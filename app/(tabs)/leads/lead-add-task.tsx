import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AddTaskComponent } from '@/components/task/AddTaskComponent';

export default function LeadAddTaskScreen() {
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; id?: string }>();

  return (
    <AddTaskComponent
      id={params.id}
      leadId={params.leadId}
      leadName={params.leadName}
    />
  );
}
