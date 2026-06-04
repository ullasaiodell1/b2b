import { Stack } from 'expo-router';
import React from 'react';

export default function MeetingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"           options={{ title: 'Meetings' }} />
      <Stack.Screen name="add-meeting"     options={{ title: 'New Meeting' }} />
      <Stack.Screen name="meeting-details" options={{ title: 'Meeting Details' }} />
    </Stack>
  );
}
