import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { AddOrderComponent } from '@/components/order&quotations/AddOrderComponent';

export default function AddOrderScreen() {
  const params = useLocalSearchParams<{
    referrer?: string;
    companyName?: string;
    contactName?: string;
    leadId?: string;
  }>();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <AddOrderComponent
      initialLeadId={params.leadId}
      initialCompanyName={params.companyName}
      initialContactName={params.contactName}
      referrer={params.referrer}
      onCancel={handleBack}
      onSuccess={handleBack}
    />
  );
}
