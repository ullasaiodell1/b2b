import React from 'react';
import { useRoute } from '@react-navigation/native';
import { VisitsComponent } from '@/components/visit/VisitsComponent';

export default function VisitScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <VisitsComponent
      leadId={params.leadId}
      leadName={params.leadName}
      company={params.company}
      phone={params.phone}
      email={params.email}
    />
  );
}
