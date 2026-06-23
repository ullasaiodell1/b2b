import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AddOrderComponent } from '@/components/order&quotations/AddOrderComponent';

export default function AddOrderScreen() {
  const params = useLocalSearchParams<{
    referrer?: string;
    companyName?: string;
    contactName?: string;
    leadId?: string;
  }>();

  return (
    <AddOrderComponent
      initialLeadId={params.leadId}
      initialCompanyName={params.companyName}
      initialContactName={params.contactName}
      referrer={params.referrer}
    />
  );
}
