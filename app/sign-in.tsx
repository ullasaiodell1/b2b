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
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLogin } from '@/hooks/useAuth';

const { height } = Dimensions.get('window');

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(-150)).current;

  const loginMutation = useLogin();

  // Shake animation on wrong credentials
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  };

  // Show top error banner for 3 seconds
  const showError = (msg: string) => {
    setError(msg);
    // Slide down
    Animated.spring(errorAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(errorAnim, {
        toValue: -150,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setError('');
      });
    }, 3000);

    return () => clearTimeout(timer);
  };

  // Sign In handler with validation and mutation
  const handleSignIn = () => {
    setError('');
    if (!phoneNumber.trim()) {
      showError('Please enter your phone number.');
      shake();
      return;
    }
    if (phoneNumber.trim().length < 10) {
      showError('Please enter a valid 10-digit phone number.');
      shake();
      return;
    }
    if (!password.trim()) {
      showError('Please enter your password.');
      shake();
      return;
    }

    loginMutation.mutate(
      { identifier: phoneNumber.trim(), password },
      {
        onSuccess: async (data: any) => {
          if (data?.token_type === 'otp') {
            router.push({
              pathname: '/otp',
              params: { code: phoneNumber, token: data.token, password }
            });
          } else if (data?.token) {
            const { saveAuthToken, saveUserData } = require('@/utils/storage');
            await saveAuthToken(data.token);
            if (data.user) {
              await saveUserData(data.user);
            }
            router.replace('/(tabs)');
          } else {
            router.push({
              pathname: '/otp',
              params: { code: phoneNumber, token: data?.token || '', password }
            });
          }
        },
        onError: (err: any) => {
          showError(err.message || 'Failed to sign in. Please try again.');
          shake();
        }
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Floating Header Error Banner */}
      {!!error && (
        <Animated.View
          style={[
            styles.floatingErrorBanner,
            {
              top: Math.max(insets.top, 16),
              transform: [{ translateY: errorAnim }],
            },
          ]}
        >
          <View style={styles.floatingErrorContent}>
            <Ionicons name="alert-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.floatingErrorText}>{error}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* App Logo & Name */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>BASALT</Text>
        </View>

        {/* Header copy */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSub}>
            Go ahead and sign up, let everyone know how awesome you are!
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Phone Number */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#B0BAB6"
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loginMutation.isPending}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#B0BAB6"
                secureTextEntry={secureTextEntry}
                editable={!loginMutation.isPending}
              />
              <TouchableOpacity 
                style={styles.eyeBtn} 
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              >
                <Ionicons 
                  name={secureTextEntry ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#8F9995" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotWrap} 
            activeOpacity={0.7}
            onPress={() => router.push('/reset-password')}
          >
            <Text style={styles.forgotText}>Forgot Password ?</Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity
            onPress={handleSignIn}
            style={[styles.signInBtn, loginMutation.isPending && { opacity: 0.7 }]}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.signInBtnText}>
              {loginMutation.isPending ? 'SIGNING IN...' : 'SIGN IN'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0D0F0E',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  floatingErrorBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingErrorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  floatingErrorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 72 : 52,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  headerSection: { marginBottom: 40 },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0D0F0E',
    marginBottom: 12,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  welcomeSub: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },

  form: { gap: 20 },
  inputBlock: { gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8F9995',
    letterSpacing: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D0DCD7',
    borderRadius: 10,
    height: 52,
    paddingHorizontal: 16,
  },
  input: { fontSize: 14, color: '#0D0F0E', fontWeight: '500', flex: 1 },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D0F0E',
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1.5,
    borderRightColor: '#D0DCD7',
  },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },

  forgotWrap: { alignSelf: 'flex-end', paddingVertical: 4 },
  forgotText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Error box
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  errorText: { fontSize: 13, color: '#B91C1C', fontWeight: '600', lineHeight: 18 },

  signInBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  signInBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 9,
  },

  // Sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
    gap: 16,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2D3532',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetCloseIcon: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  sheetSub: { fontSize: 13, color: COLORS.textMutedDark, lineHeight: 20 },

  sheetInputBlock: { gap: 8 },
  sheetLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMutedDark, letterSpacing: 1 },
  sheetInputWrap: {
    backgroundColor: '#1E2422',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sheetInput: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },

  sheetSubmitBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  sheetSubmitBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5, textTransform: 'uppercase' },
});
