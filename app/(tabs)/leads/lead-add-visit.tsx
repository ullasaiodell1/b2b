import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AddVisitComponent } from '@/components/visit/AddVisitComponent';

export default function LeadAddVisitScreen() {
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; company?: string }>();

  return (
    <AddVisitComponent
      initialLeadId={params.leadId}
      initialLeadName={params.leadName}
      initialLeadCompany={params.company}
    />
  );
}
