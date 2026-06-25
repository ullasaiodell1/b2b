import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { EditOrderComponent } from '@/components/order&quotations/EditOrderComponent';

export default function EditOrderScreen() {
  const params = useLocalSearchParams<{
    id: string;
    referrer?: string;
  }>();

  return (
    <EditOrderComponent
      id={params.id || ''}
      referrer={params.referrer}
    />
  );
}
