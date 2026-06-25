import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const clientName = quotation.lead_company_name || quotation.company_name || quotation.dealer_company_name || '—';
  const contactName = quotation.contact_name || quotation.lead_name || quotation.dealer_contact_name || '—';
  const dateStr = formatDate(quotation.quotation_date || quotation.date);
  const amountStr = formatAmount(quotation.grand_total);

  // Shared layout for both compact and dashboard
  const cardContent = (
    <>
      {/* Row 1: # Number (left) + Status (right) */}
      <View style={s.row}>
        <Text style={[s.qNumber, { color: theme.primaryColor }]}># {qNumber}</Text>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[s.statusText, { color: statusColor }]}>{quotation.status}</Text>
        </View>
      </View>

      <View style={s.cardDivider} />

      {/* Row 2: Contact Name (left) + Company Name (right) */}
      <View style={s.row}>
        <View style={s.metaItem}>
          <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
          <Text style={s.metaText} numberOfLines={1}>{contactName}</Text>
        </View>
        <View style={s.metaItem}>
          <Ionicons name="business-outline" size={13} color={COLORS.textMuted} />
          <Text style={s.metaTextRight} numberOfLines={1}>{clientName}</Text>
        </View>
      </View>

      <View style={s.cardDivider} />

      {/* Row 3: Date (left) + Amount (right) */}
      <View style={s.row}>
        <View style={s.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={s.metaText}>{dateStr}</Text>
        </View>
        <Text style={[s.amountValue, { color: theme.primaryColor }]}>{amountStr}</Text>
      </View>
    </>
  );

  if (isCompact) {
    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={onPress ? 0.8 : 1}
        disabled={!onPress}
        onPress={onPress}
      >
        {cardContent}
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
      {cardContent}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    flexShrink: 1,
  },
  metaTextRight: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    flexShrink: 1,
    textAlign: 'right',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  amountValue: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.textDark,
  },
});

