import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AdvanceAccountCardProps {
  isAdvanceAccount: boolean;
  setIsAdvanceAccount: (val: boolean) => void;
  advanceAccountSelected: any;
  onPressSelectAccount: () => void;
  advanceDate: Date;
  onPressSelectDate: () => void;
  onClearDate: () => void;
  advanceAmount: string;
  setAdvanceAmount: (val: string) => void;
  advanceRemark: string;
  setAdvanceRemark: (val: string) => void;
  advanceProof: string | null;
  isUploadingProof: boolean;
  onPressPickProof: () => void;
}

export const AdvanceAccountCard: React.FC<AdvanceAccountCardProps> = ({
  isAdvanceAccount,
  setIsAdvanceAccount,
  advanceAccountSelected,
  onPressSelectAccount,
  advanceDate,
  onPressSelectDate,
  onClearDate,
  advanceAmount,
  setAdvanceAmount,
  advanceRemark,
  setAdvanceRemark,
  advanceProof,
  isUploadingProof,
  onPressPickProof,
}) => {
  const { primaryColor } = useTheme();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const formatDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View>
      {/* ADVANCE ACCOUNT Checkbox */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setIsAdvanceAccount(!isAdvanceAccount)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkboxSquare, { borderColor: primaryColor }, isAdvanceAccount && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
          {isAdvanceAccount && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
        <Text style={[styles.checkboxLabel, { color: primaryColor, fontWeight: '700' }]}>ADVANCE ACCOUNT</Text>
      </TouchableOpacity>

      {isAdvanceAccount && (
        <View style={styles.advanceCard}>
          {/* Account selector */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Account <Text style={{ color: COLORS.danger }}>*</Text></Text>
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={onPressSelectAccount}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectTriggerText, !advanceAccountSelected && { color: '#9CA3AF' }]} numberOfLines={1}>
                {advanceAccountSelected ? `${advanceAccountSelected.name} - ${advanceAccountSelected.bank_name || 'Bank'}` : 'Select Account'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Date & Amount Grid */}
          <View style={styles.gridRow}>
            {/* Date Picker */}
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Date <Text style={{ color: COLORS.danger }}>*</Text></Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={onPressSelectDate}
                activeOpacity={0.8}
              >
                <Text style={styles.selectTriggerText}>
                  {formatDate(advanceDate)}
                </Text>
                <TouchableOpacity onPress={onClearDate} style={{ padding: 2 }}>
                  <Ionicons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Amount <Text style={{ color: COLORS.danger }}>*</Text></Text>
              <TextInput
                style={styles.textInputBox}
                placeholder="Amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={advanceAmount}
                onChangeText={setAdvanceAmount}
              />
            </View>
          </View>

          {/* Remark Input */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Remark / Reference</Text>
            <TextInput
              style={styles.textInputBox}
              placeholder="Payment details..."
              placeholderTextColor="#9CA3AF"
              value={advanceRemark}
              onChangeText={setAdvanceRemark}
            />
          </View>

          {/* Proof Upload / Preview */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Proof / Preview</Text>
            <View style={styles.proofRow}>
              {advanceProof ? (
                <TouchableOpacity onPress={() => setShowPreviewModal(true)} activeOpacity={0.8}>
                  <Image source={{ uri: advanceProof }} style={styles.proofThumbnail} />
                </TouchableOpacity>
              ) : (
                <View style={styles.proofPlaceholder}>
                  <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                </View>
              )}

              <TouchableOpacity
                style={[styles.uploadBtn, { borderColor: primaryColor }, isUploadingProof && { backgroundColor: '#E5E7EB' }]}
                onPress={onPressPickProof}
                disabled={isUploadingProof}
                activeOpacity={0.7}
              >
                {isUploadingProof ? (
                  <ActivityIndicator size="small" color={primaryColor} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={16} color={primaryColor} style={{ marginRight: 6 }} />
                    <Text style={[styles.uploadBtnText, { color: primaryColor }]}>
                      {advanceProof ? 'CHANGE PROOF' : 'UPLOAD PROOF'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Full Screen Image Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.previewModalContainer}>
          <TouchableOpacity
            style={styles.previewModalCloseBtn}
            onPress={() => setShowPreviewModal(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {advanceProof && (
            <Image
              source={{ uri: advanceProof }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingVertical: 4,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  advanceCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 10,
    marginTop: 8,
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
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proofThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  proofPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});
