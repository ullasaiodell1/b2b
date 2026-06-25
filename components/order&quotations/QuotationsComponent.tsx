import CustomHeader from '@/components/custom/CustomHeader';
import { QuotationCard } from '@/components/order&quotations/QuotationCard';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useQuotations } from '@/hooks/useQuotations';
import { QuotationFilterState } from '@/types/quotation';
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

function cleanQuotationParams(params?: Partial<QuotationFilterState>) {
  const cleanedParams: any = {};
  if (params) {
    const allowedParams = [
      'company_id',
      'lead_id',
      'dealer_id',
      'user_id',
      'status',
      'search',
      'offset',
      'limit',
      'startDate',
      'endDate',
      'exclude_dealer',
      'dealer_only',
      'sort_by',
      'sort_direction'
    ];

    allowedParams.forEach((key) => {
      const value = params[key as keyof QuotationFilterState];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        cleanedParams[key] = value;
      }
    });
  }
  return cleanedParams;
}

export interface QuotationsComponentProps {
  leadId?: string;
  leadName?: string;
  company?: string;
  phone?: string;
  email?: string;
  isEmbedded?: boolean;
  onAddQuotation?: () => void;
  onFilterPress?: () => void;
  onQuotationDetails?: (id: string) => void;
}

export const QuotationsComponent: React.FC<QuotationsComponentProps> = ({
  leadId,
  leadName,
  company,
  phone,
  email,
  isEmbedded = false,
  onAddQuotation,
  onFilterPress,
  onQuotationDetails,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    qStartDate?: string;
    qEndDate?: string;
    qFilterApplied?: string;
  }>();
  const qFilterActive = !!(params.qStartDate || params.qEndDate);

  const [searchQuery, setSearchQuery] = useState('');

  const filterParams = React.useMemo(() => {
    return cleanQuotationParams({
      startDate: params.qStartDate || undefined,
      endDate: params.qEndDate || undefined,
      search: searchQuery || undefined,
      lead_id: leadId || undefined,
    });
  }, [params.qStartDate, params.qEndDate, searchQuery, leadId]);

  const { data: quotations = [], isLoading, isFetching, refetch } = useQuotations(filterParams);

  const handleClearFilters = () => {
    (navigation as any).setParams({
      qStartDate: '',
      qEndDate: '',
      qFilterApplied: ''
    });
  };

  const handleAddPress = () => {
    if (onAddQuotation) {
      onAddQuotation();
    } else {
      const targetScreen = leadId ? 'lead-add-quotation' : 'add-quotation';
      (navigation as any).navigate(targetScreen, { leadId });
    }
  };

  const handleFilterPress = () => {
    if (onFilterPress) {
      onFilterPress();
    } else {
      const targetScreen = leadId ? 'lead-quotation-filter' : 'quotation-filter';
      (navigation as any).navigate(targetScreen, {
        referrer: leadId ? 'lead-quotation' : 'quotations-index',
        qStartDate: params.qStartDate || '',
        qEndDate: params.qEndDate || '',
        leadId,
      });
    }
  };

  const handleDetailsPress = (id: string) => {
    if (onQuotationDetails) {
      onQuotationDetails(id);
    } else {
      const targetScreen = leadId ? 'lead-quotation-details' : 'quotation-details';
      (navigation as any).navigate(targetScreen, { id, leadId });
    }
  };

  const leadQuotations = leadId
    ? quotations.filter((q) => String(q.lead_id || q.dealer_id || '') === String(leadId))
    : quotations;

  // Filter by tab + search
  const filtered = leadQuotations.filter((q) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(q.quotation_number || '').toLowerCase().includes(searchLower) ||
      (q.lead_name || '').toLowerCase().includes(searchLower) ||
      (q.lead_company_name || '').toLowerCase().includes(searchLower) ||
      (q.company_name || '').toLowerCase().includes(searchLower) ||
      (q.dealer_company_name || '').toLowerCase().includes(searchLower);

    let matchesDate = true;
    if (params.qStartDate && params.qEndDate) {
      const start = new Date(params.qStartDate);
      const end = new Date(params.qEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const qDateStr = q.quotation_date || q.date;
      if (qDateStr) {
        const qDate = new Date(qDateStr);
        matchesDate = qDate >= start && qDate <= end;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

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
          onPress={handleFilterPress}
          activeOpacity={0.8}
        >
          <Ionicons name="funnel-outline" size={16} color={qFilterActive ? theme.primaryColor : COLORS.textDark} style={{ marginRight: 4 }} />
          <Text style={[styles.filterBtnText, qFilterActive && { color: theme.primaryColor }]}>
            {qFilterActive ? 'Filters (Active)' : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {qFilterActive && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={styles.filterChip}
              onPress={handleClearFilters}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={12} color="#0369A1" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>Date: {formatDate(params.qStartDate)} - {formatDate(params.qEndDate)}</Text>
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
          {filtered.map((item, index) => (
            <QuotationCard
              key={item.id + '_' + index}
              quotation={item}
              onPress={() => handleDetailsPress(item.id)}
            />
          ))}

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
        onPress={handleAddPress}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
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
