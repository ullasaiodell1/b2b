import { CustomTimePicker } from '@/components/custom/CustomTimePicker';
import { LeadSelectCard } from '@/components/lead/LeadSelectCard';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateReminder, useUpdateReminder } from '@/hooks/useReminders';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
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

export default function AddReminderScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { primaryColor } = useTheme();

  const params = useLocalSearchParams<{
    reminderId?: string;
    title?: string;
    description?: string;
    reminderDate?: string;
    reminderTime?: string;
    leadId?: string;
    leadName?: string;
    leadCompany?: string;
    referrer?: string;
  }>();

  const isEditing = !!params.reminderId;

  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder();
  const router = useRouter();

  // ─── Parse initial date from params ──────────────────────────────
  const parseInitialDate = (): Date => {
    if (params.reminderDate) {
      const parts = params.reminderDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return new Date(y, m, d);
      }
      const d = new Date(params.reminderDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  const parseInitialTime = (): Date => {
    const base = new Date();
    if (params.reminderTime) {
      const parts = params.reminderTime.split(':');
      if (parts.length >= 2) {
        base.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        return base;
      }
    }
    // Default to current time rounded to next 5 min
    const mins = Math.ceil(base.getMinutes() / 5) * 5;
    base.setMinutes(mins, 0, 0);
    return base;
  };

  // ─── Form State ───────────────────────────────────────────────────
  const [title, setTitle] = useState(params.title || '');
  const [description, setDescription] = useState(params.description || '');
  const [reminderDate, setReminderDate] = useState<Date>(parseInitialDate());
  const [reminderTime, setReminderTime] = useState<Date>(parseInitialTime());

  // ─── Lead State ───────────────────────────────────────────────────
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(params.leadId || null);
  const [selectedLeadName, setSelectedLeadName] = useState<string | null>(params.leadName || null);
  const [selectedLeadCompany, setSelectedLeadCompany] = useState<string | null>(params.leadCompany || null);

  // ─── Picker Visibility ────────────────────────────────────────────
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleBack = () => {
    const referrer = params.referrer;
    const targetLeadId = selectedLeadId || params.leadId;
    if (referrer === 'lead-details' && targetLeadId) {
      router.navigate({
        pathname: '/(tabs)/leads/lead-details',
        params: { id: targetLeadId, activeTab: 'Overview', expandSection: 'reminder' }
      });
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const referrer = params.referrer;
        const targetLeadId = selectedLeadId || params.leadId;
        if (referrer === 'lead-details' && targetLeadId) {
          router.navigate({
            pathname: '/(tabs)/leads/lead-details',
            params: { id: targetLeadId, activeTab: 'Overview', expandSection: 'reminder' }
          });
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [params.referrer, selectedLeadId, params.leadId])
  );

  // ─── Helpers ──────────────────────────────────────────────────────
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const toISODateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const toTimeStr = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // ─── Save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a reminder title.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter a reminder description.');
      return;
    }

    // Combine date and time to construct remind_at
    const remindAt = new Date(reminderDate);
    remindAt.setHours(reminderTime.getHours());
    remindAt.setMinutes(reminderTime.getMinutes());
    remindAt.setSeconds(0);
    remindAt.setMilliseconds(0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      remind_at: remindAt.toISOString(),
      remind_time: toTimeStr(reminderTime),
      ...(selectedLeadId ? { lead_id: selectedLeadId } : {}),
    };

    console.log(
      '[Reminder Payload]',
      JSON.stringify(payload, null, 2)
    );

    try {
      if (isEditing && params.reminderId) {
        await updateMutation.mutateAsync({ id: params.reminderId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleBack();
    } catch (err: any) {
      console.error('[AddReminder] save error:', err);
      Alert.alert(
        'Error',
        err?.message || 'Failed to save reminder. Please try again.'
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ──────────────────────────────────── */}
      <View
        style={[
          s.header,
          {
            paddingTop: Math.max(
              insets.top + 8,
              Platform.OS === 'ios' ? 48 : 16
            ),
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleBack}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={{ width: 20, height: 20, marginRight: 6 }}
            resizeMode="contain"
          />
          <Text style={s.logoText}>BASALT</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── FORM CARD ─────────────────────────────── */}
        <View style={s.formCard}>
          {/* Card Header */}
          <View style={s.cardHeader}>
            <View>
              <Text style={s.cardTitle}>
                {isEditing ? 'Edit Reminder' : 'Add Reminder'}
              </Text>
              <Text style={s.cardSubtitle}>
                Set a reminder with date, title, and description.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleBack}
              style={s.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={s.divider} />

          {/* ── Date & Time Row ──────────────────────── */}
          <View style={s.dateTimeRow}>
            {/* Reminder Date */}
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.inputLabel}>
                Reminder Date <Text style={s.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={s.inputRow}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={s.inputValue}>{formatDate(reminderDate)}</Text>
                <TouchableOpacity
                  onPress={() => setReminderDate(new Date())}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            {/* Reminder Time */}
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.inputLabel}>
                Reminder Time <Text style={s.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={s.inputRow}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={s.inputValue}>{formatTime(reminderTime)}</Text>
                <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.divider} />

          {/* ── Title ───────────────────────────────── */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>
              Title <Text style={s.required}>*</Text>
            </Text>
            <View style={[s.inputRow, s.inputRowFull]}>
              <TextInput
                style={s.textInput}
                placeholder="Enter reminder title"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={s.divider} />

          {/* ── Description ─────────────────────────── */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>
              Description <Text style={s.required}>*</Text>
            </Text>
            <View style={[s.inputRow, s.textareaRow]}>
              <TextInput
                style={[s.textInput, s.textarea]}
                placeholder="Enter reminder description"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        {/* ── LEAD SELECTOR ──────────────────────────── */}
        <LeadSelectCard
          selectedLeadId={selectedLeadId}
          onSelectLead={(leadId, leadName, leadCompany) => {
            setSelectedLeadId(leadId);
            setSelectedLeadName(leadName);
            setSelectedLeadCompany(leadCompany);
          }}
          initialLeadId={params.leadId}
          initialLeadName={params.leadName}
          initialLeadCompany={params.leadCompany}
        />

        {/* ── ACTION BUTTONS ──────────────────────────── */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.cancelButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={s.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.saveButton,
              { backgroundColor: primaryColor },
              isLoading && { opacity: 0.7 },
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={s.saveButtonText}>
                {isEditing ? 'Update Reminder' : 'Save Reminder'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── DATE PICKER ─────────────────────────────────── */}
      {showDatePicker &&
        (Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showDatePicker}>
            <TouchableOpacity
              style={s.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <View style={s.modalContent}>
                <Text style={s.modalTitle}>Select Date</Text>
                <DateTimePicker
                  value={reminderDate}
                  mode="date"
                  display="inline"
                  onChange={(_e, selected) => {
                    if (selected) setReminderDate(selected);
                  }}
                />
                <TouchableOpacity
                  style={[s.saveButton, { backgroundColor: primaryColor }]}
                  onPress={() => setShowDatePicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={s.saveButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={reminderDate}
            mode="date"
            display="default"
            onChange={(_e, selected) => {
              setShowDatePicker(false);
              if (selected) setReminderDate(selected);
            }}
          />
        ))}

      {/* ── TIME PICKER ─────────────────────────────────── */}
      <CustomTimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        selectedDate={reminderTime}
        onSelect={(selected) => {
          setShowTimePicker(false);
          setReminderTime(selected);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },

  // Header
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 2,
  },

  // Scroll
  scrollContent: {
    padding: 5,
    gap: 5,
    paddingBottom: 40,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: -2,
  },

  // Date Time Row
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Input group
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  required: {
    color: COLORS.danger,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputRowFull: {
    justifyContent: 'flex-start',
  },
  inputValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textDark,
    fontWeight: '600',
    padding: 0,
  },
  textareaRow: {
    height: 110,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textarea: {
    height: 88,
    textAlignVertical: 'top',
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.cancelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgWhite,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  saveButton: {
    flex: 1.5,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Date Modal (iOS)
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
