import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface LogisticsCardProps {
  logisticsPartner: string;
  onPressLogisticsPartner: () => void;
  onPressAddPartner: () => void;
  trackingAwb: string;
  setTrackingAwb: (val: string) => void;
  shippingFreight: string;
  setShippingFreight: (val: string) => void;
  primaryColor: string;
}

export const LogisticsCard: React.FC<LogisticsCardProps> = ({
  logisticsPartner,
  onPressLogisticsPartner,
  onPressAddPartner,
  trackingAwb,
  setTrackingAwb,
  shippingFreight,
  setShippingFreight,
  primaryColor,
}) => {
  return (
    <View style={{ gap: 12, marginTop: 4 }}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>LOGISTICS & CHARGES</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.itemCard}>
        {/* Logistics Partner */}
        <View style={styles.formField}>
          <Text style={styles.inputLabel}>Logistics Partner</Text>
          <TouchableOpacity
            style={styles.selectTrigger}
            onPress={onPressLogisticsPartner}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectTriggerText, !logisticsPartner && { color: '#9CA3AF' }]} numberOfLines={1}>
              {logisticsPartner || 'Select Transport Partner'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addItemBtn, { borderColor: primaryColor, marginTop: 4, height: 42 }]}
            onPress={onPressAddPartner}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color={primaryColor} />
            <Text style={[styles.addItemBtnText, { color: primaryColor, fontSize: 11 }]}>ADD NEW PARTNER</Text>
          </TouchableOpacity>
        </View>

        {/* Tracking / AWB */}
        <View style={styles.formField}>
          <Text style={styles.inputLabel}>Tracking / AWB</Text>
          <TextInput
            style={styles.textInputBox}
            placeholder="e.g. 7823945012"
            placeholderTextColor="#9CA3AF"
            value={trackingAwb}
            onChangeText={setTrackingAwb}
          />
        </View>

        {/* Shipping / Freight */}
        <View style={styles.formField}>
          <Text style={styles.inputLabel}>Shipping / Freight (₹)</Text>
          <TextInput
            style={styles.textInputBox}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            value={shippingFreight}
            onChangeText={setShippingFreight}
          />
        </View>
      </View>
    </View>
  );
};

interface FinancialAdjustmentsCardProps {
  adjustmentType: 'PERCENTAGE' | 'FLAT';
  setAdjustmentType: (type: 'PERCENTAGE' | 'FLAT') => void;
  discountValue: string;
  setDiscountValue: (val: string) => void;
  primaryColor: string;
}

export const FinancialAdjustmentsCard: React.FC<FinancialAdjustmentsCardProps> = ({
  adjustmentType,
  setAdjustmentType,
  discountValue,
  setDiscountValue,
  primaryColor,
}) => {
  return (
    <View style={{ gap: 12, marginTop: 4 }}>
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="pricetag-outline" size={16} color={COLORS.textMuted} />
        <Text style={styles.sectionLabel}>FINANCIAL ADJUSTMENTS</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.itemCard}>
        {/* Type selector: Percentage or Flat */}
        <View style={{ flexDirection: 'row', gap: 20, marginVertical: 4 }}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setAdjustmentType('PERCENTAGE')}
            activeOpacity={0.8}
          >
            <View style={[styles.radioOuter, adjustmentType === 'PERCENTAGE' && { borderColor: primaryColor }]}>
              {adjustmentType === 'PERCENTAGE' && <View style={[styles.radioInner, { backgroundColor: primaryColor }]} />}
            </View>
            <Text style={styles.radioLabel}>PERCENTAGE (%)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setAdjustmentType('FLAT')}
            activeOpacity={0.8}
          >
            <View style={[styles.radioOuter, adjustmentType === 'FLAT' && { borderColor: primaryColor }]}>
              {adjustmentType === 'FLAT' && <View style={[styles.radioInner, { backgroundColor: primaryColor }]} />}
            </View>
            <Text style={styles.radioLabel}>FLAT AMOUNT (₹)</Text>
          </TouchableOpacity>
        </View>

        {/* Discount input */}
        <View style={styles.formField}>
          <Text style={styles.inputLabel}>
            {adjustmentType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Flat Amount (₹)'}
          </Text>
          <View style={styles.inputWithIconContainer}>
            <Text style={styles.inputIconText}>
              {adjustmentType === 'PERCENTAGE' ? '%' : '₹'}
            </Text>
            <TextInput
              style={styles.inputWithIconField}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              value={discountValue}
              onChangeText={setDiscountValue}
            />
          </View>
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
    gap: 5,
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
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 44,
    marginTop: 10,
  },
  addItemBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  inputWithIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 42,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
  },
  inputIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginRight: 8,
  },
  inputWithIconField: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});
