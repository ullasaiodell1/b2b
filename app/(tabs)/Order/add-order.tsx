import { AdvanceAccountCard } from '@/components/order&quotations/AdvanceAccountCard';
import BulkItemActionsCard from '@/components/order&quotations/BulkItemActionsCard';
import { FinancialAdjustmentsCard, LogisticsCard } from '@/components/order&quotations/LogisticsAndAdjustmentsCards';
import { AdditionalChargesCard, OperationalInsightsCard } from '@/components/order&quotations/OperationalAndChargesCards';
import { OrderRecord } from '@/components/order&quotations/OrderState';
import SelectImagesModal from '@/components/order&quotations/SelectImagesModal';
import SelectProductModal from '@/components/order&quotations/SelectProductModal';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCompanies, useCompanyAccounts } from '@/hooks/useCompany';
import { useCouriers, useCreateCourier } from '@/hooks/useCourier';
import { useDealers } from '@/hooks/useDealers';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useLeads } from '@/hooks/useLeads';
import { useCities, useCountries, useStates } from '@/hooks/useLocation';
import { useCreateOrder } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useProfile } from '@/hooks/useProfile';
import { useUsersCombobox } from '@/hooks/useUsers';
import { uploadFile } from '@/services/api/file';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CLIENT_OPTIONS = ['NovaTech Solutions Pvt. Ltd.', 'Zenith System Pvt. Ltd.', 'Ullas India IT Solutions Limited.'];
const CONTACT_OPTIONS = ['Arjun Maheta', 'Khushal Nadiyapara', 'Parth Solanki'];
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

const COUNTRY_OPTIONS = ['India', 'United States', 'United Kingdom', 'Canada'];
const STATE_OPTIONS_BY_COUNTRY: Record<string, string[]> = {
  'India': ['Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Rajasthan'],
  'United States': ['California', 'Texas', 'New York', 'Florida'],
  'United Kingdom': ['England', 'Scotland', 'Wales'],
  'Canada': ['Ontario', 'Quebec', 'British Columbia']
};
const CITY_OPTIONS_BY_STATE: Record<string, string[]> = {
  'Gujarat': ['Rajkot', 'Ahmedabad', 'Surat', 'Vadodara'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
  'Delhi': ['New Delhi'],
  'Karnataka': ['Bengaluru', 'Mysuru'],
  'Rajasthan': ['Jaipur', 'Udaipur'],
  'California': ['Los Angeles', 'San Francisco', 'San Diego'],
  'Texas': ['Houston', 'Austin', 'Dallas'],
  'New York': ['New York City', 'Buffalo'],
  'Florida': ['Miami', 'Orlando'],
  'England': ['London', 'Manchester', 'Birmingham'],
  'Scotland': ['Edinburgh', 'Glasgow'],
  'Wales': ['Cardiff', 'Swansea'],
  'Ontario': ['Toronto', 'Ottawa'],
  'Quebec': ['Montreal', 'Quebec City'],
  'British Columbia': ['Vancouver', 'Victoria']
};
const SERVICE_TYPE_OPTIONS = ['Standard', 'Express', 'Priority', 'Same Day', 'Overnight'];

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
  barcodes?: string[];
  isSelected?: boolean;
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
    barcodes: [],
    isSelected: true,
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

export default function AddOrderScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const createOrderMutation = useCreateOrder();
  const { data: products = [] } = useProducts();
  const { profile: userProfile } = useProfile();

  const toggleCollapse = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], isCollapsed: !next[idx].isCollapsed };
      return next;
    });
  };

  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    referrer?: string;
    companyName?: string;
    contactName?: string;
    leadId?: string;
  }>();
  const referrer = params.referrer;
  const insets = useSafeAreaInsets();
  const { primaryColor, primaryLight } = useTheme();

  const handleBack = () => {
    if (referrer === 'lead-details' && params.leadId) {
      router.navigate({ pathname: '/(tabs)/leads/lead-details', params: { id: params.leadId, activeTab: 'Order' } });
    } else {
      (navigation as any).goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (referrer === 'lead-details' && params.leadId) {
          router.navigate({ pathname: '/(tabs)/leads/lead-details', params: { id: params.leadId, activeTab: 'Order' } });
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [referrer, params.leadId])
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
  const [customerType, setCustomerType] = useState<'DEALER' | 'LEAD'>('DEALER');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Company selection states
  const [companyId, setCompanyId] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>(params.companyName || '');
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanies({ search: companySearchQuery, limit: 100 });

  const selectedCompany = React.useMemo(() => {
    return companies.find((c: any) => String(c.id) === String(companyId));
  }, [companies, companyId]);

  React.useEffect(() => {
    if (selectedCustomer && companies.length > 0) {
      if (selectedCustomer.company_id) {
        setCompanyId(String(selectedCustomer.company_id));
        const match = companies.find((c: any) => String(c.id) === String(selectedCustomer.company_id));
        if (match) {
          setCompanyName(match.display_name || match.name || '');
        }
      } else {
        const cName = selectedCustomer.company || selectedCustomer.company_name || '';
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
  }, [selectedCustomer, companies]);

  // Delivery address states
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [tempBillingAddress, setTempBillingAddress] = useState('');
  const [tempShippingAddress, setTempShippingAddress] = useState('');
  const [tempSameAsBilling, setTempSameAsBilling] = useState(true);

  const [isLocatingBilling, setIsLocatingBilling] = useState(false);
  const [isLocatingShipping, setIsLocatingShipping] = useState(false);

  const handleGetLocation = async (target: 'billing' | 'shipping') => {
    const setLocating = target === 'billing' ? setIsLocatingBilling : setIsLocatingShipping;
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = location.coords;

      let geocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      if (geocode && geocode.length > 0) {
        const addr = geocode[0];
        const streetPart = [addr.name, addr.street, addr.district].filter(Boolean).join(', ');
        const cityPart = [addr.city, addr.subregion].filter(Boolean).join(', ');
        const statePart = addr.region ? `${addr.region}` : '';
        const pinPart = addr.postalCode ? `${addr.postalCode}` : '';
        const countryPart = addr.country || '';

        const fullAddress = [
          streetPart,
          cityPart,
          [statePart, pinPart].filter(Boolean).join(' - '),
          countryPart
        ].filter(v => v && v.trim()).join(', ');

        if (target === 'billing') {
          setTempBillingAddress(fullAddress);
          if (tempSameAsBilling) {
            setTempShippingAddress(fullAddress);
          }
        } else {
          setTempShippingAddress(fullAddress);
        }
      } else {
        Alert.alert('Error', 'No address details found for your current location.');
      }
    } catch (error: any) {
      console.error('[Get Location Error]:', error);
      Alert.alert('Error', 'Failed to retrieve your current location: ' + (error?.message || ''));
    } finally {
      setLocating(false);
    }
  };

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
    const targetId = params.leadId || '58da794e-9c4f-4bfb-ae79-0541a1ba3e7b';
    if (leads.length > 0) {
      const match = leads.find(l => String(l.id) === String(targetId));
      if (match) {
        setCustomerType(match.tag === 'DEALER' ? 'DEALER' : 'LEAD');
        handleSelectCustomer(match);
      }
    }
  }, [params.leadId, leads]);

  const [orderNo, setOrderNo] = useState(() => 'ORD-2026-' + Math.floor(1000 + Math.random() * 9000));
  const [clientName, setClientName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [status, setStatus] = useState<OrderRecord['status']>('Pending');
  const [paymentType, setPaymentType] = useState('Advance Payment');

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.company || customer.name || '');
    setClientName(customer.company || customer.name || '');
    setContactPerson(customer.name || '');
    setHotelLocation(customer.address || customer.location || 'No address provided');
    setBillingAddress(customer.address || customer.location || '');
    setShippingAddress(customer.address || customer.location || '');
    setShowCustomerModal(false);
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

  // Items State
  const [items, setItems] = useState<ItemLine[]>([makeEmptyItem()]);
  const [activeProductSelectIndex, setActiveProductSelectIndex] = useState<number | null>(null);
  const [activeImageSelectIndex, setActiveImageSelectIndex] = useState<number | null>(null);
  const [pendingProduct, setPendingProduct] = useState<any>(null);

  // Operational Insights State
  const [internalRemarks, setInternalRemarks] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState<Date | null>(null);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [approvedBy, setApprovedBy] = useState('');
  const [showApprovedByModal, setShowApprovedByModal] = useState(false);

  // Additional Charges State
  const [chargesGst, setChargesGst] = useState('18');
  const [chargesType, setChargesType] = useState('Service Charge');
  const [showChargesTypeModal, setShowChargesTypeModal] = useState(false);
  const [chargesAmount, setChargesAmount] = useState('');

  // Logistics & Charges State
  const [transportPartners, setTransportPartners] = useState(['Blue Dart', 'Delhivery', 'FedEx', 'DHL', 'DTDC', 'Professional Couriers']);
  const [logisticsPartner, setLogisticsPartner] = useState('');
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [trackingAwb, setTrackingAwb] = useState('');
  const [shippingFreight, setShippingFreight] = useState('0.00');
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerContact, setNewPartnerContact] = useState('');
  const [newPartnerCountry, setNewPartnerCountry] = useState('');
  const [newPartnerCountryId, setNewPartnerCountryId] = useState('');
  const [newPartnerState, setNewPartnerState] = useState('');
  const [newPartnerStateId, setNewPartnerStateId] = useState('');
  const [newPartnerCity, setNewPartnerCity] = useState('');
  const [newPartnerCityId, setNewPartnerCityId] = useState('');
  const [newPartnerServiceType, setNewPartnerServiceType] = useState('Standard');
  const [newPartnerRating, setNewPartnerRating] = useState('4.5');
  const [newPartnerGst, setNewPartnerGst] = useState('');
  const [newPartnerStatus, setNewPartnerStatus] = useState(true);

  // Selector visibility
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false);

  // Keyboard visibility state
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

  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Location API queries
  const { data: countriesData } = useCountries(countrySearch);
  const { data: statesData } = useStates(newPartnerCountryId, stateSearch);
  const { data: citiesData } = useCities(newPartnerStateId, citySearch);

  // Couriers list query
  const { data: couriersData } = useCouriers();
  const createCourierMutation = useCreateCourier();

  const courierList = React.useMemo(() => {
    const defaultPartners = ['Blue Dart', 'Delhivery', 'FedEx', 'DHL', 'DTDC', 'Professional Couriers'];
    if (!couriersData || couriersData.length === 0) return defaultPartners;
    const apiNames = couriersData.map((c: any) => c.courier_name).filter(Boolean);
    if (apiNames.length === 0) return defaultPartners;
    return Array.from(new Set([...apiNames, ...defaultPartners]));
  }, [couriersData]);

  const resetAddPartnerForm = () => {
    setNewPartnerName('');
    setNewPartnerContact('');
    setNewPartnerCountry('');
    setNewPartnerCountryId('');
    setNewPartnerState('');
    setNewPartnerStateId('');
    setNewPartnerCity('');
    setNewPartnerCityId('');
    setNewPartnerServiceType('Standard');
    setNewPartnerRating('4.5');
    setNewPartnerGst('');
    setNewPartnerStatus(true);
  };

  const handleCreateTransportPartner = async () => {
    if (!newPartnerName.trim()) {
      Alert.alert('Validation Error', 'Transport Name is required.');
      return;
    }
    if (!newPartnerContact.trim()) {
      Alert.alert('Validation Error', 'Contact Number is required.');
      return;
    }
    if (!newPartnerCountryId) {
      Alert.alert('Validation Error', 'Country selection is required.');
      return;
    }
    if (!newPartnerStateId) {
      Alert.alert('Validation Error', 'State selection is required.');
      return;
    }
    if (!newPartnerCityId) {
      Alert.alert('Validation Error', 'City selection is required.');
      return;
    }

    try {
      const newCourierData = {
        courier_name: newPartnerName.trim(),
        contact_number: parseInt(newPartnerContact.trim(), 10) || 0,
        country: newPartnerCountryId,
        state: newPartnerStateId,
        city: newPartnerCityId,
        service_type: newPartnerServiceType,
        efficiency_rating: parseFloat(newPartnerRating) || 4.5,
        gst_number: newPartnerGst.trim() || null,
        is_available: newPartnerStatus
      };

      await createCourierMutation.mutateAsync(newCourierData);

      setTransportPartners((prev) => [...prev, newPartnerName.trim()]);
      setLogisticsPartner(newPartnerName.trim());
      setShowAddPartnerModal(false);
      resetAddPartnerForm();
      Alert.alert('Success', 'Courier registered successfully!');
    } catch (err: any) {
      console.error('[Create Courier Error]:', err);
      // Fallback local registration
      setTransportPartners((prev) => [...prev, newPartnerName.trim()]);
      setLogisticsPartner(newPartnerName.trim());
      setShowAddPartnerModal(false);
      resetAddPartnerForm();
      Alert.alert('Success', 'Courier registered locally!');
    }
  };

  // Financial Adjustments State
  const [adjustmentType, setAdjustmentType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('0.00');

  // Advance Account State
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
        console.log('[AdvanceProof] Upload response:', JSON.stringify(uploadResult));
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
    // Validate items
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

    const leadId = customerType === 'LEAD' && selectedCustomer ? selectedCustomer.id : undefined;
    const dealerId = customerType === 'DEALER' && selectedCustomer ? selectedCustomer.id : undefined;

    const newOrder: any = {
      // Backend Validation fields
      source_type: customerType === 'DEALER' ? 'DEALER_PO' : 'LEAD_QUOTATION',
      lead_id: leadId || '58da794e-9c4f-4bfb-ae79-0541a1ba3e7b',
      dealer_id: dealerId,
      company_id: companyId ? String(companyId) : '0364bbec-99cf-42d1-8d3f-1efbb6a0c9e2',
      order_date: new Date().toISOString(),
      expected_delivery_date: expectedDelivery ? expectedDelivery.toISOString() : undefined,
      status: getBackendStatus(status),
      payment_status: 'PENDING',
      billing_address: billingAddress || hotelLocation || 'No address provided',
      shipping_address_line1: shippingAddress || hotelLocation || 'No address provided',
      subtotal: subTotal,
      discount_amount: discountAmt,
      discount_type: adjustmentType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
      gst_amount: taxTotal,
      tax_amount: taxTotal,
      shipping_charges: shippingAmt,
      additional_charges: addChargesAmt > 0 ? [{ name: chargesType || 'Service Charge', amount: addChargesAmt }] : [],
      grand_total: payableAmt,
      internal_notes: internalRemarks || undefined,
      customer_notes: internalRemarks || undefined,
      advance_amount: isAdvanceAccount ? (parseFloat(advanceAmount) || 0) : 0,

      // New database alignment fields
      amount_in_words: numberToWords(payableAmt),
      sales_member_id: userProfile?.id || selectedCustomer?.assigned_to || '56fab03a-e2dc-4b00-9335-43b5fa6a80f0',
      city_id: selectedCustomer?.city_id || null,
      state_id: selectedCustomer?.state_id || null,
      country_id: selectedCustomer?.country_id || null,
      pincode: selectedCustomer?.pincode || null,
      address_line1: selectedCustomer?.address_line1 || billingAddress || null,
      address_line2: selectedCustomer?.address_line2 || null,
      shipping_address_line2: sameAsBilling ? (selectedCustomer?.address_line2 || null) : null,
      shipping_city_id: sameAsBilling ? (selectedCustomer?.city_id || null) : null,
      shipping_state_id: sameAsBilling ? (selectedCustomer?.state_id || null) : null,
      shipping_country_id: sameAsBilling ? (selectedCustomer?.country_id || null) : null,
      shipping_pincode: sameAsBilling ? (selectedCustomer?.pincode || null) : null,
      advance_payment_date: isAdvanceAccount ? advanceDate.toISOString() : null,
      advance_payment_method: isAdvanceAccount ? paymentType : null,
      advance_receipt_url: isAdvanceAccount ? (advanceProof || null) : null,

      // Legacy/UI Fallback fields
      id: String(Date.now()),
      orderNo,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      clientName,
      contactPerson,
      hotelLocation,
      itemsCount: items.length,
      paymentType,
      amount: formattedAmount,
      order_no: orderNo,
      client_name: clientName,
      contact_person: contactPerson,
      hotel_location: hotelLocation,
      payment_type: paymentType,
      total_items: items.length,

      items: items.map((item) => {
        const { amount: itemTaxable, gst_amount: itemGstAmount, total } = calcItem(item);
        const itemDiscPct = parseFloat(item.item_discount) || 0;
        const itemDiscAmt = itemTaxable * (itemDiscPct / 100);
        return {
          // Backend Validation fields
          product_id: item.product_id || undefined,
          item_code: item.item_code || '',
          item_name: item.item_name,
          item_description: item.item_description || '',
          quantity: parseFloat(item.quantity) || 0,
          unit_price: parseFloat(item.unit_price) || 0,
          amount: itemTaxable,
          gst_percentage: parseFloat(item.gst_percentage) || 0,
          gst_amount: itemGstAmount,
          item_discount: itemDiscPct,
          discount_amount: itemDiscAmt,
          images: item.images || [],
          source: item.source || 'MANUAL',
          barcodes: item.barcodes || [],

          // Legacy/UI fields
          name: item.item_name.toUpperCase(),
          description: item.item_description || '',
          price: `₹ ${parseFloat(item.unit_price).toFixed(2)}`,
          qty: String(item.quantity),
          gst: `${item.gst_percentage}%`,
          total: `₹ ${total.toFixed(2)}`,
          total_amount: total,
        };
      }),
      payments: isAdvanceAccount && advanceAccountSelected ? [{
        account_id: advanceAccountSelected.id,
        amount: parseFloat(advanceAmount) || 0,
        remark: advanceRemark || '',
        receipt_url: advanceProof || ''
      }] : [],
      internalRemarks: internalRemarks || undefined,
      expectedDelivery: expectedDelivery ? formatDate(expectedDelivery) : undefined,
      approvedBy: approvedBy || undefined,
      chargesGst: chargesAmount ? chargesGst : undefined,
      chargesType: chargesAmount ? chargesType : undefined,
      chargesAmount: chargesAmount || undefined,
      logisticsPartner: logisticsPartner || undefined,
      trackingAwb: trackingAwb || undefined,
      shippingFreight: shippingFreight || undefined,
      adjustmentType: adjustmentType,
      discountValue: discountValue,
      isAdvanceAccount: isAdvanceAccount,
      payableAmount: formattedAmount,
      advanceAccountId: isAdvanceAccount && advanceAccountSelected ? advanceAccountSelected.id : undefined,
      advanceAccountName: isAdvanceAccount && advanceAccountSelected ? advanceAccountSelected.name : undefined,
      advanceDate: isAdvanceAccount ? formatDate(advanceDate) : undefined,
      advanceRemark: isAdvanceAccount ? advanceRemark : undefined,
      advanceProof: isAdvanceAccount ? (advanceProof || undefined) : undefined,
    };

    createOrderMutation.mutate(newOrder, {
      onSuccess: () => {
        Alert.alert('Success', 'Order created successfully!', [
          { text: 'OK', onPress: handleBack }
        ]);
      },
      onError: (error: any) => {
        console.error('[Create Order Error]:', error);
        Alert.alert('Error', 'Failed to create order. Please try again.');
      }
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: keyboardVisible ? 200 : 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* COMPANY PICKER SECTION */}
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

          {/* CUSTOMER PICKER SECTION */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ color: COLORS.danger, fontSize: 13, fontWeight: '700' }}>* </Text>
              <Text style={styles.inputLabelGrey}>CUSTOMER</Text>
            </View>

            <View style={styles.pickerRowContainer}>
              <TouchableOpacity
                style={styles.dropdownSelectorBtn}
                onPress={() => {
                  setShowTypeDropdown((prev) => !prev);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownSelectorText}>{customerType}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>

              <View style={styles.verticalSeparator} />

              <TouchableOpacity
                style={{ flex: 1, height: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: selectedCustomer ? 4 : 12 }}
                onPress={() => {
                  setShowCustomerModal(true);
                  setShowTypeDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, color: selectedCustomer ? COLORS.textDark : '#9CA3AF', fontWeight: '600', flex: 1 }} numberOfLines={1}>
                  {selectedCustomer ? (selectedCustomer.company || selectedCustomer.name) : 'Select Customer'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {selectedCustomer ? (
                    <TouchableOpacity onPress={handleClearCustomer} style={{ padding: 4 }}>
                      <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Type Dropdown Popup (Dealer / Lead selector) */}
            {showTypeDropdown && (
              <View style={styles.typeDropdownPopup}>
                <TouchableOpacity
                  style={[styles.typeDropdownItem, customerType === 'DEALER' && styles.typeDropdownItemActive]}
                  onPress={() => {
                    setCustomerType('DEALER');
                    setShowTypeDropdown(false);
                    handleClearCustomer();
                  }}
                  activeOpacity={0.7}
                >
                  {customerType === 'DEALER' && <Ionicons name="checkmark" size={14} color="#8A1C30" style={{ marginRight: 6 }} />}
                  <Text style={[styles.typeDropdownItemText, customerType === 'DEALER' && { color: '#8A1C30', fontWeight: '700' }]}>Dealer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeDropdownItem, customerType === 'LEAD' && styles.typeDropdownItemActive]}
                  onPress={() => {
                    setCustomerType('LEAD');
                    setShowTypeDropdown(false);
                    handleClearCustomer();
                  }}
                  activeOpacity={0.7}
                >
                  {customerType === 'LEAD' && <Ionicons name="checkmark" size={14} color="#8A1C30" style={{ marginRight: 6 }} />}
                  <Text style={[styles.typeDropdownItemText, customerType === 'LEAD' && { color: '#8A1C30', fontWeight: '700' }]}>Lead</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>


          {/* BILL TO SECTION */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.inputLabelGrey}>SHIP TO</Text>
              {selectedCustomer && (
                <TouchableOpacity
                  onPress={() => {
                    setTempBillingAddress(billingAddress);
                    setTempShippingAddress(sameAsBilling ? billingAddress : shippingAddress);
                    setTempSameAsBilling(sameAsBilling);
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

          {/* ── BILL ITEMS BULK ACTIONS CARD ────────────────── */}
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
                {/* Item header */}
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
                      <Text style={styles.inputLabel}>Item Name *</Text>
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
                        <Text style={styles.inputLabel}>Qty *</Text>
                        <TextInput
                          style={styles.textInputBox}
                          keyboardType="numeric"
                          value={item.quantity}
                          onChangeText={(v) => updateItem(idx, 'quantity', v)}
                        />
                      </View>
                      <View style={[styles.formField, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Price *</Text>
                        <TextInput
                          style={styles.textInputBox}
                          keyboardType="numeric"
                          value={item.unit_price}
                          onChangeText={(v) => updateItem(idx, 'unit_price', v)}
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

          {/* Add Item Button */}
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

          {/* BILL SUMMARY */}
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

            {/* Payable Amount in Words */}
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

        {/* ── SAVE ORDER BUTTON ───────────────────────── */}
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
              updateItem(idx, 'product_id', pendingProduct.id);
              updateItem(idx, 'item_name', pendingProduct.product_name || '');
              updateItem(idx, 'item_code', pendingProduct.code || '');
              updateItem(idx, 'unit_price', String(pendingProduct.selling_price || pendingProduct.dealer_price || 0));
              updateItem(idx, 'gst_percentage', String(pendingProduct.tax_rate ?? 18));
              updateItem(idx, 'item_description', pendingProduct.description || '');
              updateItem(idx, 'images', selectedImages);
              updateItem(idx, 'availableImages', pendingProduct.images || []);
            } else {
              updateItem(idx, 'images', selectedImages);
            }
          }
          setPendingProduct(null);
          setActiveImageSelectIndex(null);
        }}
      />

      {/* DELIVERY DATE PICKER */}
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

      {/* ADVANCE DATE PICKER */}
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

      {/* SELECT ACCOUNT MODAL */}
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

      {/* APPROVED BY MODAL */}
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

      {/* ── DELIVERY ADDRESS CONFIGURE MODAL ─────────────── */}
      <Modal
        transparent
        animationType="slide"
        visible={showAddressModal}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowAddressModal(false)}
          />
          <View style={[styles.modalContent, { maxHeight: '80%', paddingBottom: 24 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Delivery Address</Text>
                <Text style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 }}>
                  Configure billing and shipping details for this order
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
              {/* Billing Address Field */}
              <View style={styles.formField}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="receipt-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.inputLabel}>BILLING ADDRESS</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleGetLocation('billing')}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    activeOpacity={0.7}
                    disabled={isLocatingBilling}
                  >
                    {isLocatingBilling ? (
                      <ActivityIndicator size="small" color={primaryColor} />
                    ) : (
                      <>
                        <Ionicons name="locate-outline" size={14} color={primaryColor} />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: primaryColor }}>Use Current Location</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.textInputBox, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                  placeholder="Full billing address, city, state, pincode..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  value={tempBillingAddress}
                  onChangeText={(txt) => {
                    setTempBillingAddress(txt);
                    if (tempSameAsBilling) {
                      setTempShippingAddress(txt);
                    }
                  }}
                />
              </View>

              {/* Shipping Address Header with Checkbox */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.inputLabel}>SHIPPING ADDRESS</Text>
                </View>

                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={() => {
                    const nextVal = !tempSameAsBilling;
                    setTempSameAsBilling(nextVal);
                    if (nextVal) {
                      setTempShippingAddress(tempBillingAddress);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={tempSameAsBilling ? "checkbox" : "square-outline"}
                    size={18}
                    color={tempSameAsBilling ? primaryColor : COLORS.textMuted}
                  />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.textMuted }}>SAME AS BILLING</Text>
                </TouchableOpacity>
              </View>

              {/* Shipping Address Field (Only shown if NOT same as billing) */}
              {!tempSameAsBilling && (
                <View style={styles.formField}>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
                    <TouchableOpacity
                      onPress={() => handleGetLocation('shipping')}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      activeOpacity={0.7}
                      disabled={isLocatingShipping}
                    >
                      {isLocatingShipping ? (
                        <ActivityIndicator size="small" color={primaryColor} />
                      ) : (
                        <>
                          <Ionicons name="locate-outline" size={14} color={primaryColor} />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: primaryColor }}>Use Current Location</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.textInputBox, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                    placeholder="Full shipping address, city, state, pincode..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    value={tempShippingAddress}
                    onChangeText={setTempShippingAddress}
                  />
                </View>
              )}

              {/* Modal Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowAddressModal(false)}
                  style={{
                    flex: 1,
                    height: 40,
                    borderWidth: 1,
                    borderColor: primaryColor,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF'
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 13, fontWeight: '800', color: primaryColor }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setBillingAddress(tempBillingAddress);
                    setSameAsBilling(tempSameAsBilling);
                    setShippingAddress(tempSameAsBilling ? tempBillingAddress : tempShippingAddress);
                    setShowAddressModal(false);
                  }}
                  style={{
                    flex: 1.5,
                    height: 40,
                    backgroundColor: primaryColor,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Apply Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CHARGES TYPE MODAL */}
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

      {/* LOGISTICS PARTNER MODAL */}
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

      {/* ADD NEW PARTNER FORM MODAL */}
      <Modal transparent animationType="fade" visible={showAddPartnerModal}>
        <View style={styles.modalOverlayCentered}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalFormCard}>
            {/* Header */}
            <View style={styles.modalFormHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalFormTitle}>Add Transport</Text>
                <Text style={styles.modalFormSubtitle}>Register a new courier service.</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowAddPartnerModal(false);
                  resetAddPartnerForm();
                }}
                style={styles.modalFormCloseBtn}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Form Fields Scroll */}
            <ScrollView contentContainerStyle={styles.modalFormScrollContent} style={{ flexShrink: 1 }}>
              <View style={styles.modalFormBody}>
                {/* Row 1: Transport Name & Contact Number */}
                <View style={styles.gridRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>Transport Name
                    </Text>
                    <TextInput
                      style={styles.textInputBox}
                      placeholder="e.g. BlueDart"
                      placeholderTextColor="#9CA3AF"
                      value={newPartnerName}
                      onChangeText={setNewPartnerName}
                    />
                  </View>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>Contact Number
                    </Text>
                    <TextInput
                      style={styles.textInputBox}
                      placeholder="e.g. 9876543210"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      value={newPartnerContact}
                      onChangeText={setNewPartnerContact}
                    />
                  </View>
                </View>

                {/* Row 2: Country, State, City */}
                <View style={styles.gridRow}>
                  {/* Country */}
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>Country
                    </Text>
                    <TouchableOpacity
                      style={styles.selectTrigger}
                      onPress={() => setShowCountryModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.selectTriggerText, !newPartnerCountry && { color: '#9CA3AF' }]} numberOfLines={1}>
                        {newPartnerCountry || 'Select Country'}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  {/* State */}
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>State
                    </Text>
                    <TouchableOpacity
                      style={styles.selectTrigger}
                      onPress={() => {
                        if (!newPartnerCountry) {
                          Alert.alert('Required Field', 'Please select Country first.');
                          return;
                        }
                        setShowStateModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.selectTriggerText, !newPartnerState && { color: '#9CA3AF' }]} numberOfLines={1}>
                        {newPartnerState || (newPartnerCountry ? 'Select State' : 'Select Country first')}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  {/* City */}
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>City
                    </Text>
                    <TouchableOpacity
                      style={styles.selectTrigger}
                      onPress={() => {
                        if (!newPartnerState) {
                          Alert.alert('Required Field', 'Please select State first.');
                          return;
                        }
                        setShowCityModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.selectTriggerText, !newPartnerCity && { color: '#9CA3AF' }]} numberOfLines={1}>
                        {newPartnerCity || (newPartnerState ? 'Select City' : 'Select State first')}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Row 3: Service Type, Efficiency Rating, GST Number */}
                <View style={styles.gridRow}>
                  {/* Service Type */}
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Service Type</Text>
                    <TouchableOpacity
                      style={styles.selectTrigger}
                      onPress={() => setShowServiceTypeModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectTriggerText}>{newPartnerServiceType}</Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  {/* Efficiency Rating */}
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Efficiency Rating (0-5)</Text>
                    <TextInput
                      style={styles.textInputBox}
                      placeholder="4.5"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={newPartnerRating}
                      onChangeText={setNewPartnerRating}
                    />
                  </View>

                  {/* GST Number */}
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>GST Number</Text>
                    <TextInput
                      style={styles.textInputBox}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      placeholderTextColor="#9CA3AF"
                      value={newPartnerGst}
                      onChangeText={setNewPartnerGst}
                    />
                  </View>
                </View>

                {/* Row 4: Availability Status card */}
                <View style={styles.availabilityCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.availabilityTitle}>Availability Status</Text>
                    <Text style={styles.availabilitySubtitle}>Toggle courier operational status</Text>
                  </View>
                  <Switch
                    value={newPartnerStatus}
                    onValueChange={setNewPartnerStatus}
                    trackColor={{ false: '#D1D5DB', true: '#E0F2FE' }}
                    thumbColor={newPartnerStatus ? '#0284C7' : '#9CA3AF'}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFormFooter}>
              <TouchableOpacity
                style={styles.modalFormCancelBtn}
                onPress={() => {
                  setShowAddPartnerModal(false);
                  resetAddPartnerForm();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalFormCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalFormSubmitBtn, { backgroundColor: '#4CB5BD' }]}
                onPress={handleCreateTransportPartner}
                activeOpacity={0.8}
              >
                <Text style={styles.modalFormSubmitBtnText}>Create Transport</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* COUNTRY SELECT MODAL */}
      <Modal transparent animationType="slide" visible={showCountryModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24), maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search country..."
                placeholderTextColor="#9CA3AF"
                value={countrySearch}
                onChangeText={setCountrySearch}
              />
              {countrySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(countriesData || []).map((opt: any) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setNewPartnerCountry(opt.name);
                    setNewPartnerCountryId(opt.id);
                    setNewPartnerState('');
                    setNewPartnerStateId('');
                    setNewPartnerCity('');
                    setNewPartnerCityId('');
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt.name}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* STATE SELECT MODAL */}
      <Modal transparent animationType="slide" visible={showStateModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStateModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24), maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search state..."
                placeholderTextColor="#9CA3AF"
                value={stateSearch}
                onChangeText={setStateSearch}
              />
              {stateSearch.length > 0 && (
                <TouchableOpacity onPress={() => setStateSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(statesData || []).map((opt: any) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setNewPartnerState(opt.name);
                    setNewPartnerStateId(opt.id);
                    setNewPartnerCity('');
                    setNewPartnerCityId('');
                    setShowStateModal(false);
                    setStateSearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt.name}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CITY SELECT MODAL */}
      <Modal transparent animationType="slide" visible={showCityModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCityModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24), maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search city..."
                placeholderTextColor="#9CA3AF"
                value={citySearch}
                onChangeText={setCitySearch}
              />
              {citySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCitySearch('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(citiesData || []).map((opt: any) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setNewPartnerCity(opt.name);
                    setNewPartnerCityId(opt.id);
                    setShowCityModal(false);
                    setCitySearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt.name}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* SERVICE TYPE SELECT MODAL */}
      <Modal transparent animationType="slide" visible={showServiceTypeModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowServiceTypeModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service Type</Text>
              <TouchableOpacity onPress={() => setShowServiceTypeModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {SERVICE_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setNewPartnerServiceType(opt);
                    setShowServiceTypeModal(false);
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

      {/* ── CUSTOMER PICKER MODAL ─────────────── */}
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

            {/* Search Container */}
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={customerType === 'DEALER' ? 'Search by company or name...' : 'Search by name, company...'}
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

            {customerType === 'DEALER' && isLoadingDealers ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={primaryColor} />
              </View>
            ) : (
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
                      <Text style={styles.modalRowText}>{lead.company || lead.name}</Text>
                      {(lead.company || lead.name) && (
                        <Text style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' }}>
                          {lead.name || 'No Contact'} • {lead.phone || 'No Phone'}
                        </Text>
                      )}
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
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── COMPANY PICKER MODAL ─────────────── */}
      <Modal transparent animationType="slide" visible={showCompanyPicker} onRequestClose={() => setShowCompanyPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCompanyPicker(false)}
        >
          <View style={[styles.modalContent, { height: '45%' }]}>
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

      {/* Full Screen Image Preview Modal */}
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
}

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
  customerSearchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
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
  customerDropdownPopup: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  customerDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  customerDropdownName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  customerDropdownSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  billToBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
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
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    backgroundColor: '#FFFFFF',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  pickerValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
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

  // Items Editor
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

  // Totals summary card
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

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingVertical: 4,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  inputWithIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 42,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
  },
  inputIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginRight: 8,
  },
  inputWithIconField: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  alertInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    backgroundColor: '#FAFAFA',
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  alertBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  alertBtnCancel: {
    backgroundColor: '#F3F4F6',
  },
  alertBtnCancelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  alertBtnSubmitText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
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
});
