import axios from './httpRequest';

// GET /dealers — list dealers
export const getDealers = async (params?: any) => {
  const res = await axios({
    method: 'GET',
    url: `/dealers`,
    params
  });
  return res;
};

// GET /dealers/:id — get dealer details
export const getDealerDetails = async (id: string) => {
  const res = await axios({
    method: 'GET',
    url: `/dealers/${id}`
  });
  return res;
};
