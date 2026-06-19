import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TYPES = ['All Types', 'Credit', 'Debit'];
const CATEGORIES = ['All Categories', 'Sale', 'Payment', 'Refund', 'Discount', 'Other'];

export default function LedgerFilterScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const params = (route.params ?? {}) as {
    referrer?: string;
    leadId?: string;
    company?: string;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  };

  // State initialized from params
  const [selectedType, setSelectedType] = useState(params.type || 'All Types');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'All Categories');

  // Custom Date States (defaulting to 01/06/2026 - 30/06/2026 if not set)
  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (params.startDate) {
      const parsed = new Date(params.startDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date(2026, 5, 1); // 01 June 2026
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (params.endDate) {
      const parsed = new Date(params.endDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date(2026, 5, 30); // 30 June 2026
  });

  // Picker Show Toggles
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Modals state
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Search filter inside dropdowns
  const [typeSearch, setTypeSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const filteredTypes = TYPES.filter(t =>
    t.toLowerCase().includes(typeSearch.toLowerCase())
  );

  const filteredCategories = CATEGORIES.filter(c =>
    c.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const formatDateShort = (date: Date | null) => {
    if (!date) return 'Select Date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleReset = () => {
    setSelectedType('All Types');
    setSelectedCategory('All Categories');
    setStartDate(new Date(2026, 5, 1));
    setEndDate(new Date(2026, 5, 30));
  };

  const handleApply = () => {
    const backTo = params.referrer || 'lead-ledger';
    const startStr = startDate ? startDate.toISOString() : '';
    const endStr = endDate ? endDate.toISOString() : '';
    const isApplied = !!(startDate || endDate);

    if (backTo === 'lead-details') {
      navigation.navigate(backTo as never, {
        id: params.leadId,
        lType: selectedType,
        lCategory: selectedCategory,
        lStartDate: startStr,
        lEndDate: endStr,
        lFilterApplied: isApplied ? 'true' : '',
        activeTab: 'Ledger',
      } as never);
    } else {
      navigation.navigate(backTo as never, {
        ...params,
        type: selectedType,
        category: selectedCategory,
        startDate: startStr,
        endDate: endStr,
        filterApplied: isApplied ? 'true' : '',
      } as never);
    }
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
          <Text style={{ color: theme.primaryColor }}>LEDGER </Text>
          <Text style={{ color: COLORS.textDark }}>FILTER</Text>
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Reset Row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.titleText}>Filter Options</Text>
          </View>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown 1: TYPE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Transaction Type</Text>
          </View>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setTypeModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.dropdownText}>{selectedType}</Text>
            <Ionicons name="chevron-expand-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Dropdown 2: CATEGORY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Category</Text>
          </View>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.dropdownText}>{selectedCategory}</Text>
            <Ionicons name="chevron-expand-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Custom Date Pickers: From / To */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
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
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 10, 16) }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Clear Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <Text style={styles.applyBtnText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>

      {/* TYPE SELECTION MODAL */}
      <Modal transparent animationType="slide" visible={typeModalVisible} onRequestClose={() => setTypeModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Transaction Type</Text>
              <TouchableOpacity onPress={() => setTypeModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Inline search bar in dropdown */}
            <View style={styles.modalSearchRow}>
              <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                value={typeSearch}
                onChangeText={setTypeSearch}
                autoCorrect={false}
              />
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }}>
              {filteredTypes.map((t) => {
                const isSelected = selectedType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={styles.modalRowItem}
                    onPress={() => {
                      setSelectedType(t);
                      setTypeModalVisible(false);
                      setTypeSearch('');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={isSelected ? theme.primaryColor : 'transparent'}
                      />
                      <Text style={[styles.modalRowText, isSelected && styles.modalRowTextActive]}>
                        {t}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CATEGORY SELECTION MODAL */}
      <Modal transparent animationType="slide" visible={categoryModalVisible} onRequestClose={() => setCategoryModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Inline search bar in dropdown */}
            <View style={styles.modalSearchRow}>
              <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                value={categorySearch}
                onChangeText={setCategorySearch}
                autoCorrect={false}
              />
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }}>
              {filteredCategories.map((c) => {
                const isSelected = selectedCategory === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={styles.modalRowItem}
                    onPress={() => {
                      setSelectedCategory(c);
                      setCategoryModalVisible(false);
                      setCategorySearch('');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={isSelected ? theme.primaryColor : 'transparent'}
                      />
                      <Text style={[styles.modalRowText, isSelected && styles.modalRowTextActive]}>
                        {c}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── SYSTEM DATE PICKERS ─────────────────────── */}
      {showStartPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showStartPicker} onRequestClose={() => setShowStartPicker(false)}>
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
          <Modal transparent animationType="fade" visible={showEndPicker} onRequestClose={() => setShowEndPicker(false)}>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
    marginBottom: 1,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 3.5,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 2,
    marginRight: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  resetText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.danger,
  },
  section: {
    marginBottom: 5,
  },
  sectionHeader: {
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderColor: '#E5ECE9',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
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
    flex: 1,
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
    maxHeight: '50%',
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
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  modalRowItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  modalRowTextActive: {
    color: theme.primaryColor,
    fontWeight: '800',
  },
  // Custom Date Picker styles
  datePickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderColor: '#E5ECE9',
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
