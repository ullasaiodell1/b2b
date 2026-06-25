import { Stack } from 'expo-router';
import React from 'react';

export default function OrderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"         options={{ title: 'Orders Dashboard' }} />
      <Stack.Screen name="orders"        options={{ title: 'Orders List' }} />
      <Stack.Screen name="order-details" options={{ title: 'Order Details' }} />
      <Stack.Screen name="order-filter"  options={{ title: 'Order Filter' }} />
      <Stack.Screen name="add-order"     options={{ title: 'Add Order' }} />
      <Stack.Screen name="edit-order"    options={{ title: 'Edit Order' }} />
    </Stack>
  );
}
