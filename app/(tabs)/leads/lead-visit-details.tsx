import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { VisitDetailsComponent } from '@/components/visit/VisitDetailsComponent';

export default function LeadVisitDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string; leadId?: string }>();

  return (
    <VisitDetailsComponent id={params.id || ''} leadId={params.leadId || ''} />
  );
}
