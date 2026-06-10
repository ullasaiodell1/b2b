import { COLORS } from '@/constants/theme';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COMPANIES = ['Ullas India IT Solutions Limited.', 'Zenith System Pvt. Ltd.', 'NovaTech Solutions Pvt. Ltd.'];
const STATUSES = ['Opened', 'Sent', 'Draft', 'Bounce'];

export default function EmailFilterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; company?: string }>();
  const insets = useSafeAreaInsets();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(params.status || null);
  const [selectedCompany, setSelectedCompany] = useState<string>(params.company || 'Select Company');

  const [companyModalVisible, setCompanyModalVisible] = useState(false);

  const handleResetAll = () => {
    setSelectedStatus(null);
    setSelectedCompany('Select Company');
  };

  const handleApplyFilter = () => {
    router.push({
      pathname: '/(tabs)/email',
      params: {
        status: selectedStatus || '',
        company: selectedCompany !== 'Select Company' ? selectedCompany : '',
      },
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
          <Text style={{ color: COLORS.primary }}>EMAIL </Text>
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
  filtersTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 14,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 3,
    height: 14,
    backgroundColor: COLORS.primary,
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
  sectionContainer: {
    marginTop: 20,
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
  checkboxList: {
    gap: 10,
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
    borderColor: COLORS.primary,
  },
  checkboxCheckedInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
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
    gap: 12,
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
    backgroundColor: COLORS.primary,
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
