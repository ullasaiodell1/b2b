import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useForgotPassword, useLogin, useResetPassword, useVerifyForgotPasswordOTP } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getUserPassword, saveUserPassword } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width } = Dimensions.get('window');
const BOX_SIZE = (width - 48 - 32) / 6;

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'current-password' | 'verify' | 'new-password' | 'success'>('current-password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resetToken, setResetToken] = useState('');
  const [resetAuthorizedToken, setResetAuthorizedToken] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // API hooks
  const { profile } = useProfile();
  const loginMutation = useLogin();
  const forgotPasswordMutation = useForgotPassword();
  const verifyOTPMutation = useVerifyForgotPasswordOTP();
  const resetPasswordMutation = useResetPassword();

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }

    const email = profile?.personal_email || profile?.email || '';
    if (!email) {
      Alert.alert('Error', 'Unable to fetch your registered email address.');
      return;
    }

    const storedPassword = await getUserPassword();

    const triggerSendOTP = () => {
      forgotPasswordMutation.mutate(
        { email },
        {
          onSuccess: (res: any) => {
            const token = res?.token || '';
            setResetToken(token);
            setStep('verify');
            setErrorMessage('');
          },
          onError: (error: any) => {
            const msg = error?.message || 'Failed to send verification code. Please try again.';
            Alert.alert('Error', msg);
          },
        }
      );
    };

    if (storedPassword) {
      if (storedPassword === currentPassword) {
        triggerSendOTP();
      } else {
        Alert.alert('Error', 'Incorrect current password.');
      }
    } else {
      loginMutation.mutate(
        { identifier: email, password: currentPassword },
        {
          onSuccess: () => {
            saveUserPassword(currentPassword).catch((err) => console.error('Error storing password:', err));
            triggerSendOTP();
          },
          onError: (error: any) => {
            const msg = error?.message || 'Incorrect current password.';
            Alert.alert('Error', msg);
          },
        }
      );
    }
  };

  const handleVerifyCode = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }
    verifyOTPMutation.mutate(
      { token: resetToken, code },
      {
        onSuccess: (res: any) => {
          const authToken = res?.token || '';
          setResetAuthorizedToken(authToken);
          setErrorMessage('');
          setStep('new-password');
        },
        onError: (error: any) => {
          const msg = error?.message || 'Invalid verification code. Please try again.';
          setErrorMessage(msg);
        },
      }
    );
  };

  const handleResendCode = () => {
    const email = profile?.personal_email || profile?.email || '';
    if (!email) return;

    setOtp(Array(6).fill(''));
    setErrorMessage('');
    inputRefs.current[0]?.focus();

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: (res: any) => {
          const token = res?.token || '';
          setResetToken(token);
          Alert.alert('Success', 'A new verification code has been sent to your email.');
        },
        onError: (error: any) => {
          const msg = error?.message || 'Failed to resend OTP.';
          Alert.alert('Error', msg);
        },
      }
    );
  };

  const handleUpdatePassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in both fields.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    resetPasswordMutation.mutate(
      { token: resetAuthorizedToken, password: newPassword },
      {
        onSuccess: async () => {
          try {
            await saveUserPassword(newPassword);
          } catch (e) {
            console.error('Error saving password to storage:', e);
          }
          setStep('success');
        },
        onError: (error: any) => {
          const msg = error?.message || 'Failed to update password. Please try again.';
          Alert.alert('Error', msg);
        },
      }
    );
  };

  const handleBack = () => {
    if (step === 'success') {
      setStep('new-password');
    } else if (step === 'new-password') {
      setStep('verify');
    } else if (step === 'verify') {
      setStep('current-password');
    } else {
      navigation.goBack();
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setErrorMessage('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>CHANGE </Text>
            <Text style={{ color: COLORS.textDark }}>PASSWORD</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            {step === 'current-password' && 'Enter Current Password'}
            {step === 'verify' && 'Verify OTP'}
            {step === 'new-password' && 'Set New Password'}
            {step === 'success' && 'Password Updated'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 'current-password' && (
          <View style={styles.stepContainer}>
            {/* Large Banner Icon Block */}
            <View style={styles.bannerContainer}>
              <View style={styles.bannerBadge}>
                <Ionicons name="key-outline" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.bannerTitle}>Verify Your Identity</Text>
              <Text style={styles.bannerSubtitle}>Enter your current password</Text>
            </View>

            {/* Current Password Field */}
            <View style={styles.form}>
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
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleVerifyCurrentPassword}
              style={[styles.saveBtn, (loginMutation.isPending || forgotPasswordMutation.isPending) && styles.disabledButton]}
              activeOpacity={0.9}
              disabled={loginMutation.isPending || forgotPasswordMutation.isPending}
            >
              {loginMutation.isPending || forgotPasswordMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'verify' && (
          <View style={styles.stepContainer}>
            <View style={styles.bannerContainer}>
              <View style={styles.bannerBadge}>
                <Ionicons name="mail-unread-outline" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.bannerTitle}>Check Your Email</Text>
              <Text style={styles.bannerSubtitle}>
                We sent a code to {profile?.personal_email || profile?.email || ''}
              </Text>
            </View>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : {},
                    focusedIndex === index ? { borderColor: theme.primaryColor, borderWidth: 1.5 } : {},
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Error message */}
            {!!errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.saveBtn,
                (otp.join('').length < 6 || verifyOTPMutation.isPending) && styles.disabledButton
              ]}
              disabled={otp.join('').length < 6 || verifyOTPMutation.isPending}
              onPress={handleVerifyCode}
              activeOpacity={0.8}
            >
              {verifyOTPMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={forgotPasswordMutation.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.resendText}>
                {"Haven't got the code yet? "}
                <Text style={styles.resendHighlight}>Resend code</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'new-password' && (
          <View style={styles.stepContainer}>
            <View style={styles.bannerContainer}>
              <View style={styles.bannerBadge}>
                <Ionicons name="lock-open-outline" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.bannerTitle}>Choose New Password</Text>
              <Text style={styles.bannerSubtitle}>Must be at least 8 characters</Text>
            </View>

            <View style={styles.form}>
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

            <TouchableOpacity
              onPress={handleUpdatePassword}
              style={[styles.saveBtn, resetPasswordMutation.isPending && styles.disabledButton]}
              activeOpacity={0.9}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'success' && (
          <View style={styles.stepContainer}>
            <View style={styles.bannerContainer}>
              <View style={[styles.bannerBadge, { backgroundColor: '#DEF7EC' }]}>
                <Ionicons name="checkmark-circle-outline" size={32} color="#0E9F6E" />
              </View>
              <Text style={styles.bannerTitle}>Password Updated</Text>
              <Text style={styles.bannerSubtitle}>Your password has been changed successfully.</Text>
            </View>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.saveBtn} activeOpacity={0.9}>
              <Text style={styles.saveBtnText}>Go Back to Settings</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 16,
    gap: 16,
    paddingBottom: 150,
  },
  stepContainer: {
    gap: 16,
  },
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 8,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
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
  passInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  passInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  eyeBtn: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: theme.primaryColor,
  },
  disabledButton: {
    backgroundColor: '#C5D1F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 6,
  },
  otpBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: theme.primaryColor,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  resendHighlight: {
    color: theme.primaryColor,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
