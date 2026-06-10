import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useQuotationDetails, useUpdateQuotationStatus } from '@/hooks/useQuotations';
import { QuotationItem } from '@/types/quotation';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function QuotationDetailsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: quotation, isLoading, isError, refetch } = useQuotationDetails(id || '');
  const updateStatusMutation = useUpdateQuotationStatus();

  const handleStatusChange = (newStatus: string) => {
    if (!id) return;
    Alert.alert(
      'Update Status',
      `Change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateStatusMutation.mutate(
              { id, status: newStatus },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Status updated successfully');
                  refetch();
                },
                onError: (err: any) => {
                  Alert.alert('Error', err?.message || 'Failed to update status');
                },
              }
            );
          },
        },
      ]
    );
  };

  if (!id) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No quotation ID provided.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnSmall}>
          <Text style={styles.backBtnSmallText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={styles.loaderText}>Loading quotation...</Text>
      </View>
    );
  }

  if (isError || !quotation) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load quotation details.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnSmall}>
          <Text style={styles.backBtnSmallText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[quotation.status] || '#6B7280';
  const prefix = quotation.prefix || 'QT';
  const qNumber = quotation.quotation_number
    ? `${prefix}-${quotation.quotation_number}`
    : id.slice(0, 8).toUpperCase();

  const clientName =
    quotation.lead_name ||
    quotation.lead_company_name ||
    quotation.company_name ||
    quotation.dealer_company_name ||
    '—';

  const items: QuotationItem[] = Array.isArray(quotation.items) ? quotation.items : [];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>QUOTATION </Text>
          <Text style={{ color: COLORS.textDark }}>DETAILS</Text>
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quotation Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryQNumber}>#{qNumber}</Text>
              <Text style={styles.summaryDate}>{formatDate(quotation.quotation_date)}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
              <Text style={[styles.statusPillText, { color: statusColor }]}>{quotation.status}</Text>
            </View>
          </View>

          {/* Client info */}
          {clientName !== '—' && (
            <View style={styles.summaryInfoRow}>
              <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <Text style={styles.summaryInfoText}>{clientName}</Text>
            </View>
          )}
          {!!quotation.contact_name && (
            <View style={styles.summaryInfoRow}>
              <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <Text style={styles.summaryInfoText}>{quotation.contact_name}</Text>
            </View>
          )}
          {!!quotation.contact_email && (
            <View style={styles.summaryInfoRow}>
              <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <Text style={styles.summaryInfoText}>{quotation.contact_email}</Text>
            </View>
          )}
          {!!quotation.contact_phone && (
            <View style={styles.summaryInfoRow}>
              <Ionicons name="call-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <Text style={styles.summaryInfoText}>{quotation.contact_phone}</Text>
            </View>
          )}
        </View>

        {/* Status Update Actions */}
        {quotation.status === 'DRAFT' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
            onPress={() => handleStatusChange('SENT')}
            activeOpacity={0.85}
            disabled={updateStatusMutation.isPending}
          >
            <Ionicons name="send-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Mark as Sent</Text>
          </TouchableOpacity>
        )}
        {quotation.status === 'SENT' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtnHalf, { backgroundColor: '#10B981' }]}
              onPress={() => handleStatusChange('ACCEPTED')}
              activeOpacity={0.85}
              disabled={updateStatusMutation.isPending}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtnHalf, { backgroundColor: '#EF4444' }]}
              onPress={() => handleStatusChange('REJECTED')}
              activeOpacity={0.85}
              disabled={updateStatusMutation.isPending}
            >
              <Ionicons name="close-circle-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Items Section */}
        {items.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIndicatorBar} />
              <Text style={styles.sectionTitle}>ITEMS ({items.length})</Text>
              <View style={styles.sectionHeaderLine} />
            </View>

            {items.map((item, idx) => (
              <View key={item.id || String(idx)} style={styles.productCard}>
                <View style={styles.productTopRow}>
                  <View style={styles.productIndexBadge}>
                    <Text style={styles.productIndexText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.productDetailsCol}>
                    <Text style={styles.productName}>{item.item_name}</Text>
                    {!!item.item_code && (
                      <Text style={styles.productSpec}>Code: {item.item_code}</Text>
                    )}
                    {!!item.item_description && (
                      <Text style={styles.productDesc} numberOfLines={2}>{item.item_description}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.productStatsGrid}>
                  <View style={styles.statsGridCol}>
                    <Text style={styles.gridLabel}>
                      Qty: <Text style={styles.gridVal}>{item.quantity}</Text>
                    </Text>
                    <Text style={styles.gridLabel}>
                      GST: <Text style={styles.gridVal}>{item.gst_percentage ?? 0}%</Text>
                    </Text>
                  </View>
                  <View style={[styles.statsGridCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.gridLabel}>
                      Rate: <Text style={styles.gridVal}>{formatAmount(item.unit_price)}</Text>
                    </Text>
                    <Text style={styles.gridLabel}>
                      Amount: <Text style={styles.gridPriceVal}>{formatAmount(item.amount)}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Notes */}
        {!!quotation.notes && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIndicatorBar} />
              <Text style={styles.sectionTitle}>NOTES</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            <View style={styles.remarkCard}>
              <View style={styles.remarkTitleRow}>
                <Ionicons name="pin" size={14} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.remarkTitleText}>Note</Text>
              </View>
              <Text style={styles.remarkBodyText}>{quotation.notes}</Text>
            </View>
          </>
        )}

        {/* Totals */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIndicatorBar} />
          <Text style={styles.sectionTitle}>AMOUNT SUMMARY</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatAmount(quotation.subtotal)}</Text>
          </View>
          {!!quotation.tax_total && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax Total</Text>
              <Text style={styles.totalValue}>{formatAmount(quotation.tax_total)}</Text>
            </View>
          )}
          {!!quotation.discount_amount && quotation.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: '#EF4444' }]}>
                - {formatAmount(quotation.discount_amount)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.totalRowGrandTotal]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{formatAmount(quotation.grand_total)}</Text>
          </View>
        </View>

        {/* Download Quotation */}
        <TouchableOpacity
          style={styles.downloadOrderBanner}
          onPress={() => Alert.alert('Download', 'Download feature coming soon')}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.downloadOrderTitle}>Download Quotation</Text>
            <Text style={styles.downloadOrderSub}>Export as PDF</Text>
          </View>
          <View style={styles.downloadOrderIconBg}>
            <Ionicons name="download" size={20} color={theme.primaryColor} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    gap: 12,
    padding: 24,
  },
  loaderText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  errorText: { fontSize: 14, color: COLORS.textDark, fontWeight: '700', textAlign: 'center' },
  backBtnSmall: {
    backgroundColor: theme.primaryColor,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backBtnSmallText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  scrollContent: { paddingHorizontal: 12, paddingTop: 12, gap: 8 },

  // Summary card
  summaryCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 8,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryQNumber: { fontSize: 18, fontWeight: '900', color: COLORS.textDark },
  summaryDate: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  statusPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  summaryInfoRow: { flexDirection: 'row', alignItems: 'center' },
  summaryInfoText: { fontSize: 12.5, color: COLORS.textMuted, fontWeight: '600', flex: 1 },

  // Action buttons
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 44,
  },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtnHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 44,
  },
  actionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  // Section headers
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  sectionIndicatorBar: {
    width: 3.5,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: { fontSize: 12.5, fontWeight: '900', color: COLORS.textDark, letterSpacing: 0.3 },
  sectionHeaderLine: { flex: 1, height: 1, backgroundColor: COLORS.border, marginLeft: 10 },

  // Product cards
  productCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  productTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  productIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIndexText: { fontSize: 12, fontWeight: '800', color: theme.primaryColor },
  productDetailsCol: { flex: 1 },
  productName: { fontSize: 13.5, fontWeight: '800', color: COLORS.textDark },
  productSpec: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
  productDesc: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted, marginTop: 3 },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  productStatsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statsGridCol: { flex: 1, gap: 5 },
  gridLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  gridVal: { fontWeight: '800', color: COLORS.textDark },
  gridPriceVal: { fontSize: 12.5, fontWeight: '900', color: COLORS.textDark },

  // Remark
  remarkCard: {
    backgroundColor: '#FAFDFB',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: theme.primaryColor,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 4,
  },
  remarkTitleRow: { flexDirection: 'row', alignItems: 'center' },
  remarkTitleText: { fontSize: 12.5, fontWeight: '800', color: COLORS.textDark },
  remarkBodyText: { fontSize: 11.5, color: COLORS.textMuted, fontWeight: '600', lineHeight: 16 },

  // Totals
  totalsCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  totalRowGrandTotal: { borderBottomWidth: 0 },
  totalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  totalValue: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  grandTotalLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  grandTotalValue: { fontSize: 15, fontWeight: '900', color: theme.primaryColor },

  // Download banner
  downloadOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#437E6B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  downloadOrderTitle: { color: '#FFF', fontSize: 13.5, fontWeight: '800' },
  downloadOrderSub: { color: '#E0EDE9', fontSize: 10, fontWeight: '700', marginTop: 2 },
  downloadOrderIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
