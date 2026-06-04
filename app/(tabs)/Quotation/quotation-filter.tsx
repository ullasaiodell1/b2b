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
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
  danger: '#EF4444',
};

type PriorityType = 'High' | 'Normal' | 'Low';

const QUOTATION_TYPES = [
  'Product Quotation',
  'Project Based Quotation',
  'Services Based Quotation',
];

const STATUSES = ['Sent', 'Accepted', 'Draft', 'Pending'];

const CLIENTS = [
  'NovaTech Solutions Pvt. Ltd.',
  'Sunrise Exports',
  'Delta Constructions',
  'GreenField Agro',
];

const USERS = [
  'Arjun Maheta',
  'Parth Solanki',
  'Khushal Nadiyapara',
  'Jigar Kalariya',
];

export default function QuotationFilterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Filters State
  const [priority, setPriority] = useState<PriorityType>('High');
  const [startDate, setStartDate] = useState<Date>(new Date(2022, 11, 28));
  const [endDate, setEndDate] = useState<Date>(new Date(2023, 0, 10));
  const [quotationType, setQuotationType] = useState<string>('');
  const [status, setStatus] = useState<string>('Sent');
  const [client, setClient] = useState<string>('');
  const [salesPerson, setSalesPerson] = useState<string>('');

  // Picker States
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showRangePickerModal, setShowRangePickerModal] = useState(false);

  // Dropdown Modal Selection helper states
  const [activeSelectType, setActiveSelectType] = useState<'type' | 'client' | 'sales' | null>(null);

  const formatDateShort = (date: Date) => {
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).substring(2);
    return `${day} ${month} ${year}`;
  };

  const handleResetAll = () => {
    setPriority('High');
    setStartDate(new Date(2022, 11, 28));
    setEndDate(new Date(2023, 0, 10));
    setQuotationType('');
    setStatus('Sent');
    setClient('');
    setSalesPerson('');
  };

  const handleResetDates = () => {
    setStartDate(new Date(2022, 11, 28));
    setEndDate(new Date(2023, 0, 10));
  };

  const handleApplyFilter = () => {
    // Apply filters logic goes here or saves to global filter state
    router.back();
  };

  const renderDropdownModal = () => {
    if (!activeSelectType) return null;

    let title = '';
    let items: string[] = [];
    let selectedValue = '';
    let setSelected = (val: string) => {};

    if (activeSelectType === 'type') {
      title = 'Select Quotation Type';
      items = QUOTATION_TYPES;
      selectedValue = quotationType;
      setSelected = setQuotationType;
    } else if (activeSelectType === 'client') {
      title = 'Select Client';
      items = CLIENTS;
      selectedValue = client;
      setSelected = setClient;
    } else if (activeSelectType === 'sales') {
      title = 'Select Sales Person';
      items = USERS;
      selectedValue = salesPerson;
      setSelected = setSalesPerson;
    }

    return (
      <Modal transparent animationType="slide" visible={!!activeSelectType}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveSelectType(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setActiveSelectType(null)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {items.map((item) => {
                const isItemSel = selectedValue === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.modalItem, isItemSel && styles.modalItemActive]}
                    onPress={() => {
                      setSelected(item);
                      setActiveSelectType(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalItemText, isItemSel && styles.modalItemTextActive]}>
                      {item}
                    </Text>
                    {isItemSel && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
        <Text style={styles.headerTitle}>QUATATION FILTER</Text>
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

        {/* Priority Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.priorityContainer}>
            {(['High', 'Normal', 'Low'] as PriorityType[]).map((p) => {
              const isSel = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityTab, isSel && styles.priorityTabActive]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.priorityTabText, isSel && styles.priorityTabTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Date</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.datePickerRow}>
            <TouchableOpacity 
              style={styles.dateDropdown}
              onPress={() => setShowRangePickerModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.dateText}>
                {formatDateShort(startDate)} – {formatDateShort(endDate)}
              </Text>
              <Ionicons name="chevron-down" size={15} color={COLORS.textDark} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateResetBtn}
              onPress={handleResetDates}
              activeOpacity={0.8}
            >
              <Text style={styles.dateResetText}>Reset</Text>
              <Ionicons name="refresh-outline" size={13} color={COLORS.textDark} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quotation Type Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Quotation Type</Text>
            <View style={styles.sectionLine} />
          </View>

          <TouchableOpacity 
            style={styles.selectBox}
            onPress={() => setActiveSelectType('type')}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectBoxText, !quotationType && styles.selectBoxPlaceholder]}>
              {quotationType || 'Select Quotation'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Status</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.radioList}>
            {STATUSES.map((st) => {
              const isSel = status === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={styles.radioRow}
                  onPress={() => setStatus(st)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.radioLabel}>{st}</Text>
                  <View style={[styles.radioCircle, isSel && styles.radioCircleActive]}>
                    {isSel && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Client Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Client</Text>
            <View style={styles.sectionLine} />
          </View>

          <TouchableOpacity 
            style={styles.selectBox}
            onPress={() => setActiveSelectType('client')}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectBoxText, !client && styles.selectBoxPlaceholder]}>
              {client || 'Select Company'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Sales Person Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Sales Person</Text>
            <View style={styles.sectionLine} />
          </View>

          <TouchableOpacity 
            style={styles.selectBox}
            onPress={() => setActiveSelectType('sales')}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectBoxText, !salesPerson && styles.selectBoxPlaceholder]}>
              {salesPerson || 'Select User'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── FOOTER ACTIONS ────────────────────────── */}
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
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── DROPDOWN LIST SELECTION MODAL ─────────── */}
      {renderDropdownModal()}

      {/* ── SYSTEM DATE RANGE PICKER MODALS ────────── */}
      {showRangePickerModal && (
        <Modal transparent animationType="fade" visible={showRangePickerModal}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRangePickerModal(false)}
          >
            <View style={styles.calendarModalContent}>
              <Text style={styles.calendarModalTitle}>Select Date Range</Text>

              <View style={styles.inlinePickersRow}>
                {/* Start Date */}
                <View style={styles.inlinePickerCol}>
                  <Text style={styles.pickerLabel}>Start Date</Text>
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="calendar"
                    onChange={(event: any, selectedDate?: Date) => {
                      if (selectedDate) setStartDate(selectedDate);
                    }}
                  />
                </View>

                {/* End Date */}
                <View style={styles.inlinePickerCol}>
                  <Text style={styles.pickerLabel}>End Date</Text>
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="calendar"
                    onChange={(event: any, selectedDate?: Date) => {
                      if (selectedDate) setEndDate(selectedDate);
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.calendarDoneBtn}
                onPress={() => setShowRangePickerModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.calendarDoneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
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
    backgroundColor: COLORS.primary,
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
    gap: 12,
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
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
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
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
    color: COLORS.primary,
    fontWeight: '800',
  },

  // Calendar Modal Content
  calendarModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 360,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    gap: 16,
  },
  calendarModalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  inlinePickersRow: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  inlinePickerCol: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  calendarDoneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  calendarDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
