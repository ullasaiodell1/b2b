import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { QuotationDetailsComponent } from '@/components/order&quotations/QuotationDetailsComponent';

export default function LeadQuotationDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string; referrer?: string; leadId?: string }>();

  return (
    <QuotationDetailsComponent
      id={params.id || ''}
      referrer={params.referrer}
      leadId={params.leadId}
    />
  );
}
