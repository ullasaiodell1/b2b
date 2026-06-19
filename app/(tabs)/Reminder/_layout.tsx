import { Stack } from 'expo-router';
import React from 'react';

export default function ReminderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"        options={{ title: 'Reminders' }} />
      <Stack.Screen name="add-reminder" options={{ title: 'Add Reminder' }} />
    </Stack>
  );
}
