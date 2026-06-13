import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useQuotations } from '@/hooks/useQuotations';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabType = 'ALL' | 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6B7280',
  SENT: '#F59E0B',
  VIEWED: '#3B82F6',
  ACCEPTED: '#10B981',
  REJECTED: '#EF4444',
  EXPIRED: '#9CA3AF',
  REVISED: '#8B5CF6',
  CANCELLED: '#EF4444',
  APPROVED: '#10B981',
  ORDER_CREATED: '#0EA5E9',
  PROFORMA_CREATED: '#6366F1',
};

function formatAmount(amount?: number) {
  if (!amount && amount !== 0) return '—';
  return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function QuotationScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const STATUS_TABS: { key: TabType; label: string; color: string }[] = [
    { key: 'ALL', label: 'All', color: theme.primaryColor },
    { key: 'DRAFT', label: 'Draft', color: '#6B7280' },
    { key: 'SENT', label: 'Sent', color: '#F59E0B' },
    { key: 'ACCEPTED', label: 'Accepted', color: '#10B981' },
    { key: 'REJECTED', label: 'Rejected', color: '#EF4444' },
  ];

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { quotations, isLoading, isFetching, refetch } = useQuotations();

  // Filter by tab + search
  const filtered = quotations.filter((q) => {
    const matchesTab =
      activeTab === 'ALL' || q.status === activeTab;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(q.quotation_number || '').toLowerCase().includes(searchLower) ||
      (q.lead_name || '').toLowerCase().includes(searchLower) ||
      (q.lead_company_name || '').toLowerCase().includes(searchLower) ||
      (q.company_name || '').toLowerCase().includes(searchLower) ||
      (q.dealer_company_name || '').toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  // Count per tab
  const countFor = (tab: TabType) =>
    tab === 'ALL'
      ? quotations.length
      : quotations.filter((q) => q.status === tab).length;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader title="Quotation" showSearch={false} />

      {/* SEARCH & FILTER */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotation..."
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

      {/* STATUS TABS */}
      <View style={styles.tabsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {STATUS_TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.bullet, { backgroundColor: tab.color }]} />
                <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                  {tab.label}{' '}
                  <Text style={styles.tabChipCount}>{countFor(tab.key)}</Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* LIST */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={styles.loaderText}>Loading quotations...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[theme.primaryColor]} />
          }
        >
          {filtered.map((item, index) => {
            const statusColor = STATUS_COLORS[item.status] || '#6B7280';
            const displayName =
              item.lead_name ||
              item.lead_company_name ||
              item.company_name ||
              item.dealer_company_name ||
              '—';
            const prefix = item.prefix || 'QT';
            const qNumber = item.quotation_number
              ? `# ${prefix}-${item.quotation_number}`
              : `# ${item.id.slice(0, 8).toUpperCase()}`;

            return (
              <TouchableOpacity
                key={item.id + '_' + index}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/Quotation/quotation-details',
                    params: { id: item.id },
                  })
                }
                activeOpacity={0.85}
              >
                {/* Header row: type label + status */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTypeRow}>
                    <View style={[styles.typeBullet, { backgroundColor: COLORS.blue }]} />
                    <Text style={styles.cardTypeText}>Product Quotation</Text>
                  </View>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                    • {item.status}
                  </Text>
                </View>

                {/* Quotation number */}
                <Text style={styles.cardId}>{qNumber}</Text>

                {/* Meta rows */}
                <View style={styles.metaSection}>
                  {!!displayName && displayName !== '—' && (
                    <View style={styles.metaRow}>
                      <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={styles.metaIcon} />
                      <Text style={styles.metaText} numberOfLines={1}>{displayName}</Text>
                    </View>
                  )}
                  {!!item.contact_name && (
                    <View style={styles.metaRow}>
                      <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={styles.metaIcon} />
                      <Text style={styles.metaText} numberOfLines={1}>{item.contact_name}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.separator} />

                {/* Bottom row */}
                <View style={styles.cardBottom}>
                  <View style={styles.bottomStatsLeft}>
                    <View style={styles.statsRowSub}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.bottomStatsText}>{formatDate(item.quotation_date)}</Text>
                    </View>
                    {!!item.total_items && (
                      <View style={[styles.statsRowSub, { marginTop: 6 }]}>
                        <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                        <Text style={styles.bottomStatsText}>{item.total_items} Items</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.bottomAmountRight}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>{formatAmount(item.grand_total)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filtered.length === 0 && !isLoading && (
            <View style={styles.emptyArea}>
              <Ionicons name="document-text-outline" size={48} color="#C2D3CC" />
              <Text style={styles.emptyTitle}>No quotations found</Text>
              <Text style={styles.emptySub}>Try searching another keyword or change the status tab</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom + 90, 100) }]}
        onPress={() => router.push('/(tabs)/Quotation/add-quotation')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },

  searchSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 10,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    height: '100%',
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
  filterBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },

  tabsRow: {
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsScrollContent: { paddingHorizontal: 5, gap: 4, paddingTop: 5 },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7F5',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
  },
  tabChipActive: { backgroundColor: '#E2ECE7' },
  bullet: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  tabChipText: { fontSize: 11.5, fontWeight: '700', color: COLORS.textMuted },
  tabChipTextActive: { color: COLORS.textDark, fontWeight: '800' },
  tabChipCount: { fontSize: 11.5, fontWeight: '800' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loaderText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },

  listContent: { paddingHorizontal: 4, paddingTop: 8, paddingBottom: 120, gap: 5 },

  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBullet: { width: 6, height: 6, borderRadius: 3 },
  cardTypeText: { fontSize: 12.5, fontWeight: '800', color: COLORS.blue },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  cardId: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginTop: 2 },

  metaSection: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { marginRight: 8 },
  metaText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, flex: 1 },

  separator: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomStatsLeft: { gap: 2 },
  statsRowSub: { flexDirection: 'row', alignItems: 'center' },
  bottomStatsText: { fontSize: 11.5, fontWeight: '700', color: COLORS.textMuted },
  bottomAmountRight: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 10.5, fontWeight: '700', color: COLORS.textMuted, marginBottom: 2 },
  amountValue: { fontSize: 14.5, fontWeight: '800', color: COLORS.textDark },

  emptyArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  emptySub: { fontSize: 12.5, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },

  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
});
