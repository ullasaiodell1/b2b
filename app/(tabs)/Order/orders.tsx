import { OrderRecord, OrderStatus, activeOrderFilter, subscribeToOrders, updateOrderFilterState } from '@/components/order&quotations/OrderState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders } from '@/hooks/useOrders';
import { cleanOrderParams } from '@/utils/orderHelper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function OrderListScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const [filters, setFilters] = useState(activeOrderFilter);

  React.useEffect(() => {
    return subscribeToOrders(() => {
      setFilters({ ...activeOrderFilter });
    });
  }, []);

  const cleanedFilters = React.useMemo(() => {
    return cleanOrderParams(filters);
  }, [filters]);

  const { data: orders = [], isLoading, refetch } = useOrders(cleanedFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClearStatusFilter = () => {
    updateOrderFilterState({
      ...filters,
      status: '',
    });
  };

  const filteredOrders = (orders as any[]).filter((item: any) => {
    const matchesStatus = !filters.status || item.status.toLowerCase() === filters.status.toLowerCase();
    const matchesSearch =
      (item.orderNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderOrderCard = ({ item }: { item: OrderRecord }) => {
    const configMap: Record<OrderStatus, { bg: string; text: string; icon: string }> = {
      'Complete': { bg: COLORS.completeBg, text: COLORS.complete, icon: 'checkmark-circle-outline' },
      'Pending': { bg: COLORS.pendingBg, text: COLORS.pending, icon: 'time-outline' },
      'Inprogress': { bg: COLORS.inprogressBg, text: COLORS.inprogress, icon: 'sync-outline' },
      'Delivered': { bg: COLORS.completeBg, text: COLORS.complete, icon: 'cube-outline' },
      'Booking': { bg: COLORS.inprogressBg, text: COLORS.inprogress, icon: 'bookmark-outline' },
      'Out Of Delivery': { bg: COLORS.inprogressBg, text: COLORS.inprogress, icon: 'car-outline' },
    };
    const config = configMap[item.status] || { bg: COLORS.inprogressBg, text: COLORS.inprogress, icon: 'sync-outline' };

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('order-details', { id: item.id })}
        style={styles.card}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderNo}>{item.orderNo}</Text>
          <View style={styles.dateTag}>
            <Ionicons name="calendar-outline" size={12} color={theme.primaryColor} style={{ marginRight: 4 }} />
            <Text style={styles.dateTagText}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.clientBlock}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{item.contactPerson}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{item.hotelLocation}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon as any} size={11} color={config.text} style={{ marginRight: 3 }} />
            <Text style={[styles.statusBadgeText, { color: config.text }]}>{item.status}</Text>
            <Text style={[styles.itemsCountText, { color: config.text }]}> • {item.itemsCount} Items</Text>
          </View>

          <View style={styles.amountBlock}>
            <Text style={styles.payLabel}>Order By</Text>
            <Text style={styles.payVal}>{item.paymentType}</Text>
            <Text style={styles.amountText}>{item.amount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── SEARCH & FILTER TRIGGER ROW ───────────── */}
      <View style={styles.filterSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search order by / client..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('order-filter')}
            style={styles.filterBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.filterBtnText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Bubble Filters */}
        {(filters.status !== '' || filters.dateRange !== '') && (
          <View style={styles.bubbleRow}>
            {filters.status !== '' && (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{filters.status}</Text>
                <TouchableOpacity onPress={handleClearStatusFilter}>
                  <Ionicons name="close-circle" size={14} color={theme.primaryColor} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {filters.dateRange !== '' && (
              <View style={styles.bubble}>
                <Ionicons name="calendar-outline" size={12} color={theme.primaryColor} style={{ marginRight: 4 }} />
                <Text style={styles.bubbleText}>{filters.dateRange}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── LIST ──────────────────────────────────── */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyArea}>
            <Ionicons name="bag-handle-outline" size={48} color="#C2D3CC" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  filterSection: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F5',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  filterBtn: {
    backgroundColor: theme.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    height: 44,
  },
  filterBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Bubble Row
  bubbleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(52,101,86,0.2)',
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.primaryColor,
  },

  // List Cards
  listContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 5,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNo: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dateTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.primaryColor,
  },

  clientBlock: {
    gap: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  itemsCountText: {
    fontSize: 11,
    fontWeight: '700',
  },

  amountBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  payLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  payVal: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.primaryColor,
    marginTop: 1,
  },

  // Empty State
  emptyArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
