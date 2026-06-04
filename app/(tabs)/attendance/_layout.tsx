import { Stack } from 'expo-router';
import React from 'react';

export default function AttendanceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"      options={{ title: 'Attendance'   }} />
      <Stack.Screen
        name="selfie"
        options={{ title: 'Selfie', presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
}
