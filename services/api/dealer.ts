import axios from './httpRequest';

export const getDealers = async (params?: any) => {
  const res = await axios({
    method: 'GET',
    url: `/dealers`,
    params
  });
  return res;
};

export const getDealerDetails = async (id: string) => {
  const res = await axios({
    method: 'GET',
    url: `/dealers/${id}`
  });
  return res;
};
