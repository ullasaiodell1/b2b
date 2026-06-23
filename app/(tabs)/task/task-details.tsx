import React from 'react';
import { useRoute } from '@react-navigation/native';
import { TaskDetailsComponent } from '@/components/task/TaskDetailsComponent';

export default function TaskDetailsScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <TaskDetailsComponent id={params.id} />
  );
}
