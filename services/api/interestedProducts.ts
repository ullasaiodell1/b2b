import axios from './httpRequest';

// GET /leads/:leadId/interested-products
export const getLeadInterestedProducts = (
  leadId: string,
  params?: { limit?: number; offset?: number }
) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/interested-products`,
    params: { limit: 10, offset: 0, ...params },
  });
};

// POST /leads/:leadId/interested-products
// Body: { product_id: string }
export const addLeadInterestedProducts = (
  leadId: string,
  productId: string
) => {
  return axios({
    method: 'POST',
    url: `/leads/${leadId}/interested-products`,
    data: { product_id: productId },
  });
};

// DELETE /leads/:leadId/interested-products/:productId
export const removeLeadInterestedProduct = (
  leadId: string,
  productId: string
) => {
  return axios({
    method: 'DELETE',
    url: `/leads/${leadId}/interested-products/${productId}`,
  });
};
