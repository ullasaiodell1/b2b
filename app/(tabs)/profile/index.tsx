import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useLogout } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { clearAuthData } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, isLoading, isFetching, refetch } = useProfile();
  const logoutMutation = useLogout();

  React.useEffect(() => {
    if (profile) {
      console.log('[ProfileScreen] Rendered profile data:', profile);
    }
  }, [profile]);

  if (isLoading && !profile.fullName) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const formatDob = (dob: string) => {
    if (!dob) return '';
    // Convert ISO "YYYY-MM-DD" to "DD MMM YYYY"
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      const [y, m, d] = dob.split('-').map(Number);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${String(d).padStart(2,'0')} ${months[m-1]} ${y}`;
    }
    return dob;
  };

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
              router.replace('/sign-in' as any);
            },
            onError: async () => {
              // Always clean local storage and redirect even if network request fails
              await clearAuthData();
              router.replace('/sign-in' as any);
            }
          });
        },
      },
    ]);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${profile.mobile}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${profile.email}`);
  };

  const handleAlertValue = (title: string, value: string) => {
    Alert.alert(title, value, [{ text: 'OK' }]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader title="Profile" showSearch={false} />

      {/* ── 2. SCROLLABLE CONTAINER ────────────────── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >

        {/* Profile Card Block */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profile.photoUri || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.profileMobile}>{profile.mobile}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtnBadge}
            activeOpacity={0.8}
            onPress={() => router.push('/profile/edit-profile' as any)}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 4 Quick Action Row */}
        <View style={styles.quickActionsRow}>
          {/* Call */}
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}
            activeOpacity={0.7}
            onPress={handleCall}
          >
            <Ionicons name="call-outline" size={18} color="#2563EB" />
            <Text style={styles.quickActionText}>Call</Text>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}
            activeOpacity={0.7}
            onPress={handleEmail}
          >
            <Ionicons name="mail-outline" size={18} color="#059669" />
            <Text style={styles.quickActionText}>Email</Text>
          </TouchableOpacity>

          {/* GST */}
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}
            activeOpacity={0.7}
            onPress={() => handleAlertValue('GST Number', profile.gstNo)}
          >
            <Ionicons name="card-outline" size={18} color="#D97706" />
            <Text style={styles.quickActionText}>GST No.</Text>
          </TouchableOpacity>

          {/* PAN */}
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}
            activeOpacity={0.7}
            onPress={() => handleAlertValue('PAN Number', profile.panNo)}
          >
            <Ionicons name="document-text-outline" size={18} color="#7C3AED" />
            <Text style={styles.quickActionText}>PAN No.</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* Information Table Card */}
        <View style={styles.infoSheet}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Full Name</Text>
            <Text style={styles.infoVal}>{profile.fullName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Mobile</Text>
            <Text style={styles.infoVal}>{profile.mobile}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Date Of Birth</Text>
            <Text style={styles.infoVal}>{profile.dob}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Email</Text>
            <Text style={styles.infoVal}>{profile.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Gender</Text>
            <Text style={styles.infoVal}>{profile.gender}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>GST No.:</Text>
            <Text style={styles.infoVal}>{profile.gstNo}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>PAN No.:</Text>
            <Text style={styles.infoVal}>{profile.panNo}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoKey}>Address</Text>
            <Text style={styles.infoVal}>{profile.address}</Text>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 40,
  },

  // Profile Green Card
  profileCard: {
    backgroundColor: COLORS.primary,
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
  profileDetails: {
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
  profileMobile: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
  },
  editBtnBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 4 Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // Section divider
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Info Sheet
  infoSheet: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F6F4',
    gap: 12,
  },
  infoKey: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'right',
    flex: 1,
  },

  // Logout Button
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
  logoutText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '800',
  },
});
