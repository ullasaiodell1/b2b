import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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

const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#346556',
  bgDark: '#121514',
  textMutedDark: '#8F9995',
  textLight: '#FFFFFF',
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Slide-up entrance
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 52,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    router.push('/otp');
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Dimmed backdrop area (shows sign-in underneath) */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Close button */}
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.sheetTitle}>Reset Password</Text>
        <Text style={styles.sheetSub}>
          Create a new secure password for your account.
        </Text>

        {/* New Password */}
        <View style={styles.inputBlock}>
          <Text style={styles.label}>NEW PASSWORD</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#3A4844"
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showNew ? '' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputBlock}>
          <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#3A4844"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showConfirm ? '' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Password strength hint */}
        {newPassword.length > 0 && (
          <View style={styles.strengthRow}>
            {['Weak', 'Fair', 'Strong'].map((label, i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor:
                      newPassword.length >= (i + 1) * 4
                        ? i === 0
                          ? '#EF4444'
                          : i === 1
                            ? '#F59E0B'
                            : COLORS.primary
                        : '#2D3532',
                  },
                ]}
              />
            ))}
            <Text style={styles.strengthLabel}>
              {newPassword.length < 4 ? 'Weak' : newPassword.length < 8 ? 'Fair' : 'Strong'}
            </Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>SUBMIT</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(0,0,0,0)' },

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
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 14,
    gap: 16,
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

  inputBlock: { gap: 8 },
  label: { fontSize: 11, fontWeight: '800', color: COLORS.textMutedDark, letterSpacing: 1 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2422',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    height: 52,
    paddingHorizontal: 16,
  },
  input: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMutedDark,
    marginLeft: 4,
    width: 40,
  },

  submitBtn: {
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
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5, textTransform: 'uppercase' },
});
