import BulkItemActionsCard from '@/components/order&quotations/BulkItemActionsCard';
import SelectImagesModal from '@/components/order&quotations/SelectImagesModal';
import SelectProductModal from '@/components/order&quotations/SelectProductModal';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCompanies } from '@/hooks/useCompany';
import { useCreateLead, useLeads, useLeadSources, useLeadStatuses, useUsers } from '@/hooks/useLeads';
import { useProducts } from '@/hooks/useProducts';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { getCompanyDetails } from '@/services/api/company';
import { CreateQuotationPayload, QuotationItem } from '@/types/quotation';
import { Ionicons } from '@expo/vector-icons';
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

function convertNumberToWords(amount: number): string {
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

export default function AddQuotationScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const toggleCollapse = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], isCollapsed: !next[idx].isCollapsed };
      return next;
    });
  };

  const router = useRouter();
  const params = useLocalSearchParams<{
    referrer?: string;
    leadId?: string;
    companyName?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    gstNumber?: string;
    panNumber?: string;
    notes?: string;
  }>();
  const referrer = params.referrer;
  const [leadId, setLeadId] = useState(params.leadId || '58da794e-9c4f-4bfb-ae79-0541a1ba3e7b');
  const [companyId, setCompanyId] = useState<string>('');
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  const [chargesGst, setChargesGst] = useState('18');
  const [chargesType, setChargesType] = useState('Service Charge');
  const [showChargesTypeModal, setShowChargesTypeModal] = useState(false);
  const [chargesAmount, setChargesAmount] = useState('');
  const [amountInWords, setAmountInWords] = useState('');
  const insets = useSafeAreaInsets();
  const createMutation = useCreateQuotation();
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanies({ search: companySearchQuery, limit: 100 });
  const { primaryColor, primaryLight } = useTheme();

  // ── Leads list and references ──────────────────────────────────────────────
  const { data: rawLeads = [], isLoading: isLoadingLeads } = useLeads();
  const { mutateAsync: createLead } = useCreateLead();

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
  const { data: statusesData } = useLeadStatuses();
  const { data: sourcesData } = useLeadSources();
  const { data: usersData } = useUsers();

  const selectedLead = leads.find((l) => String(l.id) === String(leadId)) || null;
  const selectedCompany = companies.find((c: any) => String(c.id) === String(companyId)) || null;

  // Picker/Modals Visibility
  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  // Product Picker Modal State
  const { data: products = [] } = useProducts();

  // Quick Create Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadGst, setNewLeadGst] = useState('');
  const [newLeadPan, setNewLeadPan] = useState('');
  const [isCreatingLead, setIsCreatingLead] = useState(false);

  const [activeProductSelectIndex, setActiveProductSelectIndex] = useState<number | null>(null);
  const [activeImageSelectIndex, setActiveImageSelectIndex] = useState<number | null>(null);
  const [pendingProduct, setPendingProduct] = useState<any>(null);

  const handleSelectLead = (lead: any) => {
    setLeadId(lead.id);
    setCompanyName(lead.company_name || lead.company || '');
    setContactName(lead.name || '');
    setContactPhone(lead.phone || '');
    setContactEmail(lead.email || '');
    setGstNumber(lead.gst_number || lead.gstNo || '');
    setPanNumber(lead.pan_number || lead.panNo || '');
    setShowLeadPicker(false);
    setLeadSearchQuery('');
  };

  const handleClearLead = () => {
    setLeadId('');
    setCompanyName('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setGstNumber('');
    setPanNumber('');
    setCompanyId('');
  };

  const handleQuickCreateLead = async () => {
    if (!newLeadName.trim() || !newLeadCompany.trim() || !newLeadPhone.trim() || !newLeadEmail.trim()) {
      Alert.alert('Required Fields', 'Full Name, Company Name, Phone, and Email are required.');
      return;
    }

    if (newLeadGst.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstRegex.test(newLeadGst.trim())) {
        Alert.alert('Validation Error', 'Invalid GST number format. Example: 22ABCDE1234F1Z5');
        return;
      }
    }

    if (newLeadPan.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!panRegex.test(newLeadPan.trim())) {
        Alert.alert('Validation Error', 'Invalid PAN number format. Example: ABCDE1234F');
        return;
      }
    }

    setIsCreatingLead(true);
    const selectedStatusObj = statusesData?.find((s: any) => s.is_default) || statusesData?.[0];
    const selectedSourceObj = sourcesData?.[0];
    const selectedUserObj = usersData?.[0];

    const payload = {
      name: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      status_id: selectedStatusObj?.id || null,
      source_id: selectedSourceObj?.id || null,
      email: newLeadEmail.trim() || null,
      assigned_to: selectedUserObj?.id || null,
      priority: 'WARM',
      company_name: newLeadCompany.trim() || null,
      gst_number: newLeadGst.trim() || null,
      pan_number: newLeadPan.trim() || null,
    };

    try {
      const newLead = await createLead(payload);
      const rawLead = newLead?.data || newLead;
      const createdId = rawLead?.id ? String(rawLead.id) : null;

      if (createdId) {
        setLeadId(createdId);
        setCompanyName(rawLead.company_name || rawLead.company || newLeadCompany);
        setContactName(rawLead.name || newLeadName);
        setContactPhone(rawLead.phone || newLeadPhone);
        setContactEmail(rawLead.email || newLeadEmail);
        setGstNumber(rawLead.gst_number || newLeadGst);
        setPanNumber(rawLead.pan_number || newLeadPan);
      }

      setNewLeadName('');
      setNewLeadCompany('');
      setNewLeadPhone('');
      setNewLeadEmail('');
      setNewLeadGst('');
      setNewLeadPan('');
      setShowCreateLeadModal(false);
      Alert.alert('Success', 'Customer/Lead created and selected successfully.');
    } catch (error: any) {
      console.error('Error creating lead:', error);
      Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to create lead.');
    } finally {
      setIsCreatingLead(false);
    }
  };

  const handleBack = () => {
    if (referrer === 'lead-details' && leadId) {
      router.navigate({
        pathname: '/(tabs)/leads/lead-details',
        params: { id: leadId }
      });
    } else {
      router.back();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (referrer === 'lead-details' && leadId) {
          router.navigate({
            pathname: '/(tabs)/leads/lead-details',
            params: { id: leadId }
          });
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [referrer, leadId])
  );

  // ── Form state ─────────────────────────────────────────────────────────────
  const [quotationDate, setQuotationDate] = useState<Date>(new Date());

  const [companyName, setCompanyName] = useState(params.companyName || '');
  const [contactName, setContactName] = useState(params.contactName || '');
  const [contactPhone, setContactPhone] = useState(params.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(params.contactEmail || '');
  const [gstNumber, setGstNumber] = useState(params.gstNumber || '');
  const [panNumber, setPanNumber] = useState(params.panNumber || '');
  const [notes, setNotes] = useState(params.notes || '');

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

  const [items, setItems] = useState<ItemLine[]>([makeEmptyItem()]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sync selected lead details to form states when selectedLead changes
  React.useEffect(() => {
    if (selectedLead) {
      setCompanyName((selectedLead as any).company_name || selectedLead.company || '');
      setContactName(selectedLead.name || '');
      setContactPhone(selectedLead.phone || '');
      setContactEmail(selectedLead.email || '');
      setGstNumber((selectedLead as any).gst_number || (selectedLead as any).gstNo || '');
      setPanNumber((selectedLead as any).pan_number || (selectedLead as any).panNo || '');

      if ((selectedLead as any).company_id) {
        setCompanyId(String((selectedLead as any).company_id));
      } else {
        const cName = (selectedLead as any).company_name || selectedLead.company || '';
        if (cName.trim()) {
          const match = companies.find(
            (c: any) =>
              c.display_name?.toLowerCase().trim() === cName.trim().toLowerCase() ||
              c.name?.toLowerCase().trim() === cName.trim().toLowerCase()
          );
          if (match) {
            setCompanyId(String(match.id));
          } else {
            setCompanyId('');
          }
        } else {
          setCompanyId('');
        }
      }
    }
  }, [selectedLead, companies]);

  // Fetch company details when companyId changes to auto-populate GST/PAN/phone/email
  React.useEffect(() => {
    const fetchCompanyDetailsData = async () => {
      if (!companyId) return;
      try {
        const res = await getCompanyDetails(companyId) as any;
        const data = res?.data?.[0] || (Array.isArray(res?.data) ? res.data[0] : res?.data) || res?.[0] || res;
        if (data) {
          setCompanyName(data.display_name || data.name || '');
          if (data.gstin || data.gst_number) {
            setGstNumber(data.gstin || data.gst_number);
          }
          if (data.pan || data.pan_number) {
            setPanNumber(data.pan || data.pan_number);
          }
          if (data.phone) {
            setContactPhone(data.phone);
          }
          if (data.email) {
            setContactEmail(data.email);
          }
        }
      } catch (err) {
        console.error('Error fetching company details in useEffect:', err);
      }
    };

    fetchCompanyDetailsData();
  }, [companyId]);



  // No longer using search param synchronization for select-product and select-images

  // ── Helpers ────────────────────────────────────────────────────────────────
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

  // ── Totals ─────────────────────────────────────────────────────────────────
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

  const computedSubTotal = subTotal + addChargesAmt;
  const computedGstTotal = taxTotal + addChargesGstAmt;
  const computedGrandTotal = computedSubTotal + computedGstTotal;

  // Automatically generate amount in words from grand total
  React.useEffect(() => {
    if (computedGrandTotal > 0) {
      setAmountInWords(convertNumberToWords(computedGrandTotal));
    } else {
      setAmountInWords('');
    }
  }, [computedGrandTotal]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!leadId) {
      Alert.alert('Validation', 'Please select a Customer / Lead.');
      return;
    }

    // Validate required item fields
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

    const mappedItems: QuotationItem[] = items.map((item) => {
      const { amount, gst_amount } = calcItem(item);
      return {
        product_id: item.product_id || null,
        item_name: item.item_name.trim(),
        item_code: item.item_code.trim() || null,
        item_description: item.item_description.trim() || null,
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        gst_percentage: parseFloat(item.gst_percentage) || 0,
        item_discount: parseFloat(item.item_discount) || 0,
        amount,
        gst_amount,
        images: item.images || null,
      } as QuotationItem;
    });

    if (!companyId) {
      Alert.alert('Validation', 'Please select a Company.');
      return;
    }

    const isDealer = selectedLead
      ? (selectedLead.tag === 'DEALER' ||
        (selectedLead.name || '').toLowerCase().includes('dealer') ||
        (selectedLead.company || '').toLowerCase().includes('dealer') ||
        (selectedLead.tag || '').toLowerCase().includes('dealer') ||
        (selectedLead.status || '').toLowerCase().includes('dealer'))
      : false;

    const payload: CreateQuotationPayload = {
      lead_id: isDealer ? null : (leadId || null),
      dealer_id: isDealer ? (leadId || null) : null,
      company_id: companyId ? String(companyId) : null,
      quotation_date: quotationDate.toISOString(),
      status: 'DRAFT',
      company_name: companyName.trim() || null,
      contact_name: contactName.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
      gst_number: gstNumber.trim() || null,
      pan_number: panNumber.trim() || null,
      notes: notes.trim() || null,
      amount_in_words: amountInWords.trim() || null,
      additional_charges: addChargesAmt > 0 ? [{ name: chargesType, amount: addChargesAmt }] : [],
      subtotal: parseFloat(computedSubTotal.toFixed(2)),
      sub_total: parseFloat(computedSubTotal.toFixed(2)),
      tax_total: parseFloat(computedGstTotal.toFixed(2)),
      grand_total: parseFloat(computedGrandTotal.toFixed(2)),
      discount_percentage: 0,
      discount_amount: 0,
      items: mappedItems,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        Alert.alert('Success', 'Quotation created successfully!', [
          { text: 'OK', onPress: handleBack },
        ]);
      },
      onError: (err: any) => {
        const msg =
          err?.message ||
          err?.error ||
          (Array.isArray(err?.details) ? err.details.map((d: any) => d.message).join('\n') : null) ||
          'Failed to create quotation.';
        Alert.alert('Error', msg);
      },
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>QUOTATION</Text>
          </Text>
          <Text style={styles.headerSub}>Fill In The Details Below</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardVisible ? 200 : 30 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── CLIENT / CONTACT DETAILS ─────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>CUSTOMER / LEAD DETAILS</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.card}>
          {/* Select Company Dropdown */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Company *</Text>
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

          <View style={styles.formField}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.inputLabel}>Customer / Lead *</Text>
              <TouchableOpacity onPress={() => setShowCreateLeadModal(true)} activeOpacity={0.7}>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: primaryColor }}>+ Create New</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.selectTrigger, { flex: 1 }]}
                onPress={() => setShowLeadPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.selectTriggerText, !selectedLead && { color: '#9CA3AF' }]} numberOfLines={1}>
                  {selectedLead ? selectedLead.name : 'Select Customer / Lead'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
              {selectedLead && (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: '#FEF2F2',
                    borderWidth: 1,
                    borderColor: '#FEE2E2',
                    height: 42,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={handleClearLead}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {(selectedLead || companyId) && (
            <View style={styles.leadDetailsRow}>
              <View style={styles.leadDetailsItem}>
                <Text style={styles.leadDetailsLabel}>COMPANY NAME</Text>
                <Text style={styles.leadDetailsValue} numberOfLines={1} ellipsizeMode="tail">
                  {companyName || '—'}
                </Text>
              </View>
              <View style={styles.leadDetailsItem}>
                <Text style={styles.leadDetailsLabel}>PHONE</Text>
                <Text style={styles.leadDetailsValue} numberOfLines={1} ellipsizeMode="tail">
                  {contactPhone || (selectedLead && selectedLead.phone) || '—'}
                </Text>
              </View>
              <View style={styles.leadDetailsItem}>
                <Text style={styles.leadDetailsLabel}>GST</Text>
                <Text style={styles.leadDetailsValue} numberOfLines={1} ellipsizeMode="tail">
                  {gstNumber || '—'}
                </Text>
              </View>
            </View>
          )}
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
          const { amount, gst_amount, total } = calcItem(item);
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
                      Taxable: <Text style={styles.itemTotalVal}>{formatAmount(amount)}</Text>
                      {'  '}GST: <Text style={styles.itemTotalVal}>{formatAmount(gst_amount)}</Text>
                    </Text>
                    <Text style={[styles.itemGrandTotal, { color: primaryColor }]}>{formatAmount(total)}</Text>
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

        {/* Add Item button */}
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

        {/* ── NOTES & ADDITIONAL INFO ───────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>NOTES &amp; ADDITIONAL INFO</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.card}>
          {/* Additional Charges Title */}
          <Text style={{ fontSize: 12.5, fontWeight: '800', color: primaryColor, marginBottom: 8 }}>Additional Charges</Text>

          <View style={styles.gridRow}>
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Charges GST %</Text>
              <TextInput
                style={styles.textInputBox}
                keyboardType="numeric"
                value={chargesGst}
                onChangeText={setChargesGst}
              />
            </View>
            <View style={[styles.formField, { flex: 1.5 }]}>
              <Text style={styles.inputLabel}>Charge Type</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setShowChargesTypeModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.selectTriggerText}>{chargesType}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.textInputBox}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              value={chargesAmount}
              onChangeText={setChargesAmount}
            />
          </View>

          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 }} />

          {/* Additional Notes */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Additional Notes</Text>
            <TextInput
              style={[styles.textInputBox, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
              multiline
              numberOfLines={3}
              placeholder="Priority customer - first order"
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Amount in Words (Display Only) */}
          {amountInWords ? (
            <View style={[styles.formField, { marginTop: 10 }]}>
              <Text style={styles.inputLabel}>Amount in Words</Text>
              <Text style={{ fontSize: 13, color: COLORS.textDark, fontWeight: '700', paddingHorizontal: 4 }}>
                {amountInWords}
              </Text>
            </View>
          ) : null}


        </View>

        {/* ── ORDER TOTAL SUMMARY ───────────────────── */}
        <View style={styles.totalSummaryCard}>
          <View style={styles.totalSummaryRow}>
            <Text style={styles.totalSummaryLabel}>Subtotal</Text>
            <Text style={styles.totalSummaryVal}>{formatAmount(subTotal)}</Text>
          </View>
          {addChargesAmt > 0 && (
            <View style={styles.totalSummaryRow}>
              <Text style={styles.totalSummaryLabel}>{chargesType}</Text>
              <Text style={styles.totalSummaryVal}>{formatAmount(addChargesAmt)}</Text>
            </View>
          )}
          <View style={styles.totalSummaryRow}>
            <Text style={styles.totalSummaryLabel}>Tax Total</Text>
            <Text style={styles.totalSummaryVal}>{formatAmount(computedGstTotal)}</Text>
          </View>
          <View style={[styles.totalSummaryRow, styles.totalSummaryGrand]}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={[styles.grandVal, { color: primaryColor }]}>{formatAmount(computedGrandTotal)}</Text>
          </View>
        </View>

        {/* ── SAVE QUOTATION BUTTON ───────────────────────── */}
        <View style={styles.nonStickySaveContainer}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: primaryColor, shadowColor: primaryColor },
              createMutation.isPending && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={createMutation.isPending}
          >
            <Text style={styles.saveBtnText}>
              {createMutation.isPending ? 'Creating...' : 'Create Quotation'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── CUSTOMER / LEAD PICKER MODAL ─────────────── */}
      <Modal transparent animationType="slide" visible={showLeadPicker} onRequestClose={() => setShowLeadPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLeadPicker(false)}
        >
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer / Lead</Text>
              <TouchableOpacity onPress={() => setShowLeadPicker(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name, company, phone..."
                placeholderTextColor="#9CA3AF"
                value={leadSearchQuery}
                onChangeText={setLeadSearchQuery}
                autoCorrect={false}
                autoComplete="off"
              />
              {leadSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setLeadSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {isLoadingLeads ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={primaryColor} />
              </View>
            ) : (
              <ScrollView style={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
                {leads
                  .filter((lead: any) => {
                    const query = leadSearchQuery.toLowerCase().trim();
                    if (!query) return true;
                    return (
                      lead.name?.toLowerCase().includes(query) ||
                      (lead.company_name || lead.company || '').toLowerCase().includes(query) ||
                      (lead.phone || '').includes(query)
                    );
                  })
                  .map((lead: any) => (
                    <TouchableOpacity
                      key={lead.id}
                      style={styles.modalRowItem}
                      onPress={() => handleSelectLead(lead)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalRowText}>{lead.name}</Text>
                        <Text style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' }}>
                          {lead.company_name || lead.company || 'No Company'} • {lead.phone || 'No Phone'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ))}
                {leads.filter((lead: any) => {
                  const query = leadSearchQuery.toLowerCase().trim();
                  if (!query) return true;
                  return (
                    lead.name?.toLowerCase().includes(query) ||
                    (lead.company_name || lead.company || '').toLowerCase().includes(query) ||
                    (lead.phone || '').includes(query)
                  );
                }).length === 0 && (
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

      {/* ── QUICK CREATE LEAD MODAL ────────────────── */}
      <Modal transparent animationType="slide" visible={showCreateLeadModal} onRequestClose={() => setShowCreateLeadModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => {
              if (!isCreatingLead) setShowCreateLeadModal(false);
            }}
          />
          <View style={[styles.modalContent, { maxHeight: '80%', paddingBottom: 30 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Customer / Lead</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!isCreatingLead) setShowCreateLeadModal(false);
                }}
                disabled={isCreatingLead}
              >
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 12 }} keyboardShouldPersistTaps="handled">
              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInputBox}
                  placeholder="Enter contact person name"
                  placeholderTextColor="#9CA3AF"
                  value={newLeadName}
                  onChangeText={setNewLeadName}
                  editable={!isCreatingLead}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Company Name *</Text>
                <TextInput
                  style={styles.textInputBox}
                  placeholder="Enter company name"
                  placeholderTextColor="#9CA3AF"
                  value={newLeadCompany}
                  onChangeText={setNewLeadCompany}
                  editable={!isCreatingLead}
                />
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Phone *</Text>
                  <TextInput
                    style={styles.textInputBox}
                    placeholder="Phone number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={newLeadPhone}
                    onChangeText={setNewLeadPhone}
                    editable={!isCreatingLead}
                  />
                </View>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.textInputBox}
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newLeadEmail}
                    onChangeText={setNewLeadEmail}
                    editable={!isCreatingLead}
                  />
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>GST Number (Optional)</Text>
                  <TextInput
                    style={styles.textInputBox}
                    placeholder="GSTIN"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                    value={newLeadGst}
                    onChangeText={(text) => setNewLeadGst(text.toUpperCase())}
                    maxLength={15}
                    editable={!isCreatingLead}
                  />
                </View>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>PAN Number (Optional)</Text>
                  <TextInput
                    style={styles.textInputBox}
                    placeholder="PAN"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                    value={newLeadPan}
                    onChangeText={(text) => setNewLeadPan(text.toUpperCase())}
                    maxLength={10}
                    editable={!isCreatingLead}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { marginTop: 15, backgroundColor: primaryColor, shadowColor: primaryColor },
                  isCreatingLead && { opacity: 0.6 }
                ]}
                onPress={handleQuickCreateLead}
                activeOpacity={0.85}
                disabled={isCreatingLead}
              >
                {isCreatingLead ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save &amp; Select Customer</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── CHARGE TYPE PICKER MODAL ─────────────── */}
      <Modal transparent animationType="slide" visible={showChargesTypeModal} onRequestClose={() => setShowChargesTypeModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChargesTypeModal(false)}
        >
          <View style={[styles.modalContent, { height: '40%', paddingBottom: 30 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Charge Type</Text>
              <TouchableOpacity onPress={() => setShowChargesTypeModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
              {['Service Charge', 'Packaging Charge', 'Printing Charge', 'Installation Charge', 'Handling Charge', 'Freight Charge'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setChargesType(type);
                    setShowChargesTypeModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{type}</Text>
                  {chargesType === type && <Ionicons name="checkmark" size={16} color={primaryColor} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>



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
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgWhite,
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
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 14.5, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },

  scrollContent: { padding: 5, gap: 5 },

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

  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 1,
  },
  formField: { gap: 5 },
  inputLabel: { fontSize: 11.5, fontWeight: '700', color: COLORS.textMuted },
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

  // Item cards
  itemCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 1,
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
  },
  addItemBtnText: { fontSize: 13, fontWeight: '800' },

  // Order total summary
  totalSummaryCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  totalSummaryGrand: { borderBottomWidth: 0 },
  totalSummaryLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  totalSummaryVal: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  grandLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  grandVal: { fontSize: 15, fontWeight: '900' },

  saveBtn: {
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  leadDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  leadDetailsItem: {
    flex: 1,
    gap: 3,
  },
  leadDetailsLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  leadDetailsValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
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
    maxHeight: '75%',
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: 40,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontSize: 13.5,
    fontWeight: '700',
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
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  nonStickySaveContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 20,
  },

});
