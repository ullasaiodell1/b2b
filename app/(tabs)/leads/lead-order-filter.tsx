import { OrderFilterComponent } from '@/components/order&quotations/OrderFilterComponent';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import React from 'react';

export default function LeadOrderFilterScreen() {
  const route = useRoute<any>();
  const params = (route.params ?? {}) as { referrer?: string; leadId?: string };
  const navigation = useNavigation<any>();

  return (
    <OrderFilterComponent
      referrer={params.referrer || 'lead-order'}
      leadId={params.leadId}
      onCancel={() => navigation.goBack()}
      onApply={(status, startDate, endDate) => {
        if (params.referrer === 'lead-details') {
          router.navigate({
            pathname: '/(tabs)/leads/lead-details',
            params: {
              id: params.leadId,
              activeTab: 'Order',
              oStatus: status || '',
              oStartDate: startDate ? startDate.toISOString() : '',
              oEndDate: endDate ? endDate.toISOString() : '',
              oFilterApplied: 'true',
            },
          });
        } else {
          router.navigate({
            pathname: '/(tabs)/leads/lead-order',
            params: {
              leadId: params.leadId,
            },
          });
        }
      }}
    />
  );
}

