import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AddVisitComponent } from '@/components/visit/AddVisitComponent';

export default function AddVisitScreen() {
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; company?: string }>();

  return (
    <AddVisitComponent
      initialLeadId={params.leadId}
      initialLeadName={params.leadName}
      initialLeadCompany={params.company}
    />
  );
}
