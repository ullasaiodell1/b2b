import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
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

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Validation Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    Alert.alert('Success', 'Password updated successfully!', [
      {
        text: 'OK',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password recovery link has been sent to your registered email address.');
  };

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
            <Text style={{ color: theme.primaryColor }}>CHANGE </Text>
            <Text style={{ color: COLORS.textDark }}>PASSWORD</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Large Banner Icon Block */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerBadge}>
            <Ionicons name="download-outline" size={28} color="#3B82F6" />
          </View>
          <Text style={styles.bannerTitle}>Set A New Password</Text>
          <Text style={styles.bannerSubtitle}>Must Be At Least 8 Characters</Text>
        </View>

        {/* Password Fields Form */}
        <View style={styles.form}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password <Text style={{ color: COLORS.danger }}>*</Text></Text>
            <View style={styles.passInputWrapper}>
              <TextInput
                style={styles.passInput}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter Your Current Password"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Recovery Link */}
          <TouchableOpacity
            style={styles.recoveryLink}
            activeOpacity={0.7}
            onPress={handleForgotPassword}
          >
            <Text style={styles.recoveryLinkText}>
              <Text style={{ color: theme.primaryColor, textDecorationLine: 'underline', fontWeight: '700' }}>Click Here</Text>
              <Text style={{ color: COLORS.textMuted }}>{" If You Don't Have Or Remember Your Current Password"}</Text>
            </Text>
          </TouchableOpacity>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password <Text style={{ color: COLORS.danger }}>*</Text></Text>
            <View style={styles.passInputWrapper}>
              <TextInput
                style={styles.passInput}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Choose Strong Password"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                <Ionicons name={showNew ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password <Text style={{ color: COLORS.danger }}>*</Text></Text>
            <View style={styles.passInputWrapper}>
              <TextInput
                style={styles.passInput}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm New Password"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Update Password Action Button */}
        <TouchableOpacity onPress={handleUpdate} style={styles.saveBtn} activeOpacity={0.9}>
          <Text style={styles.saveBtnText}>Update Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
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
    padding: 5,
    gap: 5,
    paddingBottom: 150,
  },

  // Banner lock badge
  bannerContainer: {
    alignItems: 'center',
    gap: 1,
    marginVertical: 10,
  },
  bannerBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 4,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Form Fields
  form: {
    gap: 5,
  },
  inputGroup: {
    gap: 3,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  passInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  passInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  eyeBtn: {
    paddingLeft: 10,
    justifyContent: 'center',
  },

  // Recovery Help text
  recoveryLink: {
    marginTop: -4,
    marginBottom: 4,
  },
  recoveryLinkText: {
    fontSize: 11,
    lineHeight: 16,
  },

  // Save
  saveBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: theme.primaryColor,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
