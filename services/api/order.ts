import { OrderFilterState, OrderRecord } from '@/types/order';
import axios from './httpRequest';

// GET /orders — list orders
export const getOrders = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/orders`,
    params
  });
};

// GET /orders/:id — get order details
export const getOrderDetails = (id: string, params?: { limit?: number; offset?: number }) => {
  return axios({
    method: 'GET',
    url: `/orders/${id}`,
    params: {
      limit: params?.limit ?? 10,
      offset: params?.offset ?? 0,
    }
  });
};

// GET /orders/:id/barcodes — get order barcodes
export const getOrderBarcodes = (id: string) => {
  return axios({
    method: 'GET',
    url: `/orders/${id}/barcodes`
  });
};

// GET /inventory/reservations — get inventory reservations
export const getInventoryReservations = (refId: string) => {
  return axios({
    method: 'GET',
    url: `/inventory/reservations`,
    params: { ref_id: refId }
  });
};

// POST /orders — create order
export const createOrder = (data: Partial<OrderRecord>) => {
  return axios({
    method: 'POST',
    url: `/orders`,
    data
  });
};

// PUT /orders/:id — update order
export const updateOrder = (id: string, data: Partial<OrderRecord>) => {
  return axios({
    method: 'PUT',
    url: `/orders/${id}`,
    data
  });
};

// DELETE /orders/:id — delete order
export const deleteOrder = (id: string) => {
  return axios({ method: 'DELETE', url: `/orders/${id}` });
};

