import { useState, useEffect } from 'react';
import { OrderRecord, OrderFilterState, ordersState, activeOrderFilter, subscribeToOrders, updateOrdersState, updateOrderFilterState } from '@/components/OrderState';

export function useOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>(ordersState);
  const [filter, setFilter] = useState<OrderFilterState>(activeOrderFilter);

  useEffect(() => {
    return subscribeToOrders(() => {
      setOrders([...ordersState]);
      setFilter({ ...activeOrderFilter });
    });
  }, []);

  return {
    orders,
    filter,
    updateOrders: updateOrdersState,
    updateFilter: updateOrderFilterState,
  };
}
