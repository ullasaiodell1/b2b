import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { leadsState, updateLeadsState, LeadRecord } from '@/components/LeadState';
import { useIsFocused } from '@react-navigation/native';
import { cameraResult, setCameraResult } from '@/components/CameraState';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F8FAFC',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E2E8F0',
  danger: '#EF4444',
  saveBtnBg: '#000000',
};

const OWNER_OPTIONS = ['Arjun Maheta', 'Parth Solanki', 'Khushal Nadiyapara', 'Jigar Kalariya'];
const COMPANY_OPTIONS = ['NovaTech Solutions Pvt. Ltd.', 'Zenith System Pvt. Ltd.', 'Jigar Pvt. Ltd.', 'Parth Pvt. Ltd.'];

export default function AddLeadScreen() {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{
    owner?: string;
    company?: string;
    fullname?: string;
    email?: string;
    phone?: string;
  }>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Show All Fields Toggle
  const [showAllFields, setShowAllFields] = useState(true);

  // Form States
  const [owner, setOwner] = useState('');
  const [company, setCompany] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailOptOut, setEmailOptOut] = useState(false);

  React.useEffect(() => {
    if (routeParams?.owner) {
      setOwner(routeParams.owner);
    }
  }, [routeParams?.owner]);

  React.useEffect(() => {
    if (routeParams?.company) {
      setCompany(routeParams.company);
    }
  }, [routeParams?.company]);

  React.useEffect(() => {
    if (routeParams?.fullname) {
      setFullname(routeParams.fullname);
    }
  }, [routeParams?.fullname]);

  React.useEffect(() => {
    if (routeParams?.email) {
      setEmail(routeParams.email);
    }
  }, [routeParams?.email]);

  React.useEffect(() => {
    if (routeParams?.phone) {
      setPhone(routeParams.phone);
    }
  }, [routeParams?.phone]);

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
  const [activePicker, setActivePicker] = useState<'owner' | 'company' | null>(null);

  const handleSelectOption = (val: string) => {
    if (activePicker === 'owner') setOwner(val);
    else if (activePicker === 'company') setCompany(val);
    setActivePicker(null);
  };

  const handleSave = () => {
    if (!fullname || !company || !email || !phone || !owner) {
      Alert.alert('Required Fields', 'Please fill in Owner, Company, Fullname, Email and Phone.');
      return;
    }

    const newLead: LeadRecord = {
      id: String(leadsState.length + 1),
      name: fullname,
      company,
      email,
      phone,
      tag: 'Hardware',
      priority: 'Normal',
      owner,
    };

    updateLeadsState([newLead, ...leadsState]);

    Alert.alert('Success', 'Lead created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
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
        contentContainerStyle={{ paddingBottom: 48, paddingTop: 16 }}
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
          {/* Lead Owner */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lead Owner</Text>
            <TouchableOpacity 
              style={styles.pickerTrigger}
              onPress={() => router.push({
                pathname: '/(tabs)/leads/select-owner',
                params: { 
                  currentOwner: owner,
                  company,
                  fullname,
                  email,
                  phone
                }
              })}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !owner && styles.placeholderText]}>
                {owner || 'Enter Lead Owner Name'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Company */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company</Text>
            <TouchableOpacity 
              style={styles.pickerTrigger}
              onPress={() => router.push({
                pathname: '/(tabs)/leads/select-company',
                params: { 
                  currentCompany: company,
                  owner,
                  fullname,
                  email,
                  phone
                }
              })}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !company && styles.placeholderText]}>
                {company || 'Enter Company Name'}
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
              placeholder="Enter Email Address"
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

          {/* Email Opt Out - Conditional */}
          {showAllFields && (
            <View style={styles.optOutRow}>
              <Text style={styles.optOutLabel}>Email Opt Out</Text>
              <Switch
                value={emailOptOut}
                onValueChange={setEmailOptOut}
                trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}

          {/* Photo Uploader - Conditional */}
          {showAllFields && (
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
          )}

          {/* Save Lead button at the end of the form content */}
          <TouchableOpacity 
            style={[styles.saveBtn, { marginTop: 32 }]} 
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save Lead</Text>
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
                Select {activePicker === 'owner' ? 'Lead Owner' : 'Company'}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(
                activePicker === 'owner' ? OWNER_OPTIONS : COMPANY_OPTIONS
              ).map((opt) => (
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
    marginTop: 16,
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
    marginTop: 24,
    marginBottom: 16,
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
    gap: 16,
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

  // Email Opt Out Switch Row
  optOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
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
    gap: 10,
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
    gap: 2,
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

  // Bottom Sticky Bar

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
