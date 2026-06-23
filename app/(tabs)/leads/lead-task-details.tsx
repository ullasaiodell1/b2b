import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TaskDetailsComponent } from '@/components/task/TaskDetailsComponent';

export default function LeadTaskDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();

  return (
    <TaskDetailsComponent id={params.id || ''} />
  );
}
