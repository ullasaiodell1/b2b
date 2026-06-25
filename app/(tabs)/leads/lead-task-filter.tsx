import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { TaskFilterComponent } from '@/components/task/TaskFilterComponent';

export default function LeadTaskFilterScreen() {
  const params = useLocalSearchParams<{ leadId?: string }>();
  const navigation = useNavigation<any>();

  return (
    <TaskFilterComponent
      onApplyFilters={(filters) => {
        router.navigate({
          pathname: '/(tabs)/leads/lead-task',
          params: {
            leadId: params.leadId || '',
            priority: filters.priority || '',
            status: filters.status || '',
            startDate: filters.startDate ? filters.startDate.toISOString() : '',
            endDate: filters.endDate ? filters.endDate.toISOString() : '',
          },
        });
      }}
      onResetFilters={() => {
        router.navigate({
          pathname: '/(tabs)/leads/lead-task',
          params: {
            leadId: params.leadId || '',
            priority: '',
            status: '',
            startDate: '',
            endDate: '',
          },
        });
      }}
    />
  );
}

