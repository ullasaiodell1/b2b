import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ProformaRecord } from '@/types/proforma';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ProformaCardProps {
  proforma: ProformaRecord;
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
  DISPATCHED: '#10B981',
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

export const ProformaCard: React.FC<ProformaCardProps> = ({ proforma, onPress, isCompact = false }) => {
  const theme = useTheme();

  const pNumber = proforma.formatted_proforma_number || 
    (proforma.proforma_prefix && proforma.proforma_number 
      ? `${proforma.proforma_prefix}-${proforma.proforma_number}`
      : `PI-${proforma.proforma_number || String(proforma.id || '').slice(0, 8).toUpperCase()}`);
  
  const statusColor = STATUS_COLORS[proforma.status] || '#6B7280';
  const clientName = proforma.lead_company_name || proforma.company_name || proforma.dealer_company_name || '—';
  const contactName = proforma.contact_name || proforma.lead_name || proforma.dealer_contact_name || '—';
  const dateStr = formatDate(proforma.quotation_date || proforma.created_at);
  const amountStr = formatAmount(proforma.grand_total);
  const sourceText = proforma.source_type ? proforma.source_type.replace(/_/g, ' ') : 'Quotation';

  if (isCompact) {
    return (
      <TouchableOpacity
        style={s.compactCard}
        onPress={onPress}
        activeOpacity={onPress ? 0.85 : 1}
        disabled={!onPress}
      >
        <Text style={[s.pNumber, { color: theme.primaryColor }]}>#{pNumber}</Text>
        <Text style={[s.compactAmount, { color: theme.primaryColor }]}>{amountStr}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[s.card, isCompact && { padding: 10 }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={{ gap: 10 }}>
        {/* Row 1: Proforma ID & Status Badge */}
        <View style={s.row}>
          <Text style={[s.pNumber, { color: theme.primaryColor }]}>{pNumber}</Text>
          <View style={[s.statusBadge, { borderColor: statusColor }]}>
            <Text style={[s.statusText, { color: statusColor }]}>{proforma.status || 'DRAFT'}</Text>
          </View>
        </View>

        {/* Row 2: Customer Name (with Company Subtitle) & Date */}
        <View style={s.row}>
          <View style={s.clientCol}>
            <Text style={s.contactName} numberOfLines={1}>{contactName}</Text>
            {clientName !== '—' && clientName !== '' ? (
              <Text style={s.companyName} numberOfLines={1}>{clientName}</Text>
            ) : null}
          </View>
          <Text style={s.dateText}>{dateStr}</Text>
        </View>

        {/* Row 3: Source Type & Amount Pill Badge */}
        <View style={s.row}>
          <Text style={s.typeText}>{sourceText}</Text>
          <View style={[s.amountBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[s.amountText, { color: theme.primaryColor }]}>{amountStr}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  clientCol: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    marginRight: 10,
  },
  contactName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  companyName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  typeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  amountBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  compactCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  compactAmount: {
    fontSize: 13.5,
    fontWeight: '800',
  },
});
