import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HelpSupportScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();

  const handleEmail = () => {
    Linking.openURL('mailto:Support@company.com');
  };

  const handleCall = () => {
    Linking.openURL('tel:+919099023412');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>HELP & SUPPORT</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Support Banner Card */}
        <View style={styles.bannerCard}>
          <Ionicons name="cloud-done-outline" size={32} color="#FFFFFF" />
          <Text style={styles.bannerTitle}>How Can We Help?</Text>
          <Text style={styles.bannerSubtitle}>Ask questions or get in touch with the team.</Text>
        </View>

        {/* Contact Information List */}
        <View style={styles.infoList}>
          {/* Email */}
          <TouchableOpacity onPress={handleEmail} style={styles.infoRow} activeOpacity={0.8}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="mail" size={20} color="#3B82F6" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>Support@company.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Call */}
          <TouchableOpacity onPress={handleCall} style={styles.infoRow} activeOpacity={0.8}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="call" size={20} color="#F97316" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Call</Text>
              <Text style={styles.rowValue}>+91 9099023412</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Location */}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]} >
            <View style={[styles.iconCircle, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="location" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Location</Text>
              <Text style={styles.rowValue}>Rajkot , Gujarat , India</Text>
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
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
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
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 1,
  },

  scrollContent: {
    padding: 5,
    gap: 5,
    paddingBottom: 150,
  },

  // Banner
  bannerCard: {
    backgroundColor: theme.primaryColor,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    gap: 2,
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#D1E7DD',
    fontWeight: '600',
    textAlign: 'center',
  },

  // List info
  infoList: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
    gap: 1,
  },
  rowLabel: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  rowValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '800',
  },
});
