import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadDetails, useLeadSources, useLeadStatuses, useLeadTags, useUpdateLead, useUsers } from '@/hooks/useLeads';
import { useCities, useCountries, useStates } from '@/hooks/useLocation';
import { useProducts } from '@/hooks/useProducts';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const COMMON_TAGS = ['Follow-up', 'Urgent', 'Warm Lead', 'Cold Lead', 'Corporate', 'Retail'];

export default function EditLeadScreen() {
  const theme = useTheme();
  const styles = getStyles(theme) as any;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { primaryColor, primaryLight } = useTheme();

  const { data: rawLead, isLoading: isDetailsLoading } = useLeadDetails(id || '');

  const dbLead = React.useMemo(() => {
    if (!rawLead) return null;
    let priority: 'High' | 'Normal' | 'Low' = 'Normal';
    if (rawLead.priority === 'HOT') priority = 'High';
    else if (rawLead.priority === 'WARM') priority = 'Normal';
    else if (rawLead.priority === 'COLD') priority = 'Low';

    const tag = (rawLead.tags && rawLead.tags[0]?.name) || rawLead.tag || '';

    return {
      id: String(rawLead.id),
      name: rawLead.name || '',
      company: rawLead.company_name || rawLead.company || '',
      email: rawLead.email || '',
      phone: rawLead.phone || '',
      tag: tag,
      priority: priority,
      owner: rawLead.assigned_to_name || rawLead.owner || '',
      status: rawLead.status_name || rawLead.status || '',
      source: rawLead.source_name || rawLead.source || '',
      ...rawLead
    } as any;
  }, [rawLead]);
  const { mutateAsync: updateLead, isPending: isUpdating } = useUpdateLead();
  const { data: statusesData } = useLeadStatuses();
  const { data: sourcesData } = useLeadSources();
  const { data: usersData } = useUsers();
  const { data: apiTagsData } = useLeadTags();
  const { data: products = [] } = useProducts();

  const categoriesList = React.useMemo(() => {
    const rawCats = products.map((p: any) => p.category_name).filter(Boolean);
    const uniqueCats = Array.from(new Set(rawCats));
    return uniqueCats.length > 0 ? uniqueCats : ['AYURVEDA', 'BASALT ELECTRONIC AMENITIES', 'BASALT ROOM AMENITIES', 'TOILETRIES'];
  }, [products]);

  // Show All Fields Toggle
  const [showAllFields, setShowAllFields] = useState(true); // Default to true for editing existing profiles

  // Tag Input states
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const tagInputRef = React.useRef<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form States
  const [status, setStatus] = useState('New');
  const [source, setSource] = useState('');
  const [priority, setPriority] = useState('Hot');
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
  const [emailOptOut, setEmailOptOut] = useState(false);

  // Keyboard visibility state
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Sync data from dbLead when loaded
  React.useEffect(() => {
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
      if (dbLead.email_opt_out) setEmailOptOut(!!dbLead.email_opt_out);

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

  // Effect to listen to returns from select screens (owner, company, category)
  React.useEffect(() => {
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

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(modalSearchQuery);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [modalSearchQuery]);

  React.useEffect(() => {
    setModalSearchQuery('');
    setDebouncedSearchQuery('');
  }, [activePicker]);

  // Fetch Country, State, City options from API
  const { data: countriesData } = useCountries(activePicker === 'country' ? debouncedSearchQuery : '');

  const countriesList = React.useMemo(() => Array.isArray(countriesData) ? countriesData : (countriesData?.data || []), [countriesData]);
  const selectedCountryObjForStates = React.useMemo(() => countriesList.find((c: any) => (c.name || c.title || String(c)) === country), [countriesList, country]);
  const effectiveCountryId = countryId || selectedCountryObjForStates?.id || '';

  const { data: statesData } = useStates(effectiveCountryId, activePicker === 'state' ? debouncedSearchQuery : '');

  const statesList = React.useMemo(() => Array.isArray(statesData) ? statesData : (statesData?.data || []), [statesData]);
  const selectedStateObjForCities = React.useMemo(() => statesList.find((s: any) => (s.name || s.title || String(s)) === stateName), [statesList, stateName]);
  const effectiveStateId = stateId || selectedStateObjForCities?.id || '';

  const { data: citiesData } = useCities(effectiveStateId, activePicker === 'city' ? debouncedSearchQuery : '');
  const citiesList = React.useMemo(() => Array.isArray(citiesData) ? citiesData : (citiesData?.data || []), [citiesData]);

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

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed) {
      const newTags = trimmed.split(',').map(t => t.trim()).filter(Boolean);
      const updated = [...selectedTags];
      newTags.forEach(t => {
        if (!updated.includes(t)) {
          updated.push(t);
        }
      });
      setSelectedTags(updated);
      setTagInput('');
    }
  };

  const suggestedTags = React.useMemo(() => {
    const fromApi = (apiTagsData || []).map((t: any) => t.name).filter(Boolean);
    return Array.from(new Set([...fromApi, ...COMMON_TAGS]));
  }, [apiTagsData]);

  const handleUpdate = async () => {
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

    try {
      console.log('Sending lead update payload:', JSON.stringify(payload, null, 2));
      await updateLead({ id: id!, data: payload });
      Alert.alert('Success', 'Lead updated successfully!', [
        {
          text: 'OK', onPress: () => {
            (global as any).leadSelection = {};
            navigation.goBack();
          }
        }
      ]);
    } catch (error: any) {
      console.error('Error updating lead:', error);
      Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to update lead.');
    }
  };

  if (isDetailsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>Loading Details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: primaryColor }}>EDIT </Text>
            <Text style={{ color: COLORS.textDark }}>LEAD PROFILE</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Modify lead information and click update to save.</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

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
                if (text === (dbLead?.company_name || dbLead?.company || '')) {
                  setCompanyId(dbLead?.company_id ? String(dbLead.company_id) : '');
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
                  placeholder="Enter Block / Building / Street Name"
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
                  placeholder="Enter Locality / Area / Landmark"
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
                      Alert.alert('Country Required', 'Please select a Country first.');
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
                      Alert.alert('State Required', 'Please select a State first.');
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
                  keyboardType="numeric"
                  value={pincode}
                  onChangeText={setPincode}
                  maxLength={6}
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

        {/* Save Lead Button inside ScrollView flow */}
        <View style={styles.nonStickySaveContainer}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { borderRadius: 25, height: 50 },
              isUpdating && { opacity: 0.6 }
            ]}
            onPress={handleUpdate}
            activeOpacity={0.85}
            disabled={isUpdating}
          >
            <Text style={styles.saveBtnText}>{isUpdating ? 'Updating...' : 'Update Lead'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

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
                  <Text style={[styles.modalRowText, { color: theme.primaryColor }]}>+ Create Tag "{modalSearchQuery.trim()}"</Text>
                  <Ionicons name="add" size={18} color={theme.primaryColor} />
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
                    <Text style={[styles.modalRowText, isSelected && { color: theme.primaryColor }]}>{opt}</Text>
                    {activePicker === 'tags' ? (
                      isSelected ? (
                        <Ionicons name="checkmark" size={18} color={theme.primaryColor} />
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
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 1,
    marginTop: 1,
    marginBottom: 16,
  },
  toggleCardLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderIndicator: {
    width: 3.5,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 2,
    marginRight: 4,
  },
  sectionHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.5,
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
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  pickerTrigger: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  tagsInputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
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
  tagTextInputInline: {
    flex: 1,
    minWidth: 80,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    padding: 0,
  },
  suggestionsDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionItemHighlighted: {
    backgroundColor: '#F8FAFC',
  },
  suggestionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  nonStickySaveContainer: {
    marginTop: 24,
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
});
