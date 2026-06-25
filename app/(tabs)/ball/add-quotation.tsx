import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { AddQuotationComponent } from '@/components/order&quotations/AddQuotationComponent';

export default function AddQuotationScreen() {
  const params = useLocalSearchParams<{
    referrer?: string;
    leadId?: string;
    companyName?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    gstNumber?: string;
    panNumber?: string;
    notes?: string;
  }>();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <AddQuotationComponent
      initialLeadId={params.leadId}
      initialCompanyName={params.companyName}
      initialContactName={params.contactName}
      initialContactPhone={params.contactPhone}
      initialContactEmail={params.contactEmail}
      initialGstNumber={params.gstNumber}
      initialPanNumber={params.panNumber}
      initialNotes={params.notes}
      referrer={params.referrer}
      onCancel={handleBack}
      onSuccess={handleBack}
    />
  );
}
