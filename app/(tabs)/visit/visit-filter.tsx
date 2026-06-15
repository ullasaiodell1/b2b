import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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
import DateTimePicker from '@react-native-community/datetimepicker';

const COMPANIES = ['Luis Pvt. Ltd.', 'Sherry Pvt. Ltd.', 'Jigar Pvt. Ltd.', 'Parth Pvt. Ltd.'];
const STATUSES = ['Complete', 'Draft', 'Pending', 'Bounce'];

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

export default function VisitFilterScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; company?: string; dateRange?: string }>();
  const insets = useSafeAreaInsets();

  // State values initialized from route params
  const [fromDate, setFromDate] = useState<Date | null>(() => {
    if (params.dateRange && params.dateRange.includes(' - ')) {
      const parts = params.dateRange.split(' - ');
      return parseDate(parts[0]);
    }
    return null;
  });

  const [toDate, setToDate] = useState<Date | null>(() => {
    if (params.dateRange && params.dateRange.includes(' - ')) {
      const parts = params.dateRange.split(' - ');
      return parseDate(parts[1]);
    }
    return null;
  });

  const [selectedStatus, setSelectedStatus] = useState<string | null>(params.status || null);
  const [selectedCompany, setSelectedCompany] = useState<string>(params.company || 'Select Company');

  // Modals for Pickers
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleResetAll = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedStatus(null);
    setSelectedCompany('Select Company');
  };

  const handleApplyFilter = () => {
    let finalRange = '';
    if (fromDate && toDate) {
      finalRange = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
    }
    router.push({
      pathname: '/(tabs)/visit',
      params: {
        status: selectedStatus || '',
        company: selectedCompany !== 'Select Company' ? selectedCompany : '',
        dateRange: finalRange,
      },
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
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
          <Text style={{ color: theme.primaryColor }}>VISIT </Text>
          <Text style={{ color: COLORS.textDark }}>FILTER</Text>
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* FILTERS TOP BAR */}
        <View style={styles.filtersTopBar}>
          <View style={styles.titleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.filtersHeadingText}>Filters</Text>
          </View>
          <TouchableOpacity onPress={handleResetAll} activeOpacity={0.7}>
            <Text style={styles.resetAllText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* DATE SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.dateSelectorRow}>
            <TouchableOpacity
              style={[styles.datePickerTrigger, { flex: 1, paddingVertical: 4, height: 46 }]}
              onPress={() => setShowFromPicker(true)}
              activeOpacity={0.85}
            >
              <View>
                <Text style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: '700' }}>FROM</Text>
                <Text style={styles.datePickerValue}>
                  {fromDate ? formatDate(fromDate) : 'Select Date'}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePickerTrigger, { flex: 1, paddingVertical: 4, height: 46 }]}
              onPress={() => setShowToPicker(true)}
              activeOpacity={0.85}
            >
              <View>
                <Text style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: '700' }}>TO</Text>
                <Text style={styles.datePickerValue}>
                  {toDate ? formatDate(toDate) : 'Select Date'}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {(fromDate || toDate) && (
              <TouchableOpacity
                style={[styles.dateResetBtn, { width: 44, paddingHorizontal: 0, height: 46 }]}
                onPress={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={18} color={COLORS.textDark} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* STATUS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.checkboxList}>
            {STATUSES.map((status) => {
              const isChecked = selectedStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={styles.checkboxRow}
                  onPress={() => setSelectedStatus(isChecked ? null : status)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.checkboxLabel}>{status}</Text>
                  <View style={[styles.checkboxOutline, isChecked && styles.checkboxOutlineActive]}>
                    {isChecked && (
                      <View style={styles.checkboxCheckedInner} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* COMPANY NAME SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Company Name</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={styles.companyDropdownTrigger}
            onPress={() => setCompanyModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={[styles.companyDropdownValue, selectedCompany === 'Select Company' && styles.placeholderText]}>
              {selectedCompany}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom + 10, 16) }]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyFilter}
          activeOpacity={0.85}
        >
          <Text style={styles.applyButtonText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>

      {/* COMPANY SELECTION MODAL */}
      <Modal transparent animationType="slide" visible={companyModalVisible}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCompanyModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Company</Text>
              <TouchableOpacity onPress={() => setCompanyModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {COMPANIES.map((comp) => (
                <TouchableOpacity
                  key={comp}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setSelectedCompany(comp);
                    setCompanyModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{comp}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
    backgroundColor: '#F3F4F6',
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
    paddingHorizontal: 8,
  },
  filtersTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 1,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 3,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
    marginRight: 8,
  },
  filtersHeadingText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  resetAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },

  // Sections
  sectionContainer: {
    marginTop: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginRight: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  // Date range picker row styling
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 5,
  },
  datePickerTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 42,
    paddingHorizontal: 14,
  },
  datePickerValue: {
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
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: '#FFFFFF',
  },
  dateResetText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Checkbox lists styling
  checkboxList: {
    gap: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  checkboxOutline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOutlineActive: {
    borderColor: theme.primaryColor,
  },
  checkboxCheckedInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primaryColor,
  },

  // Company selection dropdown styling
  companyDropdownTrigger: {
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
  companyDropdownValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderText: {
    color: '#9CA3AF',
  },

  // Footer Buttons
  footerContainer: {
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
    gap: 5,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.cancelBorder,
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  applyButton: {
    flex: 1,
    backgroundColor: theme.primaryColor,
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modal styling
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
