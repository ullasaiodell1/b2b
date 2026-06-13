import axios from './httpRequest';

export const getCouriers = async (params?: any) => {
  console.log('[API getCouriers] params:', params);
  const res = await axios({
    method: 'GET',
    url: `/courier`,
    params
  });
  console.log('[API getCouriers] Response:', res);
  return res;
};

export const createCourier = async (data: any) => {
  console.log('[API createCourier] Request data:', data);
  const res = await axios({
    method: 'POST',
    url: `/courier`,
    data
  });
  console.log('[API createCourier] Response:', res);
  return res;
};
