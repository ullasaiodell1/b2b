import axios from './httpRequest';

// GET /city-state-country — get city, state, and country details
export const getCityStateCountry = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/city-state-country`,
    params
  });
};

