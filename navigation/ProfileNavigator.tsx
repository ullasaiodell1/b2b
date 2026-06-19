import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ChangePasswordScreen from '@/app/(tabs)/profile/change-password';
import EditProfileScreen from '@/app/(tabs)/profile/edit-profile';
import ProfileIndexScreen from '@/app/(tabs)/profile/index';

export type ProfileStackParamList = {
  ProfileIndex: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileIndex" component={ProfileIndexScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
