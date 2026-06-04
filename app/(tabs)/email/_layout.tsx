import { Stack } from 'expo-router';
import React from 'react';

export default function EmailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Email' }} />
      <Stack.Screen name="add-email" options={{ title: 'Add Email' }} />
      <Stack.Screen name="email-filter" options={{ title: 'Email Filter' }} />
    </Stack>
  );
}
