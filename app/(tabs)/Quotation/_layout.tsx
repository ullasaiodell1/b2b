import { Stack } from 'expo-router';
import React from 'react';

export default function QuotationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Quotations' }} />
      <Stack.Screen name="quotation-filter" options={{ title: 'Quotation Filter' }} />
      <Stack.Screen name="add-quotation" options={{ title: 'Add Quotation' }} />
      <Stack.Screen name="quotation-details" options={{ title: 'Quotation Details' }} />
    </Stack>
  );
}
