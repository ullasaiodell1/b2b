import React from 'react';
import { useRoute } from '@react-navigation/native';
import { QuotationsComponent } from '@/components/order&quotations/QuotationsComponent';

export default function LeadQuotationScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <QuotationsComponent
      leadId={params.leadId || params.id}
      leadName={params.leadName}
      company={params.company}
      phone={params.phone}
      email={params.email}
    />
  );
}
