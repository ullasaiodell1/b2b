import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { AddTaskComponent } from '@/components/task/AddTaskComponent';

export default function AddTaskScreen() {
  const params = useLocalSearchParams<{ id?: string; leadId?: string; leadName?: string }>();

  const handleBack = () => {
    router.replace('/(tabs)');
  };

  return (
    <AddTaskComponent
      id={params.id}
      leadId={params.leadId}
      leadName={params.leadName}
      onCancel={handleBack}
      onSuccess={handleBack}
    />
  );
}
