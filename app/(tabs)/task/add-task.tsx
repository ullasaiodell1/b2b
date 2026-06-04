import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
};

export default function AddTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showAllFields, setShowAllFields] = useState(false);
  const [taskOwner, setTaskOwner] = useState('Parth Solanki');
  const [subject, setSubject] = useState('Website Redesign');
  const [dueDate, setDueDate] = useState('3 Mar, 2026');
  const [status, setStatus] = useState('In Progress');
  const [priority, setPriority] = useState('Normal');
  const [sendEmail, setSendEmail] = useState(false);

  // System Calendar State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDateObj, setDueDateObj] = useState(new Date(2026, 2, 3));

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handleSave = () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Subject is required.');
      return;
    }
    Alert.alert(
      'Task Created',
      `Subject: ${subject}\nOwner: ${taskOwner}\nDue: ${dueDate}\nStatus: ${status}\nPriority: ${priority}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: COLORS.primary }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>TASK</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Show All Fields Toggle Capsule */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show All Fields</Text>
          <Switch
            value={showAllFields}
            onValueChange={setShowAllFields}
            trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </View>

        {/* Form fields */}
        <View style={styles.form}>
          
          {/* Task Owner */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Task Owner</Text>
            <TouchableOpacity 
              style={styles.selectBox}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Select Owner', 'Owner picker opened.')}
            >
              <Text style={styles.selectText}>{taskOwner}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Subject */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Subject <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                style={styles.textInput}
                placeholder="Enter task subject"
                placeholderTextColor={COLORS.textMuted}
              />
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.inputChevron} />
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <TouchableOpacity 
              style={styles.selectBox}
              activeOpacity={0.8}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.selectText}>{dueDate}</Text>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* Status */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Status</Text>
            <TouchableOpacity 
              style={styles.selectBox}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Select Status', 'Status options list opened.')}
            >
              <Text style={styles.selectText}>{status}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Priority */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Priority</Text>
            <TouchableOpacity 
              style={styles.selectBox}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Select Priority', 'Priority options list opened.')}
            >
              <Text style={styles.selectText}>{priority}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Send Notification Email Toggle */}
          <View style={styles.toggleRowInline}>
            <Text style={styles.toggleLabelInline}>Send Notification Email</Text>
            <Switch
              value={sendEmail}
              onValueChange={setSendEmail}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>

        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── SYSTEM DATE PICKER ─────────────────────── */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showDatePicker}>
            <TouchableOpacity 
              style={styles.calendarOverlay} 
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <View style={styles.calendarContent}>
                <DateTimePicker
                  value={dueDateObj}
                  mode="date"
                  display="inline"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      setDueDateObj(selectedDate);
                      setDueDate(formatDate(selectedDate));
                    }
                  }}
                />
                <TouchableOpacity 
                  style={[styles.saveBtn, { marginTop: 10 }]} 
                  onPress={() => setShowDatePicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={dueDateObj}
            mode="date"
            display="default"
            onChange={(event: any, selectedDate?: Date) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDueDateObj(selectedDate);
                setDueDate(formatDate(selectedDate));
              }
            }}
          />
        )
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },

  // Toggle switch row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Form Fields
  form: {
    gap: 14,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    paddingLeft: 2,
  },
  selectBox: {
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
  selectText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    padding: 0,
  },
  inputChevron: {
    marginLeft: 6,
  },

  // Switch Toggle Inline
  toggleRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  toggleLabelInline: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // Save button
  saveBtn: {
    backgroundColor: '#000000',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Modal styles for calendar picker
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContent: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  calendarNavs: {
    flexDirection: 'row',
    gap: 8,
  },
  calNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7F5',
  },
  calWeeksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  calWeekText: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 0,
    justifyContent: 'flex-start',
  },
  calDayCell: {
    width: '14.28%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDaySelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 17,
  },
  calDayText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  calDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  calActions: {
    flexDirection: 'row',
    gap: 10,
  },
  calBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calBtnCancel: {
    backgroundColor: '#EDF3F1',
  },
  calBtnCancelText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 12.5,
  },
  calBtnApply: {
    backgroundColor: COLORS.primary,
  },
  calBtnApplyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12.5,
  },
});
