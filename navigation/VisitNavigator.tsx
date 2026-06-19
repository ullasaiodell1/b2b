import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AddVisitScreen from '@/app/(tabs)/visit/add-visit';
import VisitDetailsScreen from '@/app/(tabs)/visit/visit-details';
import VisitFilterScreen from '@/app/(tabs)/visit/visit-filter';
import VisitIndexScreen from '@/app/(tabs)/visit/index';

export type VisitStackParamList = {
  VisitIndex: { [key: string]: any } | undefined;
  AddVisit: { [key: string]: any } | undefined;
  VisitFilter: { [key: string]: any } | undefined;
  VisitDetails: { id: string; [key: string]: any };
};

const Stack = createNativeStackNavigator<VisitStackParamList>();

export default function VisitNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VisitIndex" component={VisitIndexScreen} />
      <Stack.Screen name="AddVisit" component={AddVisitScreen} />
      <Stack.Screen name="VisitFilter" component={VisitFilterScreen} />
      <Stack.Screen name="VisitDetails" component={VisitDetailsScreen} />
    </Stack.Navigator>
  );
}
