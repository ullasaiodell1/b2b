import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface QuotationCardProps {
  quotation: any;
  onPress?: () => void;
  isCompact?: boolean;
}

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

function formatAmount(amount?: number | null) {
  if (amount == null) return '₹ 0.00';
  return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

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

export const QuotationCard: React.FC<QuotationCardProps> = ({ quotation, onPress, isCompact = false }) => {
  const theme = useTheme();

  const prefix = quotation.prefix || 'QT';
  const qNumber = quotation.quotation_number
    ? `${prefix}-${quotation.quotation_number}`
    : String(quotation.id || '').slice(0, 8).toUpperCase();
  const statusColor = STATUS_COLORS[quotation.status] || '#6B7280';
  const clientName = quotation.company_name || quotation.lead_company_name || quotation.dealer_company_name || '—';
  const contactName = quotation.contact_name || quotation.lead_name || quotation.dealer_contact_name || '—';
  const dateStr = formatDate(quotation.quotation_date || quotation.date);
  const amountStr = formatAmount(quotation.grand_total);

  if (isCompact) {
    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={onPress ? 0.8 : 1}
        disabled={!onPress}
        onPress={onPress}
      >
        <View style={s.quotationTopRow}>
          <View style={s.quotationTypeRow}>
            <View style={[s.dot, { backgroundColor: COLORS.blue }]} />
            <Text style={s.quotationTypeText}>Product Quotation</Text>
          </View>
          <Text style={[s.statusTextLabel, { color: statusColor }]}>
            • {quotation.status}
          </Text>
        </View>

        <Text style={s.quotationTitle}># {qNumber}</Text>

        <View style={s.cardDetailsList}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={[s.cardDetailItem, { flex: 1, marginRight: 8 }]}>
              <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <Text style={[s.cardDetailText, { fontWeight: '800', color: COLORS.textDark }]} numberOfLines={1}>
                {clientName}
              </Text>
            </View>
            <View style={[s.cardDetailItem, { flex: 1, justifyContent: 'flex-end' }]}>
              <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <Text style={s.cardDetailText} numberOfLines={1}>
                {contactName}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.cardDivider} />

        <View style={s.quotationBottomRow}>
          <View style={s.leftMetrics}>
            <View style={s.metricItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
              <Text style={s.metricText}>{dateStr}</Text>
            </View>
          </View>
          <View style={s.rightAmountCol}>
            <Text style={s.amountLabel}>Amount</Text>
            <Text style={s.amountValue}>{amountStr}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Dashboard Card
  return (
    <TouchableOpacity
      style={s.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      {/* Header row: type label + status */}
      <View style={s.quotationTopRow}>
        <View style={s.quotationTypeRow}>
          <View style={[s.dot, { backgroundColor: COLORS.blue }]} />
          <Text style={s.quotationTypeText}>Product Quotation</Text>
        </View>
        <Text style={[s.statusTextLabel, { color: statusColor, fontWeight: '800' }]}>
          • {quotation.status}
        </Text>
      </View>

      {/* Quotation number & Lead/Contact Name side-by-side */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <Text style={s.cardId}># {qNumber}</Text>
        <Text style={{ fontSize: 13.5, fontWeight: '700', color: COLORS.textDark, textAlign: 'right', flex: 1, marginLeft: 12 }} numberOfLines={1}>
          {contactName}
        </Text>
      </View>

      <View style={s.cardDivider} />

      {/* Bottom row */}
      <View style={s.quotationBottomRow}>
        <View style={s.leftMetrics}>
          <Text style={s.amountLabel}>Date</Text>
          <View style={s.metricItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
            <Text style={s.metricText}>{dateStr}</Text>
          </View>
        </View>
        <View style={s.rightAmountCol}>
          <Text style={s.amountLabel}>Amount</Text>
          <Text style={[s.amountValue, { color: theme.primaryColor }]}>{amountStr}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 3,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  quotationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotationTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  quotationTypeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.blue,
  },
  statusTextLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  quotationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  cardId: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 0,
  },
  cardDetailsList: {
    marginTop: 2,
  },
  cardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetailText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  quotationBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftMetrics: {
    gap: 2,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  rightAmountCol: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
