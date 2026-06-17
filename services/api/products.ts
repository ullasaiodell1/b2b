import axios from './httpRequest';

// GET /products/all-items — list all products
export const listAllProducts = (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
  const url = `products/all-items`;
  return axios({
    method: 'GET',
    url,
    params
  });
};

