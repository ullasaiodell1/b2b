import React from 'react';
import { useRoute } from '@react-navigation/native';
import { TasksComponent } from '@/components/task/TasksComponent';

export default function LeadTaskScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <TasksComponent
      leadId={params.leadId || params.id}
      leadName={params.leadName}
      phone={params.phone}
      email={params.email}
    />
  );
}
