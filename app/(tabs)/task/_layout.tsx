import { Stack } from 'expo-router';
import React from 'react';

export default function TaskLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"        options={{ title: 'Tasks' }} />
      <Stack.Screen name="task-filter"  options={{ title: 'Task Filter' }} />
      <Stack.Screen name="task-details" options={{ title: 'Task Details' }} />
      <Stack.Screen name="add-task"     options={{ title: 'Add Task' }} />
    </Stack>
  );
}
