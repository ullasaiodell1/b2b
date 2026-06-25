import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { AddVisitComponent } from '@/components/visit/AddVisitComponent';

export default function AddVisitScreen() {
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; company?: string }>();

  const handleBack = () => {
    router.replace('/(tabs)');
  };

  return (
    <AddVisitComponent
      initialLeadId={params.leadId}
      initialLeadName={params.leadName}
      initialLeadCompany={params.company}
      onCancel={handleBack}
      onSuccess={handleBack}
    />
  );
}
