import { QuotationFilterComponent } from '@/components/order&quotations/QuotationFilterComponent';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import React from 'react';

export default function LeadQuotationFilterScreen() {
  const route = useRoute<any>();
  const params = (route.params ?? {}) as {
    referrer?: string;
    leadId?: string;
    qStartDate?: string;
    qEndDate?: string;
  };
  const navigation = useNavigation<any>();

  return (
    <QuotationFilterComponent
      referrer={params.referrer || 'lead-quotation'}
      leadId={params.leadId}
      qStartDate={params.qStartDate}
      qEndDate={params.qEndDate}
      onCancel={() => navigation.goBack()}
      onApply={(startDate, endDate) => {
        if (params.referrer === 'lead-details') {
          router.navigate({
            pathname: '/(tabs)/leads/lead-details',
            params: {
              id: params.leadId,
              activeTab: 'Quotation',
              qStartDate: startDate ? startDate.toISOString() : '',
              qEndDate: endDate ? endDate.toISOString() : '',
              qFilterApplied: (startDate || endDate) ? 'true' : '',
            },
          });
        } else {
          router.navigate({
            pathname: '/(tabs)/leads/lead-quotation',
            params: {
              leadId: params.leadId,
              qStartDate: startDate ? startDate.toISOString() : '',
              qEndDate: endDate ? endDate.toISOString() : '',
              qFilterApplied: (startDate || endDate) ? 'true' : '',
            },
          });
        }
      }}
    />
  );
}

