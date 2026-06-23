import React from 'react';
import { useRoute } from '@react-navigation/native';
import { AddTaskComponent } from '@/components/task/AddTaskComponent';

export default function AddTaskScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <AddTaskComponent
      id={params.id}
      leadId={params.leadId}
      leadName={params.leadName}
    />
  );
}
