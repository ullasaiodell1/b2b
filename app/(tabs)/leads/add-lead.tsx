import { cameraResult, setCameraResult } from '@/components/custom/CameraState';
import { LeadRecord, leadsState, updateLeadsState } from '@/components/LeadState';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCountries, useStates, useCities } from '@/hooks/useLocation';
import { useLeads, useLeadStatuses, useLeadSources, useUsers } from '@/hooks/useLeads';

export default function AddLeadScreen() {
  const router = useRouter();
  const routeParams = useLocalSearchParams<any>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { createLead, isCreating } = useLeads();
  const { data: statusesData } = useLeadStatuses();
  const { data: sourcesData } = useLeadSources();
  const { data: usersData } = useUsers();

  // Show All Fields Toggle
  const [showAllFields, setShowAllFields] = useState(true);

  // Form States
  const [status, setStatus] = useState('New');
  const [source, setSource] = useState('');
  const [priority, setPriority] = useState('Hot');
  const [owner, setOwner] = useState(''); // Assigned To
  const [tags, setTags] = useState('');
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
  }, [statusesData, routeParams]);

  React.useEffect(() => {
    if (sourcesData && sourcesData.length > 0 && !source && !routeParams?.source) {
      setSource(sourcesData[0].name);
    }
  }, [sourcesData, routeParams]);

  // Fetch Country, State, City options from API
  const { data: countriesData } = useCountries();
  const { data: statesData } = useStates(country);
  const { data: citiesData } = useCities(stateName);

  React.useEffect(() => {
    if (routeParams) {
      if (routeParams.owner !== undefined) setOwner(routeParams.owner);
      if (routeParams.company !== undefined) setCompany(routeParams.company);
      if (routeParams.fullname !== undefined) setFullname(routeParams.fullname);
      if (routeParams.email !== undefined) setEmail(routeParams.email);
      if (routeParams.phone !== undefined) setPhone(routeParams.phone);
      if (routeParams.status !== undefined) setStatus(routeParams.status);
      if (routeParams.source !== undefined) setSource(routeParams.source);
      if (routeParams.priority !== undefined) setPriority(routeParams.priority);
      if (routeParams.tags !== undefined) setTags(routeParams.tags);
      if (routeParams.whatsapp !== undefined) setWhatsapp(routeParams.whatsapp);
      if (routeParams.country !== undefined) setCountry(routeParams.country);
      if (routeParams.stateName !== undefined) setStateName(routeParams.stateName);
      if (routeParams.cityName !== undefined) setCityName(routeParams.cityName);
      if (routeParams.pincode !== undefined) setPincode(routeParams.pincode);
      if (routeParams.propertyType !== undefined) setPropertyType(routeParams.propertyType);
      if (routeParams.businessType !== undefined) setBusinessType(routeParams.businessType);
      if (routeParams.designation !== undefined) setDesignation(routeParams.designation);
      if (routeParams.website !== undefined) setWebsite(routeParams.website);
      if (routeParams.gstNo !== undefined) setGstNo(routeParams.gstNo);
      if (routeParams.interestedCategory !== undefined) setInterestedCategory(routeParams.interestedCategory);
      if (routeParams.panNo !== undefined) setPanNo(routeParams.panNo);
      if (routeParams.addressLine1 !== undefined) setAddressLine1(routeParams.addressLine1);
      if (routeParams.addressLine2 !== undefined) setAddressLine2(routeParams.addressLine2);
      if (routeParams.expectedRevenue !== undefined) setExpectedRevenue(routeParams.expectedRevenue);
      if (routeParams.remark !== undefined) setRemark(routeParams.remark);
      if (routeParams.emailOptOut !== undefined) setEmailOptOut(routeParams.emailOptOut === 'true' || routeParams.emailOptOut === true);
    }
  }, [routeParams]);

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
    // Normalize to string array safely
    return rawOptions.map(opt => typeof opt === 'string' ? opt : opt?.name || opt?.title || String(opt));
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
      company,
      fullname,
      email,
      phone,
      status,
      source,
      priority,
      tags,
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
      ...extra
    };
  };

  const handleSave = async () => {
    if (!fullname || !phone || !owner || !status || !source) {
      Alert.alert('Required Fields', 'Please fill in Name, Phone, Assigned To, Status and Source.');
      return;
    }

    const selectedStatusObj = (statusesData || []).find((s: any) => s.name === status);
    const selectedSourceObj = (sourcesData || []).find((s: any) => s.name === source);
    const selectedUserObj = (usersData || []).find((u: any) => u.name === owner);

    const payload = {
      name: fullname,
      phone: phone,
      status_id: selectedStatusObj?.id || statusesData?.[0]?.id,
      source_id: selectedSourceObj?.id || sourcesData?.[0]?.id,
      email: email || null,
      alternate_phone: whatsapp || null,
      address_line1: addressLine1 || null,
      address_line2: addressLine2 || null,
      city_id: null,
      state_id: null,
      country_id: null,
      assigned_to: selectedUserObj?.id || null,
      priority: priority.toUpperCase() === 'HIGH' ? 'HOT' : priority.toUpperCase() === 'NORMAL' ? 'WARM' : 'COLD',
      company_name: company || null,
      designation: designation || null,
      website: website || null,
      gst_number: gstNo || null,
      pan_number: panNo || null,
      tags: tags ? [tags] : [],
      expected_revenue: expectedRevenue ? parseFloat(expectedRevenue) : null,
      property_type: propertyType || null,
      business_type: businessType || null,
      remarks: remark || null,
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
    <View style={styles.root}>
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
            <Text style={{ color: COLORS.primary }}>ADD </Text>
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
      >
        {/* Switch Card Toggle */}
        <View style={styles.toggleCard}>
          <Text style={styles.toggleCardLabel}>Show All Fields</Text>
          <Switch
            value={showAllFields}
            onValueChange={setShowAllFields}
            trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderIndicator} />
          <Text style={styles.sectionHeaderTitle}>LEAD INFORMATION</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.formContainer}>
          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Status *</Text>
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
            <Text style={styles.inputLabel}>Source *</Text>
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

          {/* Priority */}
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

          {/* Assigned To */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Assigned To *</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => router.push({
                pathname: '/(tabs)/leads/select-owner',
                params: getNavigationParams({ currentOwner: owner })
              })}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !owner && styles.placeholderText]}>
                {owner || 'Select Assignee'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Select or enter tags..."
              placeholderTextColor="#9CA3AF"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Name"
              placeholderTextColor="#9CA3AF"
              value={fullname}
              onChangeText={setFullname}
            />
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Email Address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Phone Number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Conditional Fields below */}
          {showAllFields && (
            <>
              {/* Whatsapp Number */}
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

              {/* Company Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Name</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => router.push({
                    pathname: '/(tabs)/leads/select-company',
                    params: getNavigationParams({ currentCompany: company })
                  })}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.pickerValueText, !company && styles.placeholderText]}>
                    {company || 'Enter Company Name'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

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
                  onChangeText={setGstNo}
                />
              </View>

              {/* Interested Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Interested Category</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Select or enter tags..."
                  placeholderTextColor="#9CA3AF"
                  value={interestedCategory}
                  onChangeText={setInterestedCategory}
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
                  onChangeText={setPanNo}
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

              {/* Email Opt Out */}
              <View style={styles.optOutRow}>
                <Text style={styles.optOutLabel}>Email Opt Out</Text>
                <Switch
                  value={emailOptOut}
                  onValueChange={setEmailOptOut}
                  trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
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
                    <Ionicons name="arrow-up-circle-outline" size={20} color={COLORS.primary} />
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
            </>
          )}

          {/* Save Lead button */}
          <TouchableOpacity
            style={[styles.saveBtn, { marginTop: 32 }, isCreating && { opacity: 0.6 }]}
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
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 5,
    marginBottom: 5,
  },
  sectionHeaderIndicator: {
    width: 3,
    height: 16,
    backgroundColor: COLORS.primary,
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
    gap: 5,
  },
  inputGroup: {
    gap: 5,
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
    shadowColor: '#000000',
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
    maxHeight: '45%',
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
});
