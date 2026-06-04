import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openDrawer } from '@/components/DrawerState';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
  blue: '#3B82F6',
  orange: '#F97316',
  red: '#EF4444',
  green: '#10B981',
};

type StatusType = 'All' | 'Accepted' | 'Sent' | 'Rejected';

interface Quotation {
  id: string;
  type: string;
  status: 'Accepted' | 'Sent' | 'Rejected';
  company: string;
  owner: string;
  address: string;
  date: string;
  items: string;
  amount: string;
}

const QUOTATION_DATA: Quotation[] = [
  {
    id: '# QT-2026-001',
    type: 'Product Quotation',
    status: 'Sent',
    company: 'NovaTech Solutions Pvt. Ltd.',
    owner: 'Arjun Maheta',
    address: 'The Grand Thakar Hotel, Rajkot',
    date: '22 March 2026',
    items: '21 Items',
    amount: '₹ 10,00,000.00',
  },
  {
    id: '# QT-2026-001',
    type: 'Project Based Quotation',
    status: 'Accepted',
    company: 'NovaTech Solutions Pvt. Ltd.',
    owner: 'Arjun Maheta',
    address: 'The Grand Thakar Hotel, Rajkot',
    date: '22 March 2026',
    items: '21 Items',
    amount: '₹ 10,00,000.00',
  },
  {
    id: '# QT-2026-002',
    type: 'Services Based Quotation',
    status: 'Sent',
    company: 'NovaTech Solutions Pvt. Ltd.',
    owner: 'Arjun Maheta',
    address: 'The Grand Thakar Hotel, Rajkot',
    date: '22 March 2026',
    items: '21 Items',
    amount: '₹ 10,00,000.00',
  },
];

export default function QuotationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<StatusType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = QUOTATION_DATA.filter(item => {
    const matchesTab = activeTab === 'All' || item.status === activeTab;
    const matchesSearch =
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16), justifyContent: 'center', position: 'relative' }]}>
        <View style={styles.centerLogoSection}>
          <Ionicons name="star" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.logoText}>BASALT</Text>
        </View>
      </View>

      {/* ── SEARCH & FILTER CONTROLS ──────────────── */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Quotation..."
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
          style={styles.filterBtn} 
          onPress={() => router.push('/(tabs)/Quotation/quotation-filter')}
          activeOpacity={0.8}
        >
          <Ionicons name="funnel-outline" size={16} color={COLORS.textDark} style={{ marginRight: 4 }} />
          <Text style={styles.filterBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* ── HORIZONTAL TABS ───────────────────────── */}
      <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          {(['All', 'Accepted', 'Sent', 'Rejected'] as StatusType[]).map((tab) => {
            const count = tab === 'All' ? 12 : tab === 'Accepted' ? 20 : tab === 'Sent' ? 5 : 3;
            const bulletColor = tab === 'All' ? COLORS.green : tab === 'Accepted' ? COLORS.blue : tab === 'Sent' ? COLORS.orange : COLORS.red;
            const isSelected = activeTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <View style={[styles.bullet, { backgroundColor: bulletColor }]} />
                <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                  {tab} <Text style={styles.tabChipCount}>{count}</Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── QUOTATION LIST ────────────────────────── */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredData.map((item, index) => {
          const statusConfig = {
            Sent: { text: 'Sent', color: COLORS.orange },
            Accepted: { text: 'Accepted', color: COLORS.blue },
            Rejected: { text: 'Rejected', color: COLORS.red },
          }[item.status];

          return (
            <TouchableOpacity 
              key={index} 
              style={styles.card}
              onPress={() => router.push('/(tabs)/Quotation/quotation-details')}
              activeOpacity={0.85}
            >
              
              {/* Card Title Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTypeRow}>
                  <View style={[styles.typeBullet, { backgroundColor: COLORS.blue }]} />
                  <Text style={styles.cardTypeText}>{item.type}</Text>
                </View>
                <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                  • {statusConfig.text}
                </Text>
              </View>

              {/* ID Number */}
              <Text style={styles.cardId}>{item.id}</Text>

              {/* Meta Properties */}
              <View style={styles.metaSection}>
                <View style={styles.metaRow}>
                  <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={styles.metaIcon} />
                  <Text style={styles.metaText} numberOfLines={1}>{item.company}</Text>
                </View>
                
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={styles.metaIcon} />
                  <Text style={styles.metaText} numberOfLines={1}>{item.owner}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textMuted} style={styles.metaIcon} />
                  <Text style={styles.metaText} numberOfLines={1}>{item.address}</Text>
                </View>
              </View>

              {/* Separator line */}
              <View style={styles.separator} />

              {/* Bottom stats row */}
              <View style={styles.cardBottom}>
                <View style={styles.bottomStatsLeft}>
                  <View style={styles.statsRowSub}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.bottomStatsText}>{item.date}</Text>
                  </View>
                  <View style={[styles.statsRowSub, { marginTop: 6 }]}>
                    <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.bottomStatsText}>{item.items}</Text>
                  </View>
                </View>

                <View style={styles.bottomAmountRight}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amountValue}>{item.amount}</Text>
                </View>
              </View>

            </TouchableOpacity>
          );
        })}

        {filteredData.length === 0 && (
          <View style={styles.emptyArea}>
            <Ionicons name="document-text-outline" size={48} color="#C2D3CC" />
            <Text style={styles.emptyTitle}>No quotations found</Text>
            <Text style={styles.emptySub}>Try searching another keyword or status tab</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom + 90, 100) }]}
        onPress={() => router.push('/(tabs)/Quotation/add-quotation')}
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
    paddingHorizontal: 20,
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

  // Search section
  searchSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
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
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Horizontal Tabs Row
  tabsRow: {
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7F5',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
  },
  tabChipActive: {
    backgroundColor: '#E2ECE7',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tabChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabChipTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },
  tabChipCount: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  // List Cards
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardTypeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.blue,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardId: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  metaSection: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomStatsLeft: {
    gap: 2,
  },
  statsRowSub: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomStatsText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  bottomAmountRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Empty State
  emptyArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // FAB
  fab: {
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
