import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCompanyDetails } from '@/services/api/company';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
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

export default function CompanyInfoScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: companyDetails, isLoading, error } = useQuery({
    queryKey: ['companyDetails', id],
    queryFn: async () => {
      const res = await getCompanyDetails(id!) as any;
      console.log('[CompanyInfo] Raw response:', JSON.stringify(res)?.slice(0, 200));
      // Backend returns { total: 1, data: [company] }
      // After axios interceptor, res = { total, data: [company] }
      if (Array.isArray(res?.data)) return res.data[0] || null;
      if (Array.isArray(res)) return res[0] || null;
      return res;
    },
    enabled: !!id,
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/company');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>
          Loading company details...
        </Text>
      </View>
    );
  }

  if (error || !id) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={{ marginTop: 12, color: COLORS.textDark, fontSize: 15, fontWeight: '700' }}>
          Error Loading Company
        </Text>
        <Text style={{ marginTop: 4, color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
          Could not find or retrieve company details from the server.
        </Text>
        <TouchableOpacity onPress={handleBack} style={styles.errorBackBtn}>
          <Text style={styles.errorBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const details = companyDetails || {};
  const initial = details.display_name ? details.display_name.charAt(0).toUpperCase() : 'C';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* Header with back button */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar and Name Header Card */}
        <View style={styles.detailHeaderCard}>
          <View style={styles.largeAvatarContainer}>
            <Text style={styles.largeAvatarText}>{initial}</Text>
          </View>
          <Text style={styles.detailDisplayName}>{details.display_name || 'N/A'}</Text>
          {details.legal_name && details.legal_name !== details.display_name && (
            <Text style={styles.detailLegalName}>{details.legal_name}</Text>
          )}
          {details.gstin && (
            <View style={[styles.gstBadge, { marginTop: 6 }]}>
              <Text style={styles.gstText}>GST: {details.gstin}</Text>
            </View>
          )}
        </View>

        {/* Contact Info Card */}
        <Text style={styles.sectionTitle}>| CONTACT INFORMATION</Text>
        <View style={styles.infoCard}>
          <View style={styles.detailInfoRow}>
            <Ionicons name="call-outline" size={18} color={theme.primaryColor} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{details.phone || 'No phone number'}</Text>
            </View>
          </View>

          <View style={styles.detailInfoRow}>
            <Ionicons name="mail-outline" size={18} color={theme.primaryColor} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{details.email || 'No email address'}</Text>
            </View>
          </View>
        </View>

        {/* Location Card */}
        <Text style={styles.sectionTitle}>| LOCATION DETAILS</Text>
        <View style={styles.infoCard}>
          <View style={styles.detailInfoRow}>
            <Ionicons name="location-outline" size={18} color={theme.primaryColor} style={styles.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{details.address || 'No address provided'}</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>{details.city || 'N/A'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>State</Text>
              <Text style={styles.infoValue}>{details.state || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Pincode</Text>
              <Text style={styles.infoValue}>{details.pincode || 'N/A'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{details.country || 'India'}</Text>
            </View>
          </View>
        </View>
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
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: COLORS.textDark,
  },
  scrollContent: {
    paddingHorizontal: 5,
    paddingTop: 5,
    gap: 2,
    paddingBottom: 150,
  },
  detailHeaderCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  largeAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  largeAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.primaryColor,
  },
  detailDisplayName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  detailLegalName: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  gstBadge: {
    backgroundColor: '#E6F4EA',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  gstText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primaryColor,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDark,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 14,
  },
  detailInfoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    marginTop: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  errorBackBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  errorBackBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
