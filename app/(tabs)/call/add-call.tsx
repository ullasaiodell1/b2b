import { CallRecord, callsState, updateCallsState } from '@/components/CallState';
import { CustomTimePicker } from '@/components/custom/CustomTimePicker';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STATUS_OPTIONS = ['Incoming', 'Outgoing', 'Missed'];

export default function AddCallScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showAllFields, setShowAllFields] = useState(false);
  const [callType, setCallType] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Incoming' | 'Outgoing' | 'Missed' | ''>('');
  const [setTime, setSetTime] = useState('');
  const [contactName, setContactName] = useState('');

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [dueDateObj, setDueDateObj] = useState(new Date());
  const [setTimeObj, setSetTimeObj] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSave = () => {
    if (!callType || !dueDate || !status || !setTime) {
      Alert.alert('Required Fields', 'Please fill in Call Type, Due Date, Status and Set Time.');
      return;
    }

    const nameToUse = contactName.trim() || 'Vijay Rathod';

    const newCall: CallRecord = {
      id: String(callsState.length + 1),
      name: nameToUse,
      phoneNumber: '+91 98765 43210',
      dateTime: `${dueDate}, ${setTime}`,
      duration: status === 'Missed' ? '00:00 min' : '15:24 min',
      type: status || 'Incoming',
      callType,
      dueDate,
    };

    updateCallsState([newCall, ...callsState]);

    Alert.alert('Success', 'Call log created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>CALL</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Switch */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show All Fields</Text>
          <Switch
            value={showAllFields}
            onValueChange={setShowAllFields}
            trackColor={{ false: '#CBD5E1', true: theme.primaryColor }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.formContainer}>
          {/* Contact Name (Conditional or general) */}
          {showAllFields && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="E.G: Vijay Rathod"
                placeholderTextColor="#9CA3AF"
                value={contactName}
                onChangeText={setContactName}
              />
            </View>
          )}

          {/* Call Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Call Type</Text>
            <TextInput
              style={styles.textInput}
              placeholder="E.G : Sales Related"
              placeholderTextColor="#9CA3AF"
              value={callType}
              onChangeText={setCallType}
            />
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !dueDate && styles.placeholderText]}>
                {dueDate || 'Select Date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDateObj}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) {
                    setDueDateObj(selected);
                    setDueDate(formatDate(selected));
                  }
                }}
              />
            )}
          </View>

          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Status</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowStatusModal(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !status && styles.placeholderText]}>
                {status || 'Enter Status'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Set Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Set Time</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !setTime && styles.placeholderText]}>
                {setTime || 'Select Time'}
              </Text>
              <Ionicons name="time-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            <CustomTimePicker
              visible={showTimePicker}
              onClose={() => setShowTimePicker(false)}
              selectedDate={setTimeObj}
              onSelect={(selected) => {
                setShowTimePicker(false);
                setSetTimeObj(selected);
                setSetTime(formatTime(selected));
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Save Action Button */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 12, 18) }]}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      {/* STATUS DROPDOWN MODAL */}
      <Modal transparent animationType="slide" visible={showStatusModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setStatus(opt as any);
                    setShowStatusModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
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
  scroll: {
    flex: 1,
    paddingHorizontal: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginBottom: 10,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  formContainer: {
    gap: 5,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    backgroundColor: '#FFFFFF',
  },
  pickerTrigger: {
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
  pickerValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: COLORS.saveBtnBg,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
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
