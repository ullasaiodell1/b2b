import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AddMeetingScreen from '@/app/(tabs)/meeting/add-meeting';
import MeetingIndexScreen from '@/app/(tabs)/meeting/index';
import MeetingDetailsScreen from '@/app/(tabs)/meeting/meeting-details';

export type MeetingStackParamList = {
  MeetingIndex: { [key: string]: any } | undefined;
  AddMeeting: { [key: string]: any } | undefined;
  MeetingDetails: { id: string;[key: string]: any };
};

const Stack = createNativeStackNavigator<MeetingStackParamList>();

export default function MeetingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeetingIndex" component={MeetingIndexScreen} />
      <Stack.Screen name="AddMeeting" component={AddMeetingScreen} />
      <Stack.Screen name="MeetingDetails" component={MeetingDetailsScreen} />
    </Stack.Navigator>
  );
}
