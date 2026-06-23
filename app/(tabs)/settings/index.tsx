import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS, getColorName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLogout } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { clearAuthData } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile: backendProfile } = useProfile();

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

  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logoutMutation.mutate(undefined, {
            onSuccess: async () => {
              await clearAuthData();
              navigation.reset({ index: 0, routes: [{ name: 'sign-in' }] });
            },
            onError: async () => {
              await clearAuthData();
              navigation.reset({ index: 0, routes: [{ name: 'sign-in' }] });
            }
          });
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader title="Settings" showSearch={false} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Profile Navigation Card */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('profile'  as any)}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profile.photoUri || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.profilePhone}>{profile.mobile}</Text>
          </View>
          <View style={styles.arrowBtnBadge}>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Settings Option Cards */}
        <View style={styles.optionsList}>

          {/* Change Password Card */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('change-password' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="download-outline" size={18} color="#2563EB" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Change Password</Text>
              <Text style={styles.optionSubtitle}>Last Updated 3 Months Ago</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
          </TouchableOpacity>

          {/* Notification Card */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('notification-settings' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="notifications-outline" size={18} color="#D97706" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Notification</Text>
              <Text style={styles.optionSubtitle}>Orders, Payments, Reminders</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
          </TouchableOpacity>

          {/* Theme Colour Card */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('theme-settings' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="contrast" size={18} color={theme.primaryColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Theme Colour</Text>
              <Text style={styles.optionSubtitle}>{getColorName(theme.primaryColor)}</Text>
            </View>
            <View style={styles.radioWrapper}>
              <View style={[styles.radioCircle, { borderColor: theme.primaryColor }]}>
                <View style={[styles.radioInner, { backgroundColor: theme.primaryColor }]} />
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
            </View>
          </TouchableOpacity>

          {/* Help & Support Card */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('help-support' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="help-circle-outline" size={18} color="#3B82F6" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Help & Support</Text>
              <Text style={styles.optionSubtitle}>FAQs, Contact, Feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>Log Out</Text>
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
    paddingHorizontal: 10,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  centerLogoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 2,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 5,
    paddingBottom: 150,
  },

  // Profile Card
  profileCard: {
    backgroundColor: theme.primaryColor,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    position: 'relative',
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileMeta: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  profilePhone: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
  },
  arrowBtnBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Options
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  optionSubtitle: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Radio button inside theme row
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primaryColor,
  },

  // Logout
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '800',
  },
});
