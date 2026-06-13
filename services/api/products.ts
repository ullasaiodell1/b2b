import axios from './httpRequest';

export const listAllProducts = (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
  console.log(`[API listAllProducts] params:`, params);
  const url = `products/all-items`;
  return axios({ method: 'GET', url, params });
};
