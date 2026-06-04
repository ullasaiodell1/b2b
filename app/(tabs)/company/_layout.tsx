import { Stack } from 'expo-router';
import React from 'react';

export default function CompanyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"        options={{ title: 'Companies' }} />
      <Stack.Screen name="company-info" options={{ title: 'Company Details' }} />
    </Stack>
  );
}
