import { OrderCard } from '@/components/order&quotations/OrderCard';
import { OrderRecord, activeOrderFilter, subscribeToOrders, updateOrderFilterState } from '@/components/order&quotations/OrderState';
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

export interface OrderListComponentProps {
  onBack?: () => void;
  onFilterPress?: () => void;
  onOrderDetails?: (id: string) => void;
}

export const OrderListComponent: React.FC<OrderListComponentProps> = ({
  onBack,
  onFilterPress,
  onOrderDetails,
}) => {
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

  React.useEffect(() => {
    console.log('[OrderListComponent] Orders fetched/updated:', {
      count: orders.length,
      isLoading,
      cleanedFilters,
    });
  }, [orders, isLoading, cleanedFilters]);

  const handleClearStatusFilter = () => {
    updateOrderFilterState({ ...filters, status: '' });
  };
  const handleClearPaymentFilter = () => {
    updateOrderFilterState({ ...filters, payment_status: '' });
  };
  const handleClearTypeFilter = () => {
    updateOrderFilterState({ ...filters, order_type: '' });
  };
  const handleClearSourceFilter = () => {
    updateOrderFilterState({ ...filters, source_type: '' });
  };
  const handleClearDateFilter = () => {
    updateOrderFilterState({ ...filters, dateRange: '', startDate: '', endDate: '' });
  };

  const filteredOrders = (orders as any[]).filter((item: any) => {
    const matchesStatus = !filters.status || item.status.toLowerCase() === filters.status.toLowerCase();
    const matchesSearch =
      (item.orderNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesStatus || !matchesSearch) return false;

    // Date Range Filter
    let matchesDate = true;
    if (filters.startDate || filters.endDate) {
      const rawDateStr = item.order_date || item.created_at || item.date;
      if (rawDateStr) {
        const orderDate = new Date(rawDateStr);
        if (!isNaN(orderDate.getTime())) {
          if (filters.startDate) {
            const startParts = filters.startDate.split('-');
            let start: Date;
            if (startParts.length === 3) {
              start = new Date(parseInt(startParts[0], 10), parseInt(startParts[1], 10) - 1, parseInt(startParts[2], 10));
            } else {
              start = new Date(filters.startDate);
            }
            start.setHours(0, 0, 0, 0);
            if (orderDate < start) matchesDate = false;
          }
          if (filters.endDate) {
            const endParts = filters.endDate.split('-');
            let end: Date;
            if (endParts.length === 3) {
              end = new Date(parseInt(endParts[0], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[2], 10));
            } else {
              end = new Date(filters.endDate);
            }
            end.setHours(23, 59, 59, 999);
            if (orderDate > end) matchesDate = false;
          }
        } else {
          matchesDate = false;
        }
      } else {
        matchesDate = false;
      }
    }

    return matchesDate;
  });

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleFilterPress = () => {
    console.log('[OrderListComponent] handleFilterPress. Navigating to order-filter.');
    if (onFilterPress) {
      onFilterPress();
    } else {
      navigation.navigate('order-filter');
    }
  };

  const handleOrderPress = (id: string) => {
    console.log('[OrderListComponent] handleOrderPress. Navigating to order-details for ID:', id);
    if (onOrderDetails) {
      onOrderDetails(id);
    } else {
      navigation.navigate('order-details', { id });
    }
  };

  const renderOrderCard = ({ item }: { item: OrderRecord }) => {
    return (
      <OrderCard
        order={item}
        isCompact={true}
        onPress={() => handleOrderPress(item.id)}
      />
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backBtn}>
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
            onPress={handleFilterPress}
            style={styles.filterBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.filterBtnText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Bubble Filters */}
        {(filters.status !== '' || filters.dateRange !== '' || filters.payment_status !== '' || filters.order_type !== '' || filters.source_type !== '') && (
          <View style={styles.bubbleRow}>
            {filters.status !== '' && (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{filters.status}</Text>
                <TouchableOpacity onPress={handleClearStatusFilter}>
                  <Ionicons name="close-circle" size={14} color={theme.primaryColor} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {filters.payment_status !== '' && (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{filters.payment_status}</Text>
                <TouchableOpacity onPress={handleClearPaymentFilter}>
                  <Ionicons name="close-circle" size={14} color={theme.primaryColor} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {filters.order_type !== '' && (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{filters.order_type}</Text>
                <TouchableOpacity onPress={handleClearTypeFilter}>
                  <Ionicons name="close-circle" size={14} color={theme.primaryColor} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {filters.source_type !== '' && (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{filters.source_type}</Text>
                <TouchableOpacity onPress={handleClearSourceFilter}>
                  <Ionicons name="close-circle" size={14} color={theme.primaryColor} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {filters.dateRange !== '' && (
              <View style={styles.bubble}>
                <Ionicons name="calendar-outline" size={12} color={theme.primaryColor} style={{ marginRight: 4 }} />
                <Text style={styles.bubbleText}>{filters.dateRange}</Text>
                <TouchableOpacity onPress={handleClearDateFilter}>
                  <Ionicons name="close-circle" size={14} color={theme.primaryColor} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
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
};

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
  listContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 5,
  },
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
