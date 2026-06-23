import React from 'react';
import { useRoute } from '@react-navigation/native';
import { VisitsComponent } from '@/components/visit/VisitsComponent';

export default function LeadVisitScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <VisitsComponent
      leadId={params.leadId || params.id}
      leadName={params.leadName}
      phone={params.phone}
      email={params.email}
    />
  );
}
