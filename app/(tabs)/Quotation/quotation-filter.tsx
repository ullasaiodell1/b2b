import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function QuotationFilterScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const { referrer, leadId, qStartDate, qEndDate } = useLocalSearchParams<{
    referrer?: string;
    leadId?: string;
    qStartDate?: string;
    qEndDate?: string;
  }>();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (referrer === 'lead-details' && leadId) {
      router.navigate({
        pathname: '/(tabs)/leads/lead-details',
        params: { id: leadId }
      });
    } else {
      router.back();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (referrer === 'lead-details' && leadId) {
          router.navigate({
            pathname: '/(tabs)/leads/lead-details',
            params: { id: leadId }
          });
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [referrer, leadId])
  );

  // Filters State

  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (qStartDate) {
      const parsed = new Date(qStartDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (qEndDate) {
      const parsed = new Date(qEndDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  });

  // Picker States
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDateShort = (date: Date | null) => {
    if (!date) return 'Select Date';
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).substring(2);
    return `${day} ${month} ${year}`;
  };

  const handleResetAll = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleResetDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleApplyFilter = () => {
    const isApplied = !!(startDate || endDate);
    if (referrer === 'lead-details' && leadId) {
      router.navigate({
        pathname: '/(tabs)/leads/lead-details',
        params: {
          id: leadId,
          qStartDate: startDate ? startDate.toISOString() : '',
          qEndDate: endDate ? endDate.toISOString() : '',
          qFilterApplied: isApplied ? 'true' : ''
        }
      });
    } else {
      router.navigate({
        pathname: '/(tabs)/Quotation',
        params: {
          qStartDate: startDate ? startDate.toISOString() : '',
          qEndDate: endDate ? endDate.toISOString() : '',
          qFilterApplied: isApplied ? 'true' : ''
        }
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>QUOTATION </Text>
          <Text style={{ color: COLORS.textDark }}>FILTER</Text>
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── BODY CONTROLS ─────────────────────────── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Filters title & Reset All */}
        <View style={styles.topRow}>
          <View style={styles.panelTitleRow}>
            <View style={styles.verticalIndicator} />
            <Text style={styles.panelTitleText}>Filters</Text>
          </View>
          <TouchableOpacity onPress={handleResetAll} activeOpacity={0.7}>
            <Text style={styles.resetAllText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Date Section Card */}
        <View style={styles.filterCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.primaryColor} style={{ marginRight: 2 }} />
            <Text style={styles.sectionLabel}>Date Range</Text>
          </View>

          <View style={styles.datePickerRow}>
            <TouchableOpacity
              style={styles.dateDropdown}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.dateLabelText}>From Date</Text>
                <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                  {formatDateShort(startDate)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateDropdown}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.dateLabelText}>To Date</Text>
                <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                  {formatDateShort(endDate)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dateResetBtn}
            onPress={handleResetDates}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={13} color={COLORS.textDark} style={{ marginRight: 4 }} />
            <Text style={styles.dateResetText}>Reset Range</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── FOOTER ACTIONS ────────────────────────── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApplyFilter}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── SYSTEM DATE PICKERS ─────────────────────── */}
      {showStartPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showStartPicker}>
            <TouchableOpacity
              style={styles.calendarOverlay}
              activeOpacity={1}
              onPress={() => setShowStartPicker(false)}
            >
              <View style={styles.calendarContent}>
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="inline"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (selectedDate) setStartDate(selectedDate);
                  }}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { marginTop: 10 }]}
                  onPress={() => setShowStartPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={startDate || new Date()}
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
              style={styles.calendarOverlay}
              activeOpacity={1}
              onPress={() => setShowEndPicker(false)}
            >
              <View style={styles.calendarContent}>
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="inline"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { marginTop: 10 }]}
                  onPress={() => setShowEndPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event: any, selectedDate?: Date) => {
              setShowEndPicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )
      )}

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
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Content
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 150,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalIndicator: {
    width: 3.5,
    height: 16,
    backgroundColor: theme.primaryColor,
    borderRadius: 2,
  },
  panelTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  resetAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.danger,
  },

  // Sections
  section: {
    gap: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Priority capsules
  priorityContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEFF1',
    borderRadius: 10,
    padding: 3,
    height: 40,
  },
  priorityTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  priorityTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1.5,
  },
  priorityTabText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  priorityTabTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },

  // Date selection
  datePickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  dateLabelText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  datePlaceholder: {
    color: '#9CA3AF',
  },
  filterCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  dateResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  dateResetText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Select box
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  selectBoxText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  selectBoxPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '600',
  },

  // Radio list
  radioList: {
    gap: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  radioLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: theme.primaryColor,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primaryColor,
  },

  // Footer buttons
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  applyBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modal selector styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalList: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemActive: {
    backgroundColor: '#F9FAFB',
  },
  modalItemText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalItemTextActive: {
    color: theme.primaryColor,
    fontWeight: '800',
  },

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
    backgroundColor: theme.primaryColor,
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
