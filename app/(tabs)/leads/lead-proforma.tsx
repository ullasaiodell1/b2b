import React from 'react';
import { useRoute } from '@react-navigation/native';
import { ProformasComponent } from '@/components/order&quotations/ProformasComponent';

export default function LeadProformaScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <ProformasComponent
      leadId={params.leadId || params.id}
    />
  );
}
