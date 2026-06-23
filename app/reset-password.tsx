import { COLORS } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForgotPassword, useVerifyForgotPasswordOTP, useResetPassword } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');
const BOX_SIZE = (width - 48 - 32) / 6;

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'forgot' | 'verify' | 'new-password' | 'success'>('forgot');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));

  // Step 3 (New Password) state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isNewPassFocused, setIsNewPassFocused] = useState(false);
  const [isConfirmPassFocused, setIsConfirmPassFocused] = useState(false);

  // API hooks
  const forgotPasswordMutation = useForgotPassword();
  const verifyOTPMutation = useVerifyForgotPasswordOTP();
  const resetPasswordMutation = useResetPassword();

  const handleResetPassword = () => {
    if (phoneNumber.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid 10-digit mobile number.',
      });
      return;
    }
    forgotPasswordMutation.mutate(
      { identifier: phoneNumber },
      {
        onSuccess: () => {
          setStep('verify');
          setErrorMessage('');
          Toast.show({
            type: 'success',
            text1: 'OTP Sent',
            text2: 'A verification code has been sent to your phone number.',
          });
        },
        onError: (error: any) => {
          const msg = error?.message || 'Failed to send OTP. Please try again.';
          Toast.show({ type: 'error', text1: 'Error', text2: msg });
        },
      }
    );
  };

  const handleVerifyCode = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }
    verifyOTPMutation.mutate(
      { identifier: phoneNumber, otp: code },
      {
        onSuccess: () => {
          setVerifiedOtp(code);
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
    setOtp(Array(6).fill(''));
    setErrorMessage('');
    inputRefs.current[0]?.focus();
    forgotPasswordMutation.mutate(
      { identifier: phoneNumber },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'OTP Resent',
            text2: 'A new verification code has been sent to your phone number.',
          });
        },
        onError: (error: any) => {
          const msg = error?.message || 'Failed to resend OTP.';
          Toast.show({ type: 'error', text1: 'Error', text2: msg });
        },
      }
    );
  };

  const handleUpdatePassword = () => {
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordError('');

    resetPasswordMutation.mutate(
      { identifier: phoneNumber, otp: verifiedOtp, new_password: newPassword },
      {
        onSuccess: () => {
          setStep('success');
        },
        onError: (error: any) => {
          const msg = error?.message || 'Failed to reset password. Please try again.';
          setPasswordError(msg);
        },
      }
    );
  };

  const handleConfirm = () => {
    router.replace('/sign-in');
  };

  const handleBack = () => {
    if (step === 'success') {
      setStep('new-password');
    } else if (step === 'new-password') {
      setStep('verify');
    } else if (step === 'verify') {
      setStep('forgot');
    } else {
      router.back();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#0D0F0E" />
          </TouchableOpacity>
        </View>

        {step === 'forgot' && (
          <View style={styles.content}>
            <Text style={styles.title}>Forgot password</Text>
            <Text style={styles.subtitle}>
              Please enter your phone number to reset the password
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your Phone Number</Text>
              <View style={[
                styles.inputWrapper,
                isFocused && { borderColor: theme.primaryColor, borderWidth: 2 }
              ]}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#B0BAB6"
                  keyboardType="phone-pad"
                  maxLength={10}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (phoneNumber.length < 10 || forgotPasswordMutation.isPending) && styles.disabledButton
              ]}
              disabled={phoneNumber.length < 10 || forgotPasswordMutation.isPending}
              onPress={handleResetPassword}
              activeOpacity={0.8}
            >
              {forgotPasswordMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'verify' && (
          <View style={styles.content}>
            <Text style={styles.title}>Check your phone</Text>
            <Text style={styles.subtitle}>
              We sent a reset code to +91 ******{phoneNumber.slice(-4)} — enter the 6-digit code from the SMS
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : {},
                    focusedIndex === index ? { borderColor: theme.primaryColor, borderWidth: 2 } : {},
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
                styles.primaryButton,
                (otp.join('').length < 6 || verifyOTPMutation.isPending) && styles.disabledButton
              ]}
              disabled={otp.join('').length < 6 || verifyOTPMutation.isPending}
              onPress={handleVerifyCode}
              activeOpacity={0.8}
            >
              {verifyOTPMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify Code</Text>
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
          <View style={styles.content}>
            <Text style={styles.title}>Set a new password</Text>
            <Text style={styles.subtitle}>
              Create a new password. Ensure it differs from previous ones for security
            </Text>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[
                styles.inputWrapper,
                isNewPassFocused && { borderColor: theme.primaryColor, borderWidth: 2 }
              ]}>
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setPasswordError('');
                  }}
                  placeholder="Enter your new password"
                  placeholderTextColor="#B0BAB6"
                  secureTextEntry={!showNewPassword}
                  onFocus={() => setIsNewPassFocused(true)}
                  onBlur={() => setIsNewPassFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#8F9995"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                isConfirmPassFocused && { borderColor: theme.primaryColor, borderWidth: 2 }
              ]}>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setPasswordError('');
                  }}
                  placeholder="Re-enter password"
                  placeholderTextColor="#B0BAB6"
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setIsConfirmPassFocused(true)}
                  onBlur={() => setIsConfirmPassFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#8F9995"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {!!passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!newPassword || !confirmPassword || resetPasswordMutation.isPending) && styles.disabledButton
              ]}
              disabled={!newPassword || !confirmPassword || resetPasswordMutation.isPending}
              onPress={handleUpdatePassword}
              activeOpacity={0.8}
            >
              {resetPasswordMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'success' && (
          <View style={styles.content}>
            <Text style={styles.title}>Password reset</Text>
            <Text style={styles.subtitle}>
              Your password has been successfully reset. Click confirm to sign in with your new password.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    marginTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0D0F0E',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  subtitle: {
    fontSize: 14,
    color: '#8F9995',
    lineHeight: 22,
    marginBottom: 36,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D0F0E',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5ECE9',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D0F0E',
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1.5,
    borderRightColor: '#E5ECE9',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0D0F0E',
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: theme.primaryColor,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#C5D1F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 6,
  },
  otpBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 1.5,
    borderColor: '#E5ECE9',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0F0E',
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
    marginBottom: 20,
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 28,
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#8F9995',
  },
  resendHighlight: {
    color: theme.primaryColor,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
