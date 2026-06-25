import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { QuotationFilterComponent } from '@/components/order&quotations/QuotationFilterComponent';

export default function LeadQuotationFilterScreen() {
  const params = useLocalSearchParams<{
    referrer?: string;
    leadId?: string;
    qStartDate?: string;
    qEndDate?: string;
  }>();
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
          navigation.navigate('lead-details', {
            id: params.leadId,
            activeTab: 'Quotation',
            qStartDate: startDate ? startDate.toISOString() : '',
            qEndDate: endDate ? endDate.toISOString() : '',
            qFilterApplied: (startDate || endDate) ? 'true' : '',
          });
        } else {
          navigation.navigate('lead-quotation', {
            leadId: params.leadId,
            qStartDate: startDate ? startDate.toISOString() : '',
            qEndDate: endDate ? endDate.toISOString() : '',
            qFilterApplied: (startDate || endDate) ? 'true' : '',
          });
        }
      }}
    />
  );
}
