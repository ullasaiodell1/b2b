import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AddTaskScreen from '@/app/(tabs)/task/add-task';
import TaskDetailsScreen from '@/app/(tabs)/task/task-details';
import TaskFilterScreen from '@/app/(tabs)/task/task-filter';
import TaskIndexScreen from '@/app/(tabs)/task/index';

export type TaskStackParamList = {
  TaskIndex: { [key: string]: any } | undefined;
  TaskFilter: { [key: string]: any } | undefined;
  TaskDetails: { id: string; [key: string]: any };
  AddTask: { [key: string]: any } | undefined;
};

const Stack = createNativeStackNavigator<TaskStackParamList>();

export default function TaskNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskIndex" component={TaskIndexScreen} />
      <Stack.Screen name="TaskFilter" component={TaskFilterScreen} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
    </Stack.Navigator>
  );
}
