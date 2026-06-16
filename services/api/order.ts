import { OrderFilterState, OrderRecord } from '@/types/order';
import axios from './httpRequest';

export const getOrders = async (params?: any) => {
  console.log(`[API getOrders] raw params:`, params);
  const cleanedParams: any = {};
  if (params) {
    // Map standard query params
    const allowedParams = [
      'company_id',
      'status',
      'search',
      'user_id',
      'assigned_to_user_id',
      'offset',
      'limit',
      'payment_status',
      'order_type',
      'source_type',
      'dealer_id',
      'lead_id',
      'startDate',
      'endDate',
      'sort_by',
      'sort_direction'
    ];

    allowedParams.forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && String(params[key]).trim() !== '') {
        cleanedParams[key] = params[key];
      }
    });

    // Custom mapping for dates if passed in range
    if (params.dateRange && params.dateRange.trim() !== '') {
      cleanedParams.dateRange = params.dateRange;
    }
  }
  console.log(`[API getOrders] cleaned params sent to axios:`, cleanedParams);
  const res = await axios({
    method: 'GET',
    url: `/orders`,
    params: cleanedParams
  });
  console.log(`[API getOrders] response:`, JSON.stringify(res));
  return res as any;
};

export const getOrderDetails = async (id: string, params?: { limit?: number; offset?: number }) => {
  console.log(`[API getOrderDetails] ID: ${id}, params:`, params);
  const res = await axios({
    method: 'GET',
    url: `/orders/${id}`,
    params: {
      limit: params?.limit ?? 10,
      offset: params?.offset ?? 0,
    }
  });
  console.log(`[API getOrderDetails] response:`, JSON.stringify(res));
  return res as any;
};

export const getOrderBarcodes = async (id: string) => {
  console.log(`[API getOrderBarcodes] ID: ${id}`);
  const res = await axios({
    method: 'GET',
    url: `/orders/${id}/barcodes`
  });
  console.log(`[API getOrderBarcodes] response:`, JSON.stringify(res));
  return res as any;
};

export const getInventoryReservations = async (refId: string) => {
  console.log(`[API getInventoryReservations] ref_id: ${refId}`);
  const res = await axios({
    method: 'GET',
    url: `/inventory/reservations`,
    params: { ref_id: refId }
  });
  console.log(`[API getInventoryReservations] response:`, JSON.stringify(res));
  return res as any;
};

export const createOrder = async (data: Partial<OrderRecord>) => {
  console.log(`[API createOrder] data:`, data);
  const res = await axios({
    method: 'POST',
    url: `/orders`,
    data
  });
  console.log(`[API createOrder] response:`, JSON.stringify(res));
  return res as any;
};

export const updateOrder = async (id: string, data: Partial<OrderRecord>) => {
  console.log(`[API updateOrder] ID: ${id}, data:`, data);
  const res = await axios({
    method: 'PUT',
    url: `/orders/${id}`,
    data
  });
  console.log(`[API updateOrder] response:`, JSON.stringify(res));
  return res as any;
};

export const deleteOrder = async (id: string) => {
  console.log(`[API deleteOrder] ID: ${id}`);
  const res = await axios({ method: 'DELETE', url: `/orders/${id}` });
  console.log(`[API deleteOrder] response:`, JSON.stringify(res));
  return res;
};
