import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { OrderCard } from '@/components/order&quotations/OrderCard';
import { getOrders } from '@/services/api/order';
import { getOrderField } from '@/utils/orderHelper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
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

interface OrderTabProps {
  leadId: string;
  dbLead: any;
  oStatus?: string;
  oStartDate?: string;
  oEndDate?: string;
}

export default function OrderTab({
  leadId,
  dbLead,
  oStatus: oStatusProp,
  oStartDate: oStartDateProp,
  oEndDate: oEndDateProp,
}: OrderTabProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params ?? {};

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const isNavigatingRef = useRef(false);

  // Prefer props (passed from lead-details params) over route.params
  const oStatus = oStatusProp !== undefined ? oStatusProp : (params.oStatus || '');
  const oStartDate = oStartDateProp !== undefined ? oStartDateProp : (params.oStartDate || '');
  const oEndDate = oEndDateProp !== undefined ? oEndDateProp : (params.oEndDate || '');

  const oFilterActive = !!(oStatus || oStartDate || oEndDate);

  const ordersByLeadQuery = useQuery({
    queryKey: ['orders', { lead_id: leadId }],
    queryFn: () => getOrders({ lead_id: leadId } as any),
    enabled: !!leadId,
  });

  const ordersByDealerQuery = useQuery({
    queryKey: ['orders', { dealer_id: leadId }],
    queryFn: () => getOrders({ dealer_id: leadId } as any),
    enabled: !!leadId,
  });

  const isOrdersLoading = ordersByLeadQuery.isLoading || ordersByDealerQuery.isLoading;

  const dbOrders = useMemo(() => {
    const rawLeadOrders = ordersByLeadQuery.data as any;
    const rawDealerOrders = ordersByDealerQuery.data as any;
    if (!rawLeadOrders && !rawDealerOrders) return [];

    const leadList = Array.isArray(rawLeadOrders)
      ? rawLeadOrders
      : (Array.isArray(rawLeadOrders?.data)
        ? rawLeadOrders.data
        : (Array.isArray(rawLeadOrders?.data?.data)
          ? rawLeadOrders.data.data
          : []));

    const dealerList = Array.isArray(rawDealerOrders)
      ? rawDealerOrders
      : (Array.isArray(rawDealerOrders?.data)
        ? rawDealerOrders.data
        : (Array.isArray(rawDealerOrders?.data?.data)
          ? rawDealerOrders.data.data
          : []));

    const combined = [...leadList, ...dealerList];
    const uniqueMap = new Map();
    combined.forEach((o: any) => {
      if (o && o.id) {
        uniqueMap.set(String(o.id), o);
      }
    });

    let list = Array.from(uniqueMap.values());
    list = list.map(getOrderField);

    if (oStatus) {
      list = list.filter((o: any) => o.status?.toLowerCase() === oStatus.toLowerCase());
    }
    if (oStartDate || oEndDate) {
      list = list.filter((o: any) => {
        const oDateStr = o.date || o.created_at;
        if (!oDateStr) return false;
        const oDate = new Date(oDateStr);
        if (isNaN(oDate.getTime())) return false;

        if (oStartDate) {
          let start: Date;
          const startParts = oStartDate.split('-');
          if (startParts.length === 3 && !oStartDate.includes('T')) {
            start = new Date(parseInt(startParts[0], 10), parseInt(startParts[1], 10) - 1, parseInt(startParts[2], 10));
          } else {
            start = new Date(oStartDate);
          }
          start.setHours(0, 0, 0, 0);
          if (oDate < start) return false;
        }

        if (oEndDate) {
          let end: Date;
          const endParts = oEndDate.split('-');
          if (endParts.length === 3 && !oEndDate.includes('T')) {
            end = new Date(parseInt(endParts[0], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[2], 10));
          } else {
            end = new Date(oEndDate);
          }
          end.setHours(23, 59, 59, 999);
          if (oDate > end) return false;
        }

        return true;
      });
    }
    if (orderSearchQuery.trim()) {
      const query = orderSearchQuery.toLowerCase().trim();
      list = list.filter((o: any) => {
        const orderNumber = o.orderNo || o.id || '';
        const clientName = o.clientName || '';
        const contactPerson = o.contactPerson || '';
        const location = o.hotelLocation || '';
        return (
          orderNumber.toLowerCase().includes(query) ||
          clientName.toLowerCase().includes(query) ||
          contactPerson.toLowerCase().includes(query) ||
          location.toLowerCase().includes(query)
        );
      });
    }
    return list;
  }, [ordersByLeadQuery.data, ordersByDealerQuery.data, oStatus, oStartDate, oEndDate, orderSearchQuery, leadId]);

  const handleClearOrderFilters = () => {
    navigation.setParams({
      oStatus: '',
      oStartDate: '',
      oEndDate: '',
      oFilterApplied: ''
    } as any);
  };

  const leadName = dbLead?.name || '----';
  const leadCompany = dbLead?.company || '----';

  return (
    <View style={{ gap: 5 }}>
      {/* Search and Filters Row */}
      <View style={styles.filterDatePickerRow}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search order..."
            placeholderTextColor="#9CA3AF"
            value={orderSearchQuery}
            onChangeText={setOrderSearchQuery}
            autoCorrect={false}
            autoComplete="off"
          />
          {orderSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setOrderSearchQuery('')} style={{ padding: 2 }}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() => navigation.navigate('lead-order-filter' as never, {
            referrer: 'lead-details',
            leadId: leadId,
          } as never)}
          activeOpacity={0.8}
        >
          <Ionicons name="funnel-outline" size={16} color={oFilterActive ? theme.primaryColor : COLORS.textDark} style={{ marginRight: 4 }} />
          <Text style={[styles.filterIconBtnText, oFilterActive && { color: theme.primaryColor }]}>
            {oFilterActive ? 'Filters (Active)' : 'Filters'}
          </Text>
        </TouchableOpacity>

        {oFilterActive && (
          <TouchableOpacity
            style={[styles.filterIconBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
            onPress={handleClearOrderFilters}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
            <Text style={[styles.filterIconBtnText, { color: COLORS.danger }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {oFilterActive && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
          {!!oStatus && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => {
                navigation.setParams({
                  oStatus: '',
                  oFilterApplied: (oStartDate || oEndDate) ? 'true' : ''
                } as any);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="funnel" size={12} color="#0369A1" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>Status: {oStatus}</Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
          {(!!oStartDate || !!oEndDate) && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => {
                navigation.setParams({
                  oStartDate: '',
                  oEndDate: '',
                  oFilterApplied: oStatus ? 'true' : ''
                } as any);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={12} color="#0369A1" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>
                {oStartDate && oEndDate
                  ? `Date: ${formatDate(oStartDate)} - ${formatDate(oEndDate)}`
                  : oStartDate
                  ? `From: ${formatDate(oStartDate)}`
                  : `To: ${formatDate(oEndDate)}`}
              </Text>
              <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* List */}
      {isOrdersLoading ? (
        <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginVertical: 20 }} />
      ) : dbOrders.length === 0 ? (
        <View style={styles.placeholderTab}>
          <Ionicons name="cart-outline" size={40} color={COLORS.textMuted} />
          <Text style={styles.placeholderTabText}>No orders found for this lead.</Text>
        </View>
      ) : (
        dbOrders.map((item: any) => (
          <OrderCard
            key={item.id}
            order={item}
            isCompact={true}
            onPress={() => {
              if (isNavigatingRef.current) return;
              isNavigatingRef.current = true;
              navigation.navigate('lead-order-details' as never, {
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
