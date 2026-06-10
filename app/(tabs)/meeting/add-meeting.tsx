import { MeetingRecord, meetingsState, updateMeetingsState } from '@/components/MeetingState';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as Calendar from 'expo-calendar';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomTimePicker } from '@/components/custom/CustomTimePicker';

export default function AddMeetingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [showAllFields, setShowAllFields] = useState(false);
  const [syncToCalendar, setSyncToCalendar] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('Development Room');
  const [location, setLocation] = useState('Hybrid');
  const [isAllDay, setIsAllDay] = useState(false);

  // DateTimePicker State
  const [meetingDate, setMeetingDate] = useState<Date>(new Date());
  const [fromTime, setFromTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(11, 0, 0, 0);
    return d;
  });
  const [toTime, setToTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [host, setHost] = useState('Parth Solanki');

  // Picker visibilities
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a Meeting Title.');
      return;
    }

    const fromTimeStr = fromTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const toTimeStr = toTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMeeting: MeetingRecord = {
      id: Date.now().toString(),
      title,
      venue,
      location,
      isAllDay,
      fromTime: fromTimeStr,
      toTime: toTimeStr,
      host,
      status: 'Pending',
      notes: [],
      attachments: [],
      createdTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      modifiedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    if (syncToCalendar) {
      try {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status === 'granted') {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const editableCal = calendars.find((c) => c.isPrimary && c.allowsModifications) || calendars.find((c) => c.allowsModifications);
          if (editableCal) {
            const startDate = new Date(meetingDate);
            startDate.setHours(fromTime.getHours(), fromTime.getMinutes(), 0, 0);

            const endDate = new Date(meetingDate);
            endDate.setHours(toTime.getHours(), toTime.getMinutes(), 0, 0);

            await Calendar.createEventAsync(editableCal.id, {
              title,
              startDate,
              endDate,
              location: `${venue}, ${location}`,
              notes: `Meeting hosted by ${host}.`,
            });
          }
        }
      } catch (e) {
        console.warn('System calendar sync failed:', e);
      }
    }

    updateMeetingsState([...meetingsState, newMeeting]);
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>ADD MEETING</Text>
          <Text style={styles.headerSubtitle}>Fill in the Details Below</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Toggle Options */}
        <View style={{ gap: 10 }}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show All Fields</Text>
            <Switch
              value={showAllFields}
              onValueChange={setShowAllFields}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Sync with System Calendar</Text>
            <Switch
              value={syncToCalendar}
              onValueChange={setSyncToCalendar}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Meeting Venue */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meeting Venue *</Text>
            <View style={styles.selectorContainer}>
              <TextInput
                style={styles.selectorInput}
                placeholder="Enter Meeting Venue"
                placeholderTextColor="#9CA3AF"
                value={venue}
                onChangeText={setVenue}
              />
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location *</Text>
            <View style={styles.selectorContainer}>
              <TextInput
                style={styles.selectorInput}
                placeholder="Enter Location (e.g. Hybrid, Online)"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={setLocation}
              />
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date *</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.selectorContainer}>
              <Text style={styles.selectorInputText}>
                {meetingDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={meetingDate}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) setMeetingDate(selected);
                }}
              />
            )}
          </View>

          {/* All Day Toggle (Yes / No side-by-side buttons) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>All Day</Text>
            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                onPress={() => setIsAllDay(true)}
                style={[styles.yesNoBtn, isAllDay && styles.yesNoBtnActive]}
              >
                <Text style={[styles.yesNoText, isAllDay && styles.yesNoTextActive]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsAllDay(false)}
                style={[styles.yesNoBtn, !isAllDay && styles.yesNoBtnActive]}
              >
                <Text style={[styles.yesNoText, !isAllDay && styles.yesNoTextActive]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Picker From */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>From *</Text>
            <TouchableOpacity onPress={() => setShowFromTimePicker(true)} style={styles.selectorContainer}>
              <Text style={styles.selectorInputText}>
                {fromTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
              <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            <CustomTimePicker
              visible={showFromTimePicker}
              onClose={() => setShowFromTimePicker(false)}
              selectedDate={fromTime}
              onSelect={(selected) => {
                setShowFromTimePicker(false);
                setFromTime(selected);
              }}
            />
          </View>

          {/* Time Picker To */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>To *</Text>
            <TouchableOpacity onPress={() => setShowToTimePicker(true)} style={styles.selectorContainer}>
              <Text style={styles.selectorInputText}>
                {toTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
              <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            <CustomTimePicker
              visible={showToTimePicker}
              onClose={() => setShowToTimePicker(false)}
              selectedDate={toTime}
              onSelect={(selected) => {
                setShowToTimePicker(false);
                setToTime(selected);
              }}
            />
          </View>

          {/* Host Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Host</Text>
            <View style={styles.selectorContainer}>
              <TextInput
                style={styles.selectorInput}
                placeholder="Enter Host Name"
                placeholderTextColor="#9CA3AF"
                value={host}
                onChangeText={setHost}
              />
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 10, 16) }]}>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} activeOpacity={0.9}>
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: Platform.OS === 'ios' ? 66 : 26,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 110,
    gap: 5,
  },
  bottomStickyBar: {
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    paddingVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  form: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  selectorInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  selectorInputText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    textAlignVertical: 'center',
  },

  // Yes/No Selector Buttons
  yesNoContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  yesNoBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesNoBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  yesNoText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  yesNoTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },

  // Save Button
  saveBtn: {
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
