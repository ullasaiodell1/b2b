import { cameraResult, setCameraResult } from '@/components/custom/CameraState';
import { CustomTimePicker } from '@/components/custom/CustomTimePicker';
import { LeadSelectCard } from '@/components/lead/LeadSelectCard';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadDetails } from '@/hooks/useLeads';
import { useUpload } from '@/hooks/useUpload';
import { useCreateVisit } from '@/hooks/useVisits';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STANDARD_TYPES = ['Site Visit', 'Business Meet', 'Product Pitch', 'Follow-up', 'Technical Support'];

export interface AddVisitComponentProps {
  initialLeadId?: string;
  initialLeadName?: string;
  initialLeadCompany?: string;
  isEmbedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddVisitComponent({
  initialLeadId,
  initialLeadName,
  initialLeadCompany,
  isEmbedded = false,
  onSuccess,
  onCancel,
}: AddVisitComponentProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params as { leadId?: string; referrer?: string }) || {};
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const createVisitMutation = useCreateVisit();
  const uploadMutation = useUpload();
  const { primaryColor, primaryLight } = useTheme();

  // Form States
  const [isSaving, setIsSaving] = useState(false);
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

  // Lead Selection States
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeadId || params.leadId || null);
  const { data: dbLead } = useLeadDetails(selectedLeadId || '');
  const [selectedLeadName, setSelectedLeadName] = useState<string | null>(initialLeadName || null);
  const [selectedLeadCompany, setSelectedLeadCompany] = useState<string | null>(initialLeadCompany || null);

  useEffect(() => {
    if (dbLead) {
      setSelectedLeadName(dbLead.name || null);
      setSelectedLeadCompany(dbLead.company_name || dbLead.company || null);
    }
  }, [dbLead]);

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

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onCancel])
  );

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

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a Visit Title.');
      return;
    }
    if (!visitType) {
      Alert.alert('Required', 'Please select a Visit Type.');
      return;
    }

    if (!selectedLeadId) {
      Alert.alert('Required', 'Please select a Lead.');
      return;
    }

    if (phone.trim() && phone.trim().length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSaving(true);
    try {
      const targetLeadId = selectedLeadId;

      let finalPhotoUri = imageUri;
      if (imageUri && !imageUri.startsWith('http')) {
        let uploadResult: any;
        try {
          uploadResult = await uploadMutation.mutateAsync(imageUri);
        } catch (uploadErr: any) {
          console.error('[AddVisit] uploadFile threw:', JSON.stringify(uploadErr));
          Alert.alert(
            'Upload Failed',
            uploadErr?.message || 'Could not upload visit image. Please try again.'
          );
          setIsSaving(false);
          return;
        }

        console.log('[AddVisit] uploadFile result:', JSON.stringify(uploadResult));

        finalPhotoUri =
          (typeof uploadResult === 'string' ? uploadResult : null) ||
          uploadResult?.url ||
          uploadResult?.file_url ||
          uploadResult?.location ||
          uploadResult?.path ||
          uploadResult?.key ||
          uploadResult?.data?.url ||
          uploadResult?.data?.file_url ||
          uploadResult?.data?.location ||
          uploadResult?.data?.path ||
          uploadResult?.data?.key ||
          null;

        console.log('[AddVisit] resolved finalPhotoUri:', finalPhotoUri);
      }

      await createVisitMutation.mutateAsync({
        leadId: targetLeadId,
        apiPayload: {
          lead_id: targetLeadId,
          title: title,
          visit_type: visitType,
          scheduled_time: scheduledDateTime.toISOString(),
          image_url: finalPhotoUri || undefined,
          description: description,
          location_address: locationAddress,
          location_latitude: latitude || 0,
          location_longitude: longitude || 0,
          status: 'SCHEDULED',
          contact_person_name: contactPersonName,
          contact_person_designation: designation,
          contact_person_phone: phone,
          outcome_summary: outcomeSummary,
          next_steps: nextSteps,
        },
      });

      Alert.alert('Success', 'Visit detail saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (onSuccess) {
              onSuccess();
            } else {
              handleBack();
            }
          }
        }
      ]);
    } catch (err: any) {
      console.error('[AddVisit] save error:', err);
      Alert.alert('Error', err?.message || 'Failed to save visit.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      {!isEmbedded && <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />}

      {/* HEADER */}
      {!isEmbedded && (
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
              <Text style={{ color: COLORS.textDark }}>VISIT</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
          </View>

          <View style={{ width: 36 }} />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: keyboardVisible ? 220 : 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>

          {/* Related Lead Selection */}
          {!(initialLeadId || params.leadId) && (
            <View style={styles.inputGroup}>
              <LeadSelectCard
                selectedLeadId={selectedLeadId}
                onSelectLead={(leadId, leadName, leadCompany) => {
                  setSelectedLeadId(leadId);
                  setSelectedLeadName(leadName);
                  setSelectedLeadCompany(leadCompany);
                }}
                initialLeadId={initialLeadId || params.leadId || undefined}
                initialLeadName={selectedLeadName || undefined}
                initialLeadCompany={selectedLeadCompany || undefined}
              />
            </View>
          )}

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

          {/* Visit Type Selection (Dropdown + custom text input) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Visit Type <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <FilterDropdown
              placeholder="Select Visit Type"
              options={[...STANDARD_TYPES, 'Other']}
              value={STANDARD_TYPES.includes(visitType) ? visitType : 'Other'}
              onChange={(val) => {
                if (val === 'Other') {
                  setVisitType('');
                } else {
                  setVisitType(val);
                }
              }}
              style={styles.visitTypeDropdown}
              labelStyle={styles.visitTypeDropdownLabel}
            />

            {(!STANDARD_TYPES.includes(visitType) || visitType === '') && (
              <TextInput
                style={[styles.textInput, { marginTop: 6 }]}
                placeholder="Or enter custom visit type..."
                placeholderTextColor="#9CA3AF"
                value={visitType}
                onChangeText={setVisitType}
              />
            )}
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
              maxLength={10}
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
            disabled={isSaving || createVisitMutation.isPending}
          >
            {isSaving || createVisitMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>SAVE VISIT</Text>
            )}
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
    gap: 12,
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

  // Visit Type Dropdown styles
  visitTypeDropdown: {
    alignSelf: 'stretch',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  visitTypeDropdownLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textDark,
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

  // Sticky Bottom Bar
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
