import axios from './httpRequest';

export const getCityStateCountry = (params?: any) => {
  console.log(`[API getCityStateCountry] params:`, params);
  return axios({
    method: 'GET',
    url: `/city-state-country`,
    params
  });
};
