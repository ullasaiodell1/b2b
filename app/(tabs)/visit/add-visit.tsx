import { cameraResult, setCameraResult } from '@/components/custom/CameraState';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
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

const COMPANIES = ['Luis Pvt. Ltd.', 'Sherry Pvt. Ltd.', 'Jigar Pvt. Ltd.', 'Parth Pvt. Ltd.'];
const LOCATIONS = ['Western India.', 'South Korea', 'Rajkot, Gujarat', 'Ahmedabad, Gujarat'];
const STATUSES = ['Pending', 'Complete', 'Draft', 'Bounce'];
const SUBJECTS = ['Business Meet', 'Product Pitch', 'Follow-up Visit', 'Technical Support'];

export default function AddVisitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Switch Toggle
  const [showAllFields, setShowAllFields] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('');
  const [subject, setSubject] = useState('');

  // Dropdown Picker Modals
  const [activePicker, setActivePicker] = useState<'company' | 'location' | 'status' | 'subject' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDateObj, setDueDateObj] = useState(new Date());

  // Photo State
  const [photoName, setPhotoName] = useState<string | null>(null);

  React.useEffect(() => {
    if (isFocused && cameraResult && cameraResult.target === 'visit') {
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
          sourceScreen: 'add-visit',
          target: 'visit',
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSelectOption = (value: string) => {
    if (activePicker === 'company') setCompany(value);
    else if (activePicker === 'location') setLocation(value);
    else if (activePicker === 'status') setStatus(value);
    else if (activePicker === 'subject') setSubject(value);
    setActivePicker(null);
  };

  const handleSave = () => {
    if (!title || !subject) {
      Alert.alert('Required Fields', 'Please fill in Title and Subject fields.');
      return;
    }

    Alert.alert('Success', 'Visit detail saved successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const getOptionsList = () => {
    if (activePicker === 'company') return COMPANIES;
    if (activePicker === 'location') return LOCATIONS;
    if (activePicker === 'status') return STATUSES;
    if (activePicker === 'subject') return SUBJECTS;
    return [];
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
            <Text style={{ color: COLORS.textDark }}>VISIT</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Option Switch */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Show All Fields</Text>
          <Switch
            value={showAllFields}
            onValueChange={setShowAllFields}
            trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </View>

        {/* Form Inputs Container */}
        <View style={styles.formContainer}>
          {/* Title input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Title <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Company Name picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Name</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('company')}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !company && styles.placeholderText]}>
                {company || 'Enter Company Name'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Location picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('location')}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !location && styles.placeholderText]}>
                {location || 'Enter Location'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Due Date picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !dueDate && styles.placeholderText]}>
                {dueDate || 'Select Date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDateObj}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) {
                    setDueDateObj(selected);
                    setDueDate(formatDate(selected));
                  }
                }}
              />
            )}
          </View>

          {/* Status picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Status</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('status')}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !status && styles.placeholderText]}>
                {status || 'Enter Status'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Subject * picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Subject <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('subject')}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !subject && styles.placeholderText]}>
                {subject || 'Select Subject'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Photo Dropzone Uploader */}
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
        </View>

      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 10, 16) }]}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      {/* DROPDOWN OPTIONS MODAL */}
      <Modal transparent animationType="slide" visible={activePicker !== null}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActivePicker(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {activePicker ? activePicker.charAt(0).toUpperCase() + activePicker.slice(1) : ''}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {getOptionsList().map((opt) => (
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
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  formContainer: {
    marginTop: 18,
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

  // Dashed upload dropzone styling
  uploadDropzone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    gap: 5,
  },
  uploadIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EAFDF7',
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
    backgroundColor: '#EAFDF7',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  browseBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },

  // Bottom Sticky Bar
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: COLORS.saveBtnBg,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // Modals styling
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
});
