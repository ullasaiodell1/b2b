import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AddOrderScreen from '@/app/(tabs)/Order/add-order';
import OrderIndexScreen from '@/app/(tabs)/Order/index';
import OrderDetailsScreen from '@/app/(tabs)/Order/order-details';
import OrderFilterScreen from '@/app/(tabs)/Order/order-filter';
import OrdersScreen from '@/app/(tabs)/Order/orders';

export type OrderStackParamList = {
  OrderIndex: undefined;
  Orders: undefined;
  OrderDetails: { id: string;[key: string]: any };
  OrderFilter: { [key: string]: any } | undefined;
  AddOrder: { [key: string]: any } | undefined;
};

const Stack = createNativeStackNavigator<OrderStackParamList>();

export default function OrderNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrderIndex" component={OrderIndexScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="OrderFilter" component={OrderFilterScreen} />
      <Stack.Screen name="AddOrder" component={AddOrderScreen} />
    </Stack.Navigator>
  );
}
