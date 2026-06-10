import axios from './httpRequest';

export const getCityStateCountry = (params?: { country?: string; state?: string }) => {
  return axios({
    method: 'GET',
    url: `/city-state-country`,
    params
  });
};
