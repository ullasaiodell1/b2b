import React from 'react';
import { useRoute } from '@react-navigation/native';
import { OrdersComponent } from '@/components/order&quotations/OrdersComponent';

export default function LeadOrderScreen() {
  const route = useRoute<any>();
  const params = route.params || {};

  return (
    <OrdersComponent
      leadId={params.leadId || params.id}
      leadName={params.leadName}
      company={params.company}
      phone={params.phone}
      email={params.email}
    />
  );
}
