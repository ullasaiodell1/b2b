import { CustomTimePicker } from '@/components/custom/CustomTimePicker';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateMeeting } from '@/hooks/useMeetings';
import { LeadSelectCard } from '@/components/lead/LeadSelectCard';
import { scheduleMeetingNotification } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// ── Constants ──────────────────────────────────────────────────────
const STATUS_OPTIONS = ['SCHEDULED', 'CANCELLED', 'RESCHEDULED'] as const;
type MeetingStatus = typeof STATUS_OPTIONS[number];

const METHOD_OPTIONS = ['Online', 'Offline'] as const;
type MeetingMethod = typeof METHOD_OPTIONS[number];

export default function AddMeetingScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; company?: string }>();
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
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(params.leadId || null);
  const [selectedLeadName, setSelectedLeadName] = useState<string | null>(params.leadName || null);
  const [selectedLeadCompany, setSelectedLeadCompany] = useState<string | null>(params.company || null);

  // ─── DateTime State ───────────────────────────────────────────
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(11, 0, 0, 0);
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

  // ─── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedLeadId) {
      Alert.alert('Required', 'Please select a Lead.');
      return;
    }

    if (!status) {
      Alert.alert('Required', 'Please select a Status.');
      return;
    }

    // Build ISO scheduled_at from selected date + time
    const combined = new Date(scheduledDate);
    combined.setHours(scheduledTime.getHours(), scheduledTime.getMinutes(), 0, 0);

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
              location: method,
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

      // Schedule meeting notification
      try {
        await scheduleMeetingNotification(purpose || 'Meeting', combined);
      } catch (notiErr) {
        console.warn('Failed to schedule meeting notification:', notiErr);
      }

      router.back();
    } catch (err: any) {
      console.error('[AddMeeting] save error:', err);
      Alert.alert('Error', err?.message || 'Failed to save meeting. Please try again.');
    }
  };

  const isLoading = createMeetingMutation.isPending;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ──────────────────────────────────── */}
      <View style={[styles.header, {
        paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16),
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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

          {/* ── Status ──────────────────────────────── */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Status <Text style={styles.required}>*</Text>
            </Text>
            {/* Dropdown trigger */}
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

            {/* Dropdown list */}
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

          {/* ── Method ──────────────────────────────── */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Method</Text>
            {/* Dropdown trigger */}
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

            {/* Dropdown list */}
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

          {/* ── Purpose ─────────────────────────────── */}
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

          {/* ── Scheduled Date & Time ────────────────── */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Scheduled Date &amp; Time</Text>
            <View style={styles.dateTimeRow}>
              {/* Date */}
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

              {/* Time */}
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
        {!params.leadId && (
          <LeadSelectCard
            selectedLeadId={selectedLeadId}
            onSelectLead={(leadId, leadName, leadCompany) => {
              setSelectedLeadId(leadId);
              setSelectedLeadName(leadName);
              setSelectedLeadCompany(leadCompany);
            }}
            initialLeadId={params.leadId}
            initialLeadName={params.leadName}
            initialLeadCompany={params.company}
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
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },

  // ── Header ──────────────────────────────────────────
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

  // ── Scroll ──────────────────────────────────────────
  scrollContent: {
    padding: 5,
    gap: 8,
  },

  // ── Sync Toggle ─────────────────────────────────────
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

  // ── Form Card ────────────────────────────────────────
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

  // ── Status Dropdown ──────────────────────────────────
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

  // ── Input Row ────────────────────────────────────────
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
  inputRowFocused: {},
  inputError: {
    borderColor: '#EF4444',
  },
  readonlyRow: {
    backgroundColor: '#F3F4F6',
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

  // ── Textarea ─────────────────────────────────────────
  textareaRow: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textarea: {
    height: 68,
  },

  // ── Date + Time row ──────────────────────────────────
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // ── Bottom bar ───────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
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

  // ── Date Modal (iOS) ─────────────────────────────────
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

  // ── Selected Lead Card ────────────────────────────────
  selectedLeadCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  selectedLeadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  selectedLeadTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  changeLeadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeLeadBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  selectedLeadInfo: {
    gap: 6,
  },
  noLeadSelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  noLeadSelectedText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B91C1C',
    flex: 1,
  },
  leadListContainer: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  hintText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  leadsContainer: {
    gap: 8,
  },
  leadListItemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 4,
  },

  // ── Lead Card Inner Styles (copied from index) ─────────
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  priorityTag: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.tagText,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  contactsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F5F2',
    paddingTop: 8,
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  contactText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
