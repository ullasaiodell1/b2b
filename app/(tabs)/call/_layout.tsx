import { Stack } from 'expo-router';
import React from 'react';

export default function CallLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"        options={{ title: 'Calls' }} />
      <Stack.Screen name="call-history" options={{ title: 'Call History' }} />
      <Stack.Screen name="call-filter"  options={{ title: 'Call Filter' }} />
    </Stack>
  );
}
