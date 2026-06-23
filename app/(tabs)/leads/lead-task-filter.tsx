import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { TaskFilterComponent } from '@/components/task/TaskFilterComponent';

export default function LeadTaskFilterScreen() {
  const params = useLocalSearchParams<{ leadId?: string }>();
  const navigation = useNavigation<any>();

  return (
    <TaskFilterComponent
      onApplyFilters={(filters) => {
        navigation.navigate('lead-task', {
          leadId: params.leadId,
          ...filters,
        });
      }}
      onResetFilters={() => {
        navigation.navigate('lead-task', {
          leadId: params.leadId,
          priority: undefined,
          status: undefined,
          startDate: undefined,
          endDate: undefined,
        });
      }}
    />
  );
}
