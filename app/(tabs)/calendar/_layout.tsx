import { Stack } from 'expo-router';
import React from 'react';

export default function CalendarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"       options={{ title: 'Calendar'   }} />
      <Stack.Screen name="add-task"    options={{ title: 'Add Task'   }} />
      <Stack.Screen name="add-meeting" options={{ title: 'Add Meeting' }} />
    </Stack>
  );
}
