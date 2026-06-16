const formatDate = (dateStr?: string) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  try {
    if (dateStr.includes(',') && isNaN(Number(dateStr))) return dateStr;
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatAmountValue = (val: any) => {
  if (val === undefined || val === null) return '₹ 0.00';
  if (typeof val === 'string' && val.trim().startsWith('₹')) {
    return val;
  }
  const num = Number(val);
  if (!isNaN(num)) {
    return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }
  return val || '₹ 0.00';
};

export const getOrderField = (order: any) => {
  if (!order) return order;

  let orderNo = order.orderNo || order.order_no;
  if (!orderNo && order.order_number) {
    const prefix = order.prefix || 'OD';
    orderNo = `${prefix}-${order.order_number}`;
  }
  if (!orderNo) {
    orderNo = order.id ? `#${order.id.slice(0, 8).toUpperCase()}` : 'N/A';
  }

  const dateVal = order.date || order.order_date || order.created_at || 'N/A';
  const date = formatDate(dateVal);

  const clientName = order.clientName || order.client_name || order.customer_name || order.customer_info?.customer_name || order.company_name || order.company || 'N/A';
  const contactPerson = order.contactPerson || order.contact_person || order.customer_info?.customer_name || order.customer_name || order.contact_name || 'N/A';
  const hotelLocation = order.hotelLocation || order.hotel_location || order.shipping_address || order.billing_address || order.location || order.address || 'N/A';
  const status = order.status || 'Pending';

  const itemsCount = order.itemsCount || order.items_count || (Array.isArray(order.items) ? order.items.length : 0) || 0;

  const paymentType = order.paymentType || order.payment_type || order.payment_method || order.payment_terms || order.payment_terms_custom || 'N/A';
  
  const rawAmount = order.amount || order.payable_amount || order.grand_total || order.total_amount || 0;
  const amount = formatAmountValue(rawAmount);

  const approvedBy = order.approvedBy || order.sales_member_name || order.created_by_name || order.approved_by_name || order.sales_representative || 'N/A';

  return {
    ...order,
    orderNo,
    date,
    clientName,
    contactPerson,
    hotelLocation,
    status,
    itemsCount,
    paymentType,
    amount,
    approvedBy,
  };
};
