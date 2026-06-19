import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LedgerEntry, useLeadLedger } from '@/hooks/useLedger';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Format ISO date string → "DD/MM/YYYY" */
function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return isoStr;
  }
}

/** Format number as Indian currency without decimal — e.g. "72,090" */
function fmtAmount(n: number): string {
  return Math.abs(Math.round(n)).toLocaleString('en-IN');
}

/** Format number as Indian currency with 2 decimal places */
function fmtBalance(n: number): string {
  return Math.abs(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Build default date range: first day of current month (local midnight) → last day (local 23:59:59) */
function buildDefaultRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LeadLedgerScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const params = (route.params ?? {}) as {
    leadId?: string;
    leadName?: string;
    company?: string;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    filterApplied?: string;
  };

  const companyName = params.company || params.leadName || 'Lead';

  // Default date range
  const defaultRange = useMemo(() => buildDefaultRange(), []);
  const filterType = params.type || 'All Types';
  const filterCategory = params.category || 'All Categories';
  const filterStart = params.startDate || defaultRange.start;
  const filterEnd = params.endDate || defaultRange.end;

  const isFilterActive =
    filterType !== 'All Types' ||
    filterCategory !== 'All Categories' ||
    filterStart !== defaultRange.start ||
    filterEnd !== defaultRange.end;

  const [searchQuery, setSearchQuery] = useState('');

  // ── API: pass date range as query params ──────────────────────────
  const apiParams = useMemo(() => ({
    startDate: filterStart,
    endDate: filterEnd,
  }), [filterStart, filterEnd]);

  const { data: ledgerData, isLoading } = useLeadLedger(params.leadId || '', apiParams);

  const items = ledgerData?.items ?? [];
  const openingBalance = ledgerData?.openingBalance ?? 0;

  // ── Client-side filtering (type / category / search) ─────────────
  const filtered = useMemo(() => {
    let list = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        item.refNo.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item._type.toLowerCase().includes(q) ||
        item.accountName.toLowerCase().includes(q) ||
        formatDate(item.date).includes(q)
      );
    }

    if (filterType === 'Credit') {
      list = list.filter(item => item.entryType === 'credit');
    } else if (filterType === 'Debit') {
      list = list.filter(item => item.entryType === 'debit');
    }

    if (filterCategory !== 'All Categories') {
      const cat = filterCategory.toLowerCase();
      list = list.filter(item => item.category.toLowerCase().includes(cat));
    }

    return list;
  }, [items, searchQuery, filterType, filterCategory]);

  // ── Summary totals ────────────────────────────────────────────────
  const totals = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;

    filtered.forEach(item => {
      if (item.entryType === 'credit') totalCredit += item.amount;
      else totalDebit += item.amount;
    });

    // closing balance = opening + credits - debits
    const closingBal = openingBalance + totalCredit - totalDebit;
    const isDR = closingBal < 0;

    return {
      opening: openingBalance,
      credit: totalCredit,
      debit: totalDebit,
      closing: closingBal,
      isDR,
    };
  }, [filtered, openingBalance]);

  // ── Helpers for filters ───────────────────────────────────────────
  const formatDateChip = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch { return iso; }
  };

  const handleClearFilters = () => {
    navigation.setParams({
      type: 'All Types',
      category: 'All Categories',
      startDate: defaultRange.start,
      endDate: defaultRange.end,
      filterApplied: undefined,
    } as any);
  };

  // ── Initials for company badge ────────────────────────────────────
  const initials = companyName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>{initials}</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>{companyName}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ledger-filter' as never, {
            referrer: 'lead-ledger',
            leadId: params.leadId || '',
            company: companyName,
            type: filterType,
            category: filterCategory,
            startDate: filterStart,
            endDate: filterEnd,
          } as never)}
        >
          <Ionicons name="funnel-outline" size={20} color={isFilterActive ? theme.primaryColor : COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SEARCH + FILTER ROW ──────────────────────────────────── */}
        <View style={styles.filterRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ledger..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 2 }}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, isFilterActive && { borderColor: theme.primaryColor }]}
            onPress={() => navigation.navigate('ledger-filter' as never, {
              referrer: 'lead-ledger',
              leadId: params.leadId || '',
              company: companyName,
              type: filterType,
              category: filterCategory,
              startDate: filterStart,
              endDate: filterEnd,
            } as never)}
            activeOpacity={0.85}
          >
            <Ionicons name="funnel-outline" size={16} color={isFilterActive ? theme.primaryColor : COLORS.textDark} style={{ marginRight: 4 }} />
            <Text style={[styles.filterBtnText, isFilterActive && { color: theme.primaryColor }]}>
              {isFilterActive ? 'Filters (Active)' : 'Filters'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── ACTIVE FILTER CHIPS ──────────────────────────────────── */}
        {isFilterActive && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {filterType !== 'All Types' && (
              <TouchableOpacity style={styles.chip} onPress={() => navigation.setParams({ type: 'All Types' } as any)}>
                <Text style={styles.chipText}>Type: {filterType}</Text>
                <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            {filterCategory !== 'All Categories' && (
              <TouchableOpacity style={styles.chip} onPress={() => navigation.setParams({ category: 'All Categories' } as any)}>
                <Text style={styles.chipText}>Category: {filterCategory}</Text>
                <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            {filterStart !== defaultRange.start && (
              <TouchableOpacity style={styles.chip} onPress={() => navigation.setParams({ startDate: defaultRange.start } as any)}>
                <Text style={styles.chipText}>From: {formatDateChip(filterStart)}</Text>
                <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            {filterEnd !== defaultRange.end && (
              <TouchableOpacity style={styles.chip} onPress={() => navigation.setParams({ endDate: defaultRange.end } as any)}>
                <Text style={styles.chipText}>To: {formatDateChip(filterEnd)}</Text>
                <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.clearChip} onPress={handleClearFilters}>
              <Text style={styles.clearChipText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── BALANCE SUMMARY CARD ─────────────────────────────────── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>CLOSING BALANCE</Text>
            <View style={[styles.drBadge, !totals.isDR && styles.crBadge]}>
              <Text style={[styles.drBadgeText, !totals.isDR && styles.crBadgeText]}>
                {totals.isDR ? 'DR' : 'CR'}
              </Text>
            </View>
          </View>

          <Text style={[styles.balanceAmount, !totals.isDR && { color: '#15803D' }]}>
            ₹{fmtBalance(totals.closing)}
          </Text>

          {/* Opening balance row */}
          <View style={styles.openingRow}>
            <Text style={styles.openingLabel}>Opening Balance</Text>
            <Text style={styles.openingValue}>₹{fmtBalance(openingBalance)}</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>TOTAL CREDIT</Text>
              <Text style={styles.creditValue}>+₹{fmtAmount(totals.credit)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={[styles.metricItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.metricLabel}>TOTAL DEBIT</Text>
              <Text style={styles.debitValue}>-₹{fmtAmount(totals.debit)}</Text>
            </View>
          </View>
        </View>

        {/* ── LEDGER TABLE ─────────────────────────────────────────── */}
        {/* ── LEDGER LIST ─────────────────────────────────────────── */}
        <View style={styles.tableCard}>
          {isLoading ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="large" color={theme.primaryColor} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          ) : (
            filtered.map((item: LedgerEntry, idx: number) => {
              const isCredit = item.entryType === 'credit';
              const isLast = idx === filtered.length - 1;

              // Format amount: +80,000.00 or -900.00
              const amtFormatted = item.amount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              const amtDisplay = isCredit ? `+${amtFormatted}` : `-${amtFormatted}`;

              // Format balance: bal: -2,77,435.25
              const balFormatted = Math.abs(item.closingBalance).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              const balDisplay = `bal: ${item.closingBalance < 0 ? '-' : ''}${balFormatted}`;

              // Format date: 19-jun-2026
              const dateDisplay = (() => {
                try {
                  const d = new Date(item.date);
                  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                  return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
                } catch { return item.date; }
              })();

              // Category label: "customer payment", "sale" etc. — from category field only
              const categoryLabel = (item.category || '').replace(/_/g, ' ').toLowerCase();

              // Account label shown below date
              const accountLabel = item.accountName || '';

              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  {/* LEFT: category, date, accountLabel */}
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginBottom: 4, textTransform: 'lowercase' }}>
                      {categoryLabel || '—'}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#4B5563', marginBottom: 3 }}>
                      {dateDisplay}
                    </Text>
                    {accountLabel ? (
                      <Text style={{ fontSize: 12, fontWeight: '400', color: COLORS.textMuted }}>
                        {accountLabel}
                      </Text>
                    ) : null}
                  </View>

                  {/* RIGHT: amount, balance, refNo */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{
                      fontSize: 17,
                      fontWeight: '800',
                      color: isCredit ? '#16A34A' : '#DC2626',
                      marginBottom: 4,
                    }}>
                      {amtDisplay}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 3 }}>
                      {balDisplay}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280' }}>
                      #{item.serialNumber || item.refNo}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (theme: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F9FAFB' },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      backgroundColor: COLORS.bgWhite,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderColor: '#E5E7EB',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
    headerBtn: {
      width: 36, height: 36, borderRadius: 8,
      backgroundColor: '#F3F4F6',
      alignItems: 'center', justifyContent: 'center',
    },
    logoBadge: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: '#F3EAD8',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: '#D4AF37',
    },
    logoText: { fontSize: 10, fontWeight: '800', color: '#B8860B' },
    headerTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, flex: 1 },

    scrollContent: { padding: 12, gap: 12 },

    // Filter row
    filterRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 45,
    },
    searchInput: {
      flex: 1,
      fontSize: 12.5,
      color: COLORS.textDark,
      fontWeight: '600',
      height: '100%',
      paddingVertical: 0,
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.bgWhite,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      height: 38,
    },
    filterBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },

    // Chips
    chipsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
    chip: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#E0F2FE',
      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
      borderWidth: 1, borderColor: '#BAE6FD',
    },
    chipText: { fontSize: 11.5, fontWeight: '700', color: '#0369A1' },
    clearChip: {
      backgroundColor: '#F3F4F6', borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 6,
      borderWidth: 1, borderColor: '#E5E7EB',
    },
    clearChipText: { fontSize: 11.5, fontWeight: '700', color: COLORS.textDark },

    // Balance card
    balanceCard: {
      backgroundColor: COLORS.bgWhite,
      borderRadius: 14, padding: 12,
      borderWidth: 1, borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03, shadowRadius: 4, elevation: 2,
      gap: 12,
    },
    balanceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    balanceLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.5 },
    balanceAmount: { fontSize: 28, fontWeight: '900', color: '#B91C1C' },

    drBadge: {
      backgroundColor: '#FEE2E2',
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    drBadgeText: { fontSize: 11, fontWeight: '900', color: '#B91C1C' },
    crBadge: { backgroundColor: '#DCFCE7' },
    crBadgeText: { color: '#15803D' },

    openingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    openingLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
    openingValue: { fontSize: 12, fontWeight: '800', color: COLORS.textDark },

    metricsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderColor: '#F3F4F6',
      paddingTop: 12,
      alignItems: 'center',
    },
    metricItem: { flex: 1 },
    metricDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB', marginHorizontal: 12 },
    metricLabel: { fontSize: 9.5, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4 },
    creditValue: { fontSize: 14, fontWeight: '800', color: '#15803D' },
    debitValue: { fontSize: 14, fontWeight: '800', color: '#B91C1C' },

    // List Container
    tableCard: {
      backgroundColor: COLORS.bgWhite,
      borderRadius: 14,
      borderWidth: 1, borderColor: COLORS.border,
      overflow: 'hidden',
    },
    emptyBox: { paddingVertical: 40, alignItems: 'center', gap: 8 },
    emptyText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  });
