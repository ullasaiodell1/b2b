import { OrderFilterComponent } from '@/components/order&quotations/OrderFilterComponent';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';

export default function LeadOrderFilterScreen() {
  const route = useRoute<any>();
  const params = (route.params ?? {}) as {
    referrer?: string;
    leadId?: string;
    oStatus?: string;
    oStartDate?: string;
    oEndDate?: string;
  };
  const navigation = useNavigation<any>();

  return (
    <OrderFilterComponent
      referrer={params.referrer || 'lead-order'}
      leadId={params.leadId}
      onCancel={() => navigation.goBack()}
      onApply={(status, startDate, endDate) => {
        const startStr = startDate ? startDate.toISOString() : '';
        const endStr = endDate ? endDate.toISOString() : '';
        const isApplied = !!(status || startDate || endDate);

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
                    activeTab: 'Order',
                    oStatus: status || '',
                    oStartDate: startStr,
                    oEndDate: endStr,
                    oFilterApplied: isApplied ? 'true' : '',
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
          navigation.navigate('lead-order' as never, {
            leadId: params.leadId,
          } as never);
        }
      }}
    />
  );
}
