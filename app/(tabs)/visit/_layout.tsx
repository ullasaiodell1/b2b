import { Stack } from 'expo-router';
import React from 'react';

export default function VisitLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Visit' }} />
      <Stack.Screen name="add-visit" options={{ title: 'Add Visit' }} />
      <Stack.Screen name="visit-filter" options={{ title: 'Visit Filter' }} />
    </Stack>
  );
}
