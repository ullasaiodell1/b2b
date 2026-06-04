import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { profileData, updateProfileData } from '@/components/ProfileState';
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
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [fullName, setFullName] = useState(profileData.fullName);
  const [dob, setDob] = useState<Date>(() => {
    try {
      const parts = profileData.dob.split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthStr = parts[1].toLowerCase();
        const year = parseInt(parts[2], 10);
        const months: { [key: string]: number } = {
          january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
          july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
        };
        const monthIndex = months[monthStr] !== undefined ? months[monthStr] : 3;
        return new Date(year, monthIndex, day);
      }
      const parsed = new Date(profileData.dob);
      if (!isNaN(parsed.getTime())) return parsed;
      return new Date(2005, 3, 10);
    } catch {
      return new Date(2005, 3, 10);
    }
  });
  const [gstNo, setGstNo] = useState(profileData.gstNo);
  const [panNo, setPanNo] = useState(profileData.panNo);
  const [email, setEmail] = useState(profileData.email);
  const [mobile, setMobile] = useState(profileData.mobile);
  const [gender, setGender] = useState<'Male' | 'Female'>(profileData.gender);
  const [address, setAddress] = useState(profileData.address);
  const [photoUri, setPhotoUri] = useState<string | null>(profileData.photoUri);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [updating, setUpdating] = useState(false);

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
    router.push({
      pathname: '/camera-capture',
      params: {
        sourceScreen: 'edit-profile',
        target: 'profile',
      },
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

  const handleUpdate = () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email.');
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      const formattedDob = dob.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      updateProfileData({
        fullName,
        dob: formattedDob,
        gstNo,
        panNo,
        email,
        mobile,
        gender,
        address,
        photoUri,
      });

      setUpdating(false);
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    }, 600);
  };

  const formattedDateString = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd} / ${mm} / ${yyyy}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: COLORS.primary }}>EDIT </Text>
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
              placeholder="e.g. +91 1234567890"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },

  // Edit Squircle Avatar
  avatarEditContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    width: 110,
    height: 110,
  },
  avatarLarge: {
    width: 110,
    height: 110,
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
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
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
    borderColor: COLORS.primary,
  },
  genderBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  genderBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // Save
  saveBtn: {
    backgroundColor: '#000000',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
