import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AttendanceScreen from '@/app/(tabs)/attendance/index';
import SelfieScreen from '@/app/(tabs)/attendance/selfie';

export type AttendanceStackParamList = {
  AttendanceIndex: undefined;
  Selfie: { mode: 'in' | 'out' };
};

const Stack = createNativeStackNavigator<AttendanceStackParamList>();

export default function AttendanceNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AttendanceIndex" component={AttendanceScreen} />
      <Stack.Screen
        name="Selfie"
        component={SelfieScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
