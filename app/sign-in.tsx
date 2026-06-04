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
} from 'react-native';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#346556',
  bgDark: '#121514',
  textDark: '#1A1A1A',
  textMuted: '#707A76',
  textMutedDark: '#8F9995',
  textLight: '#FFFFFF',
};

// ── Demo credentials ────────────────────────────────
const DEMO_EMAIL    = 'demo@basalt.app';
const DEMO_PASSWORD = 'Demo@1234';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Sheet for forgot password
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetEmail, setSheetEmail] = useState('');
  const sheetAnim = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setSheetVisible(true);
    Animated.spring(sheetAnim, {
      toValue: 0,
      tension: 52,
      friction: 9,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: height,
      duration: 240,
      useNativeDriver: true,
    }).start(() => setSheetVisible(false));
  };

  const handleForgotSubmit = () => {
    closeSheet();
    router.push('/reset-password');
  };

  // Auto-fill demo credentials
  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

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

  // Sign In handler with validation
  const handleSignIn = () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      shake();
      return;
    }
    if (
      email.trim().toLowerCase() !== DEMO_EMAIL.toLowerCase() ||
      password !== DEMO_PASSWORD
    ) {
      setError('Invalid credentials. Use the demo account below.');
      shake();
      return;
    }
    // ✅ Success — go to main app
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header copy */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSub}>
            Go ahead and sign in, let everyone know how awesome you are!
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example123@domains.com"
                placeholderTextColor="#B0BAB6"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#B0BAB6"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password */}
          <TouchableOpacity onPress={openSheet} style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Error message */}
          {error ? (
            <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </Animated.View>
          ) : null}

          {/* Sign In button */}
          <TouchableOpacity
            onPress={handleSignIn}
            style={styles.signInBtn}
          >
            <Text style={styles.signInBtnText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>

        {/* ── Demo Credentials Card ───────────────────── */}
        <TouchableOpacity
          onPress={fillDemo}
          style={styles.demoCard}
          activeOpacity={0.85}
        >
          <View style={styles.demoHeader}>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO</Text>
            </View>
            <Text style={styles.demoTapHint}>Tap to auto-fill ↗</Text>
          </View>

          <View style={styles.demoRow}>
            <Text style={styles.demoFieldLabel}>Email</Text>
            <Text style={styles.demoFieldValue}>{DEMO_EMAIL}</Text>
          </View>
          <View style={styles.demoDivider} />
          <View style={styles.demoRow}>
            <Text style={styles.demoFieldLabel}>Password</Text>
            <Text style={styles.demoFieldValue}>{DEMO_PASSWORD}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ---- Forgot Password Bottom Sheet ---- */}
      {sheetVisible && (
        <>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeSheet}
          />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
            {/* Close button */}
            <TouchableOpacity onPress={closeSheet} style={styles.sheetCloseBtn}>
              <Text style={styles.sheetCloseIcon}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.sheetTitle}>Forgot Password?</Text>
            <Text style={styles.sheetSub}>
              {"Enter your email address and we'll send you a reset link."}
            </Text>

            <View style={styles.sheetInputBlock}>
              <Text style={styles.sheetLabel}>EMAIL</Text>
              <View style={styles.sheetInputWrap}>
                <TextInput
                  style={styles.sheetInput}
                  value={sheetEmail}
                  onChangeText={setSheetEmail}
                  placeholder="example123@domains.com"
                  placeholderTextColor="#3A4844"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity onPress={handleForgotSubmit} style={styles.sheetSubmitBtn}>
              <Text style={styles.sheetSubmitBtnText}>SUBMIT</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
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

  // Demo credentials card
  demoCard: {
    marginTop: 28,
    backgroundColor: '#F0FAF5',
    borderWidth: 1.5,
    borderColor: '#C9E4D4',
    borderRadius: 14,
    borderStyle: 'dashed',
    padding: 16,
    gap: 10,
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoBadge: {
    backgroundColor: '#346556',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  demoBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  demoTapHint: { fontSize: 12, color: '#346556', fontWeight: '700' },
  demoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  demoFieldLabel: { fontSize: 12, fontWeight: '600', color: '#707A76' },
  demoFieldValue: { fontSize: 13, fontWeight: '800', color: '#0D0F0E', letterSpacing: 0.2 },
  demoDivider: { height: 1, backgroundColor: '#C9E4D4' },

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
