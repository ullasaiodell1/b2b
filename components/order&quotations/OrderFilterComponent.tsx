/**
 * OrderFilterComponent — Uses the global FilterDropdown for all filter fields.
 */

import { activeOrderFilter, updateOrderFilterState } from '@/components/order&quotations/OrderState';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Filter Option Lists ───────────────────────────────────────────────────────

const ORDER_STATUS_OPTIONS = [
  'DRAFT',
  'CONFIRMED',
  'PROCESSING',
  'READY FOR DISPATCH',
  'DISPATCHED',
  'PARTIALLY DELIVERED',
  'DELIVERED',
  'CANCELLED',
  'ON HOLD',
  'COMPLETED',
  'PENDING',
  'SENT',
  'APPROVED',
  'REJECTED',
];

const PAYMENT_STATUS_OPTIONS = [
  'PENDING',
  'PARTIALLY PAID',
  'PAID',
  'REFUNDED',
  'FAILED',
  'CANCELLED',
];

// Display labels for order type
const ORDER_TYPE_DISPLAY = [
  'Without Branding',
  'Custom Branding',
];
// API values corresponding to display labels
const ORDER_TYPE_VALUES = [
  'WITHOUT_BRANDING',
  'CUSTOM_BRANDING',
];

// Display labels for source type
const SOURCE_DISPLAY = [
  'Direct',
  'Referral',
  'Online',
  'Walk-in',
  'Partner',
  'Dealer Quotation',
  'Dealer PO',
];
// API values corresponding to display labels
const SOURCE_VALUES = [
  'DIRECT',
  'REFERRAL',
  'ONLINE',
  'WALK_IN',
  'PARTNER',
  'DEALER_QUOTATION',
  'DEALER_PO',
];

// ── Props ─────────────────────────────────────────────────────────────────────

export interface OrderFilterComponentProps {
  referrer?: string;
  leadId?: string;
  onCancel?: () => void;
  onApply?: (
    status: string,
    startDate: Date | null,
    endDate: Date | null,
    paymentStatus: string,
    orderType: string,
    source: string,
  ) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const OrderFilterComponent: React.FC<OrderFilterComponentProps> = ({
  referrer,
  leadId,
  onCancel,
  onApply,
}) => {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // ── Back handling ───────────────────────────────────────────────────────
  const handleBack = () => {
    if (onCancel) { onCancel(); return; }
    (navigation as any).goBack();
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (onCancel) { onCancel(); return true; }
        (navigation as any).goBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [onCancel])
  );

  // ── Local state ─────────────────────────────────────────────────────────
  // These hold API-ready values (underscores)
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  // ── Helpers to map display <-> API values ────────────────────────
  const displayToTypeValue = (display: string) => {
    const idx = ORDER_TYPE_DISPLAY.indexOf(display);
    return idx >= 0 ? ORDER_TYPE_VALUES[idx] : display;
  };
  const typeValueToDisplay = (val: string) => {
    const idx = ORDER_TYPE_VALUES.indexOf(val);
    return idx >= 0 ? ORDER_TYPE_DISPLAY[idx] : val;
  };
  const displayToSourceValue = (display: string) => {
    const idx = SOURCE_DISPLAY.indexOf(display);
    return idx >= 0 ? SOURCE_VALUES[idx] : display;
  };
  const sourceValueToDisplay = (val: string) => {
    const idx = SOURCE_VALUES.indexOf(val);
    return idx >= 0 ? SOURCE_DISPLAY[idx] : val;
  };

  // ── Date to YYYY-MM-DD ───────────────────────────────────────────
  const toDateString = (d: Date | null): string => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // ── Sync from global state on mount ────────────────────────────────────
  useEffect(() => {
    setSelectedStatus(activeOrderFilter.status || '');
    setSelectedPayment(activeOrderFilter.payment_status || '');
    // store as API value (e.g. WITHOUT_BRANDING)
    setSelectedType(activeOrderFilter.order_type || '');
    setSelectedSource(activeOrderFilter.source_type || '');
    
    if (activeOrderFilter.startDate) {
      const parts = activeOrderFilter.startDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        setStartDate(new Date(year, month, day));
      } else {
        const d = new Date(activeOrderFilter.startDate);
        if (!isNaN(d.getTime())) setStartDate(d);
      }
    }
    if (activeOrderFilter.endDate) {
      const parts = activeOrderFilter.endDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        setEndDate(new Date(year, month, day));
      } else {
        const d = new Date(activeOrderFilter.endDate);
        if (!isNaN(d.getTime())) setEndDate(d);
      }
    }
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const formatDateShort = (date: Date | null) => {
    if (!date) return 'Select Date';
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
  };

  const activeFilterCount = [
    selectedStatus, selectedPayment, selectedType, selectedSource,
    startDate || endDate ? 'date' : '',
  ].filter(Boolean).length;

  // ── Reset ───────────────────────────────────────────────────────────────
  const handleResetAll = () => {
    setSelectedStatus('');
    setSelectedPayment('');
    setSelectedType('');
    setSelectedSource('');
    setStartDate(null);
    setEndDate(null);
    // Also clear the global filter state so the API re-fetches without filters
    updateOrderFilterState({
      status: '',
      dateRange: '',
      payment_status: '',
      order_type: '',
      source_type: '',
      startDate: '',
      endDate: '',
    });
  };

  // ── Apply ───────────────────────────────────────────────────────────────
  const handleApplyFilter = () => {
    const dateRange =
      startDate && endDate
        ? `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`
        : startDate ? `From ${formatDateShort(startDate)}`
        : endDate ? `To ${formatDateShort(endDate)}`
        : '';

    // Dates are sent as YYYY-MM-DD (what the API expects)
    const startDateStr = toDateString(startDate);
    const endDateStr = toDateString(endDate);

    updateOrderFilterState({
      status: selectedStatus,
      dateRange,
      payment_status: selectedPayment,
      order_type: selectedType,
      source_type: selectedSource,
      startDate: startDateStr,
      endDate: endDateStr,
    });

    if (onApply) {
      onApply(selectedStatus, startDate, endDate, selectedPayment, selectedType, selectedSource);
      return;
    }

    if (referrer === 'lead-details' && leadId) {
      router.navigate({
        pathname: '/(tabs)/leads/lead-details',
        params: {
          id: leadId,
          activeTab: 'Order',
          oStatus: selectedStatus || '',
          oPaymentStatus: selectedPayment || '',
          oOrderType: selectedType || '',
          oSourceType: selectedSource || '',
          oStartDate: startDateStr,
          oEndDate: endDateStr,
          oFilterApplied: 'true',
        },
      });
    } else {
      handleBack();
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={handleBack} style={s.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>ORDER </Text>
          <Text style={{ color: COLORS.textDark }}>FILTER</Text>
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* ── SCROLL BODY ─────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top row: Filters title + Reset All */}
        <View style={s.panelHeader}>
          <View style={s.panelTitleRow}>
            <View style={[s.indicator, { backgroundColor: theme.primaryColor }]} />
            <Text style={s.panelTitle}>
              Filters
              {activeFilterCount > 0 && (
                <Text style={[s.filterBadge, { color: theme.primaryColor }]}>
                  {' '}({activeFilterCount})
                </Text>
              )}
            </Text>
          </View>
          <TouchableOpacity onPress={handleResetAll} activeOpacity={0.7}>
            <Text style={s.resetAllText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* ── DROPDOWNS CARD ─────────────────────────────────────────── */}
        <View style={s.dropdownCard}>
          <View style={s.dropdownGridRow}>
            <FilterDropdown
              placeholder="All Status"
              options={ORDER_STATUS_OPTIONS}
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={s.gridDropdown}
              labelStyle={s.gridDropdownLabel}
            />
            <FilterDropdown
              placeholder="All Payments"
              options={PAYMENT_STATUS_OPTIONS}
              value={selectedPayment}
              onChange={setSelectedPayment}
              style={s.gridDropdown}
              labelStyle={s.gridDropdownLabel}
            />
          </View>

          <View style={s.dropdownGridRow}>
            <FilterDropdown
              placeholder="All Types"
              options={ORDER_TYPE_DISPLAY}
              value={typeValueToDisplay(selectedType)}
              onChange={(display) => setSelectedType(displayToTypeValue(display))}
              style={s.gridDropdown}
              labelStyle={s.gridDropdownLabel}
            />
            <FilterDropdown
              placeholder="All Sources"
              options={SOURCE_DISPLAY}
              value={sourceValueToDisplay(selectedSource)}
              onChange={(display) => setSelectedSource(displayToSourceValue(display))}
              style={s.gridDropdown}
              labelStyle={s.gridDropdownLabel}
            />
          </View>
        </View>

        {/* ── Active Filter Summary Cards ─────────────────────────── */}
        {(selectedStatus || selectedPayment || selectedType || selectedSource || startDate || endDate) ? (
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Active Filters</Text>
            <View style={s.summaryChips}>
              {selectedStatus ? (
                <View style={[s.summaryChip, { backgroundColor: theme.primaryLight, borderColor: theme.primaryColor }]}>
                  <Text style={[s.summaryChipLabel, { color: COLORS.textMuted }]}>Status</Text>
                  <Text style={[s.summaryChipValue, { color: theme.primaryColor }]}>{selectedStatus}</Text>
                  <TouchableOpacity onPress={() => setSelectedStatus('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {selectedPayment ? (
                <View style={[s.summaryChip, { backgroundColor: theme.primaryLight, borderColor: theme.primaryColor }]}>
                  <Text style={[s.summaryChipLabel, { color: COLORS.textMuted }]}>Payment</Text>
                  <Text style={[s.summaryChipValue, { color: theme.primaryColor }]}>{selectedPayment}</Text>
                  <TouchableOpacity onPress={() => setSelectedPayment('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {selectedType ? (
                <View style={[s.summaryChip, { backgroundColor: theme.primaryLight, borderColor: theme.primaryColor }]}>
                  <Text style={[s.summaryChipLabel, { color: COLORS.textMuted }]}>Type</Text>
                  <Text style={[s.summaryChipValue, { color: theme.primaryColor }]}>{typeValueToDisplay(selectedType)}</Text>
                  <TouchableOpacity onPress={() => setSelectedType('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {selectedSource ? (
                <View style={[s.summaryChip, { backgroundColor: theme.primaryLight, borderColor: theme.primaryColor }]}>
                  <Text style={[s.summaryChipLabel, { color: COLORS.textMuted }]}>Source</Text>
                  <Text style={[s.summaryChipValue, { color: theme.primaryColor }]}>{sourceValueToDisplay(selectedSource)}</Text>
                  <TouchableOpacity onPress={() => setSelectedSource('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {startDate ? (
                <View style={[s.summaryChip, { backgroundColor: theme.primaryLight, borderColor: theme.primaryColor }]}>
                  <Text style={[s.summaryChipLabel, { color: COLORS.textMuted }]}>Start</Text>
                  <Text style={[s.summaryChipValue, { color: theme.primaryColor }]}>{formatDateShort(startDate)}</Text>
                  <TouchableOpacity onPress={() => setStartDate(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {endDate ? (
                <View style={[s.summaryChip, { backgroundColor: theme.primaryLight, borderColor: theme.primaryColor }]}>
                  <Text style={[s.summaryChipLabel, { color: COLORS.textMuted }]}>End</Text>
                  <Text style={[s.summaryChipValue, { color: theme.primaryColor }]}>{formatDateShort(endDate)}</Text>
                  <TouchableOpacity onPress={() => setEndDate(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* ── DATE RANGE SECTION ──────────────────────────────────── */}
        <View style={s.filterCard}>
          <View style={s.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={15} color={theme.primaryColor} />
            <Text style={s.sectionLabel}>Date Range</Text>
          </View>

          <View style={s.datePickerRow}>
            <TouchableOpacity
              style={s.dateDropdown}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={s.dateLabelText}>Start Date</Text>
                <Text style={[s.dateValueText, !startDate && s.datePlaceholder]}>
                  {formatDateShort(startDate)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={15} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={s.dateDropdown}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={s.dateLabelText}>End Date</Text>
                <Text style={[s.dateValueText, !endDate && s.datePlaceholder]}>
                  {formatDateShort(endDate)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={15} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {(startDate || endDate) && (
            <TouchableOpacity
              style={s.resetBtnFull}
              onPress={() => { setStartDate(null); setEndDate(null); }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={13} color={COLORS.textDark} style={{ marginRight: 4 }} />
              <Text style={s.resetText}>Reset Date Range</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={[s.footerBtn, s.cancelBtn]}
          activeOpacity={0.8}
        >
          <Text style={s.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleApplyFilter}
          style={[s.footerBtn, s.applyBtn, { backgroundColor: theme.primaryColor }]}
          activeOpacity={0.8}
        >
          <Text style={s.applyBtnText}>
            Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── DATE PICKERS ─────────────────────────────────────────────── */}
      {showStartPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showStartPicker}>
            <TouchableOpacity style={s.calendarOverlay} activeOpacity={1} onPress={() => setShowStartPicker(false)}>
              <View style={s.calendarContent}>
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="inline"
                  maximumDate={endDate || undefined}
                  onChange={(_: any, d?: Date) => { if (d) setStartDate(d); }}
                />
                <TouchableOpacity
                  style={[s.saveBtn, { backgroundColor: theme.primaryColor, marginTop: 10 }]}
                  onPress={() => setShowStartPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={s.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            maximumDate={endDate || undefined}
            onChange={(_: any, d?: Date) => { setShowStartPicker(false); if (d) setStartDate(d); }}
          />
        )
      )}

      {showEndPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showEndPicker}>
            <TouchableOpacity style={s.calendarOverlay} activeOpacity={1} onPress={() => setShowEndPicker(false)}>
              <View style={s.calendarContent}>
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="inline"
                  minimumDate={startDate || undefined}
                  onChange={(_: any, d?: Date) => { if (d) setEndDate(d); }}
                />
                <TouchableOpacity
                  style={[s.saveBtn, { backgroundColor: theme.primaryColor, marginTop: 10 }]}
                  onPress={() => setShowEndPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={s.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            minimumDate={startDate || undefined}
            onChange={(_: any, d?: Date) => { setShowEndPicker(false); if (d) setEndDate(d); }}
          />
        )
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F7F6' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 8,
    backgroundColor: '#F4F7F5',
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

  // Dropdowns card grid
  dropdownCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridDropdown: {
    flex: 1,
    alignSelf: 'stretch',
    height: 48,
    borderRadius: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  gridDropdownLabel: {
    flex: 1,
    maxWidth: '85%',
  },

  // Scroll body
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 120, gap: 12 },

  // Panel header
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  indicator: { width: 3.5, height: 16, borderRadius: 2 },
  panelTitle: { fontSize: 14.5, fontWeight: '900', color: COLORS.textDark },
  filterBadge: { fontSize: 13, fontWeight: '700' },
  resetAllText: { fontSize: 12.5, fontWeight: '800', color: COLORS.danger },

  // Active filter summary
  summaryCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  summaryTitle: { fontSize: 11.5, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  summaryChipLabel: { fontSize: 10, fontWeight: '700' },
  summaryChipValue: { fontSize: 11.5, fontWeight: '800' },

  // Date filter card
  filterCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { fontSize: 12.5, fontWeight: '800', color: COLORS.textDark },

  // Date pickers
  datePickerRow: { flexDirection: 'row', gap: 10 },
  dateDropdown: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12,
    height: 52, backgroundColor: '#FAFAFA',
  },
  dateLabelText: { fontSize: 9.5, fontWeight: '700', color: COLORS.textMuted, marginBottom: 2 },
  dateValueText: { fontSize: 12.5, fontWeight: '700', color: COLORS.textDark },
  datePlaceholder: { color: '#9CA3AF' },
  resetBtnFull: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 10, height: 38,
    backgroundColor: '#F9FAFB',
  },
  resetText: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  footerBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFFFFF' },
  cancelBtnText: { fontSize: 13.5, fontWeight: '800', color: COLORS.textDark },
  applyBtn: { flex: 1.5 },
  applyBtnText: { fontSize: 13.5, fontWeight: '800', color: '#FFFFFF' },

  // Calendar modal
  calendarOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  calendarContent: {
    backgroundColor: COLORS.bgWhite, borderRadius: 20,
    padding: 20, width: '100%', maxWidth: 320, gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
  saveBtn: { borderRadius: 10, height: 44, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
});
