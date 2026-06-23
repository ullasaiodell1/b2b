import React from 'react';
import { useRoute } from '@react-navigation/native';
import { VisitDetailsComponent } from '@/components/visit/VisitDetailsComponent';

export default function VisitDetailsScreen() {
  const route = useRoute<any>();
  const id = route.params?.id || '';
  const leadId = route.params?.leadId || route.params?.lead_id || '';

  return (
    <VisitDetailsComponent id={id} leadId={leadId} />
  );
}
