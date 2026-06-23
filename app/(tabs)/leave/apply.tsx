import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateLeave, useLeaveTypes } from '@/hooks/useLeave';
import { getUserData } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ApplyLeaveScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    getUserData().then((user) => {
      if (user) {
        setCurrentUserId(user.id || '');
      }
    });
  }, []);

  const { data: leaveTypes = [], isLoading: typesLoading } = useLeaveTypes();

  const [selectedType, setSelectedType] = useState<{ id: string; name: string } | null>(null);
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [duration, setDuration] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY');
  // Approver email entered directly by the user
  const [approverEmail, setApproverEmail] = useState('');
  const [remark, setRemark] = useState('');

  const [typeModalVisible, setTypeModalVisible] = useState(false);

  const createLeaveMutation = useCreateLeave();

  // Basic email format validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleApplyLeave = async () => {
    if (!selectedType) {
      Alert.alert('Validation Error', 'Please select a leave type.');
      return;
    }
    if (!approverEmail.trim() || !isValidEmail(approverEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid approver email address.');
      return;
    }
    if (!remark.trim()) {
      Alert.alert('Validation Error', 'Please enter a remark/reason.');
      return;
    }

    try {
      const pad = (n: number) => String(n).padStart(2, '0');
      const formatDateStr = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      await createLeaveMutation.mutateAsync({
        type_id: selectedType.id,
        start_date: formatDateStr(startDate),
        end_date: formatDateStr(endDate),
        leave_duration: duration,
        approval_from_email: approverEmail.trim(),
        remark: remark.trim(),
      });

      Alert.alert('Success', 'Leave request submitted successfully.', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to submit leave request.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>APPLY </Text>
            <Text style={{ color: COLORS.textDark }}>LEAVE</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Submit Leave Details</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Leave Type Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Leave Type</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => setTypeModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={selectedType ? styles.pickerTriggerText : styles.pickerTriggerPlaceholder}>
              {selectedType ? selectedType.name : 'Select Leave Type'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Date Pickers Row */}
        <View style={styles.datesRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Start Date</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerTriggerText}>
                {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <Ionicons name="calendar" size={16} color={theme.primaryColor} />
            </TouchableOpacity>
          </View>

          <View style={{ width: 12 }} />

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>End Date</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerTriggerText}>
                {endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <Ionicons name="calendar" size={16} color={theme.primaryColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* DateTimePicker Modals */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            minimumDate={(() => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              return d;
            })()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setShowStartPicker(false);
              if (date) {
                setStartDate(date);
                if (endDate < date) {
                  setEndDate(date);
                }
              }
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            minimumDate={startDate}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setShowEndPicker(false);
              if (date) {
                setEndDate(date);
              }
            }}
          />
        )}

        {/* Shift Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Leave Duration</Text>
          <View style={styles.durationSelector}>
            <TouchableOpacity
              style={[styles.durationOption, duration === 'FULL_DAY' && styles.durationOptionActive]}
              onPress={() => setDuration('FULL_DAY')}
              activeOpacity={0.8}
            >
              <Text style={[styles.durationOptionText, duration === 'FULL_DAY' && styles.durationOptionTextActive]}>
                Full Day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.durationOption, duration === 'HALF_DAY' && styles.durationOptionActive]}
              onPress={() => setDuration('HALF_DAY')}
              activeOpacity={0.8}
            >
              <Text style={[styles.durationOptionText, duration === 'HALF_DAY' && styles.durationOptionTextActive]}>
                Half Day
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Approver Email Input */}
        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Reporting Approver Email</Text>
          <View style={styles.emailInputRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.emailInput}
              placeholder="Enter approver's email address"
              placeholderTextColor={COLORS.textMuted}
              value={approverEmail}
              onChangeText={setApproverEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Remark Form Input */}
        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Reason for Leave</Text>
          <TextInput
            style={styles.remarkInput}
            multiline
            numberOfLines={4}
            placeholder="Write leave details/reason..."
            placeholderTextColor={COLORS.textMuted}
            value={remark}
            onChangeText={setRemark}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, createLeaveMutation.isPending && styles.submitBtnDisabled]}
          onPress={handleApplyLeave}
          disabled={createLeaveMutation.isPending}
          activeOpacity={0.85}
        >
          {createLeaveMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Leave Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* --- MODAL: LEAVE TYPES PICKER --- */}
      <Modal visible={typeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Leave Type</Text>
              <TouchableOpacity onPress={() => setTypeModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {typesLoading ? (
              <ActivityIndicator size="small" color={theme.primaryColor} style={{ padding: 20 }} />
            ) : (
              <FlatList
                data={leaveTypes}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedType({ id: item.id, name: item.name });
                      setTypeModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalItemText}>{item.name}</Text>
                      <Text style={styles.modalItemSub}>{item.type || 'General'}</Text>
                    </View>
                    {selectedType?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primaryColor} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.modalEmptyText}>No active leave types found.</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      backgroundColor: '#F8FAFC',
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    headerSubtitle: {
      fontSize: 10.5,
      fontWeight: '600',
      color: COLORS.textMuted,
      marginTop: 2,
    },
    formScroll: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    formGroup: {
      marginBottom: 14,
    },
    datesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    fieldLabel: {
      fontSize: 12.5,
      fontWeight: '700',
      color: COLORS.textDark,
      marginBottom: 6,
    },
    pickerTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 10,
      height: 46,
      paddingHorizontal: 12,
    },
    pickerTriggerText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textDark,
    },
    pickerTriggerPlaceholder: {
      fontSize: 13,
      fontWeight: '500',
      color: COLORS.textMuted,
    },
    durationSelector: {
      flexDirection: 'row',
      backgroundColor: '#E2E8F0',
      borderRadius: 10,
      padding: 4,
      height: 46,
    },
    durationOption: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    durationOptionActive: {
      backgroundColor: '#FFFFFF',
    },
    durationOptionText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textMuted,
    },
    durationOptionTextActive: {
      color: COLORS.textDark,
      fontWeight: '800',
    },
    remarkInput: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textDark,
      textAlignVertical: 'top',
      height: 90,
    },
    emailInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 10,
      height: 46,
      paddingHorizontal: 12,
    },
    emailInput: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textDark,
      height: '100%',
    },
    submitBtn: {
      backgroundColor: COLORS.saveBtnBg,
      borderRadius: 12,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    submitBtnDisabled: {
      opacity: 0.7,
    },
    submitBtnText: {
      fontSize: 14.5,
      fontWeight: 'bold',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
      backgroundColor: COLORS.bgWhite,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '75%',
      paddingBottom: 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    modalCloseBtn: {
      padding: 4,
    },
    modalSearchSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F1F5F9',
      borderRadius: 10,
      margin: 12,
      paddingHorizontal: 12,
      height: 40,
    },
    modalSearchInput: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textDark,
      height: '100%',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F8FAFC',
    },
    modalItemText: {
      fontSize: 13.5,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    modalItemSub: {
      fontSize: 10.5,
      fontWeight: '600',
      color: COLORS.textMuted,
      marginTop: 2,
    },
    modalEmptyText: {
      fontSize: 12,
      color: COLORS.textMuted,
      textAlign: 'center',
      padding: 24,
      fontWeight: '600',
    },
  });
