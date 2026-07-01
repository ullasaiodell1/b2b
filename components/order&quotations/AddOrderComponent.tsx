import { AdvanceAccountCard } from '@/components/order&quotations/AdvanceAccountCard';
import BulkItemActionsCard from '@/components/order&quotations/BulkItemActionsCard';
import { FinancialAdjustmentsCard, LogisticsCard } from '@/components/order&quotations/LogisticsAndAdjustmentsCards';
import { AdditionalChargesCard, OperationalInsightsCard } from '@/components/order&quotations/OperationalAndChargesCards';
import SelectImagesModal from '@/components/order&quotations/SelectImagesModal';
import SelectProductModal from '@/components/order&quotations/SelectProductModal';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCompanies, useCompanyAccounts } from '@/hooks/useCompany';
import { useCouriers } from '@/hooks/useCourier';
import { useDealers } from '@/hooks/useDealers';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useLeads } from '@/hooks/useLeads';
import { useCreateOrder } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useProfile } from '@/hooks/useProfile';
import { useUsersCombobox } from '@/hooks/useUsers';
import { uploadFile } from '@/services/api/file';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddTransportModal from './edit-order/AddTransportModal';
import EditAddressModal from './edit-order/EditAddressModal';

const STATUS_OPTIONS = ['Complete', 'Pending', 'Inprogress', 'Out Of Delivery', 'Delivered'];
const PAYMENT_OPTIONS = ['Advance Payment', 'Cash on Delivery', 'Bank Transfer'];
const APPROVER_OPTIONS = ['Vijay Rathod', 'Arjun Maheta', 'Khushal Nadiyapara', 'Parth Solanki'];
const CHARGES_TYPE_OPTIONS = [
  'Service Charge',
  'Packaging Charge',
  'Printing Charge',
  'Installation Charge',
  'Handling Charge',
  'Freight Charge'
];


interface ItemLine {
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
  unit?: string | null;
  base_unit?: string | null;
  manual_scanned_qty?: string | null;
}

export interface AddOrderComponentProps {
  initialLeadId?: string;
  initialCompanyName?: string;
  initialContactName?: string;
  referrer?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  hideHeader?: boolean;
}

function makeEmptyItem(): ItemLine {
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
    unit: '',
    base_unit: '',
    manual_scanned_qty: '0',
  };
}

function calcItem(item: ItemLine) {
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

function formatAmount(n: number) {
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function formatDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function numberToWords(amount: number): string {
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

export const AddOrderComponent: React.FC<AddOrderComponentProps> = ({
  initialLeadId,
  initialCompanyName,
  initialContactName,
  referrer,
  onSuccess,
  onCancel,
  hideHeader = false,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const createOrderMutation = useCreateOrder();
  const { profile: userProfile } = useProfile();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { primaryColor, primaryLight } = useTheme();

  const handleBack = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    (navigation as any).goBack();
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (onCancel) {
          onCancel();
          return true;
        }
        (navigation as any).goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onCancel])
  );

  const { data: rawLeads = [] } = useLeads();

  const leads = React.useMemo(() => {
    return rawLeads.map((item: any) => {
      let priority: 'High' | 'Normal' | 'Low' = 'Normal';
      const rawPriority = (item.priority || '').toUpperCase();
      if (rawPriority === 'HOT' || rawPriority === 'HIGH') priority = 'High';
      else if (rawPriority === 'WARM' || rawPriority === 'NORMAL') priority = 'Normal';
      else if (rawPriority === 'COLD' || rawPriority === 'LOW') priority = 'Low';

      const tag = (item.tags && Array.isArray(item.tags) && item.tags[0]?.name)
        || item.tag
        || '';

      return {
        id: String(item.id),
        name: item.name || '',
        company: item.company_name || item.company || '',
        email: item.email || '',
        phone: item.phone || '',
        tag: tag,
        priority: priority,
        owner: item.assigned_to_name || item.owner || '',
        status: item.status_name || item.status || '',
        source: item.source_name || item.source || '',
        ...item,
      } as any;
    });
  }, [rawLeads]);

  const [customerType, setCustomerType] = useState<'DEALER' | 'LEAD'>('LEAD');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [companyId, setCompanyId] = useState<string>('');
  const { data: products = [] } = useProducts({ company_id: companyId });
  const [companyName, setCompanyName] = useState<string>(initialCompanyName || '');
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanies({ search: companySearchQuery, limit: 100 });

  const selectedCompany = React.useMemo(() => {
    return companies.find((c: any) => String(c.id) === String(companyId));
  }, [companies, companyId]);

  React.useEffect(() => {
    if (selectedCustomer && !companyId && companies.length > 0) {
      const cid = selectedCustomer.company_id;
      const cName = selectedCustomer.company || selectedCustomer.company_name || '';
      if (cid) {
        setCompanyId(String(cid));
        const match = companies.find((c: any) => String(c.id) === String(cid));
        if (match) {
          setCompanyName(match.display_name || match.name || '');
        }
      } else {
        if (cName.trim()) {
          const match = companies.find(
            (c: any) =>
              c.display_name?.toLowerCase().trim() === cName.trim().toLowerCase() ||
              c.name?.toLowerCase().trim() === cName.trim().toLowerCase()
          );
          if (match) {
            setCompanyId(String(match.id));
            setCompanyName(match.display_name || match.name || '');
          }
        }
      }
    }
  }, [selectedCustomer, companies, companyId]);

  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);



  const { data: dealersData = [], isLoading: isLoadingDealers } = useDealers({ search: customerSearchQuery, limit: 100 });

  const dealers = React.useMemo(() => {
    return dealersData.map((item: any) => {
      return {
        id: String(item.id),
        name: item.contact_name || item.name || '',
        company: item.company_name || item.display_name || item.company || '',
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || item.location || '',
        ...item,
      };
    });
  }, [dealersData]);

  React.useEffect(() => {
    const targetId = initialLeadId;
    if (targetId && leads.length > 0) {
      const match = leads.find(l => String(l.id) === String(targetId));
      if (match) {
        setCustomerType('LEAD');
        handleSelectCustomer(match);
      }
    }
  }, [initialLeadId, leads]);

  const [orderNo] = useState(() => 'ORD-2026-' + Math.floor(1000 + Math.random() * 9000));
  const [clientName, setClientName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [status, setStatus] = useState<any>('Pending');
  const [paymentType, setPaymentType] = useState('Advance Payment');

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.name || customer.company || '');
    setClientName(customer.company || customer.name || '');
    setContactPerson(customer.name || '');
    setHotelLocation(customer.address || customer.location || 'No address provided');
    setBillingAddress(customer.address || customer.location || '');
    setShippingAddress(customer.address || customer.location || '');
    setShowCustomerModal(false);

    const cName = customer.company || customer.company_name || '';
    if (customer.company_id) {
      const cid = String(customer.company_id);
      setCompanyId(cid);
      const match = companies.find((c: any) => String(c.id) === cid);
      if (match) {
        setCompanyName(match.display_name || match.name || '');
      } else {
        setCompanyName('');
      }
    } else {
      if (cName.trim()) {
        const match = companies.find(
          (c: any) =>
            c.display_name?.toLowerCase().trim() === cName.trim().toLowerCase() ||
            c.name?.toLowerCase().trim() === cName.trim().toLowerCase()
        );
        if (match) {
          setCompanyId(String(match.id));
          setCompanyName(match.display_name || match.name || '');
        } else {
          setCompanyId('');
          setCompanyName('');
        }
      } else {
        setCompanyId('');
        setCompanyName('');
      }
    }
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearchQuery('');
    setClientName('');
    setContactPerson('');
    setHotelLocation('');
    setBillingAddress('');
    setShippingAddress('');
    setSameAsBilling(true);
    setCompanyId('');
    setCompanyName('');
  };

  const filteredCustomerList = React.useMemo(() => {
    if (customerType === 'DEALER') {
      return dealers.filter((d: any) => {
        const query = customerSearchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          (d.name || '').toLowerCase().includes(query) ||
          (d.company || '').toLowerCase().includes(query) ||
          (d.phone || '').includes(query)
        );
      });
    } else {
      return leads.filter((lead: any) => {
        const query = customerSearchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          (lead.name || '').toLowerCase().includes(query) ||
          (lead.company || '').toLowerCase().includes(query) ||
          (lead.phone || '').includes(query)
        );
      });
    }
  }, [customerType, dealers, leads, customerSearchQuery]);

  const [items, setItems] = useState<ItemLine[]>([makeEmptyItem()]);
  const [activeProductSelectIndex, setActiveProductSelectIndex] = useState<number | null>(null);
  const [activeImageSelectIndex, setActiveImageSelectIndex] = useState<number | null>(null);
  const [pendingProduct, setPendingProduct] = useState<any>(null);

  const [internalRemarks, setInternalRemarks] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState<Date | null>(null);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [approvedBy, setApprovedBy] = useState('');
  const [showApprovedByModal, setShowApprovedByModal] = useState(false);

  const [chargesGst, setChargesGst] = useState('18');
  const [chargesType, setChargesType] = useState('Service Charge');
  const [showChargesTypeModal, setShowChargesTypeModal] = useState(false);
  const [chargesAmount, setChargesAmount] = useState('');

  const [logisticsPartner, setLogisticsPartner] = useState('');
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [trackingAwb, setTrackingAwb] = useState('');
  const [shippingFreight, setShippingFreight] = useState('0.00');
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);


  const [keyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const { data: couriersData } = useCouriers();

  const courierList = React.useMemo(() => {
    const defaultPartners = ['Blue Dart', 'Delhivery', 'FedEx', 'DHL', 'DTDC', 'Professional Couriers'];
    if (!couriersData || couriersData.length === 0) return defaultPartners;
    const apiNames = couriersData.map((c: any) => c.courier_name).filter(Boolean);
    if (apiNames.length === 0) return defaultPartners;
    return Array.from(new Set([...apiNames, ...defaultPartners]));
  }, [couriersData]);



  const [adjustmentType, setAdjustmentType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('0.00');

  const [isAdvanceAccount, setIsAdvanceAccount] = useState(false);
  const [advanceAccountSelected, setAdvanceAccountSelected] = useState<any | null>(null);
  const [advanceDate, setAdvanceDate] = useState<Date>(new Date());
  const [showAdvanceDatePicker, setShowAdvanceDatePicker] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceRemark, setAdvanceRemark] = useState('');
  const [advanceProof, setAdvanceProof] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);

  const { data: accountsData } = useCompanyAccounts(selectedCustomer?.company_id || '0364bbec-99cf-42d1-8d3f-1efbb6a0c9e2');

  const { showAttachmentOptions } = useImagePicker({
    allowsEditing: false,
    quality: 0.8,
    onImagePicked: async (uri) => {
      setIsUploadingProof(true);
      try {
        const uploadResult = await uploadFile(uri);
        const finalUrl =
          (typeof uploadResult === 'string' ? uploadResult : null) ||
          uploadResult?.url ||
          uploadResult?.file_url ||
          uploadResult?.location ||
          uploadResult?.path ||
          uploadResult?.key ||
          uploadResult?.data?.url ||
          uploadResult?.data?.file_url ||
          null;

        if (finalUrl) {
          setAdvanceProof(finalUrl);
        } else {
          setAdvanceProof(uri);
        }
      } catch (err) {
        console.error('[AdvanceProof Upload Error]:', err);
        setAdvanceProof(uri);
        Alert.alert('Upload Warning', 'Proof image was not uploaded to server but will be saved locally.');
      } finally {
        setIsUploadingProof(false);
      }
    }
  });

  const handlePickAdvanceProof = () => {
    showAttachmentOptions(
      "Upload Payment Proof",
      "Select camera or gallery to upload payment screenshot/receipt"
    );
  };

  const { data: usersData } = useUsersCombobox();

  const approverList = React.useMemo(() => {
    if (!usersData || usersData.length === 0) {
      return APPROVER_OPTIONS;
    }
    const apiNames = usersData.map((u: any) => u.name).filter(Boolean);
    if (apiNames.length === 0) return APPROVER_OPTIONS;
    return Array.from(new Set([...apiNames, ...APPROVER_OPTIONS]));
  }, [usersData]);

  const updateItem = (idx: number, key: keyof ItemLine, val: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, makeEmptyItem()]);

  const removeItem = (idx: number) => {
    if (items.length === 1) {
      Alert.alert('Info', 'At least one item is required.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleApplyBulkDiscount = (num: number) => {
    const selectedCount = items.filter(item => item.isSelected !== false).length;
    if (selectedCount === 0) {
      Alert.alert('Info', 'No items selected to apply discount.');
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.isSelected !== false ? { ...item, item_discount: String(num) } : item
      )
    );
  };

  const handleApplyBulkRate = (op: 'SET' | 'ADD' | 'SUB', num: number) => {
    const selectedCount = items.filter(item => item.isSelected !== false).length;
    if (selectedCount === 0) {
      Alert.alert('Info', 'No items selected to apply rate changes.');
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.isSelected === false) return item;
        const currentPrice = parseFloat(item.unit_price) || 0;
        let newPrice = currentPrice;
        if (op === 'SET') {
          newPrice = num;
        } else if (op === 'ADD') {
          newPrice = currentPrice + num;
        } else if (op === 'SUB') {
          newPrice = Math.max(0, currentPrice - num);
        }
        return { ...item, unit_price: String(parseFloat(newPrice.toFixed(2))) };
      })
    );
  };

  const handleResetBulk = () => {
    const selectedCount = items.filter(item => item.isSelected !== false).length;
    if (selectedCount === 0) {
      Alert.alert('Info', 'No items selected to reset.');
      return;
    }

    Alert.alert('Confirm Reset', 'Are you sure you want to reset the price and discount of selected items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setItems((prev) =>
            prev.map((item) => {
              if (item.isSelected === false) return item;
              let originalPrice = '0';
              if (item.product_id) {
                const prod = products.find((p: any) => String(p.id) === String(item.product_id));
                if (prod) {
                  originalPrice = String(prod.selling_price || prod.dealer_price || 0);
                }
              }
              return {
                ...item,
                unit_price: originalPrice,
                item_discount: '0',
              };
            })
          );
        }
      }
    ]);
  };

  const handleToggleSelectAll = () => {
    const allSel = items.every((item) => item.isSelected !== false);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isSelected: !allSel,
      }))
    );
  };

  const toggleCollapse = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], isCollapsed: !next[idx].isCollapsed };
      return next;
    });
  };

  // Calculate Totals
  let subTotal = 0;
  let taxTotal = 0;
  items.forEach((item) => {
    const { amount, gst_amount } = calcItem(item);
    subTotal += amount;
    taxTotal += gst_amount;
  });

  const addChargesAmt = parseFloat(chargesAmount) || 0;
  const addChargesGstPct = parseFloat(chargesGst) || 0;
  const addChargesGstAmt = addChargesAmt * (addChargesGstPct / 100);

  const shippingAmt = parseFloat(shippingFreight) || 0;

  const computedSubTotal = subTotal + addChargesAmt;
  const computedGstTotal = taxTotal + addChargesGstAmt;
  const computedGrandTotal = computedSubTotal + computedGstTotal + shippingAmt;

  const discountValNum = parseFloat(discountValue) || 0;
  const discountAmt = adjustmentType === 'PERCENTAGE'
    ? computedGrandTotal * (discountValNum / 100)
    : discountValNum;

  const payableAmt = Math.max(0, computedGrandTotal - discountAmt);

  const handleSave = () => {
    if (!selectedCustomer) {
      Alert.alert('Validation', 'Please select a Customer.');
      return;
    }

    if (!companyId) {
      Alert.alert('Validation', 'Please select a Company.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].item_name.trim()) {
        Alert.alert('Validation', `Item ${i + 1} name is required.`);
        return;
      }
      if (!parseFloat(items[i].quantity) || parseFloat(items[i].quantity) <= 0) {
        Alert.alert('Validation', `Item ${i + 1} quantity must be greater than 0.`);
        return;
      }
    }

    const formattedAmount = `₹ ${payableAmt.toFixed(2)}`;

    const getBackendStatus = (statusStr: string): string => {
      const s = (statusStr || 'PENDING').toUpperCase();
      if (s === 'PENDING') return 'DRAFT';
      if (s === 'COMPLETE' || s === 'COMPLETED') return 'CONFIRMED';
      if (s === 'INPROGRESS' || s === 'PROCESS' || s === 'PROCESSING') return 'PROCESSING';
      if (s === 'CANCEL' || s === 'CANCELLED') return 'CANCELLED';
      if (s === 'DELIVERED') return 'DELIVERED';
      if (s === 'APPROVED') return 'CONFIRMED';
      return 'DRAFT';
    };

    const leadId = customerType === 'LEAD' && selectedCustomer ? selectedCustomer.id : null;
    const dealerId = customerType === 'DEALER' && selectedCustomer ? selectedCustomer.id : null;

    // ── Build a clean API payload (no frontend-only display fields) ──
    const newOrder: any = {
      id: null,
      order_number: null,
      order_date: new Date().toISOString(),
      expected_delivery_date: expectedDelivery ? expectedDelivery.toISOString() : null,
      actual_delivery_date: null,
      status: getBackendStatus(status),
      payment_status: 'PENDING',
      subtotal: parseFloat(subTotal.toFixed(2)),
      discount_amount: parseFloat(discountAmt.toFixed(2)),
      tax_amount: 0,
      shipping_charges: shippingAmt,
      grand_total: parseFloat(payableAmt.toFixed(2)),
      tracking_number: trackingAwb || null,
      approved_by: approvedBy || null,
      approved_at: null,
      customer_notes: null,
      internal_notes: internalRemarks || null,
      cancelled_at: null,
      cancelled_by: null,
      cancellation_reason: null,
      created_by: userProfile?.id || null,
      updated_by: userProfile?.id || null,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      dealer_id: dealerId,
      order_type: 'CUSTOM_BRANDING',
      source_type: null,
      source_id: null,
      lead_id: leadId,
      amount_in_words: numberToWords(payableAmt),
      gst_amount: parseFloat(taxTotal.toFixed(2)),
      advance_amount: isAdvanceAccount ? (parseFloat(advanceAmount) || 0) : 0,
      advance_payment_date: isAdvanceAccount ? advanceDate.toISOString() : null,
      advance_receipt_url: isAdvanceAccount ? (advanceProof || null) : null,
      reject_remarks: null,
      advance_payment_method: isAdvanceAccount ? paymentType : null,
      courier_company_id: null,
      address_line1: selectedCustomer?.address_line1 || billingAddress || null,
      address_line2: selectedCustomer?.address_line2 || null,
      city_id: selectedCustomer?.city_id || null,
      state_id: selectedCustomer?.state_id || null,
      country_id: selectedCustomer?.country_id || null,
      pincode: selectedCustomer?.pincode || null,
      sales_member_id: userProfile?.id || null,
      billing_address: billingAddress || null,
      shipping_address_line1: sameAsBilling ? (billingAddress || null) : (shippingAddress || null),
      shipping_address_line2: sameAsBilling ? (selectedCustomer?.address_line2 || null) : null,
      shipping_city_id: sameAsBilling ? (selectedCustomer?.city_id || null) : null,
      shipping_state_id: sameAsBilling ? (selectedCustomer?.state_id || null) : null,
      shipping_country_id: sameAsBilling ? (selectedCustomer?.country_id || null) : null,
      shipping_pincode: sameAsBilling ? (selectedCustomer?.pincode || null) : null,
      shipping_lat_long: null,
      discount_type: adjustmentType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
      associated_order_id: null,
      estimated_completion_time: null,
      sale_ref_id: null,
      completed_at: null,
      approval_from: null,
      meta: null,
      company_id: companyId ? String(companyId) : '0364bbec-99cf-42d1-8d3f-1efbb6a0c9e2',
      additional_charges: addChargesAmt > 0 ? addChargesAmt : null,
      service_gst: addChargesAmt > 0 ? (parseFloat(chargesGst) || 0) : null,
      service_tax_total: addChargesAmt > 0 ? parseFloat(addChargesGstAmt.toFixed(2)) : null,

      // Items
      items: items.map((item) => {
        const { amount: itemTaxable, gst_amount: itemGstAmount, total } = calcItem(item);
        const itemDiscPct = parseFloat(item.item_discount) || 0;
        const itemDiscAmt = itemTaxable * (itemDiscPct / 100);
        return {
          id: item.id || null,
          order_id: item.order_id || null,
          product_id: item.product_id || null,
          kit_id: item.kit_id || null,
          item_code: item.item_code || '',
          item_name: item.item_name,
          item_description: item.item_description || '',
          fragrance_name: item.fragrance_name || null,
          category_id: item.category_id || null,
          category_name: item.category_name || null,
          quantity: parseFloat(item.quantity) || 0,
          unit_price: parseFloat(item.unit_price) || 0,
          discount_amount: parseFloat(itemDiscAmt.toFixed(2)),
          notes: item.notes || null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          amount: parseFloat(itemTaxable.toFixed(2)),
          gst_percentage: parseFloat(item.gst_percentage) || 0,
          gst_amount: parseFloat(itemGstAmount.toFixed(2)),
          images: item.images || [],
          total_amount: parseFloat(total.toFixed(2)),
          ref_id: item.ref_id || null,
          item_discount: itemDiscPct,
          mrp: parseFloat(item.mrp || '') || parseFloat(item.unit_price) || 0,
          manual_scanned_qty: parseFloat(item.manual_scanned_qty || '') || 0,
          source: item.source || 'MANUAL',
          barcodes: item.barcodes || null,
          base_unit: item.base_unit || item.unit || null,
        };
      }),

      // Payments
      payments: isAdvanceAccount && advanceAccountSelected ? [{
        account_id: advanceAccountSelected.id,
        amount: parseFloat(advanceAmount) || 0,
        remark: advanceRemark || '',
        receipt_url: advanceProof || '',
      }] : [],
    };

    createOrderMutation.mutate(newOrder, {
      onSuccess: (response: any) => {
        // Extract the created order id from the response
        const createdId =
          response?.data?.data?.id ||
          response?.data?.id ||
          response?.id ||
          null;

        Alert.alert('Success', 'Order created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (createdId) {
                router.replace({
                  pathname: '/(tabs)/Order/order-details' as any,
                  params: { id: createdId },
                });
              } else {
                handleBack();
              }
            },
          },
        ]);
        if (onSuccess) onSuccess();
      },
      onError: (error: any) => {
        Alert.alert('Error', 'Failed to create order. Please try again.');
      },
    });
  };

  const renderProductMock = () => {
    return (
      <View style={styles.productMockContainer}>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 26, backgroundColor: '#4F46E5' }]} />
        </View>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 32, backgroundColor: '#EAB308' }]} />
        </View>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 30, backgroundColor: '#10B981' }]} />
        </View>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 25, backgroundColor: '#F97316' }]} />
        </View>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 32, backgroundColor: '#3B82F6' }]} />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      {!hideHeader && (
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              <Text style={{ color: primaryColor }}>ADD </Text>
              <Text style={{ color: COLORS.textDark }}>ORDER</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
          </View>

          <View style={{ width: 36 }} />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: keyboardVisible ? 200 : 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ color: COLORS.danger, fontSize: 13, fontWeight: '700' }}>* </Text>
              <Text style={styles.inputLabelGrey}>CUSTOMER/LEAD</Text>
            </View>

            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={() => setShowCustomerModal(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectTriggerText, !selectedCustomer && { color: '#9CA3AF' }]} numberOfLines={1}>
                {selectedCustomer ? (selectedCustomer.name || selectedCustomer.company) : 'Select Customer'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {selectedCustomer ? (
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleClearCustomer(); }} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ color: COLORS.danger, fontSize: 13, fontWeight: '700' }}>* </Text>
              <Text style={styles.inputLabelGrey}>COMPANY</Text>
            </View>
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={() => setShowCompanyPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectTriggerText, !companyId && !companyName && { color: '#9CA3AF' }]} numberOfLines={1}>
                {selectedCompany ? (selectedCompany.display_name || selectedCompany.name) : (companyName || 'Select Company')}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.inputLabelGrey}>SHIP TO</Text>
              {selectedCustomer && (
                <TouchableOpacity
                  onPress={() => {
                    setShowAddressModal(true);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil-sharp" size={12} color={primaryColor} />
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: primaryColor }}>EDIT PROFILE</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.billToBox}>
              {selectedCustomer ? (
                (!billingAddress || billingAddress === (selectedCustomer.address || selectedCustomer.location)) && sameAsBilling ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 }}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#0EA5E9" />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#0EA5E9', letterSpacing: 0.5 }}>
                      DIRECT BILLING DELIVERY
                    </Text>
                  </View>
                ) : (
                  <View style={styles.billToContent}>
                    <Text style={styles.billToCompany}>{selectedCustomer.company || selectedCustomer.name}</Text>
                    {sameAsBilling ? (
                      <Text style={styles.billToText}>{billingAddress || 'No billing address provided'}</Text>
                    ) : (
                      <>
                        <Text style={[styles.billToCompany, { fontSize: 11, color: COLORS.textMuted, marginTop: 4 }]}>BILLING ADDRESS</Text>
                        <Text style={styles.billToText}>{billingAddress || 'No billing address provided'}</Text>
                        <Text style={[styles.billToCompany, { fontSize: 11, color: COLORS.textMuted, marginTop: 6 }]}>SHIPPING ADDRESS</Text>
                        <Text style={styles.billToText}>{shippingAddress || 'No shipping address provided'}</Text>
                      </>
                    )}
                  </View>
                )
              ) : (
                <Text style={styles.noRecipientText}>NO RECIPIENT SELECTED</Text>
              )}
            </View>
          </View>

          <BulkItemActionsCard
            items={items}
            onApplyBulkDiscount={handleApplyBulkDiscount}
            onApplyBulkRate={handleApplyBulkRate}
            onResetBulk={handleResetBulk}
            onToggleSelectAll={handleToggleSelectAll}
          />

          {items.map((item, idx) => {
            const { amount: itemTaxable, gst_amount: itemGstAmount, total: itemTotal } = calcItem(item);
            return (
              <View key={item.tempId} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <TouchableOpacity
                    style={{ padding: 4, marginRight: 2 }}
                    onPress={() => {
                      setItems((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], isSelected: next[idx].isSelected !== false ? false : true };
                        return next;
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.isSelected !== false ? "checkbox" : "square-outline"}
                      size={22}
                      color={item.isSelected !== false ? primaryColor : COLORS.textMuted}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                    onPress={() => toggleCollapse(idx)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.itemIndexBadge, { backgroundColor: primaryLight }]}>
                      <Text style={[styles.itemIndexText, { color: primaryColor }]}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.itemHeading} numberOfLines={1}>
                      {item.item_name || `Item ${idx + 1}`}
                    </Text>
                    <Ionicons
                      name={item.isCollapsed ? "chevron-back" : "chevron-down"}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                  {item.product_id && (
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 6,
                      }}
                      onPress={() => {
                        const availableImgs = item.availableImages || [];
                        if (availableImgs.length === 0) {
                          Alert.alert('Info', 'No images available for this product.');
                          return;
                        }
                        setActiveImageSelectIndex(idx);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="image-outline" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteItemBtn}
                    onPress={() => removeItem(idx)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
                {/* Form fields (only visible when expanded) */}
                {!item.isCollapsed ? (
                  <View style={{ gap: 12, marginTop: 4 }}>
                    {/* Item Name Picker */}
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>Item Name <Text style={{ color: COLORS.danger }}>*</Text></Text>
                      <TouchableOpacity
                        style={styles.selectTrigger}
                        onPress={() => {
                          setActiveProductSelectIndex(idx);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.selectTriggerText, !item.item_name && { color: '#9CA3AF' }]} numberOfLines={1}>
                          {item.item_name || 'Select Product / Kit'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {/* Item Code (labeled 'Code') */}
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>Code</Text>
                      <TextInput
                        style={styles.textInputBox}
                        placeholder="SKU / HSN / SAC code"
                        placeholderTextColor="#9CA3AF"
                        value={item.item_code}
                        onChangeText={(v) => updateItem(idx, 'item_code', v)}
                      />
                    </View>

                    {/* Description */}
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>Description</Text>
                      <TextInput
                        style={styles.textInputBox}
                        placeholder="Optional description"
                        placeholderTextColor="#9CA3AF"
                        value={item.item_description}
                        onChangeText={(v) => updateItem(idx, 'item_description', v)}
                      />
                    </View>

                    {/* Qty & Price inputs */}
                    <View style={styles.gridRow}>
                      <View style={[styles.formField, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Qty <Text style={{ color: COLORS.danger }}>*</Text></Text>
                        <TextInput
                          style={styles.textInputBox}
                          keyboardType="numeric"
                          value={item.quantity}
                          onChangeText={(v) => updateItem(idx, 'quantity', v)}
                        />
                      </View>
                      <View style={[styles.formField, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>MRP<Text style={{ color: COLORS.danger }}>*</Text></Text>
                        <TextInput
                          style={styles.textInputBox}
                          keyboardType="numeric"
                          value={item.unit_price}
                          onChangeText={(v) => updateItem(idx, 'unit_price', v)}
                        />
                      </View>
                    </View>

                    {/* MRP & Unit Row */}
                    <View style={styles.gridRow}>
                      <View style={[styles.formField, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Price</Text>
                        <TextInput
                          style={styles.textInputBox}
                          keyboardType="numeric"
                          placeholder="0.00"
                          placeholderTextColor="#9CA3AF"
                          value={item.mrp ?? ''}
                          editable={false}
                        />
                      </View>
                      <View style={[styles.formField, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Unit</Text>
                        <TextInput
                          style={styles.textInputBox}
                          placeholder="e.g. pcs"
                          placeholderTextColor="#9CA3AF"
                          value={item.base_unit ?? ''}
                          editable={false}
                        />
                      </View>
                    </View>

                    {/* Tax & Discount inputs */}
                    <View style={styles.gridRow}>
                      <View style={[styles.formField, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Tax (%)</Text>
                        <TextInput
                          style={styles.textInputBox}
                          keyboardType="numeric"
                          value={item.gst_percentage}
                          onChangeText={(v) => updateItem(idx, 'gst_percentage', v)}
                        />
                      </View>
                      <View style={[styles.formField, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Discount (%)</Text>
                        <TextInput
                          style={styles.textInputBox}
                          keyboardType="numeric"
                          value={item.item_discount}
                          onChangeText={(v) => updateItem(idx, 'item_discount', v)}
                        />
                      </View>
                    </View>

                    {/* Item total preview */}
                    <View style={styles.itemTotalRow}>
                      <Text style={styles.itemTotalLabel}>
                        Taxable: <Text style={styles.itemTotalVal}>{formatAmount(itemTaxable)}</Text>
                        {'  '}GST: <Text style={styles.itemTotalVal}>{formatAmount(itemGstAmount)}</Text>
                      </Text>
                      <Text style={[styles.itemGrandTotal, { color: primaryColor }]}>{formatAmount(itemTotal)}</Text>
                    </View>

                    {/* Selected images preview */}
                    {item.images && item.images.length > 0 && (
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {item.images.map((imgUrl, imgIdx) => (
                          <View
                            key={imgIdx}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: '#E5E7EB',
                              overflow: 'hidden',
                            }}
                          >
                            <TouchableOpacity onPress={() => setPreviewImage(imgUrl)} activeOpacity={0.8}>
                              <Image
                                source={{ uri: imgUrl }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                              />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}

          <TouchableOpacity
            style={[
              styles.addItemBtn,
              { borderColor: primaryColor, backgroundColor: primaryLight }
            ]}
            onPress={addItem}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={18} color={primaryColor} style={{ marginRight: 6 }} />
            <Text style={[styles.addItemBtnText, { color: primaryColor }]}>Add Item</Text>
          </TouchableOpacity>

          <OperationalInsightsCard
            internalRemarks={internalRemarks}
            setInternalRemarks={setInternalRemarks}
            expectedDelivery={expectedDelivery}
            onPressExpectedDelivery={() => setShowDeliveryDatePicker(true)}
            approvedBy={approvedBy}
            onPressApprovedBy={() => setShowApprovedByModal(true)}
          />

          <AdditionalChargesCard
            chargesGst={chargesGst}
            setChargesGst={setChargesGst}
            chargesType={chargesType}
            onPressChargesType={() => setShowChargesTypeModal(true)}
            chargesAmount={chargesAmount}
            setChargesAmount={setChargesAmount}
          />
          <LogisticsCard
            logisticsPartner={logisticsPartner}
            onPressLogisticsPartner={() => setShowLogisticsModal(true)}
            onPressAddPartner={() => setShowAddPartnerModal(true)}
            trackingAwb={trackingAwb}
            setTrackingAwb={setTrackingAwb}
            shippingFreight={shippingFreight}
            setShippingFreight={setShippingFreight}
            primaryColor={primaryColor}
          />

          <FinancialAdjustmentsCard
            adjustmentType={adjustmentType}
            setAdjustmentType={setAdjustmentType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            primaryColor={primaryColor}
          />

          <View style={styles.sectionHeaderRow}>
            <Ionicons name="receipt-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.sectionLabel}>BILL SUMMARY</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.totalSummaryCard}>
            <View style={styles.totalSummaryRow}>
              <Text style={styles.totalSummaryLabel}>Sub-Total</Text>
              <Text style={styles.totalSummaryVal}>{formatAmount(computedSubTotal)}</Text>
            </View>
            <View style={styles.totalSummaryRow}>
              <Text style={styles.totalSummaryLabel}>Estimated GST</Text>
              <Text style={styles.totalSummaryVal}>{formatAmount(computedGstTotal)}</Text>
            </View>
            {shippingAmt > 0 && (
              <View style={styles.totalSummaryRow}>
                <Text style={styles.totalSummaryLabel}>Shipping / Freight</Text>
                <Text style={styles.totalSummaryVal}>{formatAmount(shippingAmt)}</Text>
              </View>
            )}
            {discountAmt > 0 && (
              <View style={styles.totalSummaryRow}>
                <Text style={styles.totalSummaryLabel}>
                  Discount {adjustmentType === 'PERCENTAGE' ? `(${discountValue}%)` : ''}
                </Text>
                <Text style={[styles.totalSummaryVal, { color: COLORS.danger }]}>
                  - {formatAmount(discountAmt)}
                </Text>
              </View>
            )}
            <View style={styles.totalSummaryRow}>
              <Text style={styles.totalSummaryLabel}>Grand Total</Text>
              <Text style={styles.totalSummaryVal}>{formatAmount(computedGrandTotal)}</Text>
            </View>
            <View style={[styles.totalSummaryRow, styles.totalSummaryGrand]}>
              <Text style={styles.grandLabel}>Payable Amount</Text>
              <Text style={[styles.grandVal, { color: primaryColor }]}>{formatAmount(payableAmt)}</Text>
            </View>

            <View style={{ paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.textMuted, fontStyle: 'italic' }}>
                {numberToWords(payableAmt)}
              </Text>
            </View>
          </View>

          <AdvanceAccountCard
            isAdvanceAccount={isAdvanceAccount}
            setIsAdvanceAccount={setIsAdvanceAccount}
            advanceAccountSelected={advanceAccountSelected}
            onPressSelectAccount={() => setShowAccountsModal(true)}
            advanceDate={advanceDate}
            onPressSelectDate={() => setShowAdvanceDatePicker(true)}
            onClearDate={() => setAdvanceDate(new Date())}
            advanceAmount={advanceAmount}
            setAdvanceAmount={setAdvanceAmount}
            advanceRemark={advanceRemark}
            setAdvanceRemark={setAdvanceRemark}
            advanceProof={advanceProof}
            isUploadingProof={isUploadingProof}
            onPressPickProof={handlePickAdvanceProof}
          />
        </View>

        <View style={styles.nonStickySaveContainer}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: primaryColor }, createOrderMutation.isPending && { opacity: 0.7 }]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SelectProductModal
        visible={activeProductSelectIndex !== null}
        onClose={() => setActiveProductSelectIndex(null)}
        companyId={companyId}
        onSelectProduct={(prod) => {
          setPendingProduct(prod);
          setActiveImageSelectIndex(activeProductSelectIndex);
          setActiveProductSelectIndex(null);
        }}
      />

      <SelectImagesModal
        visible={activeImageSelectIndex !== null}
        onClose={() => {
          setActiveImageSelectIndex(null);
          setPendingProduct(null);
        }}
        originalImages={
          pendingProduct
            ? (pendingProduct.images || [])
            : (activeImageSelectIndex !== null ? (items[activeImageSelectIndex]?.availableImages || []) : [])
        }
        selectedImages={
          activeImageSelectIndex !== null
            ? (items[activeImageSelectIndex]?.images && items[activeImageSelectIndex].images.length > 0
              ? items[activeImageSelectIndex].images
              : (pendingProduct ? (pendingProduct.images || []) : []))
            : []
        }
        onSave={(selectedImages) => {
          const idx = activeImageSelectIndex;
          if (idx !== null) {
            if (pendingProduct) {
              setItems((prev) => {
                const next = [...prev];
                next[idx] = {
                  ...next[idx],
                  product_id: pendingProduct.id,
                  item_name: pendingProduct.product_name || '',
                  item_code: pendingProduct.code || '',
                  unit_price: String(pendingProduct.selling_price || pendingProduct.dealer_price || 0),
                  gst_percentage: String(pendingProduct.tax_rate ?? 18),
                  item_description: pendingProduct.description || '',
                  images: selectedImages,
                  availableImages: pendingProduct.images || [],
                  kit_id: pendingProduct.kit_id || null,
                  fragrance_name: pendingProduct.fragrance_name || null,
                  category_id: pendingProduct.category_id || null,
                  category_name: pendingProduct.category_name || null,
                  mrp: String(pendingProduct.mrp ?? pendingProduct.selling_price ?? pendingProduct.dealer_price ?? 0),
                  unit: pendingProduct.unit || pendingProduct.unit_of_measure || pendingProduct.uom || '',
                  base_unit: pendingProduct.base_unit || pendingProduct.unit || pendingProduct.unit_of_measure || pendingProduct.uom || '',
                };
                return next;
              });
            } else {
              updateItem(idx, 'images', selectedImages);
            }
          }
          setPendingProduct(null);
          setActiveImageSelectIndex(null);
        }}
      />

      {showDeliveryDatePicker && (
        <DateTimePicker
          value={expectedDelivery || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selected) => {
            setShowDeliveryDatePicker(false);
            if (selected) {
              setExpectedDelivery(selected);
            }
          }}
        />
      )}

      {showAdvanceDatePicker && (
        <DateTimePicker
          value={advanceDate}
          mode="date"
          display="default"
          onChange={(event, selected) => {
            setShowAdvanceDatePicker(false);
            if (selected) {
              setAdvanceDate(selected);
            }
          }}
        />
      )}

      <Modal transparent animationType="slide" visible={showAccountsModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountsModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account</Text>
              <TouchableOpacity onPress={() => setShowAccountsModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(accountsData || []).map((acc: any) => (
                <TouchableOpacity
                  key={acc.id}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setAdvanceAccountSelected(acc);
                    setShowAccountsModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, paddingVertical: 4 }}>
                    <Text style={styles.modalRowText}>{acc.name} - {acc.bank_name || 'Bank'}</Text>
                    {acc.account_number && (
                      <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                        A/C: {acc.account_number} | Bal: ₹{acc.balance}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent animationType="slide" visible={showApprovedByModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowApprovedByModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Approver</Text>
              <TouchableOpacity onPress={() => setShowApprovedByModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {approverList.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setApprovedBy(opt);
                    setShowApprovedByModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ADDRESS MODAL */}
      <EditAddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        billingAddress={billingAddress}
        shippingAddress={shippingAddress}
        sameAsBilling={sameAsBilling}
        onConfirm={(billing, shipping, same) => {
          setBillingAddress(billing);
          setShippingAddress(shipping);
          setSameAsBilling(same);
          setShowAddressModal(false);
        }}
      />

      <Modal transparent animationType="slide" visible={showChargesTypeModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChargesTypeModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Charge Type</Text>
              <TouchableOpacity onPress={() => setShowChargesTypeModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {CHARGES_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setChargesType(opt);
                    setShowChargesTypeModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent animationType="slide" visible={showLogisticsModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLogisticsModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Transport Partner</Text>
              <TouchableOpacity onPress={() => setShowLogisticsModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {courierList.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setLogisticsPartner(opt);
                    setShowLogisticsModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ADD TRANSPORT MODAL */}
      <AddTransportModal
        visible={showAddPartnerModal}
        onClose={() => setShowAddPartnerModal(false)}
        onSuccess={(name) => {
          setLogisticsPartner(name);
          setShowAddPartnerModal(false);
        }}
      />

      <Modal transparent animationType="slide" visible={showCustomerModal} onRequestClose={() => setShowCustomerModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCustomerModal(false)}
        >
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name, company..."
                placeholderTextColor="#9CA3AF"
                value={customerSearchQuery}
                onChangeText={setCustomerSearchQuery}
                autoCorrect={false}
                autoComplete="off"
              />
              {customerSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCustomerSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
              {filteredCustomerList.map((lead: any) => (
                <TouchableOpacity
                  key={lead.id}
                  style={styles.modalRowItem}
                  onPress={() => {
                    handleSelectCustomer(lead);
                    setShowCustomerModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalRowText}>{lead.name || 'No Contact'}</Text>
                    <Text style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' }}>
                      {lead.company || 'No Company'} • {lead.phone || 'No Phone'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
              {filteredCustomerList.length === 0 && (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>
                    No matches found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent animationType="slide" visible={showCompanyPicker} onRequestClose={() => setShowCompanyPicker(false)} statusBarTranslucent={true}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCompanyPicker(false)}
        >
          <View style={[styles.modalContent, { height: '45%', paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Company</Text>
              <TouchableOpacity onPress={() => setShowCompanyPicker(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by company name..."
                placeholderTextColor="#9CA3AF"
                value={companySearchQuery}
                onChangeText={setCompanySearchQuery}
                autoCorrect={false}
                autoComplete="off"
              />
              {companySearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCompanySearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {isLoadingCompanies ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={primaryColor} />
              </View>
            ) : (
              <ScrollView style={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
                {companies.map((comp: any) => (
                  <TouchableOpacity
                    key={comp.id}
                    style={styles.modalRowItem}
                    onPress={() => {
                      setCompanyId(String(comp.id));
                      setCompanyName(comp.display_name || comp.name || '');
                      setShowCompanyPicker(false);
                      setCompanySearchQuery('');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalRowText}>{comp.display_name || comp.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))}
                {companies.length === 0 && (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>
                      No companies found
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.previewModalContainer}>
          <TouchableOpacity
            style={styles.previewModalCloseBtn}
            onPress={() => setPreviewImage(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inputLabelGrey: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  pickerRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    marginTop: 4,
  },
  dropdownSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'space-between',
    gap: 6,
  },
  dropdownSelectorText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  verticalSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
  },
  typeDropdownPopup: {
    position: 'absolute',
    top: 48,
    left: 0,
    width: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 1100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  typeDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  typeDropdownItemActive: {
    backgroundColor: '#FDF2F4',
  },
  typeDropdownItemText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  billToBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.primaryColor,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FAFBFD',
    minHeight: 72,
    justifyContent: 'center',
    marginTop: 4,
  },
  billToContent: {
    gap: 3,
  },
  billToCompany: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  billToText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  noRecipientText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  formContainer: {
    marginTop: 10,
    gap: 5,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  nonStickySaveContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  saveBtn: {
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  itemCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    marginTop: 8,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIndexText: { fontSize: 11, fontWeight: '800' },
  itemHeading: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  deleteItemBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formField: { gap: 5 },
  textInputBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  selectTriggerText: { fontSize: 13, color: COLORS.textDark, fontWeight: '600' },
  gridRow: { flexDirection: 'row', gap: 10 },
  itemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FBF9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemTotalLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  itemTotalVal: { fontWeight: '800', color: COLORS.textDark },
  itemGrandTotal: { fontSize: 13.5, fontWeight: '900' },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 44,
    marginTop: 10,
  },
  addItemBtnText: { fontSize: 13, fontWeight: '800' },
  totalSummaryCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  totalSummaryGrand: { borderBottomWidth: 0 },
  totalSummaryLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  totalSummaryVal: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  grandLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  grandVal: { fontSize: 15, fontWeight: '900' },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 620,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  modalFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F0FDFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalFormTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalFormSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  modalFormCloseBtn: {
    padding: 4,
  },
  modalFormScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalFormBody: {
    gap: 12,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    marginTop: 6,
  },
  availabilityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  availabilitySubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  modalFormFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalFormCancelBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFormCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalFormSubmitBtn: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFormSubmitBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#FAFAFA',
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  productMockContainer: {
    width: 76,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EAEFEA',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#D8E2DD',
  },
  productImage: {
    width: 76,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E2DD',
  },
  mockBottleGroup: {
    alignItems: 'center',
    gap: 1,
  },
  bottleCap: {
    width: 4,
    height: 3,
    borderRadius: 0.5,
  },
  bottleBody: {
    width: 7,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
