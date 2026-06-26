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
  company_id?: string;
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
  internalRemarks?: string;
  expectedDelivery?: string;
  approvedBy?: string;
  chargesGst?: string;
  chargesType?: string;
  chargesAmount?: string;
  logisticsPartner?: string;
  trackingAwb?: string;
  shippingFreight?: string;
  adjustmentType?: 'PERCENTAGE' | 'FLAT';
  discountValue?: string;
  isAdvanceAccount?: boolean;
  payableAmount?: string;
  advanceAccountId?: string;
  advanceAccountName?: string;
  advanceDate?: string;
  advanceAmount?: string;
  advanceRemark?: string;
  advanceProof?: string;
  barcodes?: any[];
  reservations?: any[];
}

export interface OrderFilterState {
  status: string;
  dateRange: string;
  payment_status: string;
  order_type: string;
  source_type: string;
  startDate: string;
  endDate: string;
}
