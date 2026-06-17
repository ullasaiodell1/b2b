import axios from './httpRequest';

export const getAnalysis = async (params?: any) => {
  const [dashboardData, orderData, visitsData] = await Promise.all([
    axios({
      method: 'GET',
      url: `/analytics/dashboard-stats`,
      params
    }).catch(() => ({})),
    axios({
      method: 'GET',
      url: `/analytics/order-stats`,
      params
    }).catch(() => ({})),
    axios({
      method: 'GET',
      url: `/visits`,
      params: { ...params, limit: 1 }
    }).catch(() => ({})),
  ]);

  return { dashboardData, orderData, visitsData };
};
