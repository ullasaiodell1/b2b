import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AddOrderComponent } from '@/components/order&quotations/AddOrderComponent';

export default function LeadAddOrderScreen() {
  const params = useLocalSearchParams<{ leadId?: string; companyName?: string; contactName?: string }>();

  return (
    <AddOrderComponent
      initialLeadId={params.leadId}
      initialCompanyName={params.companyName}
      initialContactName={params.contactName}
      referrer="lead-details"
    />
  );
}
