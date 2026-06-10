import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EmailItem {
  id: string;
  subject: string;
  company: string;
  sentTo: string;
  status: 'Opened' | 'Sent' | 'Draft' | 'Bounce';
  date: string;
  deliveryStatus: string;
}

const EMAIL_DATA: EmailItem[] = [
  {
    id: '1',
    subject: 'Order Confirmation - Website Redesi...',
    company: 'Ullas India IT Solutions Limited.',
    sentTo: 'Parth Solanki',
    status: 'Opened',
    date: '22 March 2026',
    deliveryStatus: 'Delivered',
  },
  {
    id: '2',
    subject: 'Order Confirmation - Website Redesi...',
    company: 'Ullas India IT Solutions Limited.',
    sentTo: 'Parth Solanki',
    status: 'Sent',
    date: '22 March 2026',
    deliveryStatus: 'Delivered',
  },
  {
    id: '3',
    subject: 'Follow-up on Proposal Query',
    company: 'Zenith System Pvt. Ltd.',
    sentTo: 'Khushal Nadiyapara',
    status: 'Opened',
    date: '12 April 2026',
    deliveryStatus: 'Delivered',
  },
];

export default function EmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; company?: string; searchQuery?: string }>();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState(params.searchQuery || '');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'All' | 'Opened' | 'Sent' | 'Draft' | 'Bounce'>('All');

  // Filter calculations
  const totalCount = EMAIL_DATA.length;
  const openedCount = EMAIL_DATA.filter((e) => e.status === 'Opened').length + 10; // match mockup "12"
  const sentCount = EMAIL_DATA.filter((e) => e.status === 'Sent').length + 19; // match mockup "20"
  const draftCount = 5;
  const bounceCount = 2;

  const filteredEmails = EMAIL_DATA.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sentTo.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (selectedStatusTab !== 'All') {
      matchesStatus = email.status === selectedStatusTab;
    }

    let matchesParamStatus = true;
    if (params.status) {
      matchesParamStatus = email.status === params.status;
    }

    let matchesParamCompany = true;
    if (params.company && params.company !== 'Select Company') {
      matchesParamCompany = email.company === params.company;
    }

    return matchesSearch && matchesStatus && matchesParamStatus && matchesParamCompany;
  });

  const hasActiveFilters = !!(params.status || params.company);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader title="Email" showSearch={false} />

      {/* SEARCH AND FILTERS */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Emails..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          onPress={() => router.push({
            pathname: '/(tabs)/email/email-filter',
            params: {
              status: params.status || '',
              company: params.company || '',
            }
          })}
          activeOpacity={0.8}
        >
          <Ionicons
            name="funnel-outline"
            size={16}
            color={hasActiveFilters ? COLORS.primary : COLORS.textDark}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.filterBtnText, hasActiveFilters && styles.filterBtnTextActive]}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL STATUS FILTER PILLS */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          <TouchableOpacity
            style={[styles.pill, selectedStatusTab === 'Opened' && styles.pillActive]}
            onPress={() => setSelectedStatusTab('Opened')}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
            <Text style={[styles.pillText, selectedStatusTab === 'Opened' && styles.pillTextActive]}>
              Opened <Text style={{ fontWeight: '800' }}>{openedCount}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, selectedStatusTab === 'Sent' && styles.pillActive]}
            onPress={() => setSelectedStatusTab('Sent')}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: COLORS.blue }]} />
            <Text style={[styles.pillText, selectedStatusTab === 'Sent' && styles.pillTextActive]}>
              Sent <Text style={{ fontWeight: '800' }}>{sentCount}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, selectedStatusTab === 'Draft' && styles.pillActive]}
            onPress={() => setSelectedStatusTab('Draft')}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: COLORS.orange }]} />
            <Text style={[styles.pillText, selectedStatusTab === 'Draft' && styles.pillTextActive]}>
              Draft <Text style={{ fontWeight: '800' }}>{draftCount}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, selectedStatusTab === 'Bounce' && styles.pillActive]}
            onPress={() => setSelectedStatusTab('Bounce')}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: COLORS.red }]} />
            <Text style={[styles.pillText, selectedStatusTab === 'Bounce' && styles.pillTextActive]}>
              Bounce <Text style={{ fontWeight: '800' }}>{bounceCount}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* EMAIL LIST */}
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredEmails.map((email) => {
          const isOpened = email.status === 'Opened';
          const isSent = email.status === 'Sent';
          const statusColor = isOpened ? COLORS.green : isSent ? COLORS.blue : COLORS.orange;

          return (
            <View key={email.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.dot, { backgroundColor: statusColor, marginRight: 6 }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>{email.status}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <Ionicons name="calendar-outline" size={15} color={COLORS.textMuted} style={styles.iconStyle} />
                  <View>
                    <Text style={styles.rowLabel}>Subject</Text>
                    <Text style={styles.rowValue}>{email.subject}</Text>
                  </View>
                </View>

                <View style={styles.cardRow}>
                  <Ionicons name="business-outline" size={15} color={COLORS.textMuted} style={styles.iconStyle} />
                  <View>
                    <Text style={styles.rowLabel}>Company Name</Text>
                    <Text style={styles.rowValue}>{email.company}</Text>
                  </View>
                </View>

                <View style={styles.cardRow}>
                  <Ionicons name="person-outline" size={15} color={COLORS.textMuted} style={styles.iconStyle} />
                  <View>
                    <Text style={styles.rowLabel}>Sent To</Text>
                    <Text style={styles.rowValue}>{email.sentTo}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                  <Text style={styles.footerDateText}>{email.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.green} style={{ marginRight: 4 }} />
                  <Text style={styles.deliveryText}>{email.deliveryStatus}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fabBtn, { bottom: Math.max(insets.bottom + 90, 100) }]}
        onPress={() => router.push('/(tabs)/email/add-email')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 14,
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
  searchSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 42,
  },
  filterBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  filterBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  filterBtnTextActive: {
    color: COLORS.primary,
  },
  pillsContainer: {
    backgroundColor: COLORS.bgWhite,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pillsScroll: {
    paddingHorizontal: 10,
    gap: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 5.5,
    height: 34,
  },
  pillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 5,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardBody: {
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconStyle: {
    marginRight: 10,
    marginTop: 2,
  },
  rowLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDateText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  deliveryText: {
    fontSize: 11.5,
    color: COLORS.green,
    fontWeight: '800',
  },
  fabBtn: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
});

