import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';
import { cameraResult, setCameraResult } from '@/components/CameraState';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
};

const OWNERS = [
  'Arjun Maheta',
  'Parth Solanki',
  'Khushal Nadiyapara',
  'Jigar Kalariya',
];

const CLIENTS = [
  { name: 'NovaTech Solutions Pvt. Ltd.', address: 'Rajkot, Gujarat, India' },
  { name: 'Sunrise Exports', address: 'Surat, Gujarat, India' },
  { name: 'Delta Constructions', address: 'Ahmedabad, Gujarat, India' },
  { name: 'GreenField Agro', address: 'Anand, Gujarat, India' },
];

const INDUSTRIES = [
  'Technology & Software',
  'Manufacturing & Export',
  'Real Estate & Construction',
  'Agriculture & Agro',
  'Retail & E-commerce',
  'Services & Consulting',
];

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'United Arab Emirates',
  'Australia',
];

interface ItemLine {
  id: string;
  type: 'Product' | 'Service';
  name: string;
  hsnSac: string;
  gstRate: string;
  quantity: string;
  rate: string;
  discount: string;
  isCollapsed: boolean;
  attachmentName: string | null;
}

export default function AddQuotationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [step2ExpandedItems, setStep2ExpandedItems] = useState<{[key: string]: boolean}>({});

  // Basic Info State
  const [quotationName, setQuotationName] = useState('Quotation 1');
  const [owner, setOwner] = useState('');
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  // Date selection states
  const [quotationDate, setQuotationDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Client Selection State
  const [clientsList, setClientsList] = useState(CLIENTS);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<{ name: string; address: string } | null>({
    name: 'NovaTech Solutions Pvt. Ltd.',
    address: 'Rajkot, Gujarat, India',
  });

  // Multiple Items State
  const [items, setItems] = useState<ItemLine[]>([
    {
      id: '1',
      type: 'Product',
      name: 'High End Development',
      hsnSac: '998311',
      gstRate: '18',
      quantity: '1',
      rate: '10000',
      discount: '0',
      isCollapsed: false,
      attachmentName: null,
    },
    {
      id: '2',
      type: 'Product',
      name: 'Logo Design',
      hsnSac: '998312',
      gstRate: '18',
      quantity: '1',
      rate: '1500',
      discount: '0',
      isCollapsed: true,
      attachmentName: null,
    }
  ]);

  // Dropdown Modal Selection helper states
  const [activeItemIndexForType, setActiveItemIndexForType] = useState<number | null>(null);

  // Discount Accordion States
  const [discountAccordionOpen, setDiscountAccordionOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'total' | 'item'>('item');
  
  // Discount values
  const [totalDiscountVal, setTotalDiscountVal] = useState('0');
  const [totalDiscountUnit, setTotalDiscountUnit] = useState<'₹' | '%'>('%');
  
  const [itemWiseDiscountMode, setItemWiseDiscountMode] = useState<'fixed' | '%'>('fixed');
  const [itemWiseDiscountVal, setItemWiseDiscountVal] = useState('0');

  // Additional Charges Accordion States
  const [chargesAccordionOpen, setChargesAccordionOpen] = useState(false);
  const [additionalChargesSelected, setAdditionalChargesSelected] = useState(false);
  const [additionalChargesText, setAdditionalChargesText] = useState('Dustbin');
  const [additionalChargesVal, setAdditionalChargesVal] = useState('1000');

  // Add New Client Modal Form States
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [newSelectCountry, setNewSelectCountry] = useState('India');
  const [newCityTown, setNewCityTown] = useState('');
  const [newClientAttachment, setNewClientAttachment] = useState<string | null>(null);
  
  const [taxInfoAccordionOpen, setTaxInfoAccordionOpen] = useState(false);
  const [newGstNumber, setNewGstNumber] = useState('');
  const [newPanNumber, setNewPanNumber] = useState('');

  const [showIndustrySelectModal, setShowIndustrySelectModal] = useState(false);
  const [showCountrySelectModal, setShowCountrySelectModal] = useState(false);

  React.useEffect(() => {
    if (isFocused && cameraResult) {
      if (cameraResult.target === 'quotation_item') {
        const index = cameraResult.extra?.index;
        if (index !== undefined) {
          const uri = cameraResult.uri;
          const pickedName = uri.split('/').pop() || 'photo.jpg';
          updateItemField(index, 'attachmentName', pickedName);
        }
      } else if (cameraResult.target === 'quotation_client') {
        const uri = cameraResult.uri;
        const pickedName = uri.split('/').pop() || 'photo.jpg';
        setNewClientAttachment(pickedName);
      }
      setCameraResult(null);
    }
  }, [isFocused]);

  // Step 2 accordions
  const [step2SummaryCollapsed, setStep2SummaryCollapsed] = useState(false);

  // Generate a new line item helper
  const handleAddNewLine = () => {
    const nextId = String(Date.now() + items.length);
    setItems([
      ...items,
      {
        id: nextId,
        type: 'Product',
        name: '',
        hsnSac: '',
        gstRate: '18',
        quantity: '1',
        rate: '0',
        discount: '0',
        isCollapsed: false,
        attachmentName: null,
      }
    ]);
  };

  const handleDeleteLine = (index: number) => {
    if (items.length === 1) {
      Alert.alert('Info', 'You must have at least one item line');
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleToggleCollapse = (index: number) => {
    const updated = [...items];
    updated[index].isCollapsed = !updated[index].isCollapsed;
    setItems(updated);
  };

  const toggleStep2Item = (id: string) => {
    setStep2ExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const updateItemField = (index: number, key: keyof ItemLine, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setItems(updated);
  };

  const handleImagePick = async (
    useCamera: boolean,
    onSuccess: (name: string) => void,
    targetInfo?: { target: 'quotation_item' | 'quotation_client'; index?: number }
  ) => {
    if (useCamera && targetInfo) {
      router.push({
        pathname: '/camera-capture',
        params: {
          sourceScreen: 'add-quotation',
          target: targetInfo.target,
          extra: targetInfo.index !== undefined ? JSON.stringify({ index: targetInfo.index }) : undefined,
        },
      });
      return;
    }
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access photo library is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedName = result.assets[0].fileName || result.assets[0].uri.split('/').pop() || 'photo.jpg';
        onSuccess(pickedName);
      }
    } catch (err) {
      console.log('Error picking image:', err);
    }
  };

  const handleDocumentPickDirect = async (onSuccess: (name: string) => void) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        onSuccess(res.assets[0].name);
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const handleDocumentPick = (index: number) => {
    Alert.alert(
      'Upload Attachment',
      'Choose a source for your file:',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImagePick(
            true,
            (name) => updateItemField(index, 'attachmentName', name),
            { target: 'quotation_item', index }
          ),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleImagePick(
            false,
            (name) => updateItemField(index, 'attachmentName', name)
          ),
        },
        {
          text: 'Choose Document',
          onPress: () => handleDocumentPickDirect((name) => updateItemField(index, 'attachmentName', name)),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Summary Calculations
  let subtotalSum = 0;
  let cgstSum = 0;
  let sgstSum = 0;

  items.forEach((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discPercent = discountType === 'item' ? (parseFloat(item.discount) || 0) : 0;
    const gstPercent = parseFloat(item.gstRate) || 0;

    const raw = qty * rate;
    const discAmt = raw * (discPercent / 100);
    const taxable = raw - discAmt;

    const cgst = taxable * ((gstPercent / 2) / 100);
    const sgst = taxable * ((gstPercent / 2) / 100);

    subtotalSum += raw;
    cgstSum += cgst;
    sgstSum += sgst;
  });

  const totalBeforeDiscountAndCharges = subtotalSum + cgstSum + sgstSum;

  // Apply Overall Discount
  let discountOnTotalAmt = 0;
  if (discountType === 'total') {
    const discVal = parseFloat(totalDiscountVal) || 0;
    if (totalDiscountUnit === '%') {
      discountOnTotalAmt = totalBeforeDiscountAndCharges * (discVal / 100);
    } else {
      discountOnTotalAmt = discVal;
    }
  } else {
    const discVal = parseFloat(itemWiseDiscountVal) || 0;
    if (itemWiseDiscountMode === '%') {
      discountOnTotalAmt = totalBeforeDiscountAndCharges * (discVal / 100);
    } else {
      discountOnTotalAmt = discVal;
    }
  }

  // Additional charges
  const additionalChargesAmt = additionalChargesSelected ? (parseFloat(additionalChargesVal) || 0) : 0;

  const finalTotalAmount = Math.max(0, totalBeforeDiscountAndCharges - discountOnTotalAmt + additionalChargesAmt);

  const handleCreateQuotation = () => {
    if (!selectedClient) {
      Alert.alert('Error', 'Please select a client first');
      return;
    }
    Alert.alert('Success', 'Quotation created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleSaveNewClient = () => {
    if (!newBusinessName.trim()) {
      Alert.alert('Validation Error', 'Business Name is required');
      return;
    }
    const newClientObj = {
      name: newBusinessName.trim(),
      address: `${newCityTown ? newCityTown + ', ' : ''}${newSelectCountry || 'India'}`,
    };
    setClientsList([newClientObj, ...clientsList]);
    setSelectedClient(newClientObj);
    setShowAddClientModal(false);
    
    // Reset form
    setNewBusinessName('');
    setNewClientIndustry('');
    setNewSelectCountry('India');
    setNewCityTown('');
    setNewClientAttachment(null);
    setNewGstNumber('');
    setNewPanNumber('');
  };

  const handleClientDocumentPick = () => {
    Alert.alert(
      'Upload Attachment',
      'Choose a source for your file:',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImagePick(
            true,
            (name) => setNewClientAttachment(name),
            { target: 'quotation_client' }
          ),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleImagePick(
            false,
            (name) => setNewClientAttachment(name)
          ),
        },
        {
          text: 'Choose Document',
          onPress: () => handleDocumentPickDirect((name) => setNewClientAttachment(name)),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => currentStep === 2 ? setCurrentStep(1) : router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: COLORS.primary }}>ADD QUOT</Text>
            <Text style={{ color: COLORS.textDark }}>ATION</Text>
          </Text>
          <Text style={styles.headerSub}>Fill In The Details Below</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* ── PROGRESS STEP TABS ────────────────────── */}
      <View style={styles.stepTabsContainer}>
        {/* Step 1 Tab */}
        <TouchableOpacity 
          style={[styles.stepTabBase, currentStep === 1 ? styles.stepTabActive : styles.stepTabCompleted]}
          onPress={() => setCurrentStep(1)}
        >
          <View style={currentStep === 1 ? styles.stepBadgeActive : styles.stepBadgeCompleted}>
            {currentStep === 2 ? (
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            ) : (
              <Text style={styles.stepBadgeTextActive}>1</Text>
            )}
          </View>
          <Text style={currentStep === 1 ? styles.stepTextActive : styles.stepTextCompleted}>Quotation Details</Text>
        </TouchableOpacity>
        
        <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={{ marginHorizontal: 8 }} />

        {/* Step 2 Tab */}
        <View style={[styles.stepTabBase, currentStep === 2 ? styles.stepTabActive : styles.stepTabInactive]}>
          <View style={currentStep === 2 ? styles.stepBadgeActive : styles.stepBadgeInactive}>
            <Text style={currentStep === 2 ? styles.stepBadgeTextActive : styles.stepBadgeTextInactive}>2</Text>
          </View>
          <Text style={currentStep === 2 ? styles.stepTextActive : styles.stepTextInactive}>Design & Share (Option...)</Text>
        </View>
      </View>

      {/* ── STEP 1: FILL DETAILS ──────────────────────── */}
      {currentStep === 1 && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Quotation name input block */}
          <View style={styles.cardInputBlock}>
            <Text style={styles.fieldLabelSmall}>Enter Your Quotation Name</Text>
            <View style={styles.nameInputRow}>
              <TextInput
                style={styles.quotationNameInput}
                value={quotationName}
                onChangeText={setQuotationName}
              />
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            </View>
          </View>

          {/* QUOTATION INFORMATION SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>QUOTATION INFORMATION</Text>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.card}>
              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Quotation Owner</Text>
                <TouchableOpacity 
                  style={styles.selectTrigger}
                  onPress={() => setShowOwnerModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectTriggerText, !owner && styles.selectPlaceholder]}>
                    {owner || 'Enter Quotation Owner'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Quotation Date</Text>
                <TouchableOpacity 
                  style={styles.selectTrigger}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectTriggerText, !quotationDate && styles.selectPlaceholder]}>
                    {quotationDate ? quotationDate.toLocaleDateString() : 'Enter Quotation Date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* QUOTATION FROM SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>QUOTATION FROM</Text>
              <Text style={styles.sectionSubLabel}>Your Details</Text>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.card}>
              <View style={styles.cardSubHeader}>
                <Text style={styles.businessTitle}>Business Details</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert('Edit', 'Edit from business details...')}>
                  <Ionicons name="create-outline" size={13} color={COLORS.primary} style={{ marginRight: 3 }} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailsList}>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Business Name</Text>
                  <Text style={styles.detailsValue}>Freelancer</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Address</Text>
                  <Text style={styles.detailsValue}>Gujarat , India</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>GSTIN</Text>
                  <Text style={styles.detailsValue}>27ABCDE1234F1Z5</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>PAN</Text>
                  <Text style={styles.detailsValue}>ABCDE1234F</Text>
                </View>
              </View>
            </View>
          </View>

          {/* QUOTATION FOR SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>QUOTATION FOR</Text>
              <Text style={styles.sectionSubLabel}>Client Details</Text>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.selectTrigger} 
                onPress={() => setClientDropdownOpen(!clientDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.selectTriggerText}>
                  {selectedClient ? selectedClient.name : 'Select A Client'}
                </Text>
                <Ionicons name={clientDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              {clientDropdownOpen && (
                <View style={styles.clientDropdownContainer}>
                  <View style={styles.searchBarSub}>
                    <Ionicons name="search-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <TextInput
                      style={styles.searchBarSubInput}
                      placeholder="Search Client..."
                      value={clientSearchQuery}
                      onChangeText={setClientSearchQuery}
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.addClientBtn}
                    onPress={() => {
                      setShowAddClientModal(true);
                      setClientDropdownOpen(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addClientBtnText}>Add New Client</Text>
                  </TouchableOpacity>

                  {clientsList.filter(c => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())).map((c, idx) => (
                    <TouchableOpacity 
                      key={idx}
                      style={styles.clientItem}
                      onPress={() => {
                        setSelectedClient(c);
                        setClientDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.clientItemText}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={[styles.separator, { marginVertical: 10 }]} />

              <View style={styles.cardSubHeader}>
                <Text style={styles.businessTitle}>Business Details</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert('Edit', 'Edit client details...')}>
                  <Ionicons name="create-outline" size={13} color={COLORS.primary} style={{ marginRight: 3 }} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailsList}>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Business Name</Text>
                  <Text style={styles.detailsValue}>{selectedClient ? selectedClient.name : 'Freelancer'}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Address</Text>
                  <Text style={styles.detailsValue}>{selectedClient ? selectedClient.address : 'Rajkot , Gujarat , India'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ITEMS SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>ITEMS</Text>
              <View style={styles.sectionLine} />
            </View>

            {items.map((item, index) => {
              const qtyNum = parseFloat(item.quantity) || 0;
              const rateNum = parseFloat(item.rate) || 0;
              const discPercent = parseFloat(item.discount) || 0;
              const gstPercent = parseFloat(item.gstRate) || 0;

              const rawAmount = qtyNum * rateNum;
              const discountAmount = rawAmount * (discPercent / 100);
              const taxableValue = rawAmount - discountAmount;

              const cgstAmount = taxableValue * ((gstPercent / 2) / 100);
              const sgstAmount = taxableValue * ((gstPercent / 2) / 100);
              const totalAmount = taxableValue + cgstAmount + sgstAmount;

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemIndexBadge}>
                      <Text style={styles.itemIndexText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.itemHeading}>
                      {item.name ? item.name : `Product ${index + 1}`}
                    </Text>
                    
                    <View style={styles.itemHeaderActions}>
                      <TouchableOpacity style={styles.actionIconButton} onPress={() => handleDeleteLine(index)}>
                        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionIconButton} onPress={() => handleToggleCollapse(index)}>
                        <Ionicons 
                          name={item.isCollapsed ? "chevron-down" : "chevron-up"} 
                          size={16} 
                          color={COLORS.textMuted} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {!item.isCollapsed && (
                    <View style={{ gap: 12, marginTop: 4 }}>
                      <View style={styles.formField}>
                        <Text style={styles.inputLabel}>Type</Text>
                        <TouchableOpacity 
                          style={styles.selectTrigger}
                          onPress={() => setActiveItemIndexForType(index)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.selectTriggerText}>{item.type}</Text>
                          <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.inputLabel}>Item</Text>
                        <TextInput
                          style={styles.textInputBox}
                          placeholder="Enter Item Name / SKU id"
                          placeholderTextColor="#9CA3AF"
                          value={item.name}
                          onChangeText={(txt) => updateItemField(index, 'name', txt)}
                        />
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.inputLabel}>HSN/SAC</Text>
                        <View style={styles.inputSearchWrapper}>
                          <TextInput
                            style={[styles.textInputBox, { flex: 1, borderWidth: 0 }]}
                            placeholder="Enter HSN / SAC"
                            placeholderTextColor="#9CA3AF"
                            value={item.hsnSac}
                            onChangeText={(txt) => updateItemField(index, 'hsnSac', txt)}
                          />
                          <Ionicons name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 10 }} />
                        </View>
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.inputLabel}>GST Rate</Text>
                        <View style={styles.inputSearchWrapper}>
                          <TextInput
                            style={[styles.textInputBox, { flex: 1, borderWidth: 0 }]}
                            placeholder="Enter GST Rate"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={item.gstRate}
                            onChangeText={(txt) => updateItemField(index, 'gstRate', txt)}
                          />
                          <Text style={styles.percentSymbol}>%</Text>
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={[styles.formField, { flex: 1 }]}>
                          <Text style={styles.inputLabel}>Quantity</Text>
                          <TextInput
                            style={styles.textInputBox}
                            keyboardType="numeric"
                            value={item.quantity}
                            onChangeText={(txt) => updateItemField(index, 'quantity', txt)}
                          />
                        </View>
                        <View style={[styles.formField, { flex: 1 }]}>
                          <Text style={styles.inputLabel}>Rate</Text>
                          <TextInput
                            style={styles.textInputBox}
                            keyboardType="numeric"
                            value={item.rate}
                            onChangeText={(txt) => updateItemField(index, 'rate', txt)}
                          />
                        </View>
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.inputLabel}>Discount</Text>
                        <View style={styles.inputSearchWrapper}>
                          <TextInput
                            style={[styles.textInputBox, { flex: 1, borderWidth: 0 }]}
                            keyboardType="numeric"
                            value={item.discount}
                            onChangeText={(txt) => updateItemField(index, 'discount', txt)}
                          />
                          <TouchableOpacity style={styles.percentDropdown}>
                            <Text style={styles.percentText}>%</Text>
                            <Ionicons name="chevron-down" size={10} color={COLORS.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.calculationRow}>
                        <Text style={styles.calcLabel}>Amount</Text>
                        <Text style={styles.calcValue}>₹ {rawAmount.toFixed(2)}</Text>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={[styles.calculationRow, { flex: 1 }]}>
                          <Text style={styles.calcLabel}>CGST</Text>
                          <Text style={styles.calcValue}>₹ {cgstAmount.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.calculationRow, { flex: 1 }]}>
                          <Text style={styles.calcLabel}>SGST</Text>
                          <Text style={styles.calcValue}>₹ {sgstAmount.toFixed(2)}</Text>
                        </View>
                      </View>

                      <View style={styles.totalSumRow}>
                        <Text style={styles.totalSumLabel}>Total</Text>
                        <Text style={styles.totalSumValue}>₹ {totalAmount.toFixed(2)}</Text>
                      </View>

                      <TouchableOpacity 
                        style={styles.uploadContainer}
                        onPress={() => handleDocumentPick(index)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.uploadBox}>
                          <Ionicons name="cloud-upload-outline" size={22} color={COLORS.primary} />
                          <View style={styles.uploadTextWrapper}>
                            <Text style={styles.uploadTitle}>
                              {item.attachmentName ? item.attachmentName : 'Select a file or drag and drop here'}
                            </Text>
                            <Text style={styles.uploadSub}>JPG, PNG or PDF - max 10MB</Text>
                          </View>
                          <TouchableOpacity style={styles.browseButton} onPress={() => handleDocumentPick(index)}>
                            <Text style={styles.browseButtonText}>Browse</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                </View>
              );
            })}

            <TouchableOpacity 
              style={styles.addNewLineBtn} 
              onPress={handleAddNewLine}
              activeOpacity={0.8}
            >
              <Text style={styles.addNewLineBtnText}>Add New Line</Text>
            </TouchableOpacity>
          </View>

          {/* SHOW TOTAL IN PDF SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>SHOW TOTAL IN PDF</Text>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.totalCardSummary}>
              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>₹ {subtotalSum.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryLabel}>SGST</Text>
                <Text style={styles.summaryValue}>₹ {sgstSum.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryLabel}>CGST</Text>
                <Text style={styles.summaryValue}>₹ {cgstSum.toFixed(2)}</Text>
              </View>

              <View style={styles.separator} />

              {/* Accordion 1: Add Discount */}
              <View style={styles.accordionContainer}>
                <TouchableOpacity 
                  style={styles.accordionHeader}
                  onPress={() => setDiscountAccordionOpen(!discountAccordionOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.accordionTitle}>Add Discount</Text>
                  <Ionicons name={discountAccordionOpen ? "chevron-up" : "chevron-down"} size={16} color={COLORS.textDark} />
                </TouchableOpacity>

                {discountAccordionOpen && (
                  <View style={styles.accordionBody}>
                    <TouchableOpacity 
                      style={styles.radioChoiceRow}
                      onPress={() => setDiscountType('total')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.radioCircle, discountType === 'total' && styles.radioCircleActive]}>
                        {discountType === 'total' && <View style={styles.radioDot} />}
                      </View>
                      <View style={styles.radioLabelCol}>
                        <Text style={styles.radioChoiceTitle}>Give Discount On Total</Text>
                        <Text style={styles.radioChoiceSub}>Apply A Single Discount To The Entire Invoice...</Text>
                      </View>
                    </TouchableOpacity>

                    {discountType === 'total' && (
                      <View style={styles.inlineFieldsRow}>
                        <TextInput
                          style={[styles.textInputBox, { flex: 1 }]}
                          placeholder="Enter Amount..."
                          keyboardType="numeric"
                          value={totalDiscountVal}
                          onChangeText={setTotalDiscountVal}
                        />
                        <TouchableOpacity 
                          style={styles.currencyToggleBox}
                          onPress={() => setTotalDiscountUnit(totalDiscountUnit === '%' ? '₹' : '%')}
                        >
                          <Text style={styles.currencyToggleText}>{totalDiscountUnit}</Text>
                          <Ionicons name="chevron-down" size={10} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity 
                      style={[styles.radioChoiceRow, { marginTop: 12 }]}
                      onPress={() => setDiscountType('item')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.radioCircle, discountType === 'item' && styles.radioCircleActive]}>
                        {discountType === 'item' && <View style={styles.radioDot} />}
                      </View>
                      <View style={styles.radioLabelCol}>
                        <Text style={styles.radioChoiceTitle}>Give Item Wise Discount</Text>
                        <Text style={styles.radioChoiceSub}>Apply Different Discounts Per Line Item</Text>
                      </View>
                    </TouchableOpacity>

                    {discountType === 'item' && (
                      <View style={{ marginTop: 10, gap: 10 }}>
                        <View style={styles.fixedPercentTabsRow}>
                          <TouchableOpacity 
                            style={[styles.fixedTab, itemWiseDiscountMode === 'fixed' && styles.fixedTabActive]}
                            onPress={() => setItemWiseDiscountMode('fixed')}
                          >
                            <Text style={[styles.fixedTabText, itemWiseDiscountMode === 'fixed' && styles.fixedTabTextActive]}>
                              Fixed
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.fixedTab, itemWiseDiscountMode === '%' && styles.fixedTabActive]}
                            onPress={() => setItemWiseDiscountMode('%')}
                          >
                            <Text style={[styles.fixedTabText, itemWiseDiscountMode === '%' && styles.fixedTabTextActive]}>
                              %
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <TextInput
                          style={styles.textInputBox}
                          placeholder="Enter Amount..."
                          keyboardType="numeric"
                          value={itemWiseDiscountVal}
                          onChangeText={setItemWiseDiscountVal}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Accordion 2: Add Additional Charges */}
              <View style={[styles.accordionContainer, { borderBottomWidth: 0 }]}>
                <TouchableOpacity 
                  style={styles.accordionHeader}
                  onPress={() => setChargesAccordionOpen(!chargesAccordionOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.accordionTitle}>Add Additional Charges</Text>
                  <Ionicons name={chargesAccordionOpen ? "chevron-up" : "chevron-down"} size={16} color={COLORS.textDark} />
                </TouchableOpacity>

                {chargesAccordionOpen && (
                  <View style={styles.accordionBody}>
                    <Text style={styles.additionalChargesSubLabel}>Tax: Tax Applied On Charge</Text>
                    
                    <View style={styles.additionalChargesRow}>
                      <TouchableOpacity 
                        style={styles.chargeDropdownTrigger}
                        onPress={() => setAdditionalChargesSelected(!additionalChargesSelected)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.chargeDropdownLeft}>
                          <Text style={styles.chargeDropdownTitle}>{additionalChargesText}</Text>
                          <Text style={styles.chargeDropdownSub}>18% GST • ₹ {additionalChargesVal}</Text>
                        </View>
                        <View style={[styles.checkboxSquare, additionalChargesSelected && styles.checkboxSquareActive]}>
                          {additionalChargesSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                        </View>
                      </TouchableOpacity>

                      <TextInput
                        style={[styles.textInputBox, { width: 80, textAlign: 'center' }]}
                        keyboardType="numeric"
                        value={additionalChargesVal}
                        onChangeText={setAdditionalChargesVal}
                      />
                    </View>

                    <TouchableOpacity 
                      style={styles.createNewChargeBtn}
                      onPress={() => Alert.alert('Create Charge', 'Create custom service charge...')}
                    >
                      <Text style={styles.createNewChargeText}>Create New</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Final calculated output */}
              <View style={styles.finalINRSummaryRow}>
                <View>
                  <Text style={styles.finalINRLabel}>INR</Text>
                  <Text style={styles.finalINRTitle}>TOTAL</Text>
                </View>
                <Text style={styles.finalINRValue}>₹ {finalTotalAmount.toFixed(2)}</Text>
              </View>

            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: COLORS.primary }]} 
            onPress={() => {
              if (!selectedClient) {
                Alert.alert('Error', 'Please select a client first');
                return;
              }
              setCurrentStep(2);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>Save & Continue</Text>
          </TouchableOpacity>

        </ScrollView>
      )}

      {/* ── STEP 2: DESIGN & SHARE PREVIEW ────────────── */}
      {currentStep === 2 && (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 }]} showsVerticalScrollIndicator={false}>
            
            {/* Top Quick Buttons: Download & Share */}
            <View style={styles.step2QuickActionsRow}>
              <TouchableOpacity 
                style={styles.quickActionCard} 
                onPress={() => Alert.alert('Download', 'Quotation download started...')}
              >
                <Ionicons name="cloud-download-outline" size={18} color={COLORS.textDark} />
                <Text style={styles.quickActionText}>Download Quotation</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionCard} 
                onPress={() => Alert.alert('Share', 'Open Share Sheet...')}
              >
                <Ionicons name="share-outline" size={18} color={COLORS.textDark} />
                <Text style={styles.quickActionText}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Quotation Name (Read Only with edit icon) */}
            <View style={styles.card}>
              <Text style={styles.fieldLabelSmall}>Quotation Name</Text>
              <View style={styles.nameInputRow}>
                <Text style={{ fontSize: 14.5, fontWeight: '800', color: COLORS.textDark }}>
                  {quotationName}
                </Text>
                <TouchableOpacity onPress={() => setCurrentStep(1)}>
                  <Ionicons name="create-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Collapsible Quotation Summary Accordion */}
            <View style={styles.card}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => setStep2SummaryCollapsed(!step2SummaryCollapsed)}
                activeOpacity={0.8}
              >
                <View style={styles.clientModalTitleWrapper}>
                  <View style={[styles.greenIndicatorBar, { height: 16 }]} />
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: COLORS.textDark }}>
                    QUOTATION SUMMARY
                  </Text>
                </View>
                <Ionicons name={step2SummaryCollapsed ? "chevron-down" : "chevron-up"} size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              {!step2SummaryCollapsed && (
                <View style={{ gap: 8, marginTop: 8 }}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Client Name</Text>
                    <Text style={styles.detailsValue}>{selectedClient ? selectedClient.name : 'N/A'}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Owner</Text>
                    <Text style={styles.detailsValue}>{owner || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Quotation Date</Text>
                    <Text style={styles.detailsValue}>{quotationDate ? quotationDate.toLocaleDateString() : 'N/A'}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* PDF Invoice Live Sheet Mockup Container */}
            <View style={styles.pdfOuterFrame}>
              <View style={styles.pdfPaperSheet}>
                
                {/* PDF Header */}
                <View style={styles.pdfHeaderRow}>
                  <View>
                    <Text style={styles.pdfInvoiceTitle}>Quotation</Text>
                    <Text style={styles.pdfInvoiceSubTitle}>Created At: {quotationDate ? quotationDate.toLocaleDateString() : ''}</Text>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.pdfLogo}>FOOBAR LABS</Text>
                    <Text style={styles.pdfAddressText}>Gujarat, India</Text>
                  </View>
                </View>

                <View style={styles.pdfDivider} />

                {/* Bill to block */}
                <View style={styles.pdfBillRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pdfBillToLabel}>BILL TO</Text>
                    <Text style={styles.pdfBillToName}>{selectedClient ? selectedClient.name : 'Client Name'}</Text>
                    <Text style={styles.pdfAddressText}>{selectedClient ? selectedClient.address : 'Client Address'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.pdfBillToLabel}>QUOTATION NO</Text>
                    <Text style={styles.pdfBillToName}>#QTN-2026-01</Text>
                  </View>
                </View>

                {/* Table */}
                <View style={styles.pdfTable}>
                  <View style={styles.pdfTableHeader}>
                    <Text style={[styles.pdfCell, { flex: 2.5, fontWeight: '800' }]}>Item Description</Text>
                    <Text style={[styles.pdfCell, { flex: 0.8, textAlign: 'center', fontWeight: '800' }]}>Qty</Text>
                    <Text style={[styles.pdfCell, { flex: 1.2, textAlign: 'right', fontWeight: '800' }]}>Rate</Text>
                    <Text style={[styles.pdfCell, { flex: 1.5, textAlign: 'right', fontWeight: '800' }]}>Amount</Text>
                  </View>

                  {items.map((itm, idx) => {
                    const qty = parseFloat(itm.quantity) || 0;
                    const rateVal = parseFloat(itm.rate) || 0;
                    const amtVal = qty * rateVal;
                    return (
                      <View key={itm.id} style={styles.pdfTableRow}>
                        <Text style={[styles.pdfCell, { flex: 2.5 }]} numberOfLines={1}>
                          {idx + 1}. {itm.name || 'Unnamed Item'}
                        </Text>
                        <Text style={[styles.pdfCell, { flex: 0.8, textAlign: 'center' }]}>{qty}</Text>
                        <Text style={[styles.pdfCell, { flex: 1.2, textAlign: 'right' }]}>₹ {rateVal.toLocaleString()}</Text>
                        <Text style={[styles.pdfCell, { flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>₹ {amtVal.toLocaleString()}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* PDF Totals */}
                <View style={styles.pdfTotalsWrapper}>
                  <View style={styles.pdfTotalsRow}>
                    <Text style={styles.pdfTotalLabel}>Sub Total</Text>
                    <Text style={styles.pdfTotalVal}>₹ {subtotalSum.toFixed(2)}</Text>
                  </View>
                  <View style={styles.pdfTotalsRow}>
                    <Text style={styles.pdfTotalLabel}>CGST / SGST</Text>
                    <Text style={styles.pdfTotalVal}>₹ {(cgstSum + sgstSum).toFixed(2)}</Text>
                  </View>
                  {discountOnTotalAmt > 0 && (
                    <View style={styles.pdfTotalsRow}>
                      <Text style={[styles.pdfTotalLabel, { color: COLORS.danger }]}>Discount</Text>
                      <Text style={[styles.pdfTotalVal, { color: COLORS.danger }]}>- ₹ {discountOnTotalAmt.toFixed(2)}</Text>
                    </View>
                  )}
                  {additionalChargesAmt > 0 && (
                    <View style={styles.pdfTotalsRow}>
                      <Text style={styles.pdfTotalLabel}>Charges</Text>
                      <Text style={styles.pdfTotalVal}>+ ₹ {additionalChargesAmt.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={[styles.pdfTotalsRow, { borderTopWidth: 1.5, borderTopColor: COLORS.primary, paddingTop: 6, marginTop: 4 }]}>
                    <Text style={[styles.pdfTotalLabel, { fontWeight: '900', color: COLORS.primary }]}>Total Amount</Text>
                    <Text style={[styles.pdfTotalVal, { fontWeight: '900', color: COLORS.primary, fontSize: 13.5 }]}>
                      ₹ {finalTotalAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Terms and conditions */}
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.pdfTermsTitle}>Terms & Conditions</Text>
                  <Text style={styles.pdfTermsText}>1. Please check all specifications detailed above.</Text>
                  <Text style={styles.pdfTermsText}>2. Delivery within 14 working days of confirmation.</Text>
                </View>

              </View>
            </View>

            {/* Items lists collapsible rows (read only) */}
            <View style={{ gap: 10 }}>
              {items.map((itm, index) => {
                const isExp = !!step2ExpandedItems[itm.id];
                const qtyVal = parseFloat(itm.quantity) || 0;
                const rateVal = parseFloat(itm.rate) || 0;
                const subVal = qtyVal * rateVal;
                return (
                  <View key={itm.id} style={[styles.card, { paddingVertical: 12 }]}>
                    <TouchableOpacity 
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      onPress={() => toggleStep2Item(itm.id)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.itemIndexBadge, { backgroundColor: COLORS.primary, borderWidth: 0 }]}>
                          <Text style={[styles.itemIndexText, { color: '#FFFFFF' }]}>{index + 1}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.textDark, marginLeft: 8 }}>
                          {itm.name || `Product ${index + 1}`}
                        </Text>
                      </View>
                      <Ionicons name={isExp ? "chevron-up" : "chevron-down"} size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    {isExp && (
                      <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, gap: 6 }}>
                        <View style={styles.detailsRow}>
                          <Text style={styles.detailsLabel}>Rate</Text>
                          <Text style={styles.detailsValue}>₹ {rateVal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                          <Text style={styles.detailsLabel}>Quantity</Text>
                          <Text style={styles.detailsValue}>{qtyVal}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                          <Text style={styles.detailsLabel}>GST Rate</Text>
                          <Text style={styles.detailsValue}>{itm.gstRate}%</Text>
                        </View>
                        <View style={styles.detailsRow}>
                          <Text style={styles.detailsLabel}>Subtotal</Text>
                          <Text style={styles.detailsValue}>₹ {subVal.toFixed(2)}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Amount, SGST, CGST, and INR TOTAL card */}
            <View style={styles.totalCardSummary}>
              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>₹ {subtotalSum.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryLabel}>SGST</Text>
                <Text style={styles.summaryValue}>₹ {sgstSum.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryLabel}>CGST</Text>
                <Text style={styles.summaryValue}>₹ {cgstSum.toFixed(2)}</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.finalINRSummaryRow}>
                <View>
                  <Text style={styles.finalINRLabel}>INR</Text>
                  <Text style={styles.finalINRTitle}>TOTAL</Text>
                </View>
                <Text style={styles.finalINRValue}>₹ {finalTotalAmount.toFixed(2)}</Text>
              </View>
            </View>

          </ScrollView>

          {/* Sticky Bottom Actions */}
          <View style={styles.step2StickyFooter}>
            <TouchableOpacity 
              style={styles.step2BackBtn}
              onPress={() => setCurrentStep(1)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.step2DownloadBtn}
              onPress={handleCreateQuotation}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.step2DownloadText}>Download Quotation</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── SYSTEM DATE PICKER DIALOG ───────────────── */}
      {showDatePicker && (
        <DateTimePicker
          value={quotationDate || new Date()}
          mode="date"
          display="default"
          onChange={(event: any, selectedDate?: Date) => {
            setShowDatePicker(false);
            if (selectedDate) setQuotationDate(selectedDate);
          }}
        />
      )}

      {/* ── MODALS FOR DROPDOWNS ────────────────────── */}
      {showOwnerModal && (
        <Modal transparent animationType="slide" visible={showOwnerModal}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowOwnerModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitleInline}>Select Owner</Text>
              <ScrollView style={{ paddingHorizontal: 20 }}>
                {OWNERS.map((o) => (
                  <TouchableOpacity
                    key={o}
                    style={styles.modalRowItem}
                    onPress={() => {
                      setOwner(o);
                      setShowOwnerModal(false);
                    }}
                  >
                    <Text style={styles.modalRowText}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {activeItemIndexForType !== null && (
        <Modal transparent animationType="slide" visible={activeItemIndexForType !== null}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActiveItemIndexForType(null)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitleInline}>Select Type</Text>
              <ScrollView style={{ paddingHorizontal: 20 }}>
                {['Product', 'Service'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.modalRowItem}
                    onPress={() => {
                      if (activeItemIndexForType !== null) {
                        updateItemField(activeItemIndexForType, 'type', t);
                      }
                      setActiveItemIndexForType(null);
                    }}
                  >
                    <Text style={styles.modalRowText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* ── ADD NEW CLIENT MODAL overlay ───────────── */}
      {showAddClientModal && (
        <Modal transparent animationType="slide" visible={showAddClientModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '90%', paddingBottom: 20 }]}>
              <View style={styles.clientModalHeader}>
                <View style={styles.clientModalTitleWrapper}>
                  <View style={styles.greenIndicatorBar} />
                  <Text style={styles.clientModalTitle}>Add New Client</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowAddClientModal(false)}
                  style={styles.clientModalCloseBtn}
                >
                  <Ionicons name="close" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                <View style={styles.clientFormHeaderRow}>
                  <Text style={styles.clientFormHeaderTitle}>Add Additional Charges</Text>
                  <Ionicons name="chevron-up" size={16} color={COLORS.textDark} />
                </View>

                <View style={{ gap: 14, marginTop: 8 }}>
                  <View style={styles.formField}>
                    <Text style={styles.inputLabel}>
                      Business Name <Text style={{ color: COLORS.danger }}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.textInputBox}
                      placeholder="Business Name(Required)"
                      placeholderTextColor="#9CA3AF"
                      value={newBusinessName}
                      onChangeText={setNewBusinessName}
                    />
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.inputLabel}>Client Industry</Text>
                    <TouchableOpacity 
                      style={styles.selectTrigger}
                      onPress={() => setShowIndustrySelectModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.selectTriggerText, !newClientIndustry && styles.selectPlaceholder]}>
                        {newClientIndustry || 'Select an industry'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.inputLabel}>Select Country</Text>
                    <TouchableOpacity 
                      style={styles.selectTrigger}
                      onPress={() => setShowCountrySelectModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.selectTriggerText, !newSelectCountry && styles.selectPlaceholder]}>
                        {newSelectCountry || 'Select Country'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.inputLabel}>City/Town</Text>
                    <TextInput
                      style={styles.textInputBox}
                      placeholder="City/ Town Name"
                      placeholderTextColor="#9CA3AF"
                      value={newCityTown}
                      onChangeText={setNewCityTown}
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.uploadContainer}
                    onPress={handleClientDocumentPick}
                    activeOpacity={0.8}
                  >
                    <View style={styles.uploadBox}>
                      <Ionicons name="cloud-upload-outline" size={22} color={COLORS.primary} />
                      <View style={styles.uploadTextWrapper}>
                        <Text style={styles.uploadTitle}>
                          {newClientAttachment ? newClientAttachment : 'Select a file or drag and drop here'}
                        </Text>
                        <Text style={styles.uploadSub}>JPG, PNG or PDF - max 10MB</Text>
                      </View>
                      <TouchableOpacity style={styles.browseButton} onPress={handleClientDocumentPick}>
                        <Text style={styles.browseButtonText}>Browse</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={[styles.clientAccordionHeader, { marginTop: 16 }]}>
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}
                    onPress={() => setTaxInfoAccordionOpen(!taxInfoAccordionOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.clientAccordionTitle}>Tax Information (Optional)</Text>
                    <Ionicons name={taxInfoAccordionOpen ? "chevron-up" : "chevron-down"} size={16} color={COLORS.textDark} />
                  </TouchableOpacity>
                </View>

                {taxInfoAccordionOpen && (
                  <View style={{ gap: 12, marginTop: 10, paddingHorizontal: 2 }}>
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>GSTIN</Text>
                      <TextInput
                        style={styles.textInputBox}
                        placeholder="GSTIN (Optional)"
                        placeholderTextColor="#9CA3AF"
                        value={newGstNumber}
                        onChangeText={setNewGstNumber}
                      />
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>PAN</Text>
                      <TextInput
                        style={styles.textInputBox}
                        placeholder="PAN (Optional)"
                        placeholderTextColor="#9CA3AF"
                        value={newPanNumber}
                        onChangeText={setNewPanNumber}
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.submitBtn, { marginTop: 24 }]} 
                  onPress={handleSaveNewClient}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitBtnText}>Save</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ── INDUSTRY SELECT MODAL ─────────────────── */}
      {showIndustrySelectModal && (
        <Modal transparent animationType="slide" visible={showIndustrySelectModal}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowIndustrySelectModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitleInline}>Select Industry</Text>
              <ScrollView style={{ paddingHorizontal: 20 }}>
                {INDUSTRIES.map((ind) => (
                  <TouchableOpacity
                    key={ind}
                    style={styles.modalRowItem}
                    onPress={() => {
                      setNewClientIndustry(ind);
                      setShowIndustrySelectModal(false);
                    }}
                  >
                    <Text style={styles.modalRowText}>{ind}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* ── COUNTRY SELECT MODAL ──────────────────── */}
      {showCountrySelectModal && (
        <Modal transparent animationType="slide" visible={showCountrySelectModal}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCountrySelectModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitleInline}>Select Country</Text>
              <ScrollView style={{ paddingHorizontal: 20 }}>
                {COUNTRIES.map((cty) => (
                  <TouchableOpacity
                    key={cty}
                    style={styles.modalRowItem}
                    onPress={() => {
                      setNewSelectCountry(cty);
                      setShowCountrySelectModal(false);
                    }}
                  >
                    <Text style={styles.modalRowText}>{cty}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  clientModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  clientModalTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenIndicatorBar: {
    width: 3.5,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  clientModalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  clientModalCloseBtn: {
    padding: 4,
  },
  clientFormHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
  },
  clientFormHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  clientAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
  },
  clientAccordionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
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
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Steps Progress
  stepTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgWhite,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 20,
  },
  stepTabBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  stepTabActive: {
    backgroundColor: COLORS.primaryLight,
  },
  stepTabCompleted: {
    backgroundColor: '#F3F4F6',
  },
  stepTabInactive: {
    backgroundColor: 'transparent',
  },
  stepBadgeActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  stepBadgeCompleted: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  stepBadgeInactive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  stepBadgeTextInactive: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  stepTextActive: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  stepTextCompleted: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  stepTextInactive: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // Editable Name field
  cardInputBlock: {
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fieldLabelSmall: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  nameInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotationNameInput: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
    padding: 0,
  },

  // Sections
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Cards layout
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  formField: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  selectTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  selectPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  textInputBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '700',
    backgroundColor: '#FFFFFF',
  },
  inputSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  percentSymbol: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginRight: 12,
  },
  percentDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    gap: 4,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Business Detail card header
  cardSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailsList: {
    gap: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  detailsValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Client Selection dropdown
  clientDropdownContainer: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    padding: 10,
    gap: 8,
  },
  searchBarSub: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 34,
  },
  searchBarSubInput: {
    flex: 1,
    fontSize: 11.5,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  addClientBtn: {
    backgroundColor: COLORS.primary,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addClientBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  clientItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  clientItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Item Card
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemIndexBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  itemIndexText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  itemHeading: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  itemHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    padding: 2,
  },

  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },

  addNewLineBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  addNewLineBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Dynamic calculations display
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calcLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  calcValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  totalSumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F3F4F6',
    marginVertical: 4,
  },
  totalSumLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  totalSumValue: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.primary,
  },

  // Total Card Summary (SHOW TOTAL IN PDF)
  totalCardSummary: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Accordions for Summary details
  accordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  accordionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  accordionBody: {
    marginTop: 8,
    paddingHorizontal: 4,
  },

  // Radio button selections inside Discount accordion
  radioChoiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  radioLabelCol: {
    flex: 1,
    gap: 2,
  },
  radioChoiceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  radioChoiceSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  inlineFieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  currencyToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFB',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  currencyToggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  fixedPercentTabsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    height: 32,
    backgroundColor: '#F3F4F6',
  },
  fixedTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedTabActive: {
    backgroundColor: COLORS.primary,
  },
  fixedTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  fixedTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Additional Charges Accordion Body
  additionalChargesSubLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  additionalChargesRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chargeDropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: '#FFFFFF',
  },
  chargeDropdownLeft: {
    gap: 2,
  },
  chargeDropdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  chargeDropdownSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  createNewChargeBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  createNewChargeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },

  // Final total Summary Output
  finalINRSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  finalINRLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  finalINRTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  finalINRValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textDark,
  },

  // Step 2 styles
  step2QuickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 44,
    gap: 6,
  },
  quickActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  pdfOuterFrame: {
    borderWidth: 1.5,
    borderColor: '#C5D6CF',
    borderRadius: 16,
    padding: 1,
    backgroundColor: '#FFFFFF',
  },
  pdfPaperSheet: {
    backgroundColor: '#FAFDFB',
    borderRadius: 14,
    padding: 14,
  },
  pdfHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pdfInvoiceTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  pdfInvoiceSubTitle: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  pdfLogo: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  pdfAddressText: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  pdfDivider: {
    height: 1.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  pdfBillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pdfBillToLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  pdfBillToName: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  pdfTable: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  pdfTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EAF4EE',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pdfTableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pdfCell: {
    fontSize: 9.5,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  pdfTotalsWrapper: {
    alignSelf: 'flex-end',
    width: '60%',
    marginTop: 12,
    gap: 5,
  },
  pdfTotalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pdfTotalLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  pdfTotalVal: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  pdfTermsTitle: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 3,
  },
  pdfTermsText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: '600',
    lineHeight: 11,
  },
  step2StickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgPage,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
  },
  step2BackBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step2DownloadBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  step2DownloadText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  // Upload area
  uploadContainer: {
    marginTop: 6,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D2DDD7',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F8FAFB',
    gap: 10,
  },
  uploadTextWrapper: {
    flex: 1,
    gap: 2,
  },
  uploadTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  uploadSub: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  browseButton: {
    backgroundColor: '#E6ECE9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  browseButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  // Modal selector styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingBottom: 30,
  },
  modalTitleInline: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  submitBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
