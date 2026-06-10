import CustomDrawer from '@/components/custom/CustomDrawer';
import CustomTabBar from '@/components/custom/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="leads" options={{ title: 'Leads' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

        {/* Hidden screens — keep files but exclude from tab bar */}
        <Tabs.Screen name="add" options={{ href: null }} />
        <Tabs.Screen name="notification" options={{ href: null }} />
        {/* New folder-based CRM screens */}
        <Tabs.Screen name="calendar" options={{ href: null }} />
        <Tabs.Screen name="attendance" options={{ href: null }} />
        <Tabs.Screen name="call" options={{ href: null }} />
        <Tabs.Screen name="company" options={{ href: null }} />
        <Tabs.Screen name="meeting" options={{ href: null }} />
        <Tabs.Screen name="task" options={{ href: null }} />
        <Tabs.Screen name="Order" options={{ href: null }} />
        <Tabs.Screen name="Quotation" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="visit" options={{ href: null }} />
        <Tabs.Screen name="email" options={{ href: null }} />
      </Tabs>
      <CustomDrawer />
    </View>
  );
}
