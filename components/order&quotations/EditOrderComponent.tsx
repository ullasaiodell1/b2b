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
import { useOrderDetails, useUpdateOrder } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useProfile } from '@/hooks/useProfile';
import { useUsersCombobox } from '@/hooks/useUsers';
import { uploadFile } from '@/services/api/file';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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


import CustomerSearchModal from './edit-order/CustomerSearchModal';
import EditAddressModal from './edit-order/EditAddressModal';
import AddTransportModal from './edit-order/AddTransportModal';
import {
  ItemLine,
  makeEmptyItem,
  calcItem,
  formatAmount,
  formatDate,
  numberToWords
} from '@/types/order-edit';

export interface EditOrderComponentProps {
  id: string;
  referrer?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  hideHeader?: boolean;
}

export const EditOrderComponent: React.FC<EditOrderComponentProps> = ({
  id,
  referrer,
  onSuccess,
  onCancel,
  hideHeader = false,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { data: order, isLoading: isLoadingOrder } = useOrderDetails(id);
  const updateOrderMutation = useUpdateOrder();
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
  const [companyName, setCompanyName] = useState<string>('');
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

  const [clientName, setClientName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [isCustomerDetailsCollapsed, setIsCustomerDetailsCollapsed] = useState(true);
  const [status, setStatus] = useState<any>('Pending');
  const [paymentType, setPaymentType] = useState('Advance Payment');
  const ORDER_TYPE_OPTIONS = ['CUSTOM_BRANDING', 'STANDARD', 'SAMPLE'];
  const [orderType, setOrderType] = useState('CUSTOM_BRANDING');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

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

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (order && !isInitialized) {
      // 1. Customer Selection
      let customerObj: any = null;
      if (order.dealer_id) {
        setCustomerType('DEALER');
        const foundDealer = dealers.find((d: any) => String(d.id) === String(order.dealer_id));
        if (foundDealer) {
          customerObj = foundDealer;
        } else {
          customerObj = {
            id: String(order.dealer_id),
            name: order.customer_name || order.contactPerson || '',
            company: order.company_name || order.company || '',
            phone: order.customer_phone || order.phone || '',
            email: order.customer_email || order.email || '',
            address: order.shipping_address_line1 || order.billing_address || '',
            company_id: order.company_id || '',
          };
        }
      } else if (order.lead_id) {
        setCustomerType('LEAD');
        const foundLead = leads.find((l: any) => String(l.id) === String(order.lead_id));
        if (foundLead) {
          customerObj = foundLead;
        } else {
          customerObj = {
            id: String(order.lead_id),
            name: order.customer_name || order.contactPerson || '',
            company: order.company_name || order.company || '',
            phone: order.customer_phone || order.phone || '',
            email: order.customer_email || order.email || '',
            address: order.shipping_address_line1 || order.billing_address || '',
            company_id: order.company_id || '',
          };
        }
      }

      if (customerObj) {
        setSelectedCustomer(customerObj);
        setCustomerSearchQuery(customerObj.name || customerObj.company || '');
      }

      setCompanyId(order.company_id || '');
      setCompanyName(order.company_name || order.company || '');
      setBillingAddress(order.billing_address || '');
      setShippingAddress(order.shipping_address_line1 || '');
      setSameAsBilling(order.billing_address === order.shipping_address_line1);
      setClientName(order.company_name || order.customer_name || '');
      setContactPerson(order.customer_name || '');
      setHotelLocation(order.shipping_address_line1 || order.billing_address || '');

      // Status mapping
      const getStatusOption = (statusStr: string): string => {
        const s = (statusStr || '').toUpperCase();
        if (s === 'DRAFT') return 'Pending';
        if (s === 'CONFIRMED') return 'Complete';
        if (s === 'PROCESSING') return 'Inprogress';
        if (s === 'CANCELLED') return 'Pending';
        if (s === 'DELIVERED') return 'Delivered';
        return 'Pending';
      };
      setStatus(getStatusOption(order.status));

      setPaymentType(order.advance_payment_method || 'Advance Payment');
      setOrderType(order.order_type || 'CUSTOM_BRANDING');
      setInternalRemarks(order.internal_notes || '');
      setExpectedDelivery(order.expected_delivery_date ? new Date(order.expected_delivery_date) : null);
      setApprovedBy(order.approved_by || '');

      setChargesAmount(order.additional_charges ? String(order.additional_charges) : '');
      setChargesGst(order.service_gst ? String(order.service_gst) : '18');

      setLogisticsPartner(order.tracking_company || order.courier_name || '');
      setTrackingAwb(order.tracking_number || '');
      setShippingFreight(order.shipping_charges ? String(order.shipping_charges) : '0.00');

      setAdjustmentType(order.discount_type === 'PERCENTAGE' ? 'PERCENTAGE' : 'FLAT');
      setDiscountValue(order.discount_type === 'PERCENTAGE' ? String(order.discount_value || '0.00') : String(order.discount_amount || '0.00'));

      setIsAdvanceAccount(order.advance_amount > 0);
      setAdvanceAmount(order.advance_amount ? String(order.advance_amount) : '');
      setAdvanceDate(order.advance_payment_date ? new Date(order.advance_payment_date) : new Date());
      setAdvanceRemark(order.advance_remark || '');
      setAdvanceProof(order.advance_receipt_url || '');

      // Load Items
      if (Array.isArray(order.items) && order.items.length > 0) {
        const mappedItems = order.items.map((item: any) => ({
          tempId: item.id || String(Date.now() + Math.random()),
          product_id: item.product_id || null,
          item_name: item.item_name || '',
          item_code: item.item_code || '',
          item_description: item.item_description || '',
          quantity: String(item.quantity || '0'),
          unit_price: String(item.unit_price || '0'),
          gst_percentage: String(item.gst_percentage || '18'),
          item_discount: String(item.item_discount || item.discount_percentage || '0'),
          images: item.images || [],
          availableImages: item.availableImages || [],
          isCollapsed: true,
          source: item.source || 'MANUAL',
          barcodes: item.barcodes || null,
          isSelected: true,
          id: item.id || null,
          order_id: item.order_id || null,
          kit_id: item.kit_id || null,
          fragrance_name: item.fragrance_name || null,
          category_id: item.category_id || null,
          category_name: item.category_name || null,
          notes: item.notes || null,
          created_at: item.created_at || null,
          updated_at: item.updated_at || null,
          ref_id: item.ref_id || null,
          mrp: String(item.mrp || item.unit_price || '0'),
          manual_scanned_qty: String(item.manual_scanned_qty || '0'),
        }));
        setItems(mappedItems);
      }

      setIsInitialized(true);
    }
  }, [order, isInitialized, leads, dealers]);

  // Keep customer details updated if leads/dealers load late
  useEffect(() => {
    if (selectedCustomer && (!selectedCustomer.email || !selectedCustomer.phone)) {
      if (customerType === 'DEALER') {
        const foundDealer = dealers.find((d: any) => String(d.id) === String(selectedCustomer.id));
        if (foundDealer) {
          setSelectedCustomer(foundDealer);
        }
      } else if (customerType === 'LEAD') {
        const foundLead = leads.find((l: any) => String(l.id) === String(selectedCustomer.id));
        if (foundLead) {
          setSelectedCustomer(foundLead);
        }
      }
    }
  }, [leads, dealers, selectedCustomer, customerType]);

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

    const updatedOrder: any = {
      id: id,
      order_number: order?.order_number || null,
      order_date: order?.order_date || new Date().toISOString(),
      expected_delivery_date: expectedDelivery ? expectedDelivery.toISOString() : null,
      actual_delivery_date: order?.actual_delivery_date || null,
      status: getBackendStatus(status),
      payment_status: order?.payment_status || 'PENDING',
      subtotal: parseFloat(subTotal.toFixed(2)),
      discount_amount: parseFloat(discountAmt.toFixed(2)),
      tax_amount: order?.tax_amount || 0,
      shipping_charges: shippingAmt,
      grand_total: parseFloat(payableAmt.toFixed(2)),
      tracking_number: trackingAwb || null,
      approved_by: approvedBy || null,
      approved_at: order?.approved_at || null,
      approved_remarks: order?.approved_remarks || null,
      customer_notes: order?.customer_notes || null,
      internal_notes: internalRemarks || null,
      cancelled_at: order?.cancelled_at || null,
      cancelled_by: order?.cancelled_by || null,
      cancellation_reason: order?.cancellation_reason || null,
      created_by: order?.created_by || userProfile?.id || null,
      updated_by: userProfile?.id || null,
      deleted_at: order?.deleted_at || null,
      created_at: order?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      dealer_id: dealerId,
      order_type: orderType,
      source_type: order?.source_type || null,
      source_id: order?.source_id || null,
      lead_id: leadId,
      amount_in_words: numberToWords(payableAmt),
      gst_amount: parseFloat(taxTotal.toFixed(2)),
      advance_amount: isAdvanceAccount ? (parseFloat(advanceAmount) || 0) : 0,
      advance_payment_date: isAdvanceAccount ? advanceDate.toISOString() : null,
      advance_receipt_url: isAdvanceAccount ? (advanceProof || null) : null,
      reject_remarks: order?.reject_remarks || null,
      advance_payment_method: isAdvanceAccount ? paymentType : null,
      courier_company_id: order?.courier_company_id || null,
      address_line1: selectedCustomer?.address_line1 || billingAddress || null,
      address_line2: selectedCustomer?.address_line2 || null,
      city_id: selectedCustomer?.city_id || null,
      state_id: selectedCustomer?.state_id || null,
      country_id: selectedCustomer?.country_id || null,
      pincode: selectedCustomer?.pincode || null,
      sales_member_id: order?.sales_member_id || userProfile?.id || null,
      billing_address: billingAddress || null,
      shipping_address_line1: sameAsBilling ? (billingAddress || null) : (shippingAddress || null),
      shipping_address_line2: sameAsBilling ? (selectedCustomer?.address_line2 || null) : null,
      shipping_city_id: sameAsBilling ? (selectedCustomer?.city_id || null) : null,
      shipping_state_id: sameAsBilling ? (selectedCustomer?.state_id || null) : null,
      shipping_country_id: sameAsBilling ? (selectedCustomer?.country_id || null) : null,
      shipping_pincode: sameAsBilling ? (selectedCustomer?.pincode || null) : null,
      shipping_lat_long: order?.shipping_lat_long || null,
      discount_type: adjustmentType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
      associated_order_id: order?.associated_order_id || null,
      estimated_completion_time: order?.estimated_completion_time || null,
      sale_ref_id: order?.sale_ref_id || null,
      completed_at: order?.completed_at || null,
      approval_from: order?.approval_from || null,
      meta: order?.meta || null,
      company_id: companyId ? String(companyId) : '0364bbec-99cf-42d1-8d3f-1efbb6a0c9e2',
      additional_charges: addChargesAmt > 0 ? addChargesAmt : null,
      service_gst: null,
      service_tax_total: null,

      items: items.map((item) => {
        const { amount: itemTaxable, gst_amount: itemGstAmount, total } = calcItem(item);
        const itemDiscPct = parseFloat(item.item_discount) || 0;
        const itemDiscAmt = itemTaxable * (itemDiscPct / 100);
        return {
          id: item.id || null,
          order_id: id,
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
          updated_at: new Date().toISOString(),
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
        };
      }),

      payments: isAdvanceAccount && advanceAccountSelected ? [{
        account_id: advanceAccountSelected.id,
        amount: parseFloat(advanceAmount) || 0,
        remark: advanceRemark || '',
        receipt_url: advanceProof || '',
      }] : [],
    };

    updateOrderMutation.mutate({ id, data: updatedOrder }, {
      onSuccess: () => {
        Alert.alert('Success', 'Order updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              handleBack();
            },
          },
        ]);
        if (onSuccess) onSuccess();
      },
      onError: (error: any) => {
        Alert.alert('Error', 'Failed to update order. Please try again.');
      },
    });
  };

  if (isLoadingOrder || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.danger }}>Failed to load order details</Text>
        <TouchableOpacity onPress={handleBack} style={{ marginTop: 10 }}>
          <Text style={{ color: primaryColor }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              <Text style={{ color: primaryColor }}>EDIT </Text>
              <Text style={{ color: COLORS.textDark }}>ORDER</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Order Number: {order?.orderNo || order?.order_number}</Text>
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
              style={[styles.selectTrigger, { backgroundColor: '#F3F4F6', opacity: 0.8 }]}
              disabled={true}
              activeOpacity={1}
            >
              <Text style={[styles.selectTriggerText, !selectedCustomer && { color: '#9CA3AF' }]} numberOfLines={1}>
                {selectedCustomer
                  ? `${selectedCustomer.name} (${selectedCustomer.company || 'No Company'})`
                  : 'Select Customer/Lead'}
              </Text>
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>



          {/* COLLAPSIBLE CUSTOMER DETAILS & ADDRESS CARD */}
          {selectedCustomer ? (
            <View style={[styles.itemCardContainer, { padding: 12, marginTop: 4, gap: 8 }]}>
              {/* Card Header */}
              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => setIsCustomerDetailsCollapsed(!isCustomerDetailsCollapsed)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="business-outline" size={18} color={primaryColor} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textDark }} numberOfLines={1}>
                      {clientName || selectedCustomer.company || selectedCustomer.name || 'Customer Details'}
                    </Text>
                    <Text style={{ fontSize: 10.5, color: COLORS.textMuted, fontWeight: '600' }} numberOfLines={1}>
                      Contact: {contactPerson || 'N/A'}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isCustomerDetailsCollapsed ? "chevron-back" : "chevron-down"}
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>

              {/* Card Body (Expanded) */}
              {!isCustomerDetailsCollapsed && (
                <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, gap: 8 }}>
                  <View style={{ gap: 2 }}>
                    <Text style={styles.inputLabelGrey}>BILL TO DETAILS</Text>
                    <Text style={styles.billToText}>Company/Name: {clientName || selectedCustomer.company || selectedCustomer.name}</Text>
                    <Text style={styles.billToText}>Contact Person: {contactPerson || 'N/A'}</Text>
                    {selectedCustomer.email ? <Text style={styles.billToText}>Email: {selectedCustomer.email}</Text> : null}
                    {selectedCustomer.phone ? <Text style={styles.billToText}>Phone: {selectedCustomer.phone}</Text> : null}
                  </View>

                  <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.inputLabelGrey}>BILLING ADDRESS</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowAddressModal(true);
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="pencil-sharp" size={11} color={primaryColor} />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: primaryColor }}>EDIT ADDRESS</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.billToText}>{billingAddress || 'No billing address provided'}</Text>
                  </View>

                  <View style={{ gap: 2 }}>
                    <Text style={styles.inputLabelGrey}>SHIPPING ADDRESS</Text>
                    <Text style={styles.billToText}>
                      {sameAsBilling ? 'Same as billing address' : shippingAddress || 'No shipping address provided'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.billToBox}>
              <Text style={styles.noRecipientText}>No Customer Selected</Text>
            </View>
          )}

          {/* STATUS & PAYMENT TYPE */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <View style={{ width: '48%' }}>
              <Text style={[styles.inputLabelGrey, { marginBottom: 4 }]}>ORDER STATUS</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setShowStatusPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.selectTriggerText}>{status}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ width: '48%' }}>
              <Text style={[styles.inputLabelGrey, { marginBottom: 4 }]}>PAYMENT METHOD</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setShowPaymentPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.selectTriggerText}>{paymentType}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ORDER TYPE */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <View style={{ width: '100%' }}>
              <Text style={[styles.inputLabelGrey, { marginBottom: 4 }]}>ORDER TYPE</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setShowTypePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.selectTriggerText}>{orderType.replace(/_/g, ' ')}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
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

                {!item.isCollapsed ? (
                  <View style={{ gap: 12, marginTop: 4 }}>
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
                        <Text style={styles.inputLabel}>Price <Text style={{ color: COLORS.danger }}>*</Text></Text>
                        <TextInput
                          style={styles.textInputBox}
                          keyboardType="numeric"
                          value={item.unit_price}
                          onChangeText={(v) => updateItem(idx, 'unit_price', v)}
                        />
                      </View>
                    </View>

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

                    <View style={styles.itemTotalRow}>
                      <Text style={styles.itemTotalLabel}>
                        Taxable: <Text style={styles.itemTotalVal}>{formatAmount(itemTaxable)}</Text>
                        {'  '}GST: <Text style={styles.itemTotalVal}>{formatAmount(itemGstAmount)}</Text>
                      </Text>
                      <Text style={[styles.itemGrandTotal, { color: primaryColor }]}>{formatAmount(itemTotal)}</Text>
                    </View>

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
          {/* CHARGES, LOGISTICS, ADJUSTMENTS */}
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
            onPressAddPartner={() => {
              setShowLogisticsModal(false);
              setShowAddPartnerModal(true);
            }}
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

          {/* ADVANCE ACCOUNT CARD */}
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

          {/* OPERATIONAL AND INSIGHTS */}
          <OperationalInsightsCard
            internalRemarks={internalRemarks}
            setInternalRemarks={setInternalRemarks}
            expectedDelivery={expectedDelivery}
            onPressExpectedDelivery={() => setShowDeliveryDatePicker(true)}
            approvedBy={approvedBy}
            onPressApprovedBy={() => setShowApprovedByModal(true)}
          />

          {/* TOTAL BILL SUMMARY SECTION */}
          <View style={styles.billSummaryBox}>
            <Text style={[styles.inputLabelGrey, { marginBottom: 6 }]}>BILL DETAILS</Text>
            <View style={{ gap: 4 }}>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Sub-Total</Text>
                <Text style={styles.summaryVal}>{formatAmount(subTotal)}</Text>
              </View>
              {addChargesAmt > 0 && (
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>{chargesType}</Text>
                  <Text style={styles.summaryVal}>{formatAmount(addChargesAmt)}</Text>
                </View>
              )}
              {(taxTotal + addChargesGstAmt) > 0 && (
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Total GST</Text>
                  <Text style={styles.summaryVal}>{formatAmount(taxTotal + addChargesGstAmt)}</Text>
                </View>
              )}
              {shippingAmt > 0 && (
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Shipping / Freight</Text>
                  <Text style={styles.summaryVal}>{formatAmount(shippingAmt)}</Text>
                </View>
              )}
              {discountAmt > 0 && (
                <View style={styles.summaryLine}>
                  <Text style={[styles.summaryLabel, { color: COLORS.danger }]}>Adjustment Discount</Text>
                  <Text style={[styles.summaryVal, { color: COLORS.danger }]}>- {formatAmount(discountAmt)}</Text>
                </View>
              )}

              <View style={[styles.summaryLine, { borderTopWidth: 1, borderTopColor: '#EEF2EF', paddingTop: 6, marginTop: 4 }]}>
                <Text style={styles.grandSummaryLabel}>GRAND TOTAL</Text>
                <Text style={[styles.grandSummaryVal, { color: primaryColor }]}>{formatAmount(payableAmt)}</Text>
              </View>

              <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.textMuted, fontStyle: 'italic', marginTop: 4 }}>
                {numberToWords(payableAmt)}
              </Text>
            </View>
          </View>

          {/* SAVE BUTTON */}
          <View style={styles.nonStickySaveContainer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: primaryColor }, updateOrderMutation.isPending && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={updateOrderMutation.isPending}
              activeOpacity={0.8}
            >
              {updateOrderMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>UPDATE ORDER</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* CUSTOMER SEARCH MODAL */}
      <CustomerSearchModal
        visible={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customerType={customerType}
        onTypeChange={setCustomerType}
        customerSearchQuery={customerSearchQuery}
        onSearchQueryChange={setCustomerSearchQuery}
        filteredCustomerList={filteredCustomerList}
        onSelectCustomer={handleSelectCustomer}
      />

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

      {/* SELECT PRODUCT MODAL */}
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

      {/* SELECT IMAGES MODAL */}
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

      {/* COMPANY PICKER MODAL */}
      <Modal
        visible={showCompanyPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCompanyPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCompanyPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => { }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT COMPANY</Text>
              <TouchableOpacity onPress={() => setShowCompanyPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search company..."
                value={companySearchQuery}
                onChangeText={setCompanySearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {companySearchQuery ? (
                <TouchableOpacity onPress={() => setCompanySearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

            {isLoadingCompanies ? (
              <ActivityIndicator size="small" color={primaryColor} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
                {companies.map((company: any) => (
                  <TouchableOpacity
                    key={company.id}
                    style={styles.customerRow}
                    onPress={() => {
                      setCompanyId(String(company.id));
                      setCompanyName(company.display_name || company.name || '');
                      setShowCompanyPicker(false);
                      setItems([makeEmptyItem()]); // Reset items since company changed
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerRowName}>{company.display_name || company.name}</Text>
                      {company.email ? (
                        <Text style={styles.customerRowCompany}>{company.email}</Text>
                      ) : null}
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
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* STATUS PICKER MODAL */}
      <Modal
        visible={showStatusPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowStatusPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => { }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT ORDER STATUS</Text>
              <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.customerRow}
                  onPress={() => {
                    setStatus(opt);
                    setShowStatusPicker(false);
                  }}
                >
                  <Text style={styles.customerRowName}>{opt}</Text>
                  {status === opt && <Ionicons name="checkmark" size={16} color={primaryColor} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* PAYMENT PICKER MODAL */}
      <Modal
        visible={showPaymentPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPaymentPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => { }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT PAYMENT METHOD</Text>
              <TouchableOpacity onPress={() => setShowPaymentPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {PAYMENT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.customerRow}
                  onPress={() => {
                    setPaymentType(opt);
                    setShowPaymentPicker(false);
                  }}
                >
                  <Text style={styles.customerRowName}>{opt}</Text>
                  {paymentType === opt && <Ionicons name="checkmark" size={16} color={primaryColor} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ORDER TYPE PICKER MODAL */}
      <Modal
        visible={showTypePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowTypePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => { }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT ORDER TYPE</Text>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {ORDER_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.customerRow}
                  onPress={() => {
                    setOrderType(opt);
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={styles.customerRowName}>{opt.replace(/_/g, ' ')}</Text>
                  {orderType === opt && <Ionicons name="checkmark" size={16} color={primaryColor} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* FULL IMAGE PREVIEW MODAL */}
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

      {/* EXPECTED DELIVERY DATE PICKER */}
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

      {/* ADVANCE PAYMENT DATE PICKER */}
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

      {/* ADVANCE ACCOUNTS PICKER MODAL */}
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

      {/* APPROVED BY PICKER MODAL */}
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

      {/* CHARGES TYPE PICKER MODAL */}
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

      {/* LOGISTICS PARTNER PICKER MODAL */}
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

      {/* ADD NEW PARTNER MODAL */}
      <AddTransportModal
        visible={showAddPartnerModal}
        onClose={() => setShowAddPartnerModal(false)}
        onSuccess={(partnerName) => {
          setLogisticsPartner(partnerName);
          setShowAddPartnerModal(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formField: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  inputLabelGrey: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  selectTriggerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
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
    marginTop: 4,
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
    marginTop: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  statusOptBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  statusOptText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  addButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
  },
  itemCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
  },
  itemCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  itemCardSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  itemCardTotalText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  itemCardBody: {
    padding: 10,
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  textInputStyle: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    height: 38,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 4,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemCalculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 4,
  },
  itemCalcText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  itemCalcTextTotal: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '800',
  },
  removeItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    height: 32,
    marginTop: 6,
  },
  billSummaryBox: {
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  summaryVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  grandSummaryLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  grandSummaryVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  nonStickySaveContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  modalList: {
    paddingHorizontal: 16,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  customerRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  customerRowCompany: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  customerRowPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginVertical: 4,
  },
  modalBtn: {
    width: '48%',
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productMockContainer: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#EAEFEA',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 1.5,
    paddingBottom: 2,
    borderWidth: 1,
    borderColor: '#D8E2DD',
    marginRight: 6,
  },
  mockBottleGroup: {
    alignItems: 'center',
    gap: 0.5,
  },
  bottleCap: {
    width: 2.5,
    height: 2,
    borderRadius: 0.3,
  },
  bottleBody: {
    width: 4.5,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
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
});
