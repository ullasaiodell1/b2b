import { Stack } from 'expo-router';
import React from 'react';

export default function LeadsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Leads' }} />
      <Stack.Screen name="leads-filter" options={{ title: 'Leads Filter' }} />
      <Stack.Screen name="lead-details" options={{ title: 'Lead Details' }} />
      <Stack.Screen name="add-lead"     options={{ title: 'Add Lead' }} />
      <Stack.Screen name="edit-lead"    options={{ title: 'Edit Lead' }} />
      <Stack.Screen name="select-owner" options={{ title: 'Select Lead Owner' }} />
      <Stack.Screen name="select-company" options={{ title: 'Select Company' }} />
      <Stack.Screen name="select-category" options={{ title: 'Select Category' }} />
    </Stack>
  );
}
