import { Stack } from 'expo-router';
import React from 'react';

export default function LeaveLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Leave Management' }} />
      <Stack.Screen name="apply" options={{ title: 'Apply Leave' }} />
      <Stack.Screen name="approvals" options={{ title: 'Leave Approvals' }} />
    </Stack>
  );
}
