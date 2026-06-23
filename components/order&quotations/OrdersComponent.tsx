import CustomHeader from '@/components/custom/CustomHeader';
import { OrderCard } from '@/components/order&quotations/OrderCard';
import { activeOrderFilter, subscribeToOrders, updateOrderFilterState } from '@/components/order&quotations/OrderState';
import { COLORS } from '@/constants/theme';
import { useOrders } from '@/hooks/useOrders';
import { cleanOrderParams } from '@/utils/orderHelper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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

const STATUS_MAP_UI = {
  'Complete': 'Complete',
  'Inprogress': 'Process',
  'Pending': 'Pending',
  'Out Of Delivery': 'Out Of Delivery',
  'Cancelled': 'Cancel',
};

export interface OrdersComponentProps {
  leadId?: string;
  leadName?: string;
  company?: string;
  phone?: string;
  email?: string;
  isEmbedded?: boolean;
  onAddOrder?: () => void;
  onFilterPress?: () => void;
  onOrderDetails?: (id: string) => void;
}

export const OrdersComponent: React.FC<OrdersComponentProps> = ({
  leadId,
  leadName,
  company,
  phone,
  email,
  isEmbedded = false,
  onAddOrder,
  onFilterPress,
  onOrderDetails,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState(activeOrderFilter);

  React.useEffect(() => {
    return subscribeToOrders(() => {
      setFilterState({ ...activeOrderFilter });
    });
  }, []);

  const cleanedFilter = React.useMemo(() => {
    const f = cleanOrderParams(filterState);
    if (leadId) {
      f.lead_id = leadId;
    }
    return f;
  }, [filterState, leadId]);

  const { data: orders = [], isLoading, refetch } = useOrders(cleanedFilter);
  const updateFilter = updateOrderFilterState;

  React.useEffect(() => {
    console.log('[OrdersComponent] Orders fetched/updated:', {
      count: orders.length,
      isLoading,
      cleanedFilter,
    });
  }, [orders, isLoading, cleanedFilter]);

  const leadOrders = leadId
    ? (orders as any[]).filter((order: any) => String(order.lead_id || order.dealer_id || order.company_id || '') === String(leadId))
    : orders;

  // Search & Filter Logic
  const filteredOrders = (leadOrders as any[]).filter((order: any) => {
    // A. Filter by Search Query
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (order.orderNo || '').toLowerCase().includes(query) ||
      (order.clientName || '').toLowerCase().includes(query) ||
      (order.contactPerson || '').toLowerCase().includes(query) ||
      (order.hotelLocation || '').toLowerCase().includes(query);

    // B. Filter by Global Status Filter
    const matchesStatus =
      !filterState.status || order.status.toLowerCase() === filterState.status.toLowerCase();

    // C. Filter by Date Range
    let matchesDate = true;
    if (filterState.dateRange) {
      const dateRangeLower = filterState.dateRange.toLowerCase();
      if (dateRangeLower.includes('') || dateRangeLower.includes('') || dateRangeLower.includes('') || dateRangeLower.includes('')) {
        matchesDate = true;
      } else {
        const orderDateLower = order.date.toLowerCase();
        if (dateRangeLower.includes('') && orderDateLower.includes('')) {
          matchesDate = orderDateLower.includes('') || orderDateLower.includes('') || orderDateLower.includes('');
        } else if (dateRangeLower.includes('') && orderDateLower.includes('')) {
          matchesDate = orderDateLower.includes('') || orderDateLower.includes('') || orderDateLower.includes('');
        } else if (dateRangeLower.includes('') && orderDateLower.includes('')) {
          matchesDate = orderDateLower.includes('');
        } else {
          matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleFilterPress = () => {
    console.log('[OrdersComponent] handleFilterPress. Navigating/Callback. leadId:', leadId);
    if (onFilterPress) {
      onFilterPress();
    } else {
      const targetScreen = leadId ? 'lead-order-filter' : 'order-filter';
      (navigation as any).navigate(targetScreen, leadId ? { leadId, referrer: 'lead-order' } : undefined);
    }
  };

  const handleAddOrderPress = () => {
    console.log('[OrdersComponent] handleAddOrderPress. Navigating/Callback. leadId:', leadId);
    if (onAddOrder) {
      onAddOrder();
    } else {
      const targetScreen = leadId ? 'lead-add-order' : 'add-order';
      (navigation as any).navigate(targetScreen, { leadId });
    }
  };


  const handleOrderPress = (id: string) => {
    console.log('[OrdersComponent] handleOrderPress. Navigating to order details for ID:', id);
    if (onOrderDetails) {
      onOrderDetails(id);
    } else {
      const targetScreen = leadId ? 'lead-order-details' : 'order-details';
      (navigation as any).navigate(targetScreen, { id });
    }
  };

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
          onPress={handleFilterPress}
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
      {(!!filterState.status || (!!filterState.dateRange && filterState.dateRange !== '' && filterState.dateRange !== '')) && (
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

          {!!filterState.dateRange && filterState.dateRange !== '' && filterState.dateRange !== '' && (
            <TouchableOpacity
              style={s.activeChip}
              onPress={() => {
                updateFilter({
                  ...filterState,
                  dateRange: '', // Reset to default
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
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />
        }
      >
        {isLoading && filteredOrders.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order: any, idx: number) => (
            <OrderCard
              key={`${order.id}-${idx}`}
              order={order}
              onPress={() => handleOrderPress(order.id)}
            />
          ))
        ) : (
          <View style={s.emptyState}>
            <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
            <Text style={s.emptyStateText}>No orders found</Text>
            <Text style={s.emptyStateSubtext}>Try adjusting your search query or filter tags.</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[s.fab, { bottom: Math.max(insets.bottom + 90, 100) }]}
        onPress={handleAddOrderPress}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
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
    paddingVertical: 1,
    paddingHorizontal: 8,
    gap: 5,
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
