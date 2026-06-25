import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const paymentStatus = order.payment_status || order.paymentStatus || null;
  const itemsCount = Array.isArray(order.items) ? order.items.length : order.itemsCount || 0;
  const customerName = order.customer_name || order.customerName || '—';
  const amount = order.amount || '—';

  // Payment status color config
  const paymentStatusConfig = paymentStatus === 'PAID'
    ? { bg: COLORS.completeBg, text: COLORS.complete, icon: 'checkmark-circle' as const }
    : paymentStatus === 'UNPAID'
    ? { bg: COLORS.pendingBg, text: COLORS.pending, icon: 'alert-circle-outline' as const }
    : { bg: '#F0F0F0', text: COLORS.textMuted, icon: 'ellipse-outline' as const };

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
        {/* Row 1: Order# + Date */}
        <View style={s.cardHeader}>
          <Text style={[s.orderNo, { color: theme.primaryColor }]}># {orderNumber}</Text>
          <View style={[s.dateTag, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="calendar-outline" size={12} color={theme.primaryColor} style={{ marginRight: 4 }} />
            <Text style={[s.dateTagText, { color: theme.primaryColor }]}>{dateStr}</Text>
          </View>
        </View>

        {/* Row 2: Customer Name + Amount */}
        <View style={s.nameAmountRow}>
          <View style={s.metaRow}>
            <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
            <Text style={s.metaText} numberOfLines={1}>{customerName}</Text>
          </View>
          <Text style={[s.amountText, { color: theme.primaryColor }]}>{amount}</Text>
        </View>

        <View style={s.divider} />

        {/* Row 3: Status (left) + Payment Status (right) */}
        <View style={s.footerRow}>
          <View style={[s.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon as any} size={11} color={config.text} style={{ marginRight: 3 }} />
            <Text style={[s.statusBadgeText, { color: config.text }]}>{status}</Text>
          </View>
          {paymentStatus ? (
            <View style={[s.paymentStatusBadge, { backgroundColor: paymentStatusConfig.bg }]}>
              <Ionicons name={paymentStatusConfig.icon} size={11} color={paymentStatusConfig.text} />
              <Text style={[s.paymentStatusText, { color: paymentStatusConfig.text }]}>{paymentStatus}</Text>
            </View>
          ) : null}
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
      {/* Row 1: Order# + Date */}
      <View style={s.cardHeader}>
        <Text style={[s.orderNo, { color: theme.primaryColor }]}># {orderNumber}</Text>
        <View style={s.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.blueSoft} />
          <Text style={s.dateText}>{dateStr}</Text>
        </View>
      </View>

      {/* Row 2: Customer Name + Amount */}
      <View style={s.nameAmountRow}>
        <View style={s.metaRow}>
          <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
          <Text style={s.metaText} numberOfLines={1}>{customerName}</Text>
        </View>
        <Text style={s.amountValue}>{amount}</Text>
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Row 3: Status (left) + Payment Status (right) */}
      <View style={s.footerRow}>
        <View style={s.statusBadgeRow}>
          <Ionicons name={config.icon as any} size={15} color={config.text} />
          <Text style={[s.statusBadgeText, { color: config.text, fontSize: 12.5 }]}>{status}</Text>
        </View>
        {paymentStatus ? (
          <View style={[s.paymentStatusBadge, { backgroundColor: paymentStatusConfig.bg }]}>
            <Ionicons name={paymentStatusConfig.icon} size={13} color={paymentStatusConfig.text} />
            <Text style={[s.paymentStatusText, { color: paymentStatusConfig.text }]}>{paymentStatus}</Text>
          </View>
        ) : null}
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
  nameAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
