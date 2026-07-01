import CustomHeader from '@/components/custom/CustomHeader';
import { ProformaCard } from '@/components/order&quotations/ProformaCard';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProformas } from '@/hooks/useProforma';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export interface ProformasComponentProps {
  leadId?: string;
  isEmbedded?: boolean;
  onFilterPress?: () => void;
  onProformaDetails?: (id: string) => void;
}

export const ProformasComponent: React.FC<ProformasComponentProps> = ({
  leadId,
  isEmbedded = false,
  onFilterPress,
  onProformaDetails,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    pStartDate?: string;
    pEndDate?: string;
    pFilterApplied?: string;
  }>();
  const pFilterActive = !!(params.pStartDate || params.pEndDate);

  const [searchQuery, setSearchQuery] = useState('');

  const filterParams = React.useMemo(() => {
    const cleanedParams: any = {};
    if (params.pStartDate) cleanedParams.startDate = params.pStartDate;
    if (params.pEndDate) cleanedParams.endDate = params.pEndDate;
    if (searchQuery) cleanedParams.search = searchQuery;
    if (leadId) cleanedParams.lead_id = leadId;
    return cleanedParams;
  }, [params.pStartDate, params.pEndDate, searchQuery, leadId]);

  const { data: proformas = [], isLoading, isFetching, refetch } = useProformas(filterParams);

  const handleClearFilters = () => {
    (navigation as any).setParams({
      pStartDate: '',
      pEndDate: '',
      pFilterApplied: ''
    });
  };

  const handleFilterPress = () => {
    if (onFilterPress) {
      onFilterPress();
    } else {
      const targetScreen = leadId ? 'lead-proforma-filter' : 'proforma-filter';
      (navigation as any).navigate(targetScreen, {
        referrer: leadId ? 'lead-proforma' : 'proformas-index',
        pStartDate: params.pStartDate || '',
        pEndDate: params.pEndDate || '',
        leadId,
      });
    }
  };

  const handleDetailsPress = (id: string) => {
    if (onProformaDetails) {
      onProformaDetails(id);
    } else {
      const targetScreen = leadId ? 'lead-proforma-details' : 'proforma-details';
      (navigation as any).navigate(targetScreen, { id, leadId });
    }
  };

  // Filter by search, leadId, and date range locally just in case
  const filtered = proformas.filter((p) => {
    // Lead ID filter
    const matchesLead = !leadId || String(p.lead_id || '') === String(leadId);

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(p.formatted_proforma_number || '').toLowerCase().includes(searchLower) ||
      String(p.proforma_number || '').includes(searchLower) ||
      (p.lead_name || '').toLowerCase().includes(searchLower) ||
      (p.lead_company_name || '').toLowerCase().includes(searchLower) ||
      (p.company_name || '').toLowerCase().includes(searchLower) ||
      (p.dealer_company_name || '').toLowerCase().includes(searchLower) ||
      (p.customer_name || '').toLowerCase().includes(searchLower);

    // Date filter
    let matchesDate = true;
    if (params.pStartDate) {
      const pDate = p.created_at || p.quotation_date;
      if (pDate) {
        const time = new Date(pDate).getTime();
        const start = new Date(params.pStartDate).getTime();
        if (time < start) matchesDate = false;
      }
    }
    if (params.pEndDate) {
      const pDate = p.created_at || p.quotation_date;
      if (pDate) {
        const time = new Date(pDate).getTime();
        const end = new Date(params.pEndDate).getTime();
        if (time > end) matchesDate = false;
      }
    }

    return matchesLead && matchesSearch && matchesDate;
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      {!isEmbedded && (
        <CustomHeader
          title="Proforma Invoices"
          showSearch={false}
          showBack={!!leadId}
          onBackPress={() => navigation.goBack()}
        />
      )}

      {/* SEARCH & FILTER */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search proforma..."
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
          onPress={handleFilterPress}
          activeOpacity={0.8}
        >
          <Ionicons name="funnel-outline" size={16} color={pFilterActive ? theme.primaryColor : COLORS.textDark} style={{ marginRight: 4 }} />
          <Text style={[styles.filterBtnText, pFilterActive && { color: theme.primaryColor }]}>
            {pFilterActive ? 'Filters (Active)' : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {pFilterActive && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={styles.filterChip}
              onPress={handleClearFilters}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={12} color="#0369A1" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>Date: {formatDate(params.pStartDate)} - {formatDate(params.pEndDate)}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={handleClearFilters}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle" size={14} color={COLORS.danger} style={{ marginRight: 4 }} />
            <Text style={styles.clearAllBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LIST */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={styles.loaderText}>Loading proformas...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[theme.primaryColor]} />
          }
        >
          {filtered.map((item, index) => (
            <ProformaCard
              key={item.id + '_' + index}
              proforma={item}
              onPress={() => handleDetailsPress(item.id)}
            />
          ))}

          {filtered.length === 0 && !isLoading && (
            <View style={styles.emptyArea}>
              <Ionicons name="document-text-outline" size={48} color="#C2D3CC" />
              <Text style={styles.emptyTitle}>No proformas found</Text>
              <Text style={styles.emptySub}>Try searching another keyword or change parameters</Text>
            </View>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  searchSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 5,
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loaderText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  listContent: { paddingHorizontal: 5, paddingTop: 5, paddingBottom: 5, gap: 5 },
  emptyArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark
  },
  emptySub: {
    fontSize: 12.5, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center'
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
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
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 28,
  },
  clearAllBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
