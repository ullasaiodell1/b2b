import { QuotationFilterComponent } from '@/components/order&quotations/QuotationFilterComponent';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
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
        const startStr = startDate ? startDate.toISOString() : '';
        const endStr = endDate ? endDate.toISOString() : '';
        const isApplied = !!(startDate || endDate);

        if (params.referrer === 'lead-details') {
          // Pop this filter screen and merge params into the existing lead-details route
          navigation.dispatch((state: any) => {
            const prevRoutes = state.routes.slice(0, -1);
            const updatedRoutes = prevRoutes.map((route: any, index: number) => {
              if (index === prevRoutes.length - 1) {
                return {
                  ...route,
                  params: {
                    ...route.params,
                    id: params.leadId,
                    activeTab: 'Quotation',
                    qStartDate: startStr,
                    qEndDate: endStr,
                    qFilterApplied: isApplied ? 'true' : '',
                  },
                };
              }
              return route;
            });
            return CommonActions.reset({
              ...state,
              routes: updatedRoutes,
              index: updatedRoutes.length - 1,
            });
          });
        } else {
          navigation.navigate('lead-quotation' as never, {
            leadId: params.leadId,
            qStartDate: startStr,
            qEndDate: endStr,
            qFilterApplied: isApplied ? 'true' : '',
          } as never);
        }
      }}
    />
  );
}
