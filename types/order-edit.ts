export interface ItemLine {
  tempId: string;
  product_id?: string | null;
  item_name: string;
  item_code: string;
  item_description: string;
  quantity: string;
  unit_price: string;
  gst_percentage: string;
  item_discount: string;
  images?: string[] | null;
  availableImages?: string[] | null;
  isCollapsed?: boolean;
  source?: string;
  barcodes?: string[] | null;
  isSelected?: boolean;
  id?: string | null;
  order_id?: string | null;
  kit_id?: string | null;
  fragrance_name?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  ref_id?: string | null;
  mrp?: string | null;
  manual_scanned_qty?: string | null;
}

export function makeEmptyItem(): ItemLine {
  return {
    tempId: String(Date.now() + Math.random()),
    product_id: null,
    item_name: '',
    item_code: '',
    item_description: '',
    quantity: '1',
    unit_price: '0',
    gst_percentage: '18',
    item_discount: '0',
    images: [],
    availableImages: [],
    isCollapsed: false,
    source: 'MANUAL',
    barcodes: null,
    isSelected: true,
    id: null,
    order_id: null,
    kit_id: null,
    fragrance_name: null,
    category_id: null,
    category_name: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ref_id: null,
    mrp: '0',
    manual_scanned_qty: '0',
  };
}

export function calcItem(item: ItemLine) {
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.unit_price) || 0;
  const disc = parseFloat(item.item_discount) || 0;
  const gst = parseFloat(item.gst_percentage) || 0;

  const rawAmt = qty * rate;
  const discAmt = rawAmt * (disc / 100);
  const taxable = rawAmt - discAmt;
  const gstAmt = taxable * (gst / 100);
  const totalAmt = taxable + gstAmt;

  return {
    amount: parseFloat(taxable.toFixed(2)),
    gst_amount: parseFloat(gstAmt.toFixed(2)),
    total: parseFloat(totalAmt.toFixed(2)),
  };
}

export function formatAmount(n: number) {
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export function formatDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function numberToWords(amount: number): string {
  const num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const formatTens = (n: number) => {
    if (n < 10) return single[n];
    if (n < 20) return double[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  };

  const convert = (n: number, suffix: string) => {
    if (n === 0) return '';
    let res = '';
    if (n > 99) {
      res += single[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      res += formatTens(n) + ' ';
    }
    return res + suffix + ' ';
  };

  let words = '';
  words += convert(Math.floor(num / 10000000) % 100, 'Crore');
  words += convert(Math.floor(num / 100000) % 100, 'Lakh');
  words += convert(Math.floor(num / 1000) % 100, 'Thousand');
  words += convert(num % 1000, '');

  words = words.trim().replace(/\s+/g, ' ');
  if (!words) return 'Zero Rupees Only';

  const paise = Math.round((amount - num) * 100);
  let paiseWords = '';
  if (paise > 0) {
    paiseWords = ' and ' + formatTens(paise) + ' Paise';
  }

  return words + ' Rupees' + paiseWords + ' Only';
}
