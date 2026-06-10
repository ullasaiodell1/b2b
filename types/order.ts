export type OrderStatus = 'Inprogress' | 'Pending' | 'Booking' | 'Out Of Delivery' | 'Delivered' | 'Complete';

export interface OrderItem {
  name: string;
  description: string;
  price: string;
  qty: string;
  gst: string;
  total: string;
}

export interface OrderRecord {
  id: string;
  orderNo: string;
  date: string;
  clientName: string;
  contactPerson: string;
  hotelLocation: string;
  status: OrderStatus;
  itemsCount: number;
  paymentType: string;
  amount: string;
  items: OrderItem[];
}

export interface OrderFilterState {
  status: string;
  dateRange: string;
}
