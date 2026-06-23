import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { OrderDetailsComponent } from '@/components/order&quotations/OrderDetailsComponent';

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams<{ id: string; referrer?: string; leadId?: string }>();

  return (
    <OrderDetailsComponent
      id={params.id || ''}
      referrer={params.referrer}
      leadId={params.leadId}
    />
  );
}
