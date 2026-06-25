import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadSources, useLeadStatuses, useLeadTags, useUsers } from '@/hooks/useLeads';
import { useCities, useCountries, useStates } from '@/hooks/useLocation';
import { useProducts } from '@/hooks/useProducts';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet
} from 'react-native';

const COMMON_TAGS = ['Follow-up', 'Urgent', 'Warm Lead', 'Cold Lead', 'Corporate', 'Retail'];

export interface LeadFormComponentProps {
  initialData?: any; // Raw lead details
  onSubmit: (payload: any) => Promise<void>;
  isPending: boolean;
  submitButtonText: string;
  defaultShowAllFields?: boolean;
}

export default function LeadFormComponent({
  initialData,
  onSubmit,
  isPending,
  submitButtonText,
  defaultShowAllFields = false
}: LeadFormComponentProps) {
  const theme = useTheme();
  const styles = getStyles(theme) as any;
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { primaryColor } = theme;

  const { data: statusesData } = useLeadStatuses();
  const { data: sourcesData } = useLeadSources();
  const { data: usersData } = useUsers();
  const { data: apiTagsData } = useLeadTags();
  const { data: products = [] } = useProducts();

  const categoriesList = useMemo(() => {
    const rawCats = products.map((p: any) => p.category_name).filter(Boolean);
    const uniqueCats = Array.from(new Set(rawCats));
    return uniqueCats.length > 0 ? uniqueCats : ['AYURVEDA', 'BASALT ELECTRONIC AMENITIES', 'BASALT ROOM AMENITIES', 'TOILETRIES'];
  }, [products]);

  // Show All Fields Toggle
  const [showAllFields, setShowAllFields] = useState(defaultShowAllFields);

  // Tag Input states
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Form States
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [priority, setPriority] = useState('');
  const [owner, setOwner] = useState(''); // Assigned To Name
  const [ownerId, setOwnerId] = useState(''); // Assigned To ID
  const [fullname, setFullname] = useState(''); // Name
  const [email, setEmail] = useState(''); // Email Address
  const [phone, setPhone] = useState(''); // Phone
  const [whatsapp, setWhatsapp] = useState('');
  const [country, setCountry] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateName, setStateName] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityName, setCityName] = useState('');
  const [cityId, setCityId] = useState('');
  const [pincode, setPincode] = useState('');
  const [company, setCompany] = useState(''); // Company Name
  const [companyId, setCompanyId] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [designation, setDesignation] = useState('');
  const [website, setWebsite] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [interestedCategory, setInterestedCategory] = useState('');
  const [panNo, setPanNo] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [expectedRevenue, setExpectedRevenue] = useState('');
  const [remark, setRemark] = useState('');

  // Keyboard visibility state
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
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

  const dbLead = useMemo(() => {
    if (!initialData) return null;
    let priorityVal: 'High' | 'Normal' | 'Low' = 'Normal';
    if (initialData.priority === 'HOT') priorityVal = 'High';
    else if (initialData.priority === 'WARM') priorityVal = 'Normal';
    else if (initialData.priority === 'COLD') priorityVal = 'Low';

    const tag = (initialData.tags && initialData.tags[0]?.name) || initialData.tag || '';

    return {
      id: String(initialData.id),
      name: initialData.name || '',
      company: initialData.company_name || initialData.company || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      tag: tag,
      priority: priorityVal,
      owner: initialData.assigned_to_name || initialData.owner || '',
      status: initialData.status_name || initialData.status || '',
      source: initialData.source_name || initialData.source || '',
      ...initialData
    } as any;
  }, [initialData]);

  // Sync data from dbLead when loaded
  useEffect(() => {
    if (dbLead && !isInitialized) {
      setIsInitialized(true);
      if (dbLead.status) setStatus(dbLead.status);
      if (dbLead.source) setSource(dbLead.source);
      if (dbLead.priority) {
        const p = dbLead.priority;
        setPriority(p === 'High' ? 'Hot' : p === 'Normal' ? 'Warm' : 'Cold');
      }
      if (dbLead.owner) setOwner(dbLead.owner);
      if (dbLead.assigned_to) setOwnerId(String(dbLead.assigned_to));
      if (dbLead.name) setFullname(dbLead.name);
      if (dbLead.email) setEmail(dbLead.email);
      if (dbLead.phone) setPhone(dbLead.phone);
      if (dbLead.alternate_phone) setWhatsapp(dbLead.alternate_phone);
      if (dbLead.country_name || dbLead.country) setCountry(dbLead.country_name || dbLead.country);
      if (dbLead.country_id) setCountryId(dbLead.country_id);
      if (dbLead.state_name || dbLead.state) setStateName(dbLead.state_name || dbLead.state);
      if (dbLead.state_id) setStateId(dbLead.state_id);
      if (dbLead.city_name || dbLead.city) setCityName(dbLead.city_name || dbLead.city);
      if (dbLead.city_id) setCityId(dbLead.city_id);
      if (dbLead.pincode) setPincode(dbLead.pincode);
      if (dbLead.company_name || dbLead.company) setCompany(dbLead.company_name || dbLead.company);
      if (dbLead.company_id) setCompanyId(String(dbLead.company_id));
      if (dbLead.property_type) setPropertyType(dbLead.property_type);
      if (dbLead.business_type) setBusinessType(dbLead.business_type);
      if (dbLead.designation) setDesignation(dbLead.designation);
      if (dbLead.website) setWebsite(dbLead.website);
      if (dbLead.gst_number) setGstNo(dbLead.gst_number);
      if (dbLead.pan_number) setPanNo(dbLead.pan_number);
      if (dbLead.expected_revenue) setExpectedRevenue(String(dbLead.expected_revenue));
      if (dbLead.remarks) setRemark(dbLead.remarks);
      if (dbLead.address_line1) setAddressLine1(dbLead.address_line1);
      if (dbLead.address_line2) setAddressLine2(dbLead.address_line2);

      // Extract unique categories (interested_category_id is JSONB array)
      const cats = dbLead.interested_category_id;
      if (Array.isArray(cats) && cats.length > 0) {
        setInterestedCategory(cats[0]);
      }

      // Extract tags
      if (Array.isArray(dbLead.tags)) {
        const dbTags = dbLead.tags.map((t: any) => t.name || t);
        setSelectedTags(dbTags);
      }
    }
  }, [dbLead, isInitialized]);

  // Sync defaults for creation screen (if not editing)
  useEffect(() => {
    if (!dbLead) {
      if (statusesData && statusesData.length > 0 && !status) {
        const defaultStatus = statusesData.find((s: any) => s.is_default) || statusesData[0];
        setStatus(defaultStatus.name);
      }
    }
  }, [statusesData, dbLead]);

  useEffect(() => {
    if (!dbLead) {
      if (sourcesData && sourcesData.length > 0 && !source) {
        setSource(sourcesData[0].name);
      }
    }
  }, [sourcesData, dbLead]);

  // Effect to listen to returns from select screens (owner, company, category)
  useEffect(() => {
    if (isFocused) {
      const selection = (global as any).leadSelection;
      if (selection) {
        if (selection.owner !== undefined) {
          setOwner(selection.owner);
        }
        if (selection.ownerId !== undefined) {
          setOwnerId(selection.ownerId);
        }
        if (selection.company !== undefined) {
          setCompany(selection.company);
        }
        if (selection.companyId !== undefined) {
          setCompanyId(selection.companyId);
        }
        if (selection.interestedCategory !== undefined) {
          setInterestedCategory(selection.interestedCategory);
        }
        // Clear selection once consumed
        (global as any).leadSelection = {};
      }
    }
  }, [isFocused]);

  // Picker States
  const [activePicker, setActivePicker] = useState<
    'status' | 'source' | 'priority' | 'country' | 'state' | 'city' | 'interestedCategory' | 'tags' | null
  >(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(modalSearchQuery);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [modalSearchQuery]);

  useEffect(() => {
    setModalSearchQuery('');
    setDebouncedSearchQuery('');
  }, [activePicker]);

  // Fetch Country, State, City options from API
  const { data: countriesData } = useCountries(activePicker === 'country' ? debouncedSearchQuery : '');

  const countriesList = useMemo(() => Array.isArray(countriesData) ? countriesData : (countriesData?.data || []), [countriesData]);
  const selectedCountryObjForStates = useMemo(() => countriesList.find((c: any) => (c.name || c.title || String(c)) === country), [countriesList, country]);
  const effectiveCountryId = countryId || selectedCountryObjForStates?.id || '';

  const { data: statesData } = useStates(effectiveCountryId, activePicker === 'state' ? debouncedSearchQuery : '');

  const statesList = useMemo(() => Array.isArray(statesData) ? statesData : (statesData?.data || []), [statesData]);
  const selectedStateObjForCities = useMemo(() => statesList.find((s: any) => (s.name || s.title || String(s)) === stateName), [statesList, stateName]);
  const effectiveStateId = stateId || selectedStateObjForCities?.id || '';

  const { data: citiesData } = useCities(effectiveStateId, activePicker === 'city' ? debouncedSearchQuery : '');
  const citiesList = useMemo(() => Array.isArray(citiesData) ? citiesData : (citiesData?.data || []), [citiesData]);

  const getPickerOptions = () => {
    let rawOptions: any[] = [];
    switch (activePicker) {
      case 'status':
        rawOptions = statusesData && statusesData.length > 0
          ? statusesData
          : ['New', 'Contacted', 'Qualified', 'Unqualified', 'Lost'];
        break;
      case 'source':
        rawOptions = sourcesData && sourcesData.length > 0
          ? sourcesData
          : ['Website', 'Referral', 'Social Media', 'Cold Call', 'Exhibition', 'Self', 'Reference'];
        break;
      case 'priority':
        rawOptions = ['Hot', 'Warm', 'Cold'];
        break;
      case 'country':
        rawOptions = Array.isArray(countriesData) ? countriesData : (countriesData?.data || []);
        break;
      case 'state':
        rawOptions = Array.isArray(statesData) ? statesData : (statesData?.data || []);
        break;
      case 'city':
        rawOptions = Array.isArray(citiesData) ? citiesData : (citiesData?.data || []);
        break;
      case 'interestedCategory':
        rawOptions = categoriesList;
        break;
      case 'tags':
        rawOptions = suggestedTags;
        break;
      default:
        rawOptions = [];
    }
    const mapped = rawOptions.map(opt => typeof opt === 'string' ? opt : opt?.name || opt?.title || String(opt));
    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase().trim();
      return mapped.filter((opt: string) => opt.toLowerCase().includes(q));
    }
    return mapped;
  };

  const handleSelectOption = (val: string) => {
    if (activePicker === 'status') setStatus(val);
    else if (activePicker === 'source') setSource(val);
    else if (activePicker === 'priority') setPriority(val);
    else if (activePicker === 'country') {
      const selectedObj = countriesList.find((c: any) => (c.name || c.title || String(c)) === val);
      setCountry(val);
      setCountryId(selectedObj?.id || '');
      setStateName('');
      setStateId('');
      setCityName('');
      setCityId('');
    } else if (activePicker === 'state') {
      const selectedObj = statesList.find((s: any) => (s.name || s.title || String(s)) === val);
      setStateName(val);
      setStateId(selectedObj?.id || '');
      setCityName('');
      setCityId('');
    } else if (activePicker === 'city') {
      const selectedObj = citiesList.find((c: any) => (c.name || c.title || String(c)) === val);
      setCityName(val);
      setCityId(selectedObj?.id || '');
    } else if (activePicker === 'interestedCategory') {
      setInterestedCategory(val);
    }
    setActivePicker(null);
  };

  const suggestedTags = useMemo(() => {
    const fromApi = (apiTagsData || []).map((t: any) => t.name).filter(Boolean);
    return Array.from(new Set([...fromApi, ...COMMON_TAGS]));
  }, [apiTagsData]);

  const handleSubmit = async () => {
    if (!status || !source || !fullname.trim() || !phone.trim() || !email.trim() || !company.trim() || !owner.trim()) {
      Alert.alert('Required Fields', 'Please fill in Status, Source, Assigned To, Fullname, Phone, Email, and Company.');
      return;
    }

    if (phone.trim().length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    if (whatsapp.trim() && whatsapp.trim().length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit whatsapp number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (gstNo.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstRegex.test(gstNo.trim())) {
        Alert.alert('Validation Error', 'Invalid GST number format. Example: 22ABCDE1234F1Z5');
        return;
      }
    }

    if (panNo.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!panRegex.test(panNo.trim())) {
        Alert.alert('Validation Error', 'Invalid PAN number format. Example: ABCDE1234F');
        return;
      }
    }

    const selectedStatusObj = (statusesData || []).find((s: any) => s.name === status) || statusesData?.[0];
    const selectedSourceObj = (sourcesData || []).find((s: any) => s.name === source) || sourcesData?.[0];
    const selectedUserObj = (usersData || []).find((u: any) => u.name === owner);

    const selectedCountryObj = countriesList.find((c: any) => (c.name || c.title || String(c)) === country);
    const selectedStateObj = statesList.find((s: any) => (s.name || s.title || String(s)) === stateName);
    const selectedCityObj = citiesList.find((c: any) => (c.name || c.title || String(c)) === cityName);

    const payload = {
      name: fullname.trim(),
      phone: phone.trim(),
      status_id: selectedStatusObj?.id || null,
      source_id: selectedSourceObj?.id || null,
      email: email.trim() || null,
      alternate_phone: whatsapp.trim() || null,
      address_line1: addressLine1.trim() || null,
      address_line2: addressLine2.trim() || null,
      city_id: cityId || selectedCityObj?.id || null,
      state_id: effectiveStateId || selectedStateObj?.id || null,
      country_id: effectiveCountryId || selectedCountryObj?.id || null,
      assigned_to: ownerId ? ownerId : (selectedUserObj?.id || null),
      priority: (priority.toUpperCase() === 'HOT' || priority.toUpperCase() === 'HIGH') ? 'HOT' : (priority.toUpperCase() === 'WARM' || priority.toUpperCase() === 'NORMAL') ? 'WARM' : 'COLD',
      company_name: company.trim() || null,
      designation: designation.trim() || null,
      website: website.trim() || null,
      gst_number: gstNo.trim() || null,
      pan_number: panNo.trim() || null,
      tags: selectedTags,
      expected_revenue: expectedRevenue ? parseFloat(expectedRevenue) : null,
      property_type: propertyType.trim() || null,
      business_type: businessType.trim() || null,
      remarks: remark.trim() || null,
      interested_category_id: interestedCategory ? [interestedCategory] : [],
    };

    await onSubmit(payload);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: keyboardVisible ? 250 : 30, paddingTop: 5 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Switch Card Toggle */}
      <View style={styles.toggleCard}>
        <Text style={styles.toggleCardLabel}>Show All Fields</Text>
        <Switch
          value={showAllFields}
          onValueChange={setShowAllFields}
          trackColor={{ false: '#E2E8F0', true: primaryColor }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* SECTION HEADER: LEAD INFORMATION */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderIndicator} />
        <Text style={styles.sectionHeaderTitle}>LEAD INFORMATION</Text>
        <View style={styles.sectionHeaderLine} />
      </View>

      <View style={styles.formContainer}>
        {/* Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Status <Text style={{ color: COLORS.danger }}>*</Text></Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => setActivePicker('status')}
            activeOpacity={0.85}
          >
            <Text style={styles.pickerValueText}>{status || 'New'}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Source */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Source <Text style={{ color: COLORS.danger }}>*</Text></Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => setActivePicker('source')}
            activeOpacity={0.85}
          >
            <Text style={[styles.pickerValueText, !source && styles.placeholderText]}>
              {source || 'Select Source'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Assigned To */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Assigned To <Text style={{ color: COLORS.danger }}>*</Text></Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => navigation.navigate('select-owner' as any, {
              currentOwner: owner, currentOwnerId: ownerId
            })}
            activeOpacity={0.85}
          >
            <Text style={[styles.pickerValueText, !owner && styles.placeholderText]}>
              {owner || 'Select Assigned User'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Fullname */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fullname <Text style={{ color: COLORS.danger }}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Full Name"
            placeholderTextColor="#9CA3AF"
            value={fullname}
            onChangeText={setFullname}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone <Text style={{ color: COLORS.danger }}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Phone Number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email <Text style={{ color: COLORS.danger }}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Company */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Company <Text style={{ color: COLORS.danger }}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Company Name"
            placeholderTextColor="#9CA3AF"
            value={company}
            onChangeText={(text) => {
              setCompany(text);
              if (dbLead && text === (dbLead.company_name || dbLead.company || '')) {
                setCompanyId(dbLead.company_id ? String(dbLead.company_id) : '');
              } else {
                setCompanyId('');
              }
            }}
          />
        </View>

        {/* Priority */}
        {showAllFields && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Priority</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('priority')}
              activeOpacity={0.85}
            >
              <Text style={styles.pickerValueText}>{priority || 'Select Priority'}</Text>
              <Ionicons name="chevron-expand" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Whatsapp Number */}
        {showAllFields && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Whatsapp Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Whatsapp Number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
              maxLength={10}
            />
          </View>
        )}

        {/* Tags */}
        {showAllFields && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags</Text>
            <TouchableOpacity
              style={[styles.pickerTrigger, { height: undefined, minHeight: 48 }]}
              onPress={() => setActivePicker('tags')}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 4 }}>
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <View key={tag} style={[styles.tagChipInline, { marginVertical: 2 }]}>
                      <Text style={styles.tagChipInlineText}>{tag}</Text>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close" size={14} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.placeholderText}>Select or enter tags...</Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* SECTION HEADER: COMPANY & LOCATION */}
      {showAllFields && (
        <>
          <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
            <View style={styles.sectionHeaderIndicator} />
            <Text style={styles.sectionHeaderTitle}>COMPANY & LOCATION</Text>
            <View style={styles.sectionHeaderLine} />
          </View>
          <View style={styles.formContainer}>
            {/* Property Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Property Type</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter property type (e.g. Hotel, Resort)"
                placeholderTextColor="#9CA3AF"
                value={propertyType}
                onChangeText={setPropertyType}
              />
            </View>

            {/* Business Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Type</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter business type (e.g. Retailer, Wholesaler)"
                placeholderTextColor="#9CA3AF"
                value={businessType}
                onChangeText={setBusinessType}
              />
            </View>

            {/* Designation */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Designation</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Designation"
                placeholderTextColor="#9CA3AF"
                value={designation}
                onChangeText={setDesignation}
              />
            </View>

            {/* Website */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Website URL"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                value={website}
                onChangeText={setWebsite}
              />
            </View>

            {/* GST Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>GST Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter GST Number"
                placeholderTextColor="#9CA3AF"
                value={gstNo}
                onChangeText={(text) => setGstNo(text.toUpperCase())}
                autoCapitalize="characters"
                keyboardType="default"
                maxLength={15}
              />
            </View>

            {/* PAN Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PAN Card Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter PAN Number"
                placeholderTextColor="#9CA3AF"
                value={panNo}
                onChangeText={(text) => setPanNo(text.toUpperCase())}
                autoCapitalize="characters"
                keyboardType="default"
                maxLength={10}
              />
            </View>

            {/* Address Line 1 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 1</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Address Line 1"
                placeholderTextColor="#9CA3AF"
                value={addressLine1}
                onChangeText={setAddressLine1}
              />
            </View>

            {/* Address Line 2 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 2</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Address Line 2"
                placeholderTextColor="#9CA3AF"
                value={addressLine2}
                onChangeText={setAddressLine2}
              />
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <TouchableOpacity
                style={styles.pickerTrigger}
                onPress={() => setActivePicker('country')}
                activeOpacity={0.85}
              >
                <Text style={[styles.pickerValueText, !country && styles.placeholderText]}>
                  {country || 'Select Country'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* State */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State</Text>
              <TouchableOpacity
                style={styles.pickerTrigger}
                onPress={() => {
                  if (!country) {
                    Alert.alert('Selection Required', 'Please select Country first');
                    return;
                  }
                  setActivePicker('state');
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.pickerValueText, !stateName && styles.placeholderText]}>
                  {stateName || (country ? 'Select State' : 'Select Country first')}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <TouchableOpacity
                style={styles.pickerTrigger}
                onPress={() => {
                  if (!stateName) {
                    Alert.alert('Selection Required', 'Please select State first');
                    return;
                  }
                  setActivePicker('city');
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.pickerValueText, !cityName && styles.placeholderText]}>
                  {cityName || (stateName ? 'Select City' : 'Select State first')}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Pincode */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Pincode"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={pincode}
                onChangeText={setPincode}
              />
            </View>
          </View>
        </>
      )}

      {/* SECTION HEADER: REVENUE & EXTRA DETAILS */}
      {showAllFields && (
        <>
          <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
            <View style={styles.sectionHeaderIndicator} />
            <Text style={styles.sectionHeaderTitle}>REVENUE & EXTRA DETAILS</Text>
            <View style={styles.sectionHeaderLine} />
          </View>
          <View style={styles.formContainer}>
            {/* Expected Revenue */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Revenue</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Expected Revenue"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={expectedRevenue}
                onChangeText={setExpectedRevenue}
              />
            </View>

            {/* Interested Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Interested Category</Text>
              <TouchableOpacity
                style={styles.pickerTrigger}
                onPress={() => navigation.navigate('select-category' as any, {
                  currentCategory: interestedCategory
                })}
                activeOpacity={0.85}
              >
                <Text style={[styles.pickerValueText, !interestedCategory && styles.placeholderText]}>
                  {interestedCategory || 'Select Category'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Remark */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Remark</Text>
              <TextInput
                style={[styles.textInput, { height: 96, paddingTop: 12 }]}
                placeholder="Enter Remark"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={remark}
                onChangeText={setRemark}
              />
            </View>
          </View>
        </>
      )}

      {/* Save/Update Button */}
      <View style={styles.nonStickySaveContainer}>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { borderRadius: 25, height: 50 },
            isPending && { opacity: 0.6 }
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isPending}
        >
          <Text style={styles.saveBtnText}>{isPending ? 'Processing...' : submitButtonText}</Text>
        </TouchableOpacity>
      </View>

      {/* PICKER MODALS */}
      <Modal transparent animationType="slide" visible={activePicker !== null}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActivePicker(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {
                  activePicker === 'status' ? 'Status' :
                    activePicker === 'source' ? 'Source' :
                      activePicker === 'priority' ? 'Priority' :
                        activePicker === 'country' ? 'Country' :
                          activePicker === 'state' ? 'State' :
                            activePicker === 'city' ? 'City' :
                              activePicker === 'tags' ? 'Tags' :
                                activePicker === 'interestedCategory' ? 'Interested Category' : 'Value'
                }
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Search Input for Location Picker Modals */}
            {(activePicker === 'country' || activePicker === 'state' || activePicker === 'city' || activePicker === 'tags') && (
              <View style={styles.modalSearchContainer}>
                <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={`Search ${activePicker === 'country' ? 'Country' :
                    activePicker === 'state' ? 'State' :
                      activePicker === 'tags' ? 'Tags' : 'City'
                    }...`}
                  placeholderTextColor="#9CA3AF"
                  value={modalSearchQuery}
                  onChangeText={setModalSearchQuery}
                  autoCorrect={false}
                  autoComplete="off"
                />
                {modalSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setModalSearchQuery('')} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView style={{ paddingHorizontal: 24 }}>
              {activePicker === 'tags' && modalSearchQuery.trim() !== '' && !suggestedTags.some(t => t.toLowerCase() === modalSearchQuery.toLowerCase().trim()) && (
                <TouchableOpacity
                  style={styles.modalRowItem}
                  onPress={() => {
                    const newTag = modalSearchQuery.trim();
                    if (!selectedTags.includes(newTag)) {
                      setSelectedTags([...selectedTags, newTag]);
                    }
                    setModalSearchQuery('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalRowText, { color: primaryColor }]}>+ Create Tag "{modalSearchQuery.trim()}"</Text>
                  <Ionicons name="add" size={18} color={primaryColor} />
                </TouchableOpacity>
              )}
              {getPickerOptions().map((opt) => {
                const isSelected = (activePicker === 'status' && status === opt) ||
                  (activePicker === 'source' && source === opt) ||
                  (activePicker === 'priority' && priority === opt) ||
                  (activePicker === 'country' && country === opt) ||
                  (activePicker === 'state' && stateName === opt) ||
                  (activePicker === 'city' && cityName === opt) ||
                  (activePicker === 'interestedCategory' && interestedCategory === opt) ||
                  (activePicker === 'tags' && selectedTags.includes(opt));
                return (
                  <TouchableOpacity
                    key={opt}
                    style={styles.modalRowItem}
                    onPress={() => {
                      if (activePicker === 'tags') {
                        if (selectedTags.includes(opt)) {
                          setSelectedTags(selectedTags.filter(t => t !== opt));
                        } else {
                          setSelectedTags([...selectedTags, opt]);
                        }
                      } else {
                        handleSelectOption(opt);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalRowText, isSelected && { color: primaryColor }]}>{opt}</Text>
                    {activePicker === 'tags' ? (
                      isSelected ? (
                        <Ionicons name="checkmark" size={18} color={primaryColor} />
                      ) : (
                        <Ionicons name="add" size={18} color="#94A3B8" />
                      )
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                    )}
                  </TouchableOpacity>
                );
              })}
              {getPickerOptions().length === 0 && (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 13.5, fontWeight: '600' }}>
                    No matches found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 1,
    marginTop: 1,
    marginBottom: 16,
  },
  toggleCardLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 16,
  },
  sectionHeaderIndicator: {
    width: 3,
    height: 16,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 12,
  },
  formContainer: {
    gap: 1,
    paddingBottom: 8,
  },
  inputGroup: {
    gap: 3,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 13.5,
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
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  pickerValueText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  tagChipInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  tagChipInlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  saveBtn: {
    backgroundColor: COLORS.saveBtnBg,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    height: 46,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalRowText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  nonStickySaveContainer: {
    marginTop: 24,
  },
});
