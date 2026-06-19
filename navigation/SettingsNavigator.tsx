import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import HelpSupportScreen from '@/app/(tabs)/settings/help-support';
import NotificationSettingsScreen from '@/app/(tabs)/settings/notification-settings';
import SettingsChangePasswordScreen from '@/app/(tabs)/settings/change-password';
import SettingsIndexScreen from '@/app/(tabs)/settings/index';
import ThemeSettingsScreen from '@/app/(tabs)/settings/theme-settings';

export type SettingsStackParamList = {
  SettingsIndex: undefined;
  SettingsChangePassword: undefined;
  ThemeSettings: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsIndex" component={SettingsIndexScreen} />
      <Stack.Screen name="SettingsChangePassword" component={SettingsChangePasswordScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}
