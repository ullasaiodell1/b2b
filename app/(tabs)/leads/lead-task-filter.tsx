import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { TaskFilterComponent } from '@/components/task/TaskFilterComponent';

export default function LeadTaskFilterScreen() {
  const params = useLocalSearchParams<{ leadId?: string; startDate?: string; endDate?: string }>();
  const navigation = useNavigation<any>();

  const initialStartDate = params.startDate ? new Date(params.startDate) : undefined;
  const initialEndDate = params.endDate ? new Date(params.endDate) : undefined;

  return (
    <TaskFilterComponent
      initialStartDate={initialStartDate}
      initialEndDate={initialEndDate}
      onApplyFilters={(filters) => {
        router.navigate({
          pathname: '/(tabs)/leads/lead-task',
          params: {
            leadId: params.leadId || '',
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
            startDate: '',
            endDate: '',
          },
        });
      }}
    />
  );
}

