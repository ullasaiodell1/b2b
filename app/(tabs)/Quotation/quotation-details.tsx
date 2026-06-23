import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { QuotationDetailsComponent } from '@/components/order&quotations/QuotationDetailsComponent';

export default function QuotationDetailsScreen() {
  const { id, referrer, leadId } = useLocalSearchParams<{ id: string; referrer?: string; leadId?: string }>();

  return (
    <QuotationDetailsComponent
      id={id || ''}
      referrer={referrer}
      leadId={leadId}
    />
  );
}
