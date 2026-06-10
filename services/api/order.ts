import { OrderFilterState, OrderRecord } from '@/types/order';
import axios from './httpRequest';

export const getOrders = (params?: Partial<OrderFilterState>) => {
  return axios({
    method: 'GET',
    url: `/orders`,
    params
  }) as Promise<OrderRecord[]>;
};

export const getOrderDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/orders/${id}`
  }) as Promise<OrderRecord>;
};

export const createOrder = (data: Partial<OrderRecord>) => {
  return axios({
    method: 'POST',
    url: `/orders`,
    data
  }) as Promise<OrderRecord>;
};

export const updateOrder = (id: string, data: Partial<OrderRecord>) => {
  return axios({
    method: 'PUT',
    url: `/orders/${id}`,
    data
  }) as Promise<OrderRecord>;
};

export const deleteOrder = (id: string) => {
  return axios({ method: 'DELETE', url: `/orders/${id}` });
};
