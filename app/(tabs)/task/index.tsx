import React from 'react';
import { useRoute } from '@react-navigation/native';
import { TasksComponent } from '@/components/task/TasksComponent';

export default function TaskScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <TasksComponent
      leadId={params.leadId}
      leadName={params.leadName}
      company={params.company}
      phone={params.phone}
      email={params.email}
    />
  );
}
