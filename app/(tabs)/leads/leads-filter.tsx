import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadSources, useUsers } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
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
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FallbackINDUSTRIES: string[] = [];
const FallbackOWNERS = ['Select Owner'];
const DATE_RANGES = ['Select Date', '28 Dec 22 – 10 Jan 23', 'Last 30 Days', 'This Month', 'Last Month'];

export default function LeadsFilterScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params as { priority?: string; tag?: string; owner?: string; dateRange?: string }) ?? {};
  const insets = useSafeAreaInsets();

  // State values initialized from active filters
  const [priority, setPriority] = useState<'High' | 'Normal' | 'Low'>(
    (params.priority as 'High' | 'Normal' | 'Low') || 'Normal'
  );
  const [dateRange, setDateRange] = useState(params.dateRange || 'Select Date');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    params.tag ? params.tag.split(',').filter(Boolean) : []
  );
  const [owner, setOwner] = useState(params.owner || 'Select Owner');

  // Modals visibility
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const { data: usersData } = useUsers();
  const { data: sourcesData } = useLeadSources();

  const dynamicOwners = usersData && usersData.length > 0
    ? ['Select Owner', ...usersData.map((u: any) => u.name)]
    : FallbackOWNERS;

  const dynamicIndustries = sourcesData && sourcesData.length > 0
    ? sourcesData.map((s: any) => s.name)
    : FallbackINDUSTRIES;

  // Multi select handler for Industry
  const toggleIndustry = (ind: string) => {
    if (selectedIndustries.includes(ind)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== ind));
    } else {
      setSelectedIndustries([...selectedIndustries, ind]);
    }
  };

  const handleReset = () => {
    setPriority('Normal');
    setDateRange('Select Date');
    setSelectedIndustries([]);
    setOwner('Select Owner');
  };

  const handleApply = () => {
    navigation.navigate('leads' as never, {
      priority: priority,
      tag: selectedIndustries.join(','),
      owner: owner !== 'Select Owner' ? owner : '',
      dateRange: dateRange !== 'Select Date' ? dateRange : '',
    } as never);
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
          <Text style={{ color: theme.primaryColor }}>LEADS </Text>
          <Text style={{ color: COLORS.textDark }}>FILTER</Text>
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Reset Row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.titleText}>Filters</Text>
          </View>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Priority Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.priorityBox}>
            {(['High', 'Normal', 'Low'] as const).map((p) => {
              const active = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityTab, active && styles.priorityTabActive]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.priorityTabText, active && styles.priorityTabTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Date</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setShowDateModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.dropdownText}>{dateRange}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetDateBtn} onPress={() => setDateRange('Select Date')} activeOpacity={0.85}>
              <Text style={styles.resetDateText}>Reset</Text>
              <Ionicons name="refresh-outline" size={14} color={COLORS.textDark} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Industry Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Industry</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={{ gap: 10 }}>
            {dynamicIndustries.map((ind, idx) => {
              const isSelected = selectedIndustries.includes(ind);
              return (
                <TouchableOpacity
                  key={ind + '_' + idx}
                  style={styles.industryRow}
                  onPress={() => toggleIndustry(ind)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.industryText}>{ind}</Text>
                  <View style={[styles.circleCheckbox, isSelected && styles.circleCheckboxActive]}>
                    {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Lead Owner Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Lead Owner</Text>
            <View style={styles.sectionLine} />
          </View>

          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setShowOwnerModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.dropdownText}>{owner}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 10, 16) }]}>
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

      {/* LEAD OWNER PICKER MODAL */}
      <Modal transparent animationType="slide" visible={showOwnerModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOwnerModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Lead Owner</Text>
              <TouchableOpacity onPress={() => setShowOwnerModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {dynamicOwners.map((o, idx) => (
                <TouchableOpacity
                  key={o + '_' + idx}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setOwner(o);
                    setShowOwnerModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalRowText, owner === o && styles.modalRowTextActive]}>
                    {o}
                  </Text>
                  {owner === o && (
                    <Ionicons name="checkmark" size={16} color={theme.primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* DATE RANGE PICKER MODAL */}
      <Modal transparent animationType="slide" visible={showDateModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDateModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {DATE_RANGES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setDateRange(d);
                    setShowDateModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalRowText, dateRange === d && styles.modalRowTextActive]}>
                    {d}
                  </Text>
                  {dateRange === d && (
                    <Ionicons name="checkmark" size={16} color={theme.primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
    paddingVertical: 5,
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
    fontSize: 18,
    fontWeight: '900',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 10,
  },

  // Priority styling
  priorityBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 2,
    height: 35,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  priorityTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  priorityTabTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },

  // Date styling
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  resetDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  resetDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Industry styling
  industryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  industryText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  circleCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCheckboxActive: {
    backgroundColor: theme.primaryColor,
    borderColor: theme.primaryColor,
  },

  // Sticky bottom footer styling
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

  // Modals styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '45%',
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
    fontSize: 14.5,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  modalRowTextActive: {
    color: theme.primaryColor,
    fontWeight: '800',
  },
});
