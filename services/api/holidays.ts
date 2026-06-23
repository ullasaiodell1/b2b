import axios from './httpRequest';

// GET /holidays — list holidays
export const getHolidays = () => {
  return axios({
    method: 'GET',
    url: `/holidays`,
  });
};
