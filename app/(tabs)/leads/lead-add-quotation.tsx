import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AddQuotationComponent } from '@/components/order&quotations/AddQuotationComponent';

export default function LeadAddQuotationScreen() {
  const params = useLocalSearchParams<{
    leadId?: string;
    companyName?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  }>();

  return (
    <AddQuotationComponent
      initialLeadId={params.leadId}
      initialCompanyName={params.companyName}
      initialContactName={params.contactName}
      initialContactPhone={params.contactPhone}
      initialContactEmail={params.contactEmail}
      referrer="lead-details"
    />
  );
}
