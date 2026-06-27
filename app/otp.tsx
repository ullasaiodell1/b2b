import { COLORS } from '@/constants/theme';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useLocalSearchParams } from 'expo-router';
import { useOTPVerification, useResendOTP } from '@/hooks/useAuth';
import { saveAuthToken, saveUserData } from '@/utils/storage';
import { useTheme } from '@/hooks/use-theme';

const { width, height } = Dimensions.get('window');

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const { code: mobileNumber, token: initialToken, password } = useLocalSearchParams<{ code: string; token: string; password?: string }>();
  const [verificationToken, setVerificationToken] = useState(initialToken || '');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  const otpVerificationMutation = useOTPVerification();
  const resendOTPMutation = useResendOTP();

  // Slide-up entrance
  const slideAnim = useRef(new Animated.Value(height)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 52,
      friction: 9,
      useNativeDriver: true,
    }).start(() => {
      // Auto-focus first input after slide up
      inputRefs.current[0]?.focus();
    });
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    // Accept only digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setErrorMessage('');

    if (digit && index < OTP_LENGTH - 1) {
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

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setErrorMessage(`Please enter the complete ${OTP_LENGTH}-digit code.`);
      shakeError();
      return;
    }

    if (!verificationToken) {
      setErrorMessage('Verification token is missing. Please try logging in again.');
      shakeError();
      return;
    }

    otpVerificationMutation.mutate(
      { token: verificationToken, code },
      {
        onSuccess: async (data: any) => {
          // Save user data and token
          await saveAuthToken(data.token);
          await saveUserData(data.user);

          // Success animation
          setVerified(true);
          Animated.spring(successScale, {
            toValue: 1,
            tension: 60,
            friction: 7,
            useNativeDriver: true,
          }).start();

          setTimeout(() => {
            router.replace('/(tabs)' as any);
          }, 1200);
        },
        onError: (err: any) => {
          setErrorMessage(err.message || 'Failed to verify OTP. Please try again.');
          shakeError();
        }
      }
    );
  };  const isEmail = (val: string) => {
    return /[a-zA-Z]/.test(val) || val.includes('@');
  };

  const handleResend = () => {
    if (!mobileNumber) {
      setErrorMessage(isEmail(mobileNumber || '') ? 'Email is missing.' : 'Phone number is missing.');
      shakeError();
      return;
    }

    resendOTPMutation.mutate(
      { identifier: mobileNumber, password },
      {
        onSuccess: (data: any) => {
          setVerificationToken(data.token);
          setOtp(Array(OTP_LENGTH).fill(''));
          setErrorMessage('');
          setVerified(false);
          inputRefs.current[0]?.focus();
          alert(`A new verification code has been sent to your ${isEmail(mobileNumber || '') ? 'email' : 'mobile number'}.`);
        },
        onError: (err: any) => {
          setErrorMessage(err.message || 'Failed to resend OTP. Please try again.');
          shakeError();
        }
      }
    );
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 240,
      useNativeDriver: true,
    }).start(() => router.back());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Close */}
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        {!verified ? (
          <>
            <Text style={styles.sheetTitle}>Verify OTP</Text>
            <Text style={styles.sheetSub}>
              Enter the {OTP_LENGTH}-digit verification code sent to your {isEmail(mobileNumber || '') ? 'email' : 'mobile number'}:
              <Text style={{ fontWeight: '700', color: theme.primaryColor }}> {isEmail(mobileNumber || '') ? mobileNumber : `+91 ${mobileNumber}`}</Text>
            </Text>
            {/* OTP Boxes */}
            <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : {},
                    errorMessage ? styles.otpBoxError : {},
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  caretHidden
                  editable={!otpVerificationMutation.isPending && !resendOTPMutation.isPending}
                />
              ))}
            </Animated.View>

            {/* Error message */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Verify button */}
            <TouchableOpacity
              onPress={handleVerify}
              style={[styles.verifyBtn, otpVerificationMutation.isPending && { opacity: 0.7 }]}
              disabled={otpVerificationMutation.isPending || resendOTPMutation.isPending}
            >
              <Text style={styles.verifyBtnText}>
                {otpVerificationMutation.isPending ? 'VERIFYING...' : 'Verify OTP & Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Resend */}
            <TouchableOpacity
              onPress={handleResend}
              style={styles.resendBtn}
              disabled={otpVerificationMutation.isPending || resendOTPMutation.isPending}
            >
              <Text style={styles.resendText}>
                {"Haven't got the code yet? "}
                <Text style={styles.resendHighlight}>
                  {resendOTPMutation.isPending ? 'Resending...' : 'Resend OTP'}
                </Text>
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // Success State
          <View style={styles.successContainer}>
            <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
              <Text style={styles.successCheck}>✓</Text>
            </Animated.View>
            <Text style={styles.successTitle}>Verified!</Text>
            <Text style={styles.successSub}>Redirecting you to your dashboard…</Text>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const BOX_SIZE = (width - 48 - 32) / OTP_LENGTH;

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1 },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 52 : 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 14,
    gap: 18,
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D0DCD7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: { color: '#0D0F0E', fontSize: 14, fontWeight: '700' },

  sheetTitle: { fontSize: 26, fontWeight: '800', color: '#0D0F0E' },
  sheetSub: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },

  // OTP Boxes
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 6,
  },
  otpBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D0DCD7',
    borderRadius: 10,
    fontSize: 22,
    fontWeight: '800',
    color: '#0D0F0E',
  },
  otpBoxFilled: {
    borderColor: theme.primaryColor,
    backgroundColor: '#F0FDF4',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },

  verifyBtn: {
    backgroundColor: theme.primaryColor,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4 },

  resendBtn: { alignSelf: 'center', paddingVertical: 6 },
  resendText: { fontSize: 13, color: COLORS.textMuted },
  resendHighlight: { color: theme.primaryColor, fontWeight: '700' },

  // Success state
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  successCheck: { fontSize: 36, color: '#FFFFFF', fontWeight: '800' },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#0D0F0E' },
  successSub: { fontSize: 13, color: COLORS.textMuted },
});
