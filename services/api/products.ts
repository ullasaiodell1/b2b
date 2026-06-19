import axios from './httpRequest';

// GET /products/all-items — list all products
export const listAllProducts = (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
  const url = `products`;
  const finalParams = { status: 'active', ...params };
  return axios({
    method: 'GET',
    url,
    params: finalParams
  });
};

