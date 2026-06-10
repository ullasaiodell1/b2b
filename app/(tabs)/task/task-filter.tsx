import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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

type PriorityType = 'High' | 'Normal' | 'Low';
type StatusType = 'Completed' | 'Not Started' | 'In Progress' | 'Waiting For Input';

export default function TaskFilterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [priority, setPriority] = useState<PriorityType>('High');
  const [status, setStatus] = useState<StatusType>('Completed');

  // Start Date / End Date Picker States
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

  const handleResetAll = () => {
    setPriority('High');
    setStatus('Completed');
    setStartDate(new Date(2022, 11, 28));
    setEndDate(new Date(2023, 0, 10));
    Alert.alert('Reset Filters', 'All filter selections reset to defaults.');
  };

  const handleApplyFilter = () => {
    const rangeStr = `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`;
    Alert.alert(
      'Apply Filters',
      `Filters Applied:\n- Priority: ${priority}\n- Date: ${rangeStr}\n- Status: ${status}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={{ color: COLORS.primary }}>TASK </Text>
          <Text style={{ color: COLORS.textDark }}>FILTER</Text>
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <View style={styles.verticalGreenLine} />
            <Text style={styles.titleText}>Filters</Text>
          </View>
          <TouchableOpacity onPress={handleResetAll} activeOpacity={0.7}>
            <Text style={styles.resetAllText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Priority Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.prioritySegmentContainer}>
            {(['High', 'Normal', 'Low'] as PriorityType[]).map(p => {
              const isSelected = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.prioritySegmentBtn, isSelected && styles.prioritySegmentBtnActive]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.prioritySegmentText, isSelected && styles.prioritySegmentTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Date</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.dateSelectorRow}>
            <TouchableOpacity
              style={styles.datePickerDropdown}
              activeOpacity={0.8}
              onPress={() => setShowStartPicker(true)}
            >
              <View>
                <Text style={styles.dateLabelText}>Start Date</Text>
                <Text style={styles.dateText}>{formatDateShort(startDate)}</Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.datePickerDropdown}
              activeOpacity={0.8}
              onPress={() => setShowEndPicker(true)}
            >
              <View>
                <Text style={styles.dateLabelText}>End Date</Text>
                <Text style={styles.dateText}>{formatDateShort(endDate)}</Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dateResetFullBtn}
            onPress={() => {
              setStartDate(new Date(2022, 11, 28));
              setEndDate(new Date(2023, 0, 10));
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.dateResetFullBtnText}>Reset Range</Text>
            <Ionicons name="refresh-outline" size={14} color={COLORS.textDark} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Status Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Status</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.statusList}>
            {(['Completed', 'Not Started', 'In Progress', 'Waiting For Input'] as StatusType[]).map(s => {
              const isSelected = status === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusCard, isSelected && styles.statusCardActive]}
                  onPress={() => setStatus(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.statusText, isSelected && styles.statusTextActive]}>{s}</Text>

                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApplyFilter}
          activeOpacity={0.8}
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
                  value={startDate}
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
              style={styles.calendarOverlay}
              activeOpacity={1}
              onPress={() => setShowEndPicker(false)}
            >
              <View style={styles.calendarContent}>
                <DateTimePicker
                  value={endDate}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 100,
    gap: 5,
  },

  // Title Row
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalGreenLine: {
    width: 3,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  resetAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Section divider headers
  sectionContainer: {
    gap: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Segment style priorities
  prioritySegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F7F5',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  prioritySegmentBtn: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  prioritySegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  prioritySegmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  prioritySegmentTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },

  // Dates
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  dateLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  dateResetFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  dateResetFullBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Statuses
  statusList: {
    gap: 5,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  statusCardActive: {
    borderColor: COLORS.primary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  statusTextActive: {
    fontWeight: '800',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    width: 110,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  applyBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
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
