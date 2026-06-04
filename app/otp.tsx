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

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#346556',
  bgDark: '#121514',
  textMutedDark: '#8F9995',
  textLight: '#FFFFFF',
};

const OTP_LENGTH = 5;

export default function OtpScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

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
      setErrorMessage('Please enter the complete 5-digit code.');
      shakeError();
      return;
    }

    // Success animation
    setVerified(true);
    Animated.spring(successScale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1200);
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setErrorMessage('');
    setVerified(false);
    inputRefs.current[0]?.focus();
    alert('A new verification code has been sent to your email.');
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
              Enter the 5-digit verification code sent to your email address.
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
                />
              ))}
            </Animated.View>

            {/* Error message */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Verify button */}
            <TouchableOpacity onPress={handleVerify} style={styles.verifyBtn}>
              <Text style={styles.verifyBtnText}>Verify OTP & Sign In</Text>
            </TouchableOpacity>

            {/* Resend */}
            <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
              <Text style={styles.resendText}>
                {"Haven't got the email yet? "}
                <Text style={styles.resendHighlight}>Resend email</Text>
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

const styles = StyleSheet.create({
  root: { flex: 1 },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    backgroundColor: COLORS.bgDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 52 : 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 14,
    gap: 18,
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2D3532',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  sheetTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textLight },
  sheetSub: { fontSize: 13, color: COLORS.textMutedDark, lineHeight: 20 },

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
    backgroundColor: '#1D2422',
    borderWidth: 1.5,
    borderColor: '#2D3532',
    borderRadius: 10,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#1A2E26',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#2A1A1A',
  },

  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },

  verifyBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4 },

  resendBtn: { alignSelf: 'center', paddingVertical: 6 },
  resendText: { fontSize: 13, color: COLORS.textMutedDark },
  resendHighlight: { color: COLORS.primary, fontWeight: '700' },

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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  successCheck: { fontSize: 36, color: '#FFFFFF', fontWeight: '800' },
  successTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textLight },
  successSub: { fontSize: 13, color: COLORS.textMutedDark },
});
