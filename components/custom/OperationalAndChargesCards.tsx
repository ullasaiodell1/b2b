import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface OperationalInsightsCardProps {
  internalRemarks: string;
  setInternalRemarks: (val: string) => void;
  expectedDelivery: Date | null;
  onPressExpectedDelivery: () => void;
  approvedBy: string;
  onPressApprovedBy: () => void;
}

export const OperationalInsightsCard: React.FC<OperationalInsightsCardProps> = ({
  internalRemarks,
  setInternalRemarks,
  expectedDelivery,
  onPressExpectedDelivery,
  approvedBy,
  onPressApprovedBy,
}) => {
  const formatDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={{ gap: 12, marginTop: 4 }}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>OPERATIONAL INSIGHTS</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.itemCard}>
        {/* Internal Remarks */}
        <View style={styles.formField}>
          <Text style={styles.inputLabel}>Internal Remarks</Text>
          <TextInput
            style={[styles.textInputBox, { height: 80, paddingTop: 10 }]}
            placeholder="Enter special instructions..."
            placeholderTextColor="#9CA3AF"
            value={internalRemarks}
            onChangeText={setInternalRemarks}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Expected Delivery & Approved By */}
        <View style={styles.gridRow}>
          {/* Expected Delivery */}
          <View style={[styles.formField, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Expected Delivery</Text>
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={onPressExpectedDelivery}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectTriggerText, !expectedDelivery && { color: '#9CA3AF' }]}>
                {expectedDelivery ? formatDate(expectedDelivery) : 'dd/MM/yyyy'}
              </Text>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Approved By */}
          <View style={[styles.formField, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Approved By</Text>
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={onPressApprovedBy}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectTriggerText, !approvedBy && { color: '#9CA3AF' }]} numberOfLines={1}>
                {approvedBy || 'Select Approver'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

interface AdditionalChargesCardProps {
  chargesGst: string;
  setChargesGst: (val: string) => void;
  chargesType: string;
  onPressChargesType: () => void;
  chargesAmount: string;
  setChargesAmount: (val: string) => void;
}

export const AdditionalChargesCard: React.FC<AdditionalChargesCardProps> = ({
  chargesGst,
  setChargesGst,
  chargesType,
  onPressChargesType,
  chargesAmount,
  setChargesAmount,
}) => {
  return (
    <View style={{ gap: 12, marginTop: 4 }}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>ADDITIONAL CHARGES</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.itemCard}>
        {/* GST % & Select Type */}
        <View style={styles.gridRow}>
          {/* GST % */}
          <View style={[styles.formField, { flex: 1 }]}>
            <Text style={styles.inputLabel}>GST %</Text>
            <TextInput
              style={styles.textInputBox}
              keyboardType="numeric"
              value={chargesGst}
              onChangeText={setChargesGst}
            />
          </View>

          {/* Select type */}
          <View style={[styles.formField, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Select type</Text>
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={onPressChargesType}
              activeOpacity={0.8}
            >
              <Text style={styles.selectTriggerText}>{chargesType}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.formField}>
          <Text style={styles.inputLabel}>Amount</Text>
          <TextInput
            style={styles.textInputBox}
            keyboardType="numeric"
            placeholder="Enter amount..."
            placeholderTextColor="#9CA3AF"
            value={chargesAmount}
            onChangeText={setChargesAmount}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  itemCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 5,
    marginTop: 5,
  },
  formField: {
    gap: 3,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  textInputBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  selectTriggerText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
