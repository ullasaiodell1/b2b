import { OrderRecord, OrderFilterState } from '../types/order';
export { OrderRecord, OrderFilterState };

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: '1',
    orderNo: 'QT-2026-001',
    date: '22 March 2026',
    clientName: 'NanoTech Solutions Pvt. Ltd.',
    contactPerson: 'Arjun Gohil',
    hotelLocation: 'The Grand Thakor Hotel, Rajkot',
    status: 'Complete',
    itemsCount: 3,
    paymentType: 'Advance Payment',
    amount: '₹ 10,00,000.00',
    items: [
      {
        name: 'CONDITIONER',
        description: 'Smart Apple 100 ML',
        price: '₹ 200.00',
        qty: '08',
        gst: '18%',
        total: '₹ 10,00,000.00',
      },
      {
        name: 'SHAMPOO',
        description: 'Smart Apple 100 ML',
        price: '₹ 120.00',
        qty: '12',
        gst: '18%',
        total: '₹ 1,50,000.00',
      },
    ],
  },
  {
    id: '2',
    orderNo: 'QT-2026-012',
    date: '10 April 2026',
    clientName: 'Zenith System Pvt. Ltd.',
    contactPerson: 'Khushal Nadiyapara',
    hotelLocation: 'The Grand Thakor Hotel, Rajkot',
    status: 'Pending',
    itemsCount: 2,
    paymentType: 'Advance Payment',
    amount: '₹ 40,00,000.00',
    items: [
      {
        name: 'CONDITIONER',
        description: 'Smart Apple 100 ML',
        price: '₹ 200.00',
        qty: '08',
        gst: '18%',
        total: '₹ 40,00,000.00',
      },
    ],
  },
  {
    id: '3',
    orderNo: 'QT-2026-013',
    date: '20 May 2026',
    clientName: 'Zenith System Pvt. Ltd.',
    contactPerson: 'Parth Solanki',
    hotelLocation: 'The Grand Thakor Hotel, Rajkot',
    status: 'Complete',
    itemsCount: 2,
    paymentType: 'Advance Payment',
    amount: '₹ 80,00,000.00',
    items: [
      {
        name: 'SHAMPOO',
        description: 'Smart Apple 100 ML',
        price: '₹ 120.00',
        qty: '12',
        gst: '18%',
        total: '₹ 80,00,000.00',
      },
    ],
  },
  {
    id: '4',
    orderNo: 'QT-2026-018',
    date: '22 Nov 2026',
    clientName: 'NanoTech Solutions Pvt. Ltd.',
    contactPerson: 'Arjun Gohil',
    hotelLocation: 'The Grand Thakor Hotel, Rajkot',
    status: 'Delivered',
    itemsCount: 5,
    paymentType: 'Advance Payment',
    amount: '₹ 15,00,000.00',
    items: [
      {
        name: 'CONDITIONER',
        description: 'Smart Apple 100 ML',
        price: '₹ 200.00',
        qty: '08',
        gst: '18%',
        total: '₹ 15,00,000.00',
      },
    ],
  },
];


export let ordersState: OrderRecord[] = [...INITIAL_ORDERS];
export let activeOrderFilter: OrderFilterState = {
  status: '',
  dateRange: '',
};

const listeners = new Set<() => void>();

export const updateOrdersState = (newOrders: OrderRecord[]) => {
  ordersState = newOrders;
  listeners.forEach((listener) => listener());
};

export const updateOrderFilterState = (newFilter: OrderFilterState) => {
  activeOrderFilter = newFilter;
  listeners.forEach((listener) => listener());
};

export const subscribeToOrders = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
