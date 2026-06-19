import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';

import CustomDrawer from '@/components/custom/CustomDrawer';
import CustomTabBar from '@/components/custom/CustomTabBar';

// Auth & Onboarding Screens
import SplashScreen from '@/app/index';
import SlidesScreen from '@/app/slides';
import SignInScreen from '@/app/sign-in';
import OtpScreen from '@/app/otp';
import ResetPasswordScreen from '@/app/reset-password';
import DeviceLimitScreen from '@/app/device-limit';
import CameraCapture from '@/app/camera-capture';

// Tab Screens
import HomeScreen from '@/app/(tabs)/index';
import LeadsNavigator from './LeadsNavigator';
import ProfileNavigator from './ProfileNavigator';
import OrderNavigator from './OrderNavigator';
import QuotationNavigator from './QuotationNavigator';
import TaskNavigator from './TaskNavigator';
import VisitNavigator from './VisitNavigator';
import MeetingNavigator from './MeetingNavigator';
import SettingsNavigator from './SettingsNavigator';
import CalendarScreen from '@/app/(tabs)/calendar/index';
import AttendanceScreen from '@/app/(tabs)/attendance/index';
import CallScreen from '@/app/(tabs)/call/index';
import CompanyScreen from '@/app/(tabs)/company/index';
import EmailScreen from '@/app/(tabs)/email/index';
import NotificationScreen from '@/app/(tabs)/notification';
import AddScreen from '@/app/(tabs)/add';

export type RootStackParamList = {
  Splash: undefined;
  Slides: undefined;
  SignIn: undefined;
  Otp: { code: string; token: string; password?: string };
  ResetPassword: undefined;
  DeviceLimit: { sessions: string; token: string; phoneNumber: string; password: string };
  Tabs: undefined;
  CameraCapture: undefined;
};

export type TabParamList = {
  index: undefined;
  leads: undefined;
  profile: undefined;
  add: undefined;
  notification: undefined;
  calendar: undefined;
  attendance: undefined;
  call: undefined;
  company: undefined;
  meeting: undefined;
  task: undefined;
  Order: undefined;
  Quotation: undefined;
  settings: undefined;
  visit: undefined;
  email: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabsNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="index" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="leads" component={LeadsNavigator} options={{ title: 'Leads' }} />
        <Tab.Screen name="profile" component={ProfileNavigator} options={{ title: 'Profile' }} />
        <Tab.Screen name="add" component={AddScreen} options={{ title: 'Add' }} />
        <Tab.Screen name="notification" component={NotificationScreen} options={{ title: 'Notifications' }} />
        <Tab.Screen name="calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
        <Tab.Screen name="attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
        <Tab.Screen name="call" component={CallScreen} options={{ title: 'Calls' }} />
        <Tab.Screen name="company" component={CompanyScreen} options={{ title: 'Company' }} />
        <Tab.Screen name="meeting" component={MeetingNavigator} options={{ title: 'Meetings' }} />
        <Tab.Screen name="task" component={TaskNavigator} options={{ title: 'Tasks' }} />
        <Tab.Screen name="Order" component={OrderNavigator} options={{ title: 'Orders' }} />
        <Tab.Screen name="Quotation" component={QuotationNavigator} options={{ title: 'Quotations' }} />
        <Tab.Screen name="settings" component={SettingsNavigator} options={{ title: 'Settings' }} />
        <Tab.Screen name="visit" component={VisitNavigator} options={{ title: 'Visits' }} />
        <Tab.Screen name="email" component={EmailScreen} options={{ title: 'Email' }} />
      </Tab.Navigator>
      <CustomDrawer />
    </View>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Slides" component={SlidesScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
        <Stack.Screen name="DeviceLimit" component={DeviceLimitScreen} />
        <Stack.Screen name="Tabs" component={TabsNavigator} />
        <Stack.Screen name="CameraCapture" component={CameraCapture} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
