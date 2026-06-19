import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AddLeadScreen from '@/app/(tabs)/leads/add-lead';
import EditLeadScreen from '@/app/(tabs)/leads/edit-lead';
import LeadsScreen from '@/app/(tabs)/leads/index';
import LeadDetailsScreen from '@/app/(tabs)/leads/lead-details';
import LeadsFilterScreen from '@/app/(tabs)/leads/leads-filter';
import SelectCategoryScreen from '@/app/(tabs)/leads/select-category';
import SelectCompanyScreen from '@/app/(tabs)/leads/select-company';
import SelectOwnerScreen from '@/app/(tabs)/leads/select-owner';

export type LeadsStackParamList = {
  LeadsList: { filter?: string } | undefined;
  LeadsFilter: { [key: string]: any } | undefined;
  LeadDetails: { id: string;[key: string]: any };
  AddLead: { [key: string]: any } | undefined;
  EditLead: { id: string;[key: string]: any };
  SelectOwner: { [key: string]: any } | undefined;
  SelectCompany: { [key: string]: any } | undefined;
  SelectCategory: { [key: string]: any } | undefined;
};

const Stack = createNativeStackNavigator<LeadsStackParamList>();

export default function LeadsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LeadsList" component={LeadsScreen} />
      <Stack.Screen name="LeadsFilter" component={LeadsFilterScreen} />
      <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} />
      <Stack.Screen name="AddLead" component={AddLeadScreen} />
      <Stack.Screen name="EditLead" component={EditLeadScreen} />
      <Stack.Screen name="SelectOwner" component={SelectOwnerScreen} />
      <Stack.Screen name="SelectCompany" component={SelectCompanyScreen} />
      <Stack.Screen name="SelectCategory" component={SelectCategoryScreen} />
    </Stack.Navigator>
  );
}
