import { CustomTimePicker } from '@/components/custom/CustomTimePicker';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUsers } from '@/hooks/useLeads';
import { useCreateTask } from '@/hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// ─── Option sets ──────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: '#EF4444', bgColor: '#FEF2F2', textColor: '#991B1B' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#3B82F6', bgColor: '#EFF6FF', textColor: '#1E40AF' },
  { value: 'IN_REVIEW', label: 'In Review', color: '#F97316', bgColor: '#FFF7ED', textColor: '#9A3412' },
  { value: 'COMPLETED', label: 'Completed', color: '#10B981', bgColor: '#ECFDF5', textColor: '#065F46' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#707A76', bgColor: '#F4F7F5', textColor: '#374151' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: '#707A76', bgColor: '#F9FAFB', textColor: '#374151' },
  { value: 'MEDIUM', label: 'Medium', color: '#3B82F6', bgColor: '#EFF6FF', textColor: '#1E40AF' },
  { value: 'HIGH', label: 'High', color: '#F59E0B', bgColor: '#FFFBEB', textColor: '#92400E' },
  { value: 'URGENT', label: 'Urgent', color: '#EF4444', bgColor: '#FEF2F2', textColor: '#991B1B' },
] as const;

type StatusType = typeof STATUS_OPTIONS[number]['value'];
type PriorityType = typeof PRIORITY_OPTIONS[number]['value'];

interface UserRecord {
  id: string;
  name: string;
  email: string;
}

export default function AddTaskScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ leadId?: string; lead_id?: string; leadName?: string }>();

  const leadId = params.leadId || params.lead_id || '';
  const leadName = params.leadName || '';
  const { primaryColor, primaryLight } = useTheme();

  const createTaskMutation = useCreateTask();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();

  // ─── Form State ────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<StatusType | null>(null);
  const [priority, setPriority] = useState<PriorityType | null>(null);
  const [assignedUser, setAssignedUser] = useState<UserRecord | null>(null);

  // ─── Validation Error States ───────────────────────────────────
  const [titleError, setTitleError] = useState(false);
  const [assignedError, setAssignedError] = useState(false);
  const [statusError, setStatusError] = useState(false);
  const [priorityError, setPriorityError] = useState(false);

  // ─── Dropdown Visibility States ───────────────────────────────
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // ─── Date State ────────────────────────────────────────────────
  const [dueDateObj, setDueDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ─── User Selector Modal State ────────────────────────────────
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // ─── Sync with Calendar State ─────────────────────────────────
  const [syncToCalendar, setSyncToCalendar] = useState(true);


  // ─── Auto-select user if match found ──────────────────────────
  useEffect(() => {
    if (usersData && usersData.length > 0 && !assignedUser) {
      const defaultUser = usersData.find((u: any) =>
        u.name.toLowerCase().includes('harshil')
      );
      if (defaultUser) {
        setAssignedUser({
          id: String(defaultUser.id),
          name: defaultUser.name,
          email: defaultUser.email || '',
        });
      }
    }
  }, [usersData]);

  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // ─── Save ──────────────────────────────────────────────────────
  const syncToSystemCalendar = async (taskTitle: string, taskDescription: string, taskDueDate: Date) => {
    try {
      const { status: calendarPerm } = await Calendar.requestCalendarPermissionsAsync();
      if (calendarPerm !== 'granted') {
        Alert.alert(
          'Calendar Permission Required',
          'Please enable calendar permissions in your device settings to sync tasks with your system calendar.'
        );
        return;
      }

      let calendarId: string;
      if (Platform.OS === 'ios') {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        calendarId = defaultCalendar.id;
      } else {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const editableCalendar = calendars.find(cal => cal.allowsModifications);
        if (editableCalendar) {
          calendarId = editableCalendar.id;
        } else {
          const defaultCalendarSource = { isLocalAccount: true, name: 'B2B Application', type: 'LOCAL' };
          calendarId = await Calendar.createCalendarAsync({
            title: 'B2B Tasks',
            color: '#346556',
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendarSource.name,
            source: defaultCalendarSource,
            name: 'b2b_tasks',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
          });
        }
      }

      const endDate = new Date(taskDueDate);
      endDate.setHours(endDate.getHours() + 1);

      await Calendar.createEventAsync(calendarId, {
        title: taskTitle,
        startDate: taskDueDate,
        endDate: endDate,
        notes: taskDescription,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      });
    } catch (error) {
      console.error('Failed to sync event to system calendar:', error);
      Alert.alert(
        'Calendar Sync Failed',
        'Task created successfully, but we could not sync it to your system calendar.'
      );
    }
  };

  const handleSave = async () => {
    let hasError = false;

    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    } else {
      setTitleError(false);
    }

    if (!assignedUser) {
      setAssignedError(true);
      hasError = true;
    } else {
      setAssignedError(false);
    }

    if (!status) {
      setStatusError(true);
      hasError = true;
    } else {
      setStatusError(false);
    }

    if (!priority) {
      setPriorityError(true);
      hasError = true;
    } else {
      setPriorityError(false);
    }

    if (hasError) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        due: dueDateObj.toISOString(),
        priority: priority!,
        status: status!,
        assigned_to: assignedUser!.id,
        lead_id: leadId || undefined,
      });

      if (syncToCalendar) {
        await syncToSystemCalendar(title.trim(), description.trim(), dueDateObj);
      }

      router.back();
    } catch (err: any) {
      console.error('[AddTask] save error:', err);
      Alert.alert('Error', err?.message || 'Failed to create task. Please try again.');
    }
  };

  const isLoading = createTaskMutation.isPending;

  // Filter users based on search query
  const filteredUsers = (usersData || []).filter((user: any) =>
    user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ──────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>TASK</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Backdrop to close dropdowns when clicking outside */}
        {(showStatusDropdown || showPriorityDropdown) && (
          <TouchableOpacity
            style={styles.scrollBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowStatusDropdown(false);
              setShowPriorityDropdown(false);
            }}
          />
        )}

        {/* Sync with System Calendar Toggle */}
        <View style={styles.syncCalendarRow}>
          <View style={styles.syncCalendarLeft}>
            <Ionicons name="calendar-outline" size={20} color={primaryColor} />
            <Text style={styles.syncCalendarLabel}>Sync with System Calendar</Text>
          </View>
          <Switch
            value={syncToCalendar}
            onValueChange={setSyncToCalendar}
            trackColor={{ false: '#D1D5DB', true: primaryColor }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </View>

        <View style={styles.form}>

          {/* ── Related Lead (If applicable) ────────── */}
          {leadName ? (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Related Lead</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <Ionicons name="link-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <Text style={styles.disabledInputText}>{leadName}</Text>
              </View>
            </View>
          ) : null}

          {/* ── Title (required) ──────────────────── */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Title <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <View style={[styles.inputContainer, titleError && styles.inputError]}>
              <Ionicons name="create-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                value={title}
                onChangeText={(val) => {
                  setTitle(val);
                  if (val.trim()) setTitleError(false);
                }}
                style={styles.textInput}
                placeholder="Enter task title"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* ── Description ─────────────────────────── */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="document-text-outline" size={16} color={COLORS.textMuted} style={styles.textAreaIcon} />
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={[styles.textInput, styles.textAreaInput]}
                placeholder="Enter task description"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ── Status full-width dropdown ────────────────────────── */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Status <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selectBox, statusError && styles.inputError]}
              activeOpacity={0.8}
              onPress={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowPriorityDropdown(false);
              }}
            >
              <Text style={status ? styles.selectText : styles.placeholderText}>
                {status
                  ? STATUS_OPTIONS.find(o => o.value === status)?.label
                  : 'Select status'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {showStatusDropdown && (
              <View style={[styles.dropdownList, { zIndex: 3000 }]}>
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = status === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.dropdownItem,
                        isSelected && { backgroundColor: opt.bgColor },
                      ]}
                      onPress={() => {
                        setStatus(opt.value);
                        setShowStatusDropdown(false);
                        setStatusError(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        isSelected && { color: opt.textColor, fontWeight: '700' },
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── Priority full-width dropdown ──────────────────────── */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Priority <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selectBox, priorityError && styles.inputError]}
              activeOpacity={0.8}
              onPress={() => {
                setShowPriorityDropdown(!showPriorityDropdown);
                setShowStatusDropdown(false);
              }}
            >
              <Text style={priority ? styles.selectText : styles.placeholderText}>
                {priority
                  ? PRIORITY_OPTIONS.find(o => o.value === priority)?.label
                  : 'Select priority'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {showPriorityDropdown && (
              <View style={[styles.dropdownList, { zIndex: 2000 }]}>
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = priority === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.dropdownItem,
                        isSelected && { backgroundColor: opt.bgColor },
                      ]}
                      onPress={() => {
                        setPriority(opt.value);
                        setShowPriorityDropdown(false);
                        setPriorityError(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        isSelected && { color: opt.textColor, fontWeight: '700' },
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── Assigned To (required) ──────────────── */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Assigned To <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selectBox, assignedError && styles.inputError]}
              activeOpacity={0.8}
              onPress={() => setShowUserModal(true)}
            >
              <View style={styles.selectBoxLeft}>
                <Ionicons name="person-outline" size={16} color={primaryColor} style={styles.inputIcon} />
                <Text style={assignedUser ? styles.selectText : styles.placeholderText}>
                  {assignedUser ? assignedUser.name : 'Select user'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ── Due Date (required) ─────────────────── */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Due Date <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectBox}
              activeOpacity={0.8}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.selectBoxLeft}>
                <Ionicons name="calendar-outline" size={16} color={primaryColor} style={styles.inputIcon} />
                <Text style={styles.selectText}>{formatDateTime(dueDateObj)}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

        </View>

        {/* ── SAVE BUTTON ─────────────────────────────── */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleSave}
          activeOpacity={0.9}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>SAVE TASK</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ── DATE & TIME PICKER (iOS Modal) ────────────── */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal transparent animationType="fade" visible={showDatePicker}>
          <TouchableOpacity
            style={styles.calendarOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.calendarContent}>
              <Text style={styles.calendarTitle}>Select Due Date</Text>
              <DateTimePicker
                value={dueDateObj}
                mode="date"
                display="spinner"
                onChange={(_event: any, selectedDate?: Date) => {
                  if (selectedDate) setDueDateObj(selectedDate);
                }}
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  setShowDatePicker(false);
                  setTimeout(() => {
                    setShowTimePicker(true);
                  }, 250);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* ── DATE & TIME PICKER (Android Native) ───────── */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={dueDateObj}
          mode="date"
          display="default"
          onChange={(event: any, selectedDate?: Date) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              const updated = new Date(dueDateObj);
              updated.setFullYear(selectedDate.getFullYear());
              updated.setMonth(selectedDate.getMonth());
              updated.setDate(selectedDate.getDate());
              setDueDateObj(updated);
              // Trigger time picker next
              setTimeout(() => {
                setShowTimePicker(true);
              }, 150);
            }
          }}
        />
      )}

      <CustomTimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        selectedDate={dueDateObj}
        onSelect={(selected) => {
          setShowTimePicker(false);
          setDueDateObj(selected);
        }}
      />

      {/* ── ASSIGNED TO USER PICKER MODAL ──────────────── */}
      <Modal
        visible={showUserModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUserModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Task To</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowUserModal(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* User Search Bar */}
            <View style={styles.searchBarContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search user name..."
                placeholderTextColor="#9CA3AF"
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}
              />
              {userSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setUserSearchQuery('')} style={styles.clearSearchBtn}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Users List */}
            {isLoadingUsers ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={styles.loadingText}>Loading users...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.userList}
                showsVerticalScrollIndicator={false}
              >
                {filteredUsers.map((user: any) => {
                  const isSelected = assignedUser?.id === String(user.id);
                  const nameInitials = (user.name || '').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[styles.userCard, isSelected && styles.userCardSelected]}
                      onPress={() => {
                        setAssignedUser({
                          id: String(user.id),
                          name: user.name,
                          email: user.email || '',
                        });
                        setAssignedError(false);
                        setShowUserModal(false);
                      }}
                      activeOpacity={0.9}
                    >
                      <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{nameInitials}</Text>
                      </View>

                      <View style={styles.userInfoCol}>
                        <Text style={styles.userNameText}>{user.name}</Text>
                        <Text style={styles.userEmailText}>{user.email}</Text>
                      </View>

                      {/* Custom Radio Button */}
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={40} color="#C2D3CC" />
                    <Text style={styles.emptyTitle}>No users found</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },

  // Header
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

  // Sync Calendar
  syncCalendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  syncCalendarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  syncCalendarLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 5,
    paddingBottom: 150,
  },

  scrollBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
    backgroundColor: 'transparent',
  },

  // Form
  form: {
    gap: 2,
  },
  fieldContainer: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    paddingLeft: 2,
  },

  // Side-by-side dropdown styling
  row: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 1000,
  },
  col: {
    flex: 1,
    position: 'relative',
    gap: 7,
  },

  // Text Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textDark,
    padding: 0,
  },

  // Text Area description styles
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  textAreaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  textAreaInput: {
    height: '100%',
    padding: 0,
  },

  // Disabled input styles (lead link)
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderColor: COLORS.border,
  },
  disabledInputText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Select box (Date / Assigned To)
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  selectBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Dropdown list styling
  dropdownList: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2000,
    zIndex: 2000,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownItemText: {
    fontSize: 13.5,
    color: '#1F2937',
    fontWeight: '500',
  },

  // Save button
  saveBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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

  // Calendar Modal (iOS)
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContent: {
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
  calendarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },

  // User Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  clearSearchBtn: {
    padding: 4,
  },
  userList: {
    marginBottom: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  userCardSelected: {
    borderColor: theme.primaryColor,
    backgroundColor: theme.primaryLight,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  userInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  userEmailText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: theme.primaryColor,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primaryColor,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
});
