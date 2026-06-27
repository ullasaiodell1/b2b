import axios from './httpRequest';

// GET /city-state-country — get city, state, and country details
export const getCityStateCountry = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/city-state-country`,
    params
  });
};

// GET /city-state-country/city — search cities (combobox)
export const getCities = (search: string = '', limit: number = 20) => {
  return axios({
    method: 'GET',
    url: `/city-state-country/city`,
    params: { search, limit, combobox: true },
  });
};
