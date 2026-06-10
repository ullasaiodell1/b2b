import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useOrders } from '@/hooks/useOrders';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const STATUS_MAP_UI = {
  'Complete': 'Complete',
  'Inprogress': 'Process',
  'Pending': 'Pending',
  'Out Of Delivery': 'Out Of Delivery',
  'Cancelled': 'Cancel',
};

export default function OrderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const { orders, filter: filterState, updateFilter } = useOrders();

  // Search & Filter Logic
  const filteredOrders = orders.filter((order) => {
    // A. Filter by Search Query
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      order.orderNo.toLowerCase().includes(query) ||
      order.clientName.toLowerCase().includes(query) ||
      order.contactPerson.toLowerCase().includes(query) ||
      order.hotelLocation.toLowerCase().includes(query);

    // B. Filter by Global Status Filter
    const matchesStatus =
      !filterState.status || order.status.toLowerCase() === filterState.status.toLowerCase();

    // C. Filter by Date Range
    let matchesDate = true;
    if (filterState.dateRange) {
      const dateRangeLower = filterState.dateRange.toLowerCase();
      if (dateRangeLower.includes('28 dec') || dateRangeLower.includes('10 jan')) {
        matchesDate = true;
      } else {
        const orderDateLower = order.date.toLowerCase();
        if (dateRangeLower.includes('mar') && orderDateLower.includes('mar')) {
          matchesDate = orderDateLower.includes('22') || orderDateLower.includes('23') || orderDateLower.includes('24');
        } else if (dateRangeLower.includes('apr') && orderDateLower.includes('apr')) {
          matchesDate = orderDateLower.includes('10') || orderDateLower.includes('11') || orderDateLower.includes('12');
        } else if (dateRangeLower.includes('may') && orderDateLower.includes('may')) {
          matchesDate = orderDateLower.includes('20');
        } else {
          matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPage} />

      {/* ── 1. HEADER TITLE ────────────────────────── */}
      <CustomHeader title="Orders" showSearch={false} />

      {/* ── 2. SEARCH BAR & FILTERS BUTTON ──────────── */}
      <View style={s.searchRow}>
        <View style={s.searchFieldWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search Order No / Client..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={s.clearBtn}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[s.filterBtn, !!filterState.status && s.filterBtnActive]}
          onPress={() => router.push('/Order/order-filter')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="funnel-outline"
            size={16}
            color={!!filterState.status ? COLORS.primary : COLORS.textDark}
          />
          <Text style={[s.filterBtnText, !!filterState.status && s.filterBtnTextActive]}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* ── 3. ACTIVE FILTERS CHIPS ────────────────── */}
      {(!!filterState.status || (!!filterState.dateRange && filterState.dateRange !== '28 Dec 22 – 10 Jan 23')) && (
        <View style={s.chipsContainer}>
          {!!filterState.status && (
            <TouchableOpacity
              style={s.activeChip}
              onPress={() => {
                updateFilter({
                  ...filterState,
                  status: '',
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={s.activeChipText}>
                {STATUS_MAP_UI[filterState.status as keyof typeof STATUS_MAP_UI] || filterState.status}
              </Text>
              <Ionicons name="close" size={13} color={COLORS.textDark} />
            </TouchableOpacity>
          )}

          {!!filterState.dateRange && filterState.dateRange !== '28 Dec 22 – 10 Jan 23' && (
            <TouchableOpacity
              style={s.activeChip}
              onPress={() => {
                updateFilter({
                  ...filterState,
                  dateRange: '28 Dec 22 – 10 Jan 23', // Reset to default
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={s.activeChipText}>{filterState.dateRange}</Text>
              <Ionicons name="close" size={13} color={COLORS.textDark} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── 4. LIST OF ORDERS ───────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, idx) => {
            const isCompleted = order.status === 'Complete';
            return (
              <TouchableOpacity
                key={`${order.id}-${idx}`}
                style={s.card}
                activeOpacity={0.9}
                onPress={() => {
                  router.push({
                    pathname: '/Order/order-details',
                    params: { id: order.id },
                  });
                }}
              >
                {/* Header: ID and Date */}
                <View style={s.cardHeader}>
                  <Text style={s.orderId}># {order.orderNo}</Text>
                  <View style={s.dateRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.blueSoft} />
                    <Text style={s.dateText}>{order.date}</Text>
                  </View>
                </View>

                {/* Details Block */}
                <View style={s.cardBody}>
                  {/* Company */}
                  <View style={s.metaRow}>
                    <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={s.metaIcon} />
                    <Text style={s.metaTextCompany}>{order.clientName}</Text>
                  </View>
                  {/* Contact Person */}
                  <View style={s.metaRow}>
                    <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={s.metaIcon} />
                    <Text style={s.metaText}>{order.contactPerson}</Text>
                  </View>
                  {/* Location Address */}
                  <View style={s.metaRow}>
                    <Ionicons name="home-outline" size={14} color={COLORS.textMuted} style={s.metaIcon} />
                    <Text style={s.metaText}>{order.hotelLocation}</Text>
                  </View>
                </View>

                {/* Divider Line */}
                <View style={s.divider} />

                {/* Status and Items row */}
                <View style={s.statusRow}>
                  {/* Status Indicator */}
                  <View style={s.statusBadge}>
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                      size={16}
                      color={isCompleted ? COLORS.success : COLORS.danger}
                    />
                    <Text style={[s.statusText, { color: isCompleted ? COLORS.success : COLORS.danger }]}>
                      {order.status}
                    </Text>
                  </View>

                  {/* Items count */}
                  <View style={s.itemsBadge}>
                    <Ionicons name="list-outline" size={14} color={COLORS.primary} style={s.itemsIcon} />
                    <Text style={s.itemsText}>{order.itemsCount} Items</Text>
                  </View>
                </View>

                {/* Divider Line */}
                <View style={s.divider} />

                {/* Footer Payment & Amount */}
                <View style={s.cardFooter}>
                  {/* Order By payment info */}
                  <View style={s.paymentBlock}>
                    <View style={s.paymentIconBox}>
                      <Ionicons name="card-outline" size={16} color={COLORS.textMuted} />
                    </View>
                    <View>
                      <Text style={s.footerLabel}>Order By</Text>
                      <Text style={s.footerValue}>{order.paymentType}</Text>
                    </View>
                  </View>

                  {/* Amount Value */}
                  <View style={s.amountBlock}>
                    <Text style={[s.footerLabel, { textAlign: 'right' }]}>Amount</Text>
                    <Text style={s.amountValue}>{order.amount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={s.emptyState}>
            <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
            <Text style={s.emptyStateText}>No orders found</Text>
            <Text style={s.emptyStateSubtext}>Try adjusting your search query or filter tags.</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[s.fab, { bottom: Math.max(insets.bottom + 90, 100) }]}
        onPress={() => router.push('/(tabs)/Order/add-order' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  headerContainer: {
    paddingHorizontal: 10,
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
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    gap: 2,
    alignItems: 'center',
    marginVertical: 5,
  },
  searchFieldWrap: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  clearBtn: {
    padding: 2,
  },
  filterBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  filterBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  filterBtnTextActive: {
    color: COLORS.primary,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 5,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.blueSoft,
  },
  cardBody: {
    gap: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  metaTextCompany: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  itemsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemsIcon: {
    marginTop: 0.5,
  },
  itemsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EDF3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EE',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 28,
    gap: 6,
    borderWidth: 1,
    borderColor: '#C5D0CB',
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
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

