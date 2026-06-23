import { cameraResult, setCameraResult } from '@/components/custom/CameraState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/hooks/useProfile';
import { uploadFile } from '@/services/api/file';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

export default function EditProfileScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { profile: backendProfile, updateProfile: mutateProfile, isLoading } = useProfile();

  const profile = React.useMemo(() => {
    const user = backendProfile || {};
    return {
      fullName: user.name || '',
      mobile: user.phone_number || '',
      dob: user.date_of_birth || '',
      email: user.personal_email || user.email || '',
      gender: user.gender
        ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) as 'Male' | 'Female'
        : 'Male',
      gstNo: user.gst_number || '',
      panNo: user.pan_number || '',
      address: user.address || '',
      photoUri: user.image_url || null,
    };
  }, [backendProfile]);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState<Date>(new Date(2005, 3, 10));
  const [gstNo, setGstNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [address, setAddress] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Sync state values when profile loads
  React.useEffect(() => {
    if (backendProfile) {
      setFullName(profile.fullName || '');
      setGstNo(profile.gstNo || '');
      setPanNo(profile.panNo || '');
      setEmail(profile.email || '');
      setMobile(profile.mobile || '');
      setGender(profile.gender || 'Male');
      setAddress(profile.address || '');
      setPhotoUri(profile.photoUri || null);

      if (profile.dob) {
        try {
          // Handle ISO format: "YYYY-MM-DD"
          if (/^\d{4}-\d{2}-\d{2}$/.test(profile.dob)) {
            const [y, m, d] = profile.dob.split('-').map(Number);
            setDob(new Date(y, m - 1, d));
          } else {
            // Handle legacy "D Month YYYY" or "Month D, YYYY" formats
            const parts = profile.dob.split(' ');
            if (parts.length === 3) {
              const day = parseInt(parts[0], 10);
              const monthStr = parts[1].replace(',', '').toLowerCase();
              const year = parseInt(parts[2], 10);
              const months: { [key: string]: number } = {
                january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
                july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
              };
              const monthIndex = months[monthStr] !== undefined ? months[monthStr] : 3;
              setDob(new Date(year, monthIndex, day));
            } else {
              const parsed = new Date(profile.dob);
              if (!isNaN(parsed.getTime())) setDob(parsed);
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }, [profile]);

  React.useEffect(() => {
    if (isFocused && cameraResult && cameraResult.target === 'profile') {
      setPhotoUri(cameraResult.uri);
      setCameraResult(null);
    }
  }, [isFocused]);

  const handlePickImage = () => {
    Alert.alert('Profile Photo', 'Select photo source:', [
      { text: 'Camera', onPress: launchCamera },
      { text: 'Gallery', onPress: launchImageLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const launchCamera = () => {
    navigation.navigate('CameraCapture', {
      sourceScreen: 'edit-profile',
      target: 'profile',
    });
  };

  const launchImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email.');
      return;
    }

    if (mobile.trim() && mobile.trim().length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setUpdating(true);
    let finalPhotoUri = photoUri;

    try {
      // Upload image to S3 if it's a local file URI
      if (
        photoUri &&
        (photoUri.startsWith('file://') ||
          photoUri.startsWith('content://') ||
          photoUri.startsWith('ph://'))
      ) {
        let uploadResult: any;
        try {
          uploadResult = await uploadFile(photoUri);
        } catch (uploadErr: any) {
          console.error('[EditProfile] uploadFile threw:', JSON.stringify(uploadErr));
          setUpdating(false);
          Alert.alert(
            'Upload Failed',
            uploadErr?.message || 'Could not upload profile photo. Please try again.'
          );
          return;
        }

        console.log('[EditProfile] uploadFile result:', JSON.stringify(uploadResult));

        // The axios interceptor returns response.data directly.
        // Try every possible shape the server might return the URL in.
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

        console.log('[EditProfile] resolved finalPhotoUri:', finalPhotoUri);

        if (!finalPhotoUri) {
          console.warn('[EditProfile] Upload response had no recognisable URL:', JSON.stringify(uploadResult));
          // Don't block the profile save — just keep the old photo URI
          finalPhotoUri = photoUri;
        }
      }

      const formattedDob = `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`;

      const cleanedGst = gstNo.trim().toUpperCase() || null;
      const cleanedPan = panNo.trim().toUpperCase() || null;

      const backendData = {
        name: fullName.trim(),
        phone_number: mobile.trim(),
        date_of_birth: formattedDob,
        personal_email: email.trim(),
        email: email.trim(),
        gender: gender.toLowerCase(),
        gst_number: cleanedGst || '',
        pan_number: cleanedPan || '',
        address: address.trim(),
        image_url: finalPhotoUri,
      };

      mutateProfile(
        backendData,
        {
          onSuccess: () => {
            setUpdating(false);
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
          },
          onError: (err: any) => {
            setUpdating(false);
            const errMsg =
              err?.response?.data?.message ||
              err?.message ||
              'Failed to update profile.';
            Alert.alert('Update Failed', errMsg);
          },
        }
      );
    } catch (uploadErr: any) {
      setUpdating(false);
      Alert.alert('Update Failed', uploadErr?.message || 'Something went wrong. Please try again.');
    }
  };

  const formattedDateString = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd} / ${mm} / ${yyyy}`;
  };

  if (isLoading && !profile.fullName) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>EDIT </Text>
            <Text style={{ color: COLORS.textDark }}>PROFILE</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Squircle edit container */}
        <View style={styles.avatarEditContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: photoUri || DEFAULT_AVATAR }}
              style={styles.avatarLarge}
            />
            <TouchableOpacity onPress={handlePickImage} style={styles.cameraIconBadge} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Parth Solanki"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Date Of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date Of Birth</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.selectorContainer} activeOpacity={0.8}>
              <Text style={styles.selectorInputText}>
                {formattedDateString(dob)}
              </Text>
              <Ionicons name="calendar" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dob}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) setDob(selected);
                }}
              />
            )}
          </View>

          {/* GST Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter GST Number</Text>
            <TextInput
              style={styles.textInput}
              value={gstNo}
              onChangeText={setGstNo}
              placeholder="e.g. 24ABCDE1234F1Z5"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>

          {/* PAN Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter PAN Number</Text>
            <TextInput
              style={styles.textInput}
              value={panNo}
              onChangeText={setPanNo}
              placeholder="e.g. ABCDE1234F"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. parth123@gmail.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Mobile */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.textInput}
              value={mobile}
              onChangeText={setMobile}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                onPress={() => setGender('Male')}
                style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.genderBtnText, gender === 'Male' && styles.genderBtnTextActive]}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGender('Female')}
                style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.genderBtnText, gender === 'Female' && styles.genderBtnTextActive]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter Address"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Update Save Button */}
        <TouchableOpacity onPress={handleUpdate} style={styles.saveBtn} activeOpacity={0.9} disabled={updating}>
          {updating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Update & Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    padding: 8,
    paddingBottom: 150,
    gap: 2,
  },

  // Edit Squircle Avatar
  avatarEditContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  avatarWrapper: {
    position: 'relative',
    width: 150,
    height: 150,
  },
  avatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  cameraIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(32, 40, 36, 0.75)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: -4,
    right: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form
  form: {
    gap: 5,
  },
  inputGroup: {
    gap: 1,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  textInput: {
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  selectorInputText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  multilineInput: {
    height: 90,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },

  // Gender Buttons
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    borderColor: theme.primaryColor,
  },
  genderBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  genderBtnTextActive: {
    color: theme.primaryColor,
    fontWeight: '800',
  },

  // Save
  saveBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: theme.primaryColor,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
