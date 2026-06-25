import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface CustomerSearchModalProps {
  visible: boolean;
  onClose: () => void;
  customerType: 'LEAD' | 'DEALER';
  onTypeChange: (type: 'LEAD' | 'DEALER') => void;
  customerSearchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filteredCustomerList: any[];
  onSelectCustomer: (customer: any) => void;
}

export default function CustomerSearchModal({
  visible,
  onClose,
  customerType,
  onTypeChange,
  customerSearchQuery,
  onSearchQueryChange,
  filteredCustomerList,
  onSelectCustomer,
}: CustomerSearchModalProps) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={() => { }}
        >
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => setShowTypeDropdown(true)}
              >
                <Text style={styles.modalTitle}>
                  {customerType === 'LEAD' ? 'LEADS' : 'DEALERS'}
                </Text>
                <Ionicons name="caret-down" size={12} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* Type selector dropdown popup */}
          {showTypeDropdown && (
            <View style={styles.typeDropdownPopup}>
              <TouchableOpacity
                style={[styles.typeDropdownItem, customerType === 'LEAD' && styles.typeDropdownItemActive]}
                onPress={() => {
                  onTypeChange('LEAD');
                  setShowTypeDropdown(false);
                  onSearchQueryChange('');
                }}
              >
                <Text style={styles.typeDropdownItemText}>Leads</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeDropdownItem, customerType === 'DEALER' && styles.typeDropdownItemActive]}
                onPress={() => {
                  onTypeChange('DEALER');
                  setShowTypeDropdown(false);
                  onSearchQueryChange('');
                }}
              >
                <Text style={styles.typeDropdownItemText}>Dealers</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${customerType === 'LEAD' ? 'leads' : 'dealers'}...`}
              value={customerSearchQuery}
              onChangeText={onSearchQueryChange}
              placeholderTextColor="#9CA3AF"
            />
            {customerSearchQuery ? (
              <TouchableOpacity onPress={() => onSearchQueryChange('')}>
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
            {filteredCustomerList.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                style={styles.customerRow}
                onPress={() => onSelectCustomer(customer)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerRowName}>{customer.name}</Text>
                  {customer.company ? (
                    <Text style={styles.customerRowCompany}>{customer.company}</Text>
                  ) : null}
                  {customer.phone ? (
                    <Text style={styles.customerRowPhone}>{customer.phone}</Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}

            {filteredCustomerList.length === 0 && (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>
                  No matching customer found
                </Text>
              </View>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  typeDropdownPopup: {
    position: 'absolute',
    top: 48,
    left: 0,
    width: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 1100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  typeDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  typeDropdownItemActive: {
    backgroundColor: '#FDF2F4',
  },
  typeDropdownItemText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  modalList: {
    paddingHorizontal: 16,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  customerRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  customerRowCompany: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  customerRowPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
