import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useQuotations } from '@/hooks/useQuotations';
import { QuotationCard } from '@/components/order&quotations/QuotationCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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

interface QuotationTabProps {
  leadId: string;
  dbLead: any;
}

export default function QuotationTab({ leadId, dbLead }: QuotationTabProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params ?? {};

  const [quotationSearchQuery, setQuotationSearchQuery] = useState('');
  const isNavigatingRef = useRef(false);

  const qFilterActive = !!(params.qStatus || params.qPriority || params.qStartDate || params.qEndDate);

  const quotationsQuery = useQuotations({ lead_id: leadId });
  const { isLoading: isQuotationsLoading } = quotationsQuery;

  const dbQuotations = useMemo(() => {
    const raw = quotationsQuery.data as any;
    if (!raw) return [];
    let list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : []));
    list = list.filter((q: any) => String(q.lead_id) === String(leadId) || String(q.dealer_id) === String(leadId));
    
    if (params.qStatus) {
      list = list.filter((q: any) => q.status?.toLowerCase() === params.qStatus?.toLowerCase());
    }
    if (params.qPriority) {
      if (list.length > 0 && 'priority' in list[0]) {
        list = list.filter((q: any) => q.priority?.toLowerCase() === params.qPriority?.toLowerCase());
      }
    }
    if (params.qStartDate && params.qEndDate) {
      const start = new Date(params.qStartDate);
      const end = new Date(params.qEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      list = list.filter((q: any) => {
        const qDateStr = q.quotation_date || q.date;
        if (!qDateStr) return false;
        const qDate = new Date(qDateStr);
        return qDate >= start && qDate <= end;
      });
    }
    if (quotationSearchQuery.trim()) {
      const query = quotationSearchQuery.toLowerCase().trim();
      list = list.filter((q: any) => {
        const prefix = q.prefix || 'QT';
        const qNumber = q.quotation_number ? `${prefix}-${q.quotation_number}` : q.id.slice(0, 8).toUpperCase();
        const clientName = q.company_name || q.lead_company_name || '';
        const contactName = q.contact_name || q.lead_name || '';
        return (
          qNumber.toLowerCase().includes(query) ||
          clientName.toLowerCase().includes(query) ||
          contactName.toLowerCase().includes(query)
        );
      });
    }
    return list;
  }, [quotationsQuery.data, params.qStatus, params.qPriority, params.qStartDate, params.qEndDate, quotationSearchQuery, leadId]);

  const handleClearQuotationFilters = () => {
    navigation.setParams({
      qStatus: '',
      qPriority: '',
      qStartDate: '',
      qEndDate: '',
      qFilterApplied: ''
    } as any);
  };

  const leadName = dbLead?.name || '----';
  const leadCompany = dbLead?.company || '----';
  const leadEmail = dbLead?.email || '----';
  const leadPhone = dbLead?.phone || '----';

  return (
    <View style={{ gap: 5 }}>
      {/* Search and Filters Row */}
      <View style={styles.filterDatePickerRow}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search quotation..."
            placeholderTextColor="#9CA3AF"
            value={quotationSearchQuery}
            onChangeText={setQuotationSearchQuery}
            autoCorrect={false}
            autoComplete="off"
          />
          {quotationSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setQuotationSearchQuery('')} style={{ padding: 2 }}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() => navigation.navigate('lead-quotation-filter' as never, {
            referrer: 'lead-details',
            leadId: leadId,
            qStartDate: params.qStartDate || '',
            qEndDate: params.qEndDate || '',
          } as never)}
          activeOpacity={0.8}
        >
          <Ionicons name="funnel-outline" size={16} color={qFilterActive ? theme.primaryColor : COLORS.textDark} style={{ marginRight: 4 }} />
          <Text style={[styles.filterIconBtnText, qFilterActive && { color: theme.primaryColor }]}>
            {qFilterActive ? 'Filters (Active)' : 'Filters'}
          </Text>
        </TouchableOpacity>

        {qFilterActive && (
          <TouchableOpacity
            style={[styles.filterIconBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
            onPress={handleClearQuotationFilters}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
            <Text style={[styles.filterIconBtnText, { color: COLORS.danger }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {qFilterActive && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
          {!!params.qStatus && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => {
                navigation.setParams({
                  qStatus: '',
                  qFilterApplied: params.qPriority || (params.qStartDate && params.qEndDate) ? 'true' : ''
                } as any);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="funnel" size={12} color="#0369A1" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>Status: {params.qStatus}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
          {!!params.qPriority && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => {
                navigation.setParams({
                  qPriority: '',
                  qFilterApplied: params.qStatus || (params.qStartDate && params.qEndDate) ? 'true' : ''
                } as any);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="flag" size={12} color="#0369A1" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>Priority: {params.qPriority}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
          {!!(params.qStartDate && params.qEndDate) && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => {
                navigation.setParams({
                  qStartDate: '',
                  qEndDate: '',
                  qFilterApplied: params.qStatus || params.qPriority ? 'true' : ''
                } as any);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={12} color="#0369A1" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>Date: {formatDate(params.qStartDate)} - {formatDate(params.qEndDate)}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* List */}
      {isQuotationsLoading ? (
        <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginVertical: 20 }} />
      ) : dbQuotations.length === 0 ? (
        <View style={styles.placeholderTab}>
          <Ionicons name="document-text-outline" size={40} color={COLORS.textMuted} />
          <Text style={styles.placeholderTabText}>No quotations found for this lead.</Text>
        </View>
      ) : (
        dbQuotations.map((item: any) => (
          <QuotationCard
            key={item.id}
            quotation={item}
            isCompact={true}
            onPress={() => {
              if (isNavigatingRef.current) return;
              isNavigatingRef.current = true;
              navigation.navigate('lead-quotation-details' as never, {
                id: item.id, referrer: 'lead-details', leadId
              } as never);
              setTimeout(() => {
                isNavigatingRef.current = false;
              }, 1000);
            }}
          />
        ))
      )}
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
  placeholderTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  placeholderTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});
