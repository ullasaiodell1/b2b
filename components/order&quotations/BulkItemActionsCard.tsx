import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface BulkItemActionsCardProps {
  items: any[];
  onApplyBulkDiscount: (discount: number) => void;
  onApplyBulkRate: (op: 'SET' | 'ADD' | 'SUB', amount: number) => void;
  onResetBulk: () => void;
  onToggleSelectAll: () => void;
}

export default function BulkItemActionsCard({
  items,
  onApplyBulkDiscount,
  onApplyBulkRate,
  onResetBulk,
  onToggleSelectAll,
}: BulkItemActionsCardProps) {
  const theme = useTheme();
  const primaryColor = theme.primaryColor;

  const [bulkDiscount, setBulkDiscount] = useState('');
  const [bulkRateOp, setBulkRateOp] = useState<'SET' | 'ADD' | 'SUB'>('SET');
  const [bulkRateAmt, setBulkRateAmt] = useState('');
  const [showBulkRateOpModal, setShowBulkRateOpModal] = useState(false);

  const isAllSelected = items.length > 0 && items.every((item) => item.isSelected !== false);

  const handleApplyDiscount = () => {
    const val = bulkDiscount.trim();
    if (!val) {
      Alert.alert('Validation', 'Please enter a discount percentage.');
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 100) {
      Alert.alert('Validation', 'Discount must be a percentage between 0 and 100.');
      return;
    }
    onApplyBulkDiscount(num);
    setBulkDiscount('');
    Keyboard.dismiss();
  };

  const handleApplyRate = () => {
    const val = bulkRateAmt.trim();
    if (!val) {
      Alert.alert('Validation', 'Please enter an amount.');
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) {
      Alert.alert('Validation', 'Amount must be a valid number.');
      return;
    }
    onApplyBulkRate(bulkRateOp, num);
    setBulkRateAmt('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.bulkCard}>
      {/* Header Row */}
      <View style={styles.bulkCardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="cube-outline" size={18} color={primaryColor} />
          <Text style={styles.bulkCardTitle}>BILL ITEMS</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.bulkCardActionBtn, { borderColor: primaryColor }]}
            onPress={onToggleSelectAll}
            activeOpacity={0.8}
          >
            <Text style={[styles.bulkCardActionBtnText, { color: primaryColor }]}>
              {isAllSelected ? 'Deselect all' : 'Select all'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkCardActionBtn, { borderColor: COLORS.danger || '#EF4444' }]}
            onPress={onResetBulk}
            activeOpacity={0.8}
          >
            <Text style={[styles.bulkCardActionBtnText, { color: COLORS.danger || '#EF4444' }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls Row */}
      <View style={styles.bulkCardControlsRow}>
        {/* Discount Group */}
        <View style={[styles.bulkCardControlGroup, { flex: 1 }]}>
          <Text style={styles.bulkCardLabel}>Bulk Discount</Text>
          <View style={styles.bulkInputContainer}>
            <TextInput
              style={styles.bulkTextInput}
              placeholder="Disc %"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={bulkDiscount}
              onChangeText={setBulkDiscount}
            />
            <TouchableOpacity
              style={[styles.bulkApplyButton, { backgroundColor: primaryColor }]}
              onPress={handleApplyDiscount}
              activeOpacity={0.8}
            >
              <Text style={styles.bulkApplyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rate Group */}
        <View style={[styles.bulkCardControlGroup, { flex: 1.3 }]}>
          <Text style={styles.bulkCardLabel}>Bulk Rate</Text>
          <View style={styles.bulkInputContainer}>
            <TouchableOpacity
              style={styles.bulkOpSelect}
              onPress={() => setShowBulkRateOpModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.bulkOpSelectText}>
                {bulkRateOp === 'SET' ? '=' : bulkRateOp === 'ADD' ? '+' : '-'}
              </Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={[styles.bulkTextInput, { flex: 1 }]}
              placeholder="Amt"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={bulkRateAmt}
              onChangeText={setBulkRateAmt}
            />
            <TouchableOpacity
              style={[styles.bulkApplyButton, { backgroundColor: primaryColor }]}
              onPress={handleApplyRate}
              activeOpacity={0.8}
            >
              <Text style={styles.bulkApplyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── BULK RATE OPERATOR PICKER MODAL ─────────────── */}
      <Modal
        transparent
        animationType="slide"
        visible={showBulkRateOpModal}
        onRequestClose={() => setShowBulkRateOpModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBulkRateOpModal(false)}
        >
          <View style={[styles.modalContent, { height: '30%', paddingBottom: 30 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Operation</Text>
              <TouchableOpacity onPress={() => setShowBulkRateOpModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
              {[
                { label: 'Set Rate (=)', value: 'SET' },
                { label: 'Add to Rate (+)', value: 'ADD' },
                { label: 'Subtract from Rate (-)', value: 'SUB' },
              ].map((op) => (
                <TouchableOpacity
                  key={op.value}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setBulkRateOp(op.value as any);
                    setShowBulkRateOpModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{op.label}</Text>
                  {bulkRateOp === op.value && <Ionicons name="checkmark" size={16} color={primaryColor} />}
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
  bulkCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  bulkCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulkCardTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  bulkCardActionBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
  },
  bulkCardActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bulkCardControlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bulkCardControlGroup: {
    gap: 4,
  },
  bulkCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  bulkInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 38,
    paddingHorizontal: 4,
  },
  bulkTextInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 6,
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  bulkOpSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    height: 30,
    borderRadius: 6,
    marginRight: 4,
    gap: 2,
  },
  bulkOpSelectText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  bulkApplyButton: {
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkApplyButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
    maxHeight: '75%',
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
    marginBottom: 12,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
