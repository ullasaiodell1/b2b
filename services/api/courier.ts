import axios from './httpRequest';

// GET /courier — list couriers
export const getCouriers = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/courier`,
    params
  });
};

// POST /courier — create courier
export const createCourier = (data: any) => {
  return axios({
    method: 'POST',
    url: `/courier`,
    data
  });
};

