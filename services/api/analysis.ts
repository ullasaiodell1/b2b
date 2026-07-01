import axios from './httpRequest';
import { getUserData } from '@/utils/storage';

export const getAnalysis = async (params?: any) => {
  const user = await getUserData();
  const userId = user?.id;
  const finalParams = { ...params };
  if (userId) {
    finalParams.user_id = userId;
  }

  console.log('[getAnalysis] Fetching analysis data with params:', finalParams);

  const [dashboardData, orderData, visitsData, dealerStats] = await Promise.all([
    axios({
      method: 'GET',
      url: `/analytics/dashboard-stats`,
      params: finalParams
    }).catch((err) => {
      console.error('[getAnalysis] dashboard-stats error:', err);
      return {};
    }),
    axios({
      method: 'GET',
      url: `/analytics/order-stats`,
      params: finalParams
    }).catch((err) => {
      console.error('[getAnalysis] order-stats error:', err);
      return {};
    }),
    axios({
      method: 'GET',
      url: `/visits`,
      params: { ...finalParams, limit: 1 }
    }).catch((err) => {
      console.error('[getAnalysis] visits error:', err);
      return {};
    }),
    axios({
      method: 'GET',
      url: `/analytics/dealer-stats`,
      params: finalParams
    }).catch((err) => {
      console.error('[getAnalysis] dealer-stats error:', err);
      return {};
    }),
  ]);

  console.log('[getAnalysis] Raw response received:', {
    dashboardData: dashboardData,
    orderData: orderData,
    visitsData: visitsData,
    dealerStats: dealerStats,
  });

  return { dashboardData, orderData, visitsData, dealerStats };
};
