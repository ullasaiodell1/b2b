import { CustomTimePicker } from '@/components/custom/CustomTimePicker';
import { LeadSelectCard } from '@/components/lead/LeadSelectCard';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateMeeting } from '@/hooks/useMeetings';
import { scheduleMeetingNotification } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as Calendar from 'expo-calendar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

const STATUS_OPTIONS = ['SCHEDULED', 'CANCELLED', 'RESCHEDULED'] as const;
type MeetingStatus = typeof STATUS_OPTIONS[number];

const METHOD_OPTIONS = ['Online', 'Offline'] as const;
type MeetingMethod = typeof METHOD_OPTIONS[number];

export interface AddMeetingComponentProps {
  initialLeadId?: string;
  initialLeadName?: string;
  initialLeadCompany?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  hideHeader?: boolean;
}

export const AddMeetingComponent: React.FC<AddMeetingComponentProps> = ({
  initialLeadId,
  initialLeadName,
  initialLeadCompany,
  onSuccess,
  onCancel,
  hideHeader = false,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const createMeetingMutation = useCreateMeeting();
  const { primaryColor, primaryLight } = useTheme();

  // ─── Form State ────────────────────────────────────────────────
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [status, setStatus] = useState<MeetingStatus | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [method, setMethod] = useState<MeetingMethod | null>(null);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [purpose, setPurpose] = useState('');

  // ─── Lead State ────────────────────────────────────────────────
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeadId || null);
  const [selectedLeadName, setSelectedLeadName] = useState<string | null>(initialLeadName || null);
  const [selectedLeadCompany, setSelectedLeadCompany] = useState<string | null>(initialLeadCompany || null);

  // ─── DateTime State ───────────────────────────────────────────
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d;
  });

  // ─── Picker Visibility ────────────────────────────────────────
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Keyboard visibility state
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleSave = async () => {
    if (!selectedLeadId) {
      Alert.alert('Required', 'Please select a Lead.');
      return;
    }

    if (!status) {
      Alert.alert('Required', 'Please select a Status.');
      return;
    }

    const combined = new Date(scheduledDate);
    combined.setHours(scheduledTime.getHours(), scheduledTime.getMinutes(), 0, 0);

    const now = new Date();
    const minAllowedTime = new Date(now);
    minAllowedTime.setMinutes(now.getMinutes() + 5);

    if (combined < minAllowedTime) {
      Alert.alert(
        'Invalid Time',
        `Meeting time must be at least 5 minutes in the future (from ${formatTime(minAllowedTime)} onwards).`
      );
      return;
    }

    if (syncToCalendar) {
      try {
        const { status: permStatus } = await Calendar.requestCalendarPermissionsAsync();
        if (permStatus === 'granted') {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const editableCal =
            calendars.find((c) => c.isPrimary && c.allowsModifications) ||
            calendars.find((c) => c.allowsModifications);
          if (editableCal) {
            const endDate = new Date(combined);
            endDate.setHours(endDate.getHours() + 1);
            await Calendar.createEventAsync(editableCal.id, {
              title: purpose,
              startDate: combined,
              endDate,
              location: method || undefined,
              notes: undefined,
            });
          }
        }
      } catch (e) {
        console.warn('System calendar sync failed:', e);
      }
    }

    try {
      await createMeetingMutation.mutateAsync({
        leadId: selectedLeadId,
        scheduled_at: combined.toISOString(),
        status: status ?? 'SCHEDULED',
        follow_up_method: method ?? 'Online',
        purpose: purpose,
        remarks: '',
      });

      try {
        await scheduleMeetingNotification(purpose || 'Meeting', combined);
      } catch (notiErr) {
        console.warn('Failed to schedule meeting notification:', notiErr);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      console.error('[AddMeetingComponent] save error:', err);
      Alert.alert('Error', err?.message || 'Failed to save meeting. Please try again.');
    }
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onCancel])
  );

  const isLoading = createMeetingMutation.isPending;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ──────────────────────────────────── */}
      {!hideHeader && (
        <View style={[styles.header, {
          paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16),
        }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              <Text style={{ color: primaryColor }}>ADD </Text>
              <Text style={{ color: COLORS.textDark }}>MEETING</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Fill in the Details Below</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardVisible ? 200 : 30 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Sync Toggle ─────────────────────────── */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Ionicons name="calendar-outline" size={16} color={primaryColor} />
            <Text style={styles.toggleLabel}>Sync with System Calendar</Text>
          </View>
          <Switch
            value={syncToCalendar}
            onValueChange={setSyncToCalendar}
            trackColor={{ false: '#D1D5DB', true: primaryColor }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* ── FORM CARD ───────────────────────────── */}
        <View style={styles.formCard}>
          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Status <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.inputRow, statusDropdownOpen && { borderColor: primaryColor, backgroundColor: primaryLight }]}
              onPress={() => setStatusDropdownOpen(!statusDropdownOpen)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="ellipse-outline"
                size={16}
                color={status ? primaryColor : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <Text style={[styles.textInput, !status && { color: '#9CA3AF' }]}>
                {status ?? 'Select status'}
              </Text>
              <Ionicons
                name={statusDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>

            {statusDropdownOpen && (
              <View style={styles.dropdownList}>
                {STATUS_OPTIONS.map((opt, idx) => {
                  const isSelected = status === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownItemSelected,
                        idx < STATUS_OPTIONS.length - 1 && styles.dropdownItemBorder,
                      ]}
                      onPress={() => {
                        setStatus(opt);
                        setStatusDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Method */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Method</Text>
            <TouchableOpacity
              style={[styles.inputRow, methodDropdownOpen && { borderColor: primaryColor, backgroundColor: primaryLight }]}
              onPress={() => setMethodDropdownOpen(!methodDropdownOpen)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="git-merge-outline"
                size={16}
                color={method ? primaryColor : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <Text style={[styles.textInput, !method && { color: '#9CA3AF' }]}>
                {method ?? 'Select method'}
              </Text>
              <Ionicons
                name={methodDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>

            {methodDropdownOpen && (
              <View style={styles.dropdownList}>
                {METHOD_OPTIONS.map((opt, idx) => {
                  const isSelected = method === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownItemSelected,
                        idx < METHOD_OPTIONS.length - 1 && styles.dropdownItemBorder,
                      ]}
                      onPress={() => {
                        setMethod(opt);
                        setMethodDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Purpose */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Purpose</Text>
            <View style={styles.inputRow}>
              <Ionicons name="briefcase-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Product Demo, Follow-up Discussion"
                placeholderTextColor="#9CA3AF"
                value={purpose}
                onChangeText={setPurpose}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Scheduled Date & Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Scheduled Date &amp; Time</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[styles.inputRow, { flex: 1 }]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={16} color={primaryColor} style={styles.inputIcon} />
                <Text style={[styles.textInput, { paddingTop: 2 }]} numberOfLines={1}>
                  {formatDate(scheduledDate)}
                </Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inputRow, { flex: 1 }]}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={16} color={primaryColor} style={styles.inputIcon} />
                <Text style={[styles.textInput, { paddingTop: 2 }]}>
                  {formatTime(scheduledTime)}
                </Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── SELECTED LEAD CARD & LIST ───────────── */}
        {!initialLeadId && (
          <LeadSelectCard
            selectedLeadId={selectedLeadId}
            onSelectLead={(leadId, leadName, leadCompany) => {
              setSelectedLeadId(leadId);
              setSelectedLeadName(leadName);
              setSelectedLeadCompany(leadCompany);
            }}
            initialLeadId={initialLeadId}
            initialLeadName={initialLeadName}
            initialLeadCompany={initialLeadCompany}
          />
        )}

        {/* ── SAVE MEETING BUTTON ───────────────────────── */}
        <View style={styles.nonStickySaveContainer}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, isLoading && { opacity: 0.7 }]}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>SAVE MEETING</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── DATE PICKER ───────────────────────────────── */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showDatePicker}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <DateTimePicker
                  value={scheduledDate}
                  mode="date"
                  display="inline"
                  minimumDate={new Date()}
                  onChange={(_e, selected) => { if (selected) setScheduledDate(selected); }}
                />
                <TouchableOpacity
                  style={styles.saveBtn}
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
            value={scheduledDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(_e, selected) => {
              setShowDatePicker(false);
              if (selected) setScheduledDate(selected);
            }}
          />
        )
      )}

      {/* ── TIME PICKER ───────────────────────────────── */}
      <CustomTimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        selectedDate={scheduledTime}
        onSelect={(selected) => {
          setShowTimePicker(false);
          setScheduledTime(selected);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16,
    paddingBottom: 14,
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
    gap: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 5,
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  formCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  required: {
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dropdownList: {
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemSelected: {
    backgroundColor: '#EBF8FF',
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  dropdownItemTextSelected: {
    color: '#0EA5E9',
    fontWeight: '900',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    padding: 0,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nonStickySaveContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  saveBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
});
