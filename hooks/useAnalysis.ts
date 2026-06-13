import { useQuery } from '@tanstack/react-query';
import { getAnalysis } from '@/services/api/analysis';
import { useEffect } from 'react';

export const analysisKeys = {
  all: ['analysis'] as const,
  lists: () => [...analysisKeys.all, 'list'] as const,
  list: () => [...analysisKeys.lists()] as const,
  analysisFilter: (params?: any) => [...analysisKeys.lists(), params] as const,
};

export function useAnalysis(params?: any) {
  const query = useQuery({
    queryKey: analysisKeys.analysisFilter(params),
    queryFn: async () => {
      const raw = await getAnalysis(params);
      const { dashboardData, orderData, visitsData } = raw;

      const dash = (dashboardData as any)?.data || {};
      const order = (orderData as any)?.data || orderData || {};
      const visits = (visitsData as any)?.data || [];
      const totalVisits = (visitsData as any)?.total ?? visits.length ?? 0;

      // Parse Monthly lead creation/revenue trends
      const monthlyRevenue = dash.monthlyRevenue || [];
      const labels = monthlyRevenue.map((r: any) => r.month) || [];
      const data = monthlyRevenue.map((r: any) => r.revenue) || [];

      // Format to fit LEAD_DATA_MOCK structure
      const monthlyData = labels.length > 0 ? {
        labels,
        datasets: [{ data }],
        total: data.reduce((sum: number, val: number) => sum + val, 0)
      } : null;

      // Format return object to conform to HomeScreen expectations
      return {
        total_visits: totalVisits,
        revenue_generated: `₹${(dash.counters?.totalRevenue || 0).toLocaleString('en-IN')}`,
        assigned_target: `₹${(dash.counters?.pipelineValue || 0).toLocaleString('en-IN')}`,
        lead_data: {
          Daily: null, // will fall back to mock
          Weekly: null, // will fall back to mock
          Monthly: monthlyData
        },
        lead_conversion_ratio: {
          leads: dash.counters?.totalLeads || 0,
          quotations: dash.counters?.activeDeals || 0,
          orders: order.summary?.total_orders || 0,
          average_ratio: `${dash.counters?.conversionRate || 0}%`
        },
        order_status_summary: {
          pending: order.summary?.pending_orders || 0,
          confirmed: Math.max(0, (order.summary?.total_orders || 0) - (order.summary?.pending_orders || 0) - (order.summary?.completed_orders || 0)),
          completed: order.summary?.completed_orders || 0
        }
      };
    },
  });

  useEffect(() => {
    if (query.data) {
      console.log('[useAnalysis] Query success data:', query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (query.isError) {
      console.error('[useAnalysis] Query error:', query.error);
    }
  }, [query.isError, query.error]);

  return query;
}
