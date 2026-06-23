import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface OrderCardProps {
  order: any;
  onPress?: () => void;
  isCompact?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, isCompact = false }) => {
  const theme = useTheme();

  // Normalize order fields
  const orderNumber = order.orderNo || order.id || 'Order';
  const dateStr = order.date || '—';
  const clientName = order.clientName || '—';
  const contactPerson = order.contactPerson || '—';
  const location = order.hotelLocation || '—';
  const status = order.status || 'Pending';
  const itemsCount = Array.isArray(order.items) ? order.items.length : order.itemsCount || 0;
  const paymentMethod = order.paymentType || '—';
  const amount = order.amount || '—';

  // Config mapping for status
  const configMap: Record<string, { bg: string; text: string; icon: string }> = {
    'Complete': { bg: COLORS.completeBg, text: COLORS.complete, icon: 'checkmark-circle-outline' },
    'Completed': { bg: COLORS.completeBg, text: COLORS.complete, icon: 'checkmark-circle-outline' },
    'Pending': { bg: COLORS.pendingBg, text: COLORS.pending, icon: 'time-outline' },
    'Inprogress': { bg: COLORS.inprogressBg, text: COLORS.inprogress, icon: 'sync-outline' },
    'Delivered': { bg: COLORS.completeBg, text: COLORS.complete, icon: 'cube-outline' },
    'Booking': { bg: COLORS.inprogressBg, text: COLORS.inprogress, icon: 'bookmark-outline' },
    'Out Of Delivery': { bg: COLORS.inprogressBg, text: COLORS.inprogress, icon: 'car-outline' },
    'Cancelled': { bg: COLORS.pendingBg, text: COLORS.danger, icon: 'close-circle-outline' },
  };

  const config = configMap[status] || { bg: COLORS.inprogressBg, text: COLORS.inprogress, icon: 'sync-outline' };

  if (isCompact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={s.card}
        activeOpacity={onPress ? 0.9 : 1}
        disabled={!onPress}
      >
        <View style={s.cardHeader}>
          <Text style={[s.orderNo, { color: theme.primaryColor }]}># {orderNumber}</Text>
          <View style={[s.dateTag, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="calendar-outline" size={12} color={theme.primaryColor} style={{ marginRight: 4 }} />
            <Text style={[s.dateTagText, { color: theme.primaryColor }]}>{dateStr}</Text>
          </View>
        </View>

        <View style={s.clientBlock}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={[s.metaRow, { flex: 1, marginRight: 8 }]}>
              <Ionicons name="business-outline" size={13} color={COLORS.textMuted} />
              <Text style={s.clientName} numberOfLines={1}>{clientName}</Text>
            </View>
            <View style={[s.metaRow, { flex: 1, justifyContent: 'flex-end' }]}>
              <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
              <Text style={s.metaText} numberOfLines={1}>{contactPerson}</Text>
            </View>
          </View>
          <View style={s.metaRow}>
            <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
            <Text style={[s.metaText, { flex: 1 }]} numberOfLines={1}>{location}</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.cardFooter}>
          <View style={[s.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon as any} size={11} color={config.text} style={{ marginRight: 3 }} />
            <Text style={[s.statusBadgeText, { color: config.text }]}>{status}</Text>
            <Text style={[s.itemsCountText, { color: config.text }]}> • {itemsCount} Items</Text>
          </View>

          <View style={s.amountBlock}>
            <Text style={s.payLabel}>Order By</Text>
            <Text style={s.payVal}>{paymentMethod}</Text>
            <Text style={[s.amountText, { color: theme.primaryColor }]}>{amount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Dashboard Card
  return (
    <TouchableOpacity
      onPress={onPress}
      style={s.card}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
    >
      {/* Header: ID and Date */}
      <View style={s.cardHeader}>
        <Text style={[s.orderNo, { color: theme.primaryColor }]}># {orderNumber}</Text>
        <View style={s.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.blueSoft} />
          <Text style={s.dateText}>{dateStr}</Text>
        </View>
      </View>

      {/* Details Block */}
      <View style={s.clientBlock}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={[s.metaRow, { flex: 1, marginRight: 8 }]}>
            <Ionicons name="business-outline" size={14} color={COLORS.textMuted} />
            <Text style={[s.clientName, { fontSize: 13 }]} numberOfLines={1}>{clientName}</Text>
          </View>
          <View style={[s.metaRow, { flex: 1, justifyContent: 'flex-end' }]}>
            <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
            <Text style={s.metaText} numberOfLines={1}>{contactPerson}</Text>
          </View>
        </View>
        <View style={s.metaRow}>
          <Ionicons name="home-outline" size={14} color={COLORS.textMuted} />
          <Text style={[s.metaText, { flex: 1 }]} numberOfLines={1}>{location}</Text>
        </View>
      </View>

      {/* Divider Line */}
      <View style={s.divider} />

      {/* Status and Items row */}
      <View style={s.statusRow}>
        <View style={s.statusBadgeRow}>
          <Ionicons
            name={config.icon as any}
            size={16}
            color={config.text}
          />
          <Text style={[s.statusBadgeText, { color: config.text, fontSize: 12.5 }]}>
            {status}
          </Text>
        </View>

        <View style={s.itemsBadge}>
          <Ionicons name="list-outline" size={14} color={COLORS.primary} />
          <Text style={s.itemsText}>{itemsCount} Items</Text>
        </View>
      </View>

      {/* Divider Line */}
      <View style={s.divider} />

      {/* Footer Payment & Amount */}
      <View style={s.cardFooter}>
        <View style={s.paymentBlock}>
          <View style={s.paymentIconBox}>
            <Ionicons name="card-outline" size={16} color={COLORS.textMuted} />
          </View>
          <View>
            <Text style={s.footerLabel}>Order By</Text>
            <Text style={s.footerValue}>{paymentMethod}</Text>
          </View>
        </View>

        <View style={s.amountBlock}>
          <Text style={[s.footerLabel, { textAlign: 'right' }]}>Amount</Text>
          <Text style={s.amountValue}>{amount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 8,
    gap: 6,
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
  orderNo: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dateTagText: {
    fontSize: 10,
    fontWeight: '800',
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
  clientBlock: {
    gap: 5,
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
    fontWeight: '600',
    color: COLORS.textMuted,
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
    marginTop: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
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
  amountValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
  },
});
