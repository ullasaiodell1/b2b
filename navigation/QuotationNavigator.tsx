import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AddQuotationScreen from '@/app/(tabs)/Quotation/add-quotation';
import QuotationDetailsScreen from '@/app/(tabs)/Quotation/quotation-details';
import QuotationFilterScreen from '@/app/(tabs)/Quotation/quotation-filter';
import QuotationIndexScreen from '@/app/(tabs)/Quotation/index';

export type QuotationStackParamList = {
  QuotationIndex: { [key: string]: any } | undefined;
  QuotationFilter: { [key: string]: any } | undefined;
  AddQuotation: { [key: string]: any } | undefined;
  QuotationDetails: { id: string; [key: string]: any };
};

const Stack = createNativeStackNavigator<QuotationStackParamList>();

export default function QuotationNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuotationIndex" component={QuotationIndexScreen} />
      <Stack.Screen name="QuotationFilter" component={QuotationFilterScreen} />
      <Stack.Screen name="AddQuotation" component={AddQuotationScreen} />
      <Stack.Screen name="QuotationDetails" component={QuotationDetailsScreen} />
    </Stack.Navigator>
  );
}
