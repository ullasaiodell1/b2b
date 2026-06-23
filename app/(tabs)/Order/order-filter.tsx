import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { OrderFilterComponent } from '@/components/order&quotations/OrderFilterComponent';

export default function OrderFilterScreen() {
  const { referrer, leadId } = useLocalSearchParams<{ referrer?: string; leadId?: string }>();

  return (
    <OrderFilterComponent
      referrer={referrer}
      leadId={leadId}
    />
  );
}
