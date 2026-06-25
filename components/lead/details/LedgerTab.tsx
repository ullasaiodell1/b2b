import { serverDetails } from '@/config';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadLedger } from '@/hooks/useLedger';
import { getAuthToken } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const defaultStartDateStr = new Date(2026, 5, 1).toISOString(); // 01 June 2026
const defaultEndDateStr = new Date(2026, 5, 30).toISOString();  // 30 June 2026

interface LedgerTabProps {
  leadId: string;
  dbLead: any;
}

export default function LedgerTab({ leadId, dbLead }: LedgerTabProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params ?? {};

  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [ledgerDownloading, setLedgerDownloading] = useState(false);

  const filterType = params.lType || 'All Types';
  const filterCategory = params.lCategory || 'All Categories';
  const filterStartDate = params.lStartDate || defaultStartDateStr;
  const filterEndDate = params.lEndDate || defaultEndDateStr;

  const lFilterActive = filterType !== 'All Types' ||
    filterCategory !== 'All Categories' ||
    filterStartDate !== defaultStartDateStr ||
    filterEndDate !== defaultEndDateStr;

  const { data: apiLedger } = useLeadLedger(leadId);

  const handleDownloadLedger = async () => {
    setLedgerDownloading(true);
    try {
      const token = await getAuthToken();
      const cleanName = (dbLead?.company || dbLead?.name || 'Lead')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      const filename = `ledger_${cleanName}.pdf`;

      const downloadUrl = `${serverDetails.serverProxyURL}/leads/${leadId}/ledger/download?startDate=${filterStartDate}&endDate=${filterEndDate}`;
      console.log(`[LedgerDownload] Starting download from URL: ${downloadUrl}`);

      if (Platform.OS === 'web') {
        const response = await fetch(downloadUrl, {
          headers: { Authorization: token || '' },
        });
        if (!response.ok) throw new Error('Failed to download ledger PDF from server');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const localUri = FileSystem.documentDirectory + filename;
        const { uri } = await FileSystem.downloadAsync(
          downloadUrl,
          localUri,
          { headers: { Authorization: token || '' } }
        );
        console.log(`[LedgerDownload] File downloaded successfully to: ${uri}`);

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Share Ledger PDF`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Downloaded', `Ledger PDF saved to:\n${uri}`);
        }
      }
    } catch (err: any) {
      console.error('[Download Ledger Error]:', err);
      Alert.alert('Error', err?.message || 'Failed to download ledger PDF.');
    } finally {
      setLedgerDownloading(false);
    }
  };

  const ledgerItems = apiLedger?.items ?? [];
  const openingBalance = apiLedger?.openingBalance ?? 0;

  // Format helpers
  const fmtAmt = (n: number) =>
    Math.abs(Math.round(n)).toLocaleString('en-IN');
  const fmtBal = (n: number) =>
    Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch { return iso; }
  };
  const formatDateChip = (iso: string) => fmtDate(iso);

  // Client-side filtering
  let filtered = [...ledgerItems];

  if (ledgerSearchQuery.trim()) {
    const q = ledgerSearchQuery.toLowerCase();
    filtered = filtered.filter((item: any) =>
      item.refNo.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.accountName || '').toLowerCase().includes(q) ||
      fmtDate(item.date).includes(q)
    );
  }
  if (filterType === 'Credit') {
    filtered = filtered.filter((item: any) => item.entryType === 'credit');
  } else if (filterType === 'Debit') {
    filtered = filtered.filter((item: any) => item.entryType === 'debit');
  }
  if (filterCategory !== 'All Categories') {
    const cat = filterCategory.toLowerCase();
    filtered = filtered.filter((item: any) => item.category.toLowerCase().includes(cat));
  }

  // Totals
  let totalCredit = 0;
  let totalDebit = 0;
  filtered.forEach((item: any) => {
    if (item.entryType === 'credit') totalCredit += item.amount;
    else totalDebit += item.amount;
  });
  const closingBal = openingBalance + totalCredit - totalDebit;
  const isDR = closingBal < 0;

  const handleClearAllFilters = () => {
    navigation.setParams({
      lType: 'All Types',
      lCategory: 'All Categories',
      lStartDate: defaultStartDateStr,
      lEndDate: defaultEndDateStr,
      lFilterApplied: undefined,
    } as any);
  };

  const currentLeadCompany = dbLead?.company || '';

  return (
    <View style={{ gap: 1 }}>
      {/* SEARCH AND FILTERS ROW */}
      <View style={styles.filterDatePickerRow}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6, paddingLeft: 6, marginTop: 6 }} />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search ledger..."
            placeholderTextColor="#9CA3AF"
            value={ledgerSearchQuery}
            onChangeText={setLedgerSearchQuery}
            autoCorrect={false}
            autoComplete="off"
          />
          {ledgerSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setLedgerSearchQuery('')} style={{ padding: 2 }}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() => navigation.navigate('ledger-filter' as never, {
            referrer: 'lead-details',
            leadId: leadId,
            company: currentLeadCompany,
            type: filterType,
            category: filterCategory,
            startDate: filterStartDate,
            endDate: filterEndDate,
          } as never)}
          activeOpacity={0.85}
        >
          <Ionicons name="funnel-outline" size={16} color={lFilterActive ? theme.primaryColor : COLORS.textDark} style={{ marginRight: 4 }} />
          <Text style={[styles.filterIconBtnText, lFilterActive && { color: theme.primaryColor }]}>
            {lFilterActive ? 'Filters (Active)' : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVE FILTER CHIPS */}
      {lFilterActive && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
          {filterType !== 'All Types' && (
            <TouchableOpacity style={styles.filterChip} onPress={() => navigation.setParams({ lType: 'All Types' } as any)} activeOpacity={0.8}>
              <Text style={styles.filterChipText}>Type: {filterType}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
          {filterCategory !== 'All Categories' && (
            <TouchableOpacity style={styles.filterChip} onPress={() => navigation.setParams({ lCategory: 'All Categories' } as any)} activeOpacity={0.8}>
              <Text style={styles.filterChipText}>Category: {filterCategory}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
          {filterStartDate !== defaultStartDateStr && (
            <TouchableOpacity style={styles.filterChip} onPress={() => navigation.setParams({ lStartDate: defaultStartDateStr } as any)} activeOpacity={0.8}>
              <Text style={styles.filterChipText}>From: {formatDateChip(filterStartDate)}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
          {filterEndDate !== defaultEndDateStr && (
            <TouchableOpacity style={styles.filterChip} onPress={() => navigation.setParams({ lEndDate: defaultEndDateStr } as any)} activeOpacity={0.8}>
              <Text style={styles.filterChipText}>To: {formatDateChip(filterEndDate)}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E7EB' }}
            onPress={handleClearAllFilters}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 11.5, fontWeight: '700', color: COLORS.textDark }}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* BALANCE SUMMARY CARD */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>CLOSING BALANCE</Text>
          <TouchableOpacity
            onPress={handleDownloadLedger}
            disabled={ledgerDownloading}
            style={styles.downloadBtn}
            activeOpacity={0.7}
          >
            {ledgerDownloading ? (
              <ActivityIndicator size="small" color={theme.primaryColor} />
            ) : (
              <Ionicons name="download-outline" size={22} color={theme.primaryColor} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.balanceRow}>
          <Text style={[styles.balanceAmount, !isDR && { color: '#15803D' }]}>
            ₹{fmtBal(closingBal)}
          </Text>
          <View style={[styles.drBadge, !isDR && { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.drBadgeText, !isDR && { color: '#15803D' }]}>
              {isDR ? 'DR' : 'CR'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 1, marginTop: -10 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textMuted }}>Opening Balance</Text>
          <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.textDark }}>₹{fmtBal(openingBalance)}</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.ledgerMetricItem}>
            <Text style={styles.ledgerMetricLabel}>TOTAL CREDIT</Text>
            <Text style={styles.creditValue}>+₹{fmtAmt(totalCredit)}</Text>
          </View>
          <View style={styles.ledgerMetricItem}>
            <Text style={styles.ledgerMetricLabel}>TOTAL DEBIT</Text>
            <Text style={styles.debitValue}>-₹{fmtAmt(totalDebit)}</Text>
          </View>
        </View>
      </View>

      {/* LEDGER CARDS */}
      <View style={styles.tableCard}>
        {filtered.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Ionicons name="document-text-outline" size={32} color={COLORS.textMuted} />
            <Text style={{ marginTop: 1, fontSize: 13, color: COLORS.textMuted, fontWeight: '600' }}>
              No records found.
            </Text>
          </View>
        ) : (
          filtered.map((item: any, index: number) => {
            const isCredit = item.entryType === 'credit';
            const amtFormatted = item.amount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            const amtDisplay = isCredit ? `+${amtFormatted}` : `-${amtFormatted}`;

            const balFormatted = Math.abs(item.closingBalance).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            const balDisplay = `bal: ${item.closingBalance < 0 ? '-' : ''}${balFormatted}`;

            const dateDisplay = (() => {
              try {
                const d = new Date(item.date);
                const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
              } catch { return item.date; }
            })();

            const categoryLabel = (item.category || '').replace(/_/g, ' ').toLowerCase();
            const accountLabel = item.accountName || '';

            return (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderBottomWidth: index === filtered.length - 1 ? 0 : 1,
                  borderBottomColor: COLORS.border,
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginBottom: 1 }}>
                    {categoryLabel || '—'}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: '#4B5563', marginBottom: 1 }}>
                    {dateDisplay}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '400', color: COLORS.textMuted, marginBottom: 1 }}>
                    {accountLabel}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{
                    fontSize: 17,
                    fontWeight: '800',
                    color: isCredit ? '#16A34A' : '#DC2626',
                    marginBottom: 1,
                  }}>
                    {amtDisplay}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 1 }}>
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
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  filterDatePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textDark,
    fontWeight: '600',
    height: '100%',
    paddingVertical: 0,
  },
  filterIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  filterIconBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  balanceCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  downloadBtn: {
    padding: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#B91C1C',
  },
  drBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  drBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B91C1C',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingTop: 6,
  },
  creditValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  debitValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B91C1C',
  },
  tableCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 6,
  },
  ledgerMetricItem: {
    flex: 1,
  },
  ledgerMetricLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
});
