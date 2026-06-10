import { OrderFilterState, OrderRecord } from '@/types/order';
import axios from './httpRequest';

export const getOrders = (params?: Partial<OrderFilterState>) => {
  console.log(`[API getOrders] params:`, params);
  return axios({
    method: 'GET',
    url: `/orders`,
    params
  }) as Promise<OrderRecord[]>;
};

export const getOrderDetails = (id: string) => {
  console.log(`[API getOrderDetails] ID: ${id}`);
  return axios({
    method: 'GET',
    url: `/orders/${id}`
  }) as Promise<OrderRecord>;
};

export const createOrder = (data: Partial<OrderRecord>) => {
  console.log(`[API createOrder] data:`, data);
  return axios({
    method: 'POST',
    url: `/orders`,
    data
  }) as Promise<OrderRecord>;
};

export const updateOrder = (id: string, data: Partial<OrderRecord>) => {
  console.log(`[API updateOrder] ID: ${id}, data:`, data);
  return axios({
    method: 'PUT',
    url: `/orders/${id}`,
    data
  }) as Promise<OrderRecord>;
};

export const deleteOrder = (id: string) => {
  console.log(`[API deleteOrder] ID: ${id}`);
  return axios({ method: 'DELETE', url: `/orders/${id}` });
};
