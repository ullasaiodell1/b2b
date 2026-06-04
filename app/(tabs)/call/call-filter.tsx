import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activeCallFilter, updateCallFilterState, CallFilterState } from '@/components/CallState';

const COLORS = {
  primary: '#346556',
  bgPage: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E2E8F0',
  danger: '#EF4444',
};

const DATE_OPTIONS = [
  '28 Dec 22 - 10 Jan 23',
  '11 Jan 23 - 25 Jan 23',
  '26 Jan 23 - 10 Feb 23',
];

export default function CallFilterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [dateRange, setDateRange] = useState(activeCallFilter.dateRange || '28 Dec 22 - 10 Jan 23');
  const [selectedStatus, setSelectedStatus] = useState<CallFilterState['status']>(activeCallFilter.status || '');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  const handleResetAll = () => {
    setDateRange('28 Dec 22 - 10 Jan 23');
    setSelectedStatus('');
  };

  const handleResetDateOnly = () => {
    setDateRange('28 Dec 22 - 10 Jan 23');
  };

  const handleApply = () => {
    updateCallFilterState({
      status: selectedStatus,
      dateRange: dateRange,
    });
    router.back();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          <Text style={{ color: COLORS.primary }}>CALL </Text>
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
          <Text style={styles.sectionTitle}>Date</Text>
          <View style={styles.dateControlRow}>
            <TouchableOpacity 
              style={styles.dateDropdown}
              onPress={() => setShowDatePickerModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.dateDropdownText}>{dateRange}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textDark} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateResetBtn}
              onPress={handleResetDateOnly}
              activeOpacity={0.8}
            >
              <Text style={styles.dateResetText}>Reset</Text>
              <Ionicons name="refresh-outline" size={14} color={COLORS.textDark} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
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
          onPress={() => router.back()}
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

      {/* DATE PICKER MODAL */}
      <Modal transparent animationType="slide" visible={showDatePickerModal}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePickerModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {DATE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setDateRange(opt);
                    setShowDatePickerModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 20,
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 3,
    height: 16,
    backgroundColor: COLORS.primary,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  dateControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    gap: 12,
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
    borderColor: COLORS.primary,
  },
  circleSelectorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
