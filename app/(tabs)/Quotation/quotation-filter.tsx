import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { QuotationFilterComponent } from '@/components/order&quotations/QuotationFilterComponent';

export default function QuotationFilterScreen() {
  const { referrer, leadId, qStartDate, qEndDate } = useLocalSearchParams<{
    referrer?: string;
    leadId?: string;
    qStartDate?: string;
    qEndDate?: string;
  }>();

  return (
    <QuotationFilterComponent
      referrer={referrer}
      leadId={leadId}
      qStartDate={qStartDate}
      qEndDate={qEndDate}
    />
  );
}
