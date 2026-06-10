import { cameraResult, setCameraResult } from '@/components/custom/CameraState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeads, useLeadSources, useLeadStatuses, useLeadTags, useUsers } from '@/hooks/useLeads';
import { useCities, useCountries, useStates } from '@/hooks/useLocation';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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

export default function AddLeadScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const routeParams = useLocalSearchParams<any>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { primaryColor, primaryLight } = useTheme();

  const { createLead, isCreating } = useLeads();
  const { data: statusesData } = useLeadStatuses();
  const { data: sourcesData } = useLeadSources();
  const { data: usersData } = useUsers();
  const { data: apiTagsData } = useLeadTags();

  // Show All Fields Toggle
  const [showAllFields, setShowAllFields] = useState(false);

  // Tag Input states
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
  const [stateName, setStateName] = useState('');
  const [cityName, setCityName] = useState('');
  const [pincode, setPincode] = useState('');
  const [company, setCompany] = useState(''); // Company Name
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

  // Sync default status & source from backend if not set
  React.useEffect(() => {
    if (statusesData && statusesData.length > 0 && !status && !routeParams?.status) {
      const defaultStatus = statusesData.find((s: any) => s.is_default) || statusesData[0];
      setStatus(defaultStatus.name);
    }
  }, [statusesData, routeParams?.status]);

  React.useEffect(() => {
    if (sourcesData && sourcesData.length > 0 && !source && !routeParams?.source) {
      setSource(sourcesData[0].name);
    }
  }, [sourcesData, routeParams?.source]);

  // Fetch Country, State, City options from API
  const { data: countriesData } = useCountries();
  const { data: statesData } = useStates(country);
  const { data: citiesData } = useCities(stateName);

  // Ref to track last parsed routeParams string to prevent reset loops on typing
  const lastParamsStringRef = React.useRef('');
  const currentParamsString = JSON.stringify(routeParams || {});

  React.useEffect(() => {
    if (currentParamsString !== lastParamsStringRef.current) {
      lastParamsStringRef.current = currentParamsString;

      if (routeParams.owner !== undefined) {
        setOwner(prev => routeParams.owner !== prev ? routeParams.owner : prev);
      }
      if (routeParams.ownerId !== undefined) {
        setOwnerId(prev => routeParams.ownerId !== prev ? routeParams.ownerId : prev);
      }
      if (routeParams.company !== undefined) {
        setCompany(prev => routeParams.company !== prev ? routeParams.company : prev);
      }
      if (routeParams.fullname !== undefined) {
        setFullname(prev => routeParams.fullname !== prev ? routeParams.fullname : prev);
      }
      if (routeParams.email !== undefined) {
        setEmail(prev => routeParams.email !== prev ? routeParams.email : prev);
      }
      if (routeParams.phone !== undefined) {
        setPhone(prev => routeParams.phone !== prev ? routeParams.phone : prev);
      }
      if (routeParams.status !== undefined) {
        setStatus(prev => routeParams.status !== prev ? routeParams.status : prev);
      }
      if (routeParams.source !== undefined) {
        setSource(prev => routeParams.source !== prev ? routeParams.source : prev);
      }
      if (routeParams.priority !== undefined) {
        setPriority(prev => routeParams.priority !== prev ? routeParams.priority : prev);
      }
      if (routeParams.tags !== undefined) {
        const parsed = typeof routeParams.tags === 'string'
          ? routeParams.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : Array.isArray(routeParams.tags) ? routeParams.tags : [];
        setSelectedTags(prev => {
          const isSame = parsed.length === prev.length && parsed.every((val: string, index: number) => val === prev[index]);
          return isSame ? prev : parsed;
        });
      }
      if (routeParams.whatsapp !== undefined) {
        setWhatsapp(prev => routeParams.whatsapp !== prev ? routeParams.whatsapp : prev);
      }
      if (routeParams.country !== undefined) {
        setCountry(prev => routeParams.country !== prev ? routeParams.country : prev);
      }
      if (routeParams.stateName !== undefined) {
        setStateName(prev => routeParams.stateName !== prev ? routeParams.stateName : prev);
      }
      if (routeParams.cityName !== undefined) {
        setCityName(prev => routeParams.cityName !== prev ? routeParams.cityName : prev);
      }
      if (routeParams.pincode !== undefined) {
        setPincode(prev => routeParams.pincode !== prev ? routeParams.pincode : prev);
      }
      if (routeParams.propertyType !== undefined) {
        setPropertyType(prev => routeParams.propertyType !== prev ? routeParams.propertyType : prev);
      }
      if (routeParams.businessType !== undefined) {
        setBusinessType(prev => routeParams.businessType !== prev ? routeParams.businessType : prev);
      }
      if (routeParams.designation !== undefined) {
        setDesignation(prev => routeParams.designation !== prev ? routeParams.designation : prev);
      }
      if (routeParams.website !== undefined) {
        setWebsite(prev => routeParams.website !== prev ? routeParams.website : prev);
      }
      if (routeParams.gstNo !== undefined) {
        setGstNo(prev => routeParams.gstNo !== prev ? routeParams.gstNo : prev);
      }
      if (routeParams.interestedCategory !== undefined) {
        setInterestedCategory(prev => routeParams.interestedCategory !== prev ? routeParams.interestedCategory : prev);
      }
      if (routeParams.panNo !== undefined) {
        setPanNo(prev => routeParams.panNo !== prev ? routeParams.panNo : prev);
      }
      if (routeParams.addressLine1 !== undefined) {
        setAddressLine1(prev => routeParams.addressLine1 !== prev ? routeParams.addressLine1 : prev);
      }
      if (routeParams.addressLine2 !== undefined) {
        setAddressLine2(prev => routeParams.addressLine2 !== prev ? routeParams.addressLine2 : prev);
      }
      if (routeParams.expectedRevenue !== undefined) {
        setExpectedRevenue(prev => routeParams.expectedRevenue !== prev ? routeParams.expectedRevenue : prev);
      }
      if (routeParams.remark !== undefined) {
        setRemark(prev => routeParams.remark !== prev ? routeParams.remark : prev);
      }
      if (routeParams.emailOptOut !== undefined) {
        const val = routeParams.emailOptOut === 'true' || routeParams.emailOptOut === true;
        setEmailOptOut(prev => val !== prev ? val : prev);
      }
      if (routeParams.showAllFields !== undefined) {
        const val = routeParams.showAllFields === 'true' || routeParams.showAllFields === true;
        setShowAllFields(prev => val !== prev ? val : prev);
      }
    }
  }, [currentParamsString]);

  // Photo State
  const [photoName, setPhotoName] = useState<string | null>(null);

  React.useEffect(() => {
    if (isFocused && cameraResult && cameraResult.target === 'lead') {
      const uri = cameraResult.uri;
      const pickedName = uri.split('/').pop() || 'photo.jpg';
      setPhotoName(pickedName);
      setCameraResult(null);
    }
  }, [isFocused]);

  const handleImagePick = async (useCamera: boolean) => {
    if (useCamera) {
      router.push({
        pathname: '/camera-capture',
        params: {
          sourceScreen: 'add-lead',
          target: 'lead',
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
        setPhotoName(pickedName);
      }
    } catch (err) {
      console.log('Error picking image:', err);
    }
  };

  const handleDocPick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setPhotoName(res.assets[0].name);
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const handleUploadPress = () => {
    Alert.alert(
      'Upload Attachment',
      'Choose a source for your file:',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImagePick(true),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleImagePick(false),
        },
        {
          text: 'Choose Document',
          onPress: () => handleDocPick(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Picker States
  const [activePicker, setActivePicker] = useState<
    'status' | 'source' | 'country' | 'state' | 'city' | null
  >(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  React.useEffect(() => {
    setModalSearchQuery('');
  }, [activePicker]);

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
      case 'country':
        rawOptions = Array.isArray(countriesData) ? countriesData : (countriesData?.data || []);
        break;
      case 'state':
        rawOptions = Array.isArray(statesData) ? statesData : (statesData?.data || []);
        break;
      case 'city':
        rawOptions = Array.isArray(citiesData) ? citiesData : (citiesData?.data || []);
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
    else if (activePicker === 'country') {
      setCountry(val);
      setStateName('');
      setCityName('');
    } else if (activePicker === 'state') {
      setStateName(val);
      setCityName('');
    } else if (activePicker === 'city') {
      setCityName(val);
    }
    setActivePicker(null);
  };

  const getNavigationParams = (extra: any = {}) => {
    return {
      owner,
      ownerId,
      company,
      fullname,
      email,
      phone,
      status,
      source,
      priority,
      tags: selectedTags.join(', '),
      whatsapp,
      country,
      stateName,
      cityName,
      pincode,
      propertyType,
      businessType,
      designation,
      website,
      gstNo,
      interestedCategory,
      panNo,
      addressLine1,
      addressLine2,
      expectedRevenue,
      remark,
      emailOptOut,
      showAllFields: showAllFields ? 'true' : 'false',
      ...extra
    };
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

  const handleSave = async () => {
    if (!fullname.trim() || !phone.trim() || !owner) {
      Alert.alert('Required Fields', 'Please fill in Name, Phone, and Lead Owner.');
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

    const payload = {
      name: fullname.trim(),
      phone: phone.trim(),
      status_id: selectedStatusObj?.id || null,
      source_id: selectedSourceObj?.id || null,
      email: email.trim() || null,
      alternate_phone: whatsapp.trim() || null,
      address_line1: addressLine1.trim() || null,
      address_line2: addressLine2.trim() || null,
      city_id: null,
      state_id: null,
      country_id: null,
      assigned_to: ownerId ? ownerId : (selectedUserObj?.id || null),
      priority: priority.toUpperCase() === 'HIGH' ? 'HOT' : priority.toUpperCase() === 'NORMAL' ? 'WARM' : 'COLD',
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
    };

    try {
      await createLead(payload);
      Alert.alert('Success', 'Lead created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error creating lead:', error);
      Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to create lead. Please check inputs.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>LEAD</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 48, paddingTop: 5 }}
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
          {/* Lead Owner */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lead Owner</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => router.push({
                pathname: '/(tabs)/leads/select-owner',
                params: getNavigationParams({ currentOwner: owner, currentOwnerId: ownerId })
              })}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !owner && styles.placeholderText]}>
                {owner || 'Enter Lead Owner Name'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Status */}
          {showAllFields && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status</Text>
              <TouchableOpacity
                style={styles.pickerTrigger}
                onPress={() => setActivePicker('status')}
                activeOpacity={0.85}
              >
                <Text style={styles.pickerValueText}>{status || 'New'}</Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Source */}
          {showAllFields && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Source</Text>
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
          )}

          {/* Priority */}
          {showAllFields && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['Hot', 'Warm', 'Cold'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      priority === p && {
                        backgroundColor: p === 'Hot' ? '#FEE2E2' : p === 'Warm' ? '#FEF3C7' : '#E0F2FE',
                        borderColor: p === 'Hot' ? '#EF4444' : p === 'Warm' ? '#F59E0B' : '#0EA5E9',
                      }
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[
                      styles.priorityBtnText,
                      priority === p && {
                        color: p === 'Hot' ? '#B91C1C' : p === 'Warm' ? '#B45309' : '#0369A1'
                      }
                    ]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Company */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => router.push({
                pathname: '/(tabs)/leads/select-company',
                params: getNavigationParams({ currentCompany: company })
              })}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !company && styles.placeholderText]}>
                {company || 'Select Company'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Fullname */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fullname</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Full Name"
              placeholderTextColor="#9CA3AF"
              value={fullname}
              onChangeText={setFullname}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Phone Number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

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
              />
            </View>
          )}

          {/* Tags */}
          {showAllFields && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tags</Text>
              <View style={styles.inputWithIconContainer}>
                <TextInput
                  style={styles.textInputWithIcon}
                  placeholder="Select or enter tags..."
                  placeholderTextColor="#9CA3AF"
                  value={tagInput}
                  onChangeText={(val) => {
                    if (val.endsWith(',')) {
                      const tagText = val.slice(0, -1).trim();
                      if (tagText && !selectedTags.includes(tagText)) {
                        setSelectedTags([...selectedTags, tagText]);
                      }
                      setTagInput('');
                    } else {
                      setTagInput(val);
                    }
                  }}
                  onSubmitEditing={handleAddTag}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={styles.inputRightIconContainer}
                  onPress={handleAddTag}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={22} color={primaryColor} />
                </TouchableOpacity>
              </View>

              {/* Selected Tags Chips */}
              {selectedTags.length > 0 && (
                <View style={styles.chipsContainer}>
                  {selectedTags.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chip, { borderColor: primaryColor, backgroundColor: '#EEF2FF' }]}
                      onPress={() => setSelectedTags(selectedTags.filter(item => item !== t))}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, { color: primaryColor, fontWeight: '700' }]}>{t} ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Suggested Tags */}
              <Text style={[styles.inputLabel, { marginTop: 6, fontSize: 11, color: COLORS.textMuted }]}>
                Suggested Tags
              </Text>
              <View style={styles.chipsContainer}>
                {suggestedTags.map((t) => {
                  const isSelected = selectedTags.includes(t);
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.chip,
                        isSelected && { borderColor: primaryColor, backgroundColor: '#EEF2FF' }
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedTags(selectedTags.filter(s => s !== t));
                        } else {
                          setSelectedTags([...selectedTags, t]);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && { color: primaryColor, fontWeight: '700' }]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
                <TextInput
                  style={styles.textInput}
                  placeholder="Select or enter category..."
                  placeholderTextColor="#9CA3AF"
                  value={interestedCategory}
                  onChangeText={setInterestedCategory}
                />
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

        {/* SECTION HEADER: OTHER DETAILS */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <View style={styles.sectionHeaderIndicator} />
          <Text style={styles.sectionHeaderTitle}>OTHER DETAILS</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.formContainer}>
          {/* Email Opt Out */}
          <View style={styles.optOutRow}>
            <Text style={styles.optOutLabel}>Email Opt Out</Text>
            <Switch
              value={emailOptOut}
              onValueChange={setEmailOptOut}
              trackColor={{ false: '#E2E8F0', true: theme.primaryColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Photo Attachment */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Photo</Text>
            <TouchableOpacity
              style={styles.uploadDropzone}
              onPress={handleUploadPress}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconContainer}>
                <Ionicons name="arrow-up-circle-outline" size={20} color={theme.primaryColor} />
              </View>
              <View style={styles.uploadTextContainer}>
                <Text style={styles.uploadTitleText} numberOfLines={1}>
                  {photoName || 'Select a file or drag and drop here'}
                </Text>
                <Text style={styles.uploadSubText}>JPG, PNG or PDF – max 10MB</Text>
              </View>
              <TouchableOpacity style={styles.browseBtn} activeOpacity={0.8} onPress={handleUploadPress}>
                <Text style={styles.browseBtnText}>Browse</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Save Lead Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { marginTop: 32, borderRadius: 25, height: 50 },
              isCreating && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={isCreating}
          >
            <Text style={styles.saveBtnText}>{isCreating ? 'Saving...' : 'Save Lead'}</Text>
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
                      activePicker === 'country' ? 'Country' :
                        activePicker === 'state' ? 'State' :
                          activePicker === 'city' ? 'City' : 'Value'
                }
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Search Input for Location Picker Modals */}
            {(activePicker === 'country' || activePicker === 'state' || activePicker === 'city') && (
              <View style={styles.modalSearchContainer}>
                <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={`Search ${activePicker === 'country' ? 'Country' :
                    activePicker === 'state' ? 'State' : 'City'
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

            <ScrollView style={{ paddingHorizontal: 20 }}>
              {getPickerOptions().map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => handleSelectOption(opt)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
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
    paddingHorizontal: 20,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 5,
  },
  toggleCardLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Section Header Design
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
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
    gap: 12,
  },
  inputGroup: {
    gap: 6,
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

  // Priority segment styling
  priorityBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Email Opt Out Switch Row
  optOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  optOutLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Dashed upload dropzone styling
  uploadDropzone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
    gap: 5,
  },
  uploadIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextContainer: {
    flex: 1,
    gap: 5,
  },
  uploadTitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  uploadSubText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  browseBtn: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  browseBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
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

  // Modal styles for option selector
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '65%',
    paddingBottom: 24,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: 40,
    marginHorizontal: 20,
    marginBottom: 10,
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
    fontSize: 14.5,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Premium Tags styles
  inputWithIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingRight: 12,
  },
  textInputWithIcon: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  inputRightIconContainer: {
    padding: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {},
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  chipTextActive: {},
});
