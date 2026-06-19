import { activeOrderFilter, updateOrderFilterState } from '@/components/order&quotations/OrderState';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
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
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

const STATUS_MAP_UI = {
  'Complete': 'Complete',
  'Inprogress': 'Process',
  'Pending': 'Pending',
  'Out Of Delivery': 'Out Of Delivery',
  'Cancelled': 'Cancel',
};

const STATUS_MAP_BACKEND = {
  'Complete': 'Complete',
  'Process': 'Inprogress',
  'Pending': 'Pending',
  'Out Of Delivery': 'Out Of Delivery',
  'Cancel': 'Cancelled',
};

const FILTER_OPTIONS = ['Complete', 'Process', 'Pending', 'Out Of Delivery', 'Cancel'];

export default function OrderFilterScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { referrer, leadId } = useLocalSearchParams<{ referrer?: string; leadId?: string }>();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (referrer === 'lead-details' && leadId) {
      router.navigate({ pathname: '/(tabs)/leads/lead-details', params: { id: leadId, activeTab: 'Order' } });
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (referrer === 'lead-details' && leadId) {
          router.navigate({ pathname: '/(tabs)/leads/lead-details', params: { id: leadId, activeTab: 'Order' } });
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [referrer, leadId])
  );

  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Start/End Dates
  const [startDate, setStartDate] = useState<Date>(new Date(2022, 11, 28));
  const [endDate, setEndDate] = useState<Date>(new Date(2023, 0, 10));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDateShort = (date: Date) => {
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).substring(2);
    return `${day} ${month} ${year}`;
  };

  // Sync with global state initially
  useEffect(() => {
    const statusVal = activeOrderFilter.status;
    const uiStatus = STATUS_MAP_UI[statusVal as keyof typeof STATUS_MAP_UI] || statusVal;
    setSelectedStatus(uiStatus);

    // Initial dates fallback
    setStartDate(new Date(2022, 11, 28));
    setEndDate(new Date(2023, 0, 10));
  }, []);

  const handleApplyFilter = () => {
    const backendStatus = STATUS_MAP_BACKEND[selectedStatus as keyof typeof STATUS_MAP_BACKEND] || selectedStatus;
    const rangeStr = `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`;
    updateOrderFilterState({
      status: backendStatus,
      dateRange: rangeStr,
    });
    if (referrer === 'lead-details' && leadId) {
      router.navigate({
        pathname: '/(tabs)/leads/lead-details',
        params: {
          id: leadId,
          activeTab: 'Order',
          oStatus: backendStatus || '',
          oStartDate: startDate ? startDate.toISOString() : '',
          oEndDate: endDate ? endDate.toISOString() : '',
          oFilterApplied: 'true',
        }
      });
    } else {
      handleBack();
    }
  };

  const handleResetAll = () => {
    setSelectedStatus('');
    setStartDate(new Date(2022, 11, 28));
    setEndDate(new Date(2023, 0, 10));
  };

  const handleResetDateOnly = () => {
    setStartDate(new Date(2022, 11, 28));
    setEndDate(new Date(2023, 0, 10));
  };

  return (
    <View style={s.root}>
    <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

    {/* ── 1. HEADER ROW ─────────────────────────── */}
    <View style={[s.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
      <TouchableOpacity onPress={handleBack} style={s.backBtn} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>ORDER FILTER</Text>
    </View>

    {/* ── 2. SCROLLABLE FILTER CONTROLS ─────────── */}
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Reset Panel */}
      <View style={s.panelHeader}>
        <Text style={s.panelTitle}>Filters</Text>
        <TouchableOpacity onPress={handleResetAll} activeOpacity={0.7}>
          <Text style={s.resetAllText}>Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Section: Date */}
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionLabel}>Date</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.dateFilterRow}>
          <TouchableOpacity
            style={s.dropdownBox}
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={s.dateLabelText}>Start Date</Text>
              <Text style={s.dropdownText}>{formatDateShort(startDate)}</Text>
            </View>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.dropdownBox}
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={s.dateLabelText}>End Date</Text>
              <Text style={s.dropdownText}>{formatDateShort(endDate)}</Text>
            </View>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.resetBtnFull} onPress={handleResetDateOnly} activeOpacity={0.8}>
          <Text style={s.resetText}>Reset Range</Text>
          <Ionicons name="reload-outline" size={14} color={COLORS.textDark} style={s.resetIcon} />
        </TouchableOpacity>
      </View>

      {/* Section: Order Status */}
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionLabel}>Order Status</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.statusList}>
          {FILTER_OPTIONS.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <TouchableOpacity
                key={status}
                style={[s.statusCard, isActive && s.statusCardActive]}
                onPress={() => setSelectedStatus(isActive ? '' : status)}
                activeOpacity={0.85}
              >
                <Text style={[s.statusCardText, isActive && s.statusCardTextActive]}>
                  {status}
                </Text>

                <View style={[s.checkboxCircle, isActive && s.checkboxCircleActive]}>
                  {isActive && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>

    {/* ── 3. BOTTOM BUTTON PANEL ───────────────── */}
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
        style={[s.footerBtn, s.applyBtn]}
        activeOpacity={0.8}
      >
        <Text style={s.applyBtnText}>Apply Filter</Text>
      </TouchableOpacity>
    </View>

    {/* ── SYSTEM DATE PICKERS ─────────────────────── */}
    {showStartPicker && (
      Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible={showStartPicker}>
          <TouchableOpacity
            style={s.calendarOverlay}
            activeOpacity={1}
            onPress={() => setShowStartPicker(false)}
          >
            <View style={s.calendarContent}>
              <DateTimePicker
                value={startDate}
                mode="date"
                display="inline"
                onChange={(event: any, selectedDate?: Date) => {
                  if (selectedDate) setStartDate(selectedDate);
                }}
              />
              <TouchableOpacity
                style={[s.saveBtn, { marginTop: 10 }]}
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
          value={startDate}
          mode="date"
          display="default"
          onChange={(event: any, selectedDate?: Date) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )
    )}

    {showEndPicker && (
      Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible={showEndPicker}>
          <TouchableOpacity
            style={s.calendarOverlay}
            activeOpacity={1}
            onPress={() => setShowEndPicker(false)}
          >
            <View style={s.calendarContent}>
              <DateTimePicker
                value={endDate}
                mode="date"
                display="inline"
                onChange={(event: any, selectedDate?: Date) => {
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
              <TouchableOpacity
                style={[s.saveBtn, { marginTop: 10 }]}
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
          value={endDate}
          mode="date"
          display="default"
          onChange={(event: any, selectedDate?: Date) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )
    )}

  </View>
);
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  resetAllText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.danger,
  },

  section: {
    gap: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  dateFilterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  dateLabelText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  dropdownText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  resetBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 40,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  resetText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  resetIcon: {
    transform: [{ translateY: 0.5 }],
  },

  statusList: {
    gap: 5,
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusCardActive: {
    borderColor: COLORS.primary,
  },
  statusCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  statusCardTextActive: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  // Bottom Buttons
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  applyBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
  },
  applyBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // iOS Calendar dialog modal styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContent: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
