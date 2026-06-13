import { cameraResult, setCameraResult } from '@/components/custom/CameraState';
import { CustomTimePicker } from '@/components/custom/CustomTimePicker';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateVisit } from '@/hooks/useVisits';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VISIT_TYPE_OPTIONS = [
  { label: 'Site Visit', icon: 'map-outline' as const },
  { label: 'Business Meet', icon: 'briefcase-outline' as const },
  { label: 'Product Pitch', icon: 'trending-up-outline' as const },
  { label: 'Follow-up', icon: 'repeat-outline' as const },
  { label: 'Technical Support', icon: 'build-outline' as const },
];

export default function AddVisitScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams<{ leadId?: string }>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const createVisitMutation = useCreateVisit();
  const { primaryColor, primaryLight } = useTheme();

  // Form States
  const [title, setTitle] = useState('');
  const [visitType, setVisitType] = useState('Site Visit');
  const [scheduledDateTime, setScheduledDateTime] = useState<Date>(new Date());
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [outcomeSummary, setOutcomeSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  // Location States
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  // Picker Visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Keyboard visibility state
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  // Auto-fetch location on screen load
  useEffect(() => {
    fetchLocation();
  }, []);

  // Sync camera capture results
  useEffect(() => {
    if (isFocused && cameraResult && cameraResult.target === 'visit') {
      const uri = cameraResult.uri;
      const pickedName = uri.split('/').pop() || 'photo.jpg';
      setImageUri(uri);
      setPhotoName(pickedName);
      setCameraResult(null);
    }
  }, [isFocused]);

  const fetchLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermissionGranted(false);
        setLocationError('Permission to access location was denied');
        setLocationLoading(false);
        return;
      }
      setLocationPermissionGranted(true);
      const locResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = locResult.coords;
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
    } catch (err: any) {
      console.log('Error fetching location:', err);
      setLocationError(err?.message || 'Failed to fetch location');
    } finally {
      setLocationLoading(false);
    }
  };

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
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedName = result.assets[0].fileName || result.assets[0].uri.split('/').pop() || 'photo.jpg';
        setImageUri(result.assets[0].uri);
        setPhotoName(pickedName);
      }
    } catch (err) {
      console.log('Error picking image:', err);
    }
  };

  const handleUploadPress = () => {
    Alert.alert(
      'Upload Visit Image',
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
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const formatDateTime = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const hrs = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${d}-${m}-${y} ${hrs}:${mins}`;
  };

  const formatLatitude = (lat: number) => {
    const dir = lat >= 0 ? 'N' : 'S';
    return `${Math.abs(lat).toFixed(4)}° ${dir}`;
  };

  const formatLongitude = (lng: number) => {
    const dir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lng).toFixed(4)}° ${dir}`;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a Visit Title.');
      return;
    }
    if (!visitType) {
      Alert.alert('Required', 'Please select a Visit Type.');
      return;
    }

    const scheduledStr = formatDateTime(scheduledDateTime);
    const latStr = latitude !== null ? formatLatitude(latitude) : '0.0000° N';
    const lngStr = longitude !== null ? formatLongitude(longitude) : '0.0000° E';

    try {
      await createVisitMutation.mutateAsync({
        leadId: params.leadId || undefined,
        name: title,
        visitType: visitType,
        scheduledDateTime: scheduledStr,
        imageUri: imageUri || undefined,
        description: description,
        locationAddress: locationAddress,
        lat: latStr,
        lng: lngStr,
        status: 'Pending',
        contactPersonName: contactPersonName,
        designation: designation,
        phone: phone,
        outcomeSummary: outcomeSummary,
        nextSteps: nextSteps,
      });

      Alert.alert('Success', 'Visit detail saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error('[AddVisit] save error:', err);
      Alert.alert('Error', err?.message || 'Failed to save visit.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
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
            <Text style={{ color: primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>VISIT</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: keyboardVisible ? 220 : 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>

          {/* Title input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Title <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Visit title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Visit Type Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Visit Type <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Site Visit, Meeting, etc."
              placeholderTextColor="#9CA3AF"
              value={visitType}
              onChangeText={setVisitType}
            />
          </View>

          {/* Scheduled Date & Time Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Scheduled Date & Time <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.pickerValueText}>
                {formatDateTime(scheduledDateTime)}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* DateTimepicker modals */}
            {showDatePicker && (
              Platform.OS === 'ios' ? (
                <Modal transparent animationType="fade" visible={showDatePicker}>
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Select Date</Text>
                      <DateTimePicker
                        value={scheduledDateTime}
                        mode="date"
                        display="inline"
                        onChange={(_event, selected) => {
                          if (selected) {
                            const newDateTime = new Date(scheduledDateTime);
                            newDateTime.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                            setScheduledDateTime(newDateTime);
                          }
                        }}
                      />
                      <TouchableOpacity
                        style={styles.modalSaveBtn}
                        onPress={() => {
                          setShowDatePicker(false);
                          setTimeout(() => setShowTimePicker(true), 250);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.modalSaveBtnText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              ) : (
                <DateTimePicker
                  value={scheduledDateTime}
                  mode="date"
                  display="default"
                  onChange={(_event, selected) => {
                    setShowDatePicker(false);
                    if (selected) {
                      const newDateTime = new Date(scheduledDateTime);
                      newDateTime.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                      setScheduledDateTime(newDateTime);
                      setTimeout(() => setShowTimePicker(true), 150);
                    }
                  }}
                />
              )
            )}

            <CustomTimePicker
              visible={showTimePicker}
              onClose={() => setShowTimePicker(false)}
              selectedDate={scheduledDateTime}
              onSelect={(selected) => {
                setShowTimePicker(false);
                setScheduledDateTime(selected);
              }}
            />
          </View>

          {/* Contact Person Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Person Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter contact person name"
              placeholderTextColor="#9CA3AF"
              value={contactPersonName}
              onChangeText={setContactPersonName}
            />
          </View>

          {/* Designation */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Designation</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter designation"
              placeholderTextColor="#9CA3AF"
              value={designation}
              onChangeText={setDesignation}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter phone number"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Visit Image Upload / Preview */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Visit Image</Text>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <TouchableOpacity onPress={() => setShowPreviewModal(true)} activeOpacity={0.8}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                </TouchableOpacity>
                <View style={styles.imagePreviewDetails}>
                  <Text style={styles.imageNameText} numberOfLines={1}>
                    {photoName || 'visit-image.jpg'}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => {
                      setImageUri(null);
                      setPhotoName(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={14} color={COLORS.red} style={{ marginRight: 4 }} />
                    <Text style={styles.removeImageBtnText}>Remove Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadDropzone,
                  { borderColor: primaryColor }
                ]}
                onPress={handleUploadPress}
                activeOpacity={0.8}
              >
                <View style={[styles.uploadIconContainer, { backgroundColor: primaryLight }]}>
                  <Ionicons name="image-outline" size={20} color={primaryColor} />
                </View>
                <View style={styles.uploadTextContainer}>
                  <Text style={styles.uploadTitleText}>Upload visit image</Text>
                  <Text style={styles.uploadSubText}>Click to choose an image for this visit</Text>
                </View>
                <View style={styles.browseBtn}>
                  <Text style={styles.browseBtnText}>Browse</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Description input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              placeholder="Enter visit description"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location Address input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter visit location address"
              placeholderTextColor="#9CA3AF"
              value={locationAddress}
              onChangeText={setLocationAddress}
            />
          </View>

          {/* Outcome Summary */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Outcome Summary</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              placeholder="Enter visit outcome summary"
              placeholderTextColor="#9CA3AF"
              value={outcomeSummary}
              onChangeText={setOutcomeSummary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Next Steps */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Next Steps</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              placeholder="Enter next steps"
              placeholderTextColor="#9CA3AF"
              value={nextSteps}
              onChangeText={setNextSteps}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>



        </View>

        {/* ── SAVE VISIT BUTTON ───────────────────────── */}
        <View style={styles.nonStickySaveContainer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>SAVE VISIT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Full Screen Image Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.previewModalContainer}>
          <TouchableOpacity
            style={styles.previewModalCloseBtn}
            onPress={() => setShowPreviewModal(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
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
    marginTop: 5,
    gap: 6,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textDark,
    backgroundColor: '#FFFFFF',
  },
  textAreaInput: {
    height: 90,
    paddingVertical: 10,
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
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // Visit Type Option Pills
  pillsContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F4F7F5',
    marginRight: 6,
  },
  pillActive: {
    borderColor: theme.primaryColor,
    backgroundColor: theme.primaryLight,
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: theme.primaryColor,
    fontWeight: '800',
  },

  // Image Upload Dropzone
  uploadDropzone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  uploadIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextContainer: {
    flex: 1,
    gap: 3,
  },
  uploadTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  uploadSubText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  browseBtn: {
    backgroundColor: theme.primaryLight,
    borderWidth: 1,
    borderColor: '#C9E4D4',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  browseBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.primaryColor,
  },

  // Image Preview Style
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  imagePreviewDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  imageNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeImageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.red,
  },

  // Live Location UI
  locationContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: '#F4F7F5',
    padding: 12,
    gap: 10,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  loadingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  loadingLocationText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  errorLocationRow: {
    paddingVertical: 4,
    gap: 6,
  },
  errorLocationText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '600',
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coordinateBlock: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
  },
  coordinateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  coordinateVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  refreshLocCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLocationBtn: {
    backgroundColor: theme.primaryLight,
    borderWidth: 1,
    borderColor: '#C9E4D4',
    borderRadius: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLocationBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: theme.primaryColor,
  },

  // Sticky Bottom Bar
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
  nonStickySaveContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  saveBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primaryColor,
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

  // iOS modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  modalSaveBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 8,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
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
