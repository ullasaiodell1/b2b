import { activeCallFilter, CallFilterState, updateCallFilterState } from '@/components/call/CallState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
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

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDate = (str: string): Date | null => {
  try {
    const parts = str.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  } catch (e) {
    console.log('Error parsing date:', e);
  }
  return null;
};

export default function CallFilterScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [fromDate, setFromDate] = useState<Date | null>(() => {
    if (activeCallFilter.dateRange && activeCallFilter.dateRange.includes(' - ')) {
      const parts = activeCallFilter.dateRange.split(' - ');
      return parseDate(parts[0]);
    }
    return null;
  });

  const [toDate, setToDate] = useState<Date | null>(() => {
    if (activeCallFilter.dateRange && activeCallFilter.dateRange.includes(' - ')) {
      const parts = activeCallFilter.dateRange.split(' - ');
      return parseDate(parts[1]);
    }
    return null;
  });

  const [selectedStatus, setSelectedStatus] = useState<CallFilterState['status']>(activeCallFilter.status || '');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleResetAll = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedStatus('');
  };

  const handleResetDateOnly = () => {
    setFromDate(null);
    setToDate(null);
  };

  const handleApply = () => {
    let finalRange = '';
    if (fromDate && toDate) {
      finalRange = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
    }
    updateCallFilterState({
      status: selectedStatus,
      dateRange: finalRange,
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>CALL </Text>
          <Text style={{ color: COLORS.textDark }}>FILTER</Text>
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subheader */}
        <View style={styles.subHeaderRow}>
          <View style={styles.subHeaderLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.subHeaderTitle}>Filters</Text>
          </View>
          <TouchableOpacity onPress={handleResetAll}>
            <Text style={styles.resetAllText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector Row */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.dateDropdown, { flex: 1, paddingVertical: 4, height: 46 }]}
              onPress={() => setShowFromPicker(true)}
              activeOpacity={0.85}
            >
              <View>
                <Text style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: '700' }}>FROM</Text>
                <Text style={styles.dateDropdownText}>
                  {fromDate ? formatDate(fromDate) : 'Select Date'}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateDropdown, { flex: 1, paddingVertical: 4, height: 46 }]}
              onPress={() => setShowToPicker(true)}
              activeOpacity={0.85}
            >
              <View>
                <Text style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: '700' }}>TO</Text>
                <Text style={styles.dateDropdownText}>
                  {toDate ? formatDate(toDate) : 'Select Date'}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {(fromDate || toDate) && (
              <TouchableOpacity
                style={[styles.dateResetBtn, { width: 44, paddingHorizontal: 0, height: 46 }]}
                onPress={handleResetDateOnly}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={18} color={COLORS.textDark} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Status</Text>

          <View style={styles.statusOptionsList}>
            {(['Incoming', 'Outgoing', 'Missed'] as const).map((statusVal) => {
              const isSelected = selectedStatus === statusVal;
              return (
                <TouchableOpacity
                  key={statusVal}
                  style={styles.statusCardRow}
                  onPress={() => setSelectedStatus(selectedStatus === statusVal ? '' : statusVal)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.statusCardText}>{statusVal}</Text>
                  <View style={[styles.circleSelector, isSelected && styles.circleSelectorActive]}>
                    {isSelected && <View style={styles.circleSelectorInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 12, 18) }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <Text style={styles.applyBtnText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) {
              setFromDate(selectedDate);
            }
          }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display="default"
          minimumDate={fromDate || undefined}
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) {
              setToDate(selectedDate);
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 3,
    height: 16,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
    marginRight: 8,
  },
  subHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  resetAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  filterSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  dateControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  dateDropdownText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  dateResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  dateResetText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  statusOptionsList: {
    gap: 5,
  },
  statusCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  statusCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  circleSelector: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelectorActive: {
    borderColor: theme.primaryColor,
  },
  circleSelectorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primaryColor,
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 46,
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
    flex: 1.2,
    backgroundColor: theme.primaryColor,
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
