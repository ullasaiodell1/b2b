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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#FFFFFF',
  bgGray: '#F3F4F6',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
};

const INDUSTRIES = ['Hardware', 'Software', 'IT Services', 'Cybersecurity'];
const OWNERS = ['Select Owner', 'Arjun Maheta', 'Parth Solanki', 'Khushal Nadiyapara', 'Jigar Kalariya'];
const DATE_RANGES = ['Select Date', '28 Dec 22 – 10 Jan 23', 'Last 30 Days', 'This Month', 'Last Month'];

export default function LeadsFilterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ priority?: string; tag?: string; owner?: string; dateRange?: string }>();
  const insets = useSafeAreaInsets();

  // State values initialized from active filters
  const [priority, setPriority] = useState<'High' | 'Normal' | 'Low'>(
    (params.priority as 'High' | 'Normal' | 'Low') || 'Normal'
  );
  const [dateRange, setDateRange] = useState(params.dateRange || '28 Dec 22 – 10 Jan 23');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    params.tag ? params.tag.split(',').filter(Boolean) : ['Hardware']
  );
  const [owner, setOwner] = useState(params.owner || 'Select Owner');

  // Modals visibility
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

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
    // Navigate back to the index screen with the active filter params
    router.push({
      pathname: '/(tabs)/leads',
      params: {
        priority: priority,
        tag: selectedIndustries.join(','),
        owner: owner !== 'Select Owner' ? owner : '',
        dateRange: dateRange !== 'Select Date' ? dateRange : '',
      }
    });
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
          <Text style={{ color: COLORS.primary }}>LEADS </Text>
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
            {INDUSTRIES.map((ind) => {
              const isSelected = selectedIndustries.includes(ind);
              return (
                <TouchableOpacity
                  key={ind}
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
              {OWNERS.map((o) => (
                <TouchableOpacity
                  key={o}
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
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
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
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  )}
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
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 3.5,
    height: 14,
    backgroundColor: COLORS.primary,
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
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    padding: 4,
    height: 44,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    color: COLORS.primary,
    fontWeight: '800',
  },
});
