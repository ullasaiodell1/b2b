import React from 'react';
import { useRoute } from '@react-navigation/native';
import { EditTaskComponent } from '@/components/task/EditTaskComponent';

export default function EditTaskScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <EditTaskComponent
      id={params.id}
      leadId={params.leadId}
      leadName={params.leadName}
    />
  );
}
