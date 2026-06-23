import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { OrderFilterComponent } from '@/components/order&quotations/OrderFilterComponent';

export default function LeadOrderFilterScreen() {
  const params = useLocalSearchParams<{ referrer?: string; leadId?: string }>();
  const navigation = useNavigation<any>();

  return (
    <OrderFilterComponent
      referrer={params.referrer || 'lead-order'}
      leadId={params.leadId}
      onCancel={() => navigation.goBack()}
      onApply={() => {
        navigation.navigate('lead-order', {
          leadId: params.leadId,
        });
      }}
    />
  );
}
