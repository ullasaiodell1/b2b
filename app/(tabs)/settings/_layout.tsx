import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"                 options={{ title: 'Settings' }} />
      <Stack.Screen name="notification-settings" options={{ title: 'Notification Settings' }} />
      <Stack.Screen name="theme-settings"        options={{ title: 'Theme Settings' }} />
      <Stack.Screen name="help-support"          options={{ title: 'Help & Support' }} />
      <Stack.Screen name="change-password"       options={{ title: 'Change Password' }} />
    </Stack>
  );
}
