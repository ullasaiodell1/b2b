import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { TaskFilterComponent } from '@/components/task/TaskFilterComponent';

export default function TaskFilterScreen() {
  const params = useLocalSearchParams<{ startDate?: string; endDate?: string }>();

  const initialStartDate = params.startDate ? new Date(params.startDate) : undefined;
  const initialEndDate = params.endDate ? new Date(params.endDate) : undefined;

  return (
    <TaskFilterComponent
      initialStartDate={initialStartDate}
      initialEndDate={initialEndDate}
      onApplyFilters={(filters) => {
        router.navigate({
          pathname: '/(tabs)/task',
          params: {
            startDate: filters.startDate ? filters.startDate.toISOString() : '',
            endDate: filters.endDate ? filters.endDate.toISOString() : '',
          },
        });
      }}
      onResetFilters={() => {
        router.navigate({
          pathname: '/(tabs)/task',
          params: {
            startDate: '',
            endDate: '',
          },
        });
      }}
    />
  );
}
