import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMeetings } from '@/hooks/useMeetings';
import { useTasks } from '@/hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isSameDay = (d1: Date, d2: Date) =>
  d1.getDate() === d2.getDate() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getFullYear() === d2.getFullYear();

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayTime = (dateStr?: string | null) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const getPriorityConfig = (priority?: string) => {
  const p = (priority || '').toUpperCase();
  if (p === 'HIGH' || p === 'HOT')
    return { label: 'High', color: '#EF4444', icon: 'arrow-up-circle-outline' as const };
  if (p === 'NORMAL' || p === 'MEDIUM' || p === 'WARM')
    return { label: 'Normal', color: '#3B82F6', icon: 'remove-circle-outline' as const };
  return { label: 'Low', color: '#9CA3AF', icon: 'arrow-down-circle-outline' as const };
};

const getTaskStatusConfig = (status?: string) => {
  const s = (status || '').toUpperCase().replace(/\s+/g, '_');
  if (s === 'COMPLETED' || s === 'DONE')
    return { label: 'Completed', color: '#10B981', icon: 'checkmark-circle' as const };
  if (s === 'IN_PROGRESS' || s === 'INPROGRESS')
    return { label: 'In Progress', color: '#3B82F6', icon: 'sync-outline' as const };
  if (s === 'CANCELLED' || s === 'CANCELED')
    return { label: 'Cancelled', color: '#EF4444', icon: 'close-circle-outline' as const };
  return { label: status || 'Not Started', color: '#6B7280', icon: 'ellipse-outline' as const };
};

export default function CalendarScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const speedDialAnim = useRef(new Animated.Value(0)).current;

  // ── API Queries ───────────────────────────────────────────
  const meetingsQuery = useMeetings();
  const tasksQuery = useTasks();

  const isLoading = meetingsQuery.isLoading || tasksQuery.isLoading;
  const isRefreshing = meetingsQuery.isFetching || tasksQuery.isFetching;

  const handleRefresh = () => {
    meetingsQuery.refetch();
    tasksQuery.refetch();
  };

  // ── Parse & filter by selectedDate ────────────────────────
  const allMeetings = useMemo(() => {
    const raw = meetingsQuery.data as any;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.data?.data) ? raw.data.data : []));
  }, [meetingsQuery.data]);

  const allTasks = useMemo(() => {
    const raw = tasksQuery.data as any;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.data?.data) ? raw.data.data : []));
  }, [tasksQuery.data]);

  const filteredMeetings = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return allMeetings.filter((m: any) => {
      // Use scheduled_at — the actual API field name
      const meetingDate = m.scheduled_at || m.followup_date || m.date || '';
      const matchesDate = meetingDate.startsWith(dateStr);
      const title = (m.purpose || m.title || m.subject || m.remarks || '').toLowerCase();
      return matchesDate && title.includes(searchQuery.toLowerCase());
    });
  }, [allMeetings, selectedDate, searchQuery]);

  const filteredTasks = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return allTasks.filter((t: any) => {
      // Use due_date or scheduled_date — common task API fields
      const taskDate = t.due_date || t.scheduled_date || t.date || t.created_at || '';
      const matchesDate = taskDate.startsWith(dateStr);
      const title = (t.title || t.name || t.subject || '').toLowerCase();
      return matchesDate && title.includes(searchQuery.toLowerCase());
    });
  }, [allTasks, selectedDate, searchQuery]);

  // ── Speed Dial animation ──────────────────────────────────
  useEffect(() => {
    Animated.spring(speedDialAnim, {
      toValue: isSpeedDialOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [isSpeedDialOpen]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSpeedDialOpen) { setIsSpeedDialOpen(false); return true; }
      return false;
    });
    return () => sub.remove();
  }, [isSpeedDialOpen]);

  // ── Weekly strip ──────────────────────────────────────────
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      fullDate: date,
    };
  });

  // ── Animated values ───────────────────────────────────────
  const mainBtnRotation = speedDialAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const speedDialScale = speedDialAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const speedDialOpacity = speedDialAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.4, 1] });
  const speedDialTranslation = speedDialAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  // ── Handlers ──────────────────────────────────────────────
  const handleBack = () => { navigation.goBack(); };
  const handleOpenAddMeeting = () => { setIsSpeedDialOpen(false); navigation.navigate('add-meeting'); };
  const handleOpenAddTask = () => { setIsSpeedDialOpen(false); navigation.navigate('add-task'); };
  const handleMeetingPress = (id: string) => {
    navigation.navigate('meeting', { screen: 'MeetingDetails', params: { id } } as any);
  };
  const handleTaskPress = () => { navigation.navigate('task', { screen: 'TaskIndex' } as any); };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader title="Calendar" showSearch={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[theme.primaryColor]} />
        }
      >
        {/* Search */}
        <View style={styles.searchSection}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search meetings, tasks..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Month header & Today button */}
        <View style={styles.calendarHeaderRow}>
          <TouchableOpacity style={styles.monthHeaderBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <Text style={styles.calendarHeaderTitle}>
              {selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <Ionicons name="calendar-outline" size={15} color={theme.primaryColor} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
          {!isSameDay(selectedDate, today) && (
            <TouchableOpacity onPress={() => setSelectedDate(today)} style={styles.todayResetBtn} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={13} color={theme.primaryColor} style={{ marginRight: 3 }} />
              <Text style={styles.todayResetText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Weekly strip */}
        <View style={styles.dateStrip}>
          {weekDays.map((day) => {
            const isActive = isSameDay(day.fullDate, selectedDate);
            return (
              <TouchableOpacity key={day.fullDate.toISOString()} style={styles.dateBtn} onPress={() => setSelectedDate(day.fullDate)} activeOpacity={0.7}>
                <Text style={[styles.dateDayName, isActive && styles.dateDayNameActive]}>{day.name}</Text>
                <View style={[styles.dateNumBox, isActive && styles.dateNumBoxActive]}>
                  <Text style={[styles.dateNum, isActive && styles.dateNumActive]}>{day.date}</Text>
                  {isActive && <View style={styles.activeDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
            <Text style={styles.loadingText}>Loading calendar data...</Text>
          </View>
        )}

        {/* ── MEETINGS ─────────────────────────────────── */}
        {!isLoading && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.verticalBar} />
                <Text style={styles.sectionTitle}>MEETINGS</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{filteredMeetings.length}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={handleOpenAddMeeting}>
                <Ionicons name="add" size={18} color="#0D0F0E" />
              </TouchableOpacity>
            </View>

            {filteredMeetings.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="videocam-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No meetings found</Text>
              </View>
            ) : (
              filteredMeetings.map((meeting: any, idx: number) => {
                const title = meeting.purpose || meeting.title || meeting.subject || meeting.remarks || 'Meeting';
                const team = meeting.lead_name || meeting.company_name || meeting.assigned_to_name || '—';
                const timeStr = formatDisplayTime(meeting.scheduled_at || meeting.followup_date || meeting.date);
                const type = meeting.follow_up_method || meeting.type || meeting.meeting_type || 'Follow-up';
                return (
                  <TouchableOpacity
                    key={meeting.id || idx}
                    style={styles.meetingCard}
                    onPress={() => handleMeetingPress(String(meeting.id))}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
                      <View style={styles.timeWrapper}>
                        <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                        <Text style={styles.cardTimeText}>{timeStr}</Text>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>{team}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="videocam-outline" size={14} color={COLORS.success} />
                      <Text style={[styles.metaText, { color: COLORS.success, fontWeight: '700' }]}>{type}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {/* ── TASKS ─────────────────────────────────── */}
            <View style={[styles.sectionHeader, { marginTop: 12 }]}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.verticalBar} />
                <Text style={styles.sectionTitle}>TASKS</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{filteredTasks.length}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={handleOpenAddTask}>
                <Ionicons name="add" size={18} color="#0D0F0E" />
              </TouchableOpacity>
            </View>

            {filteredTasks.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="checkbox-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No tasks for this day</Text>
              </View>
            ) : (
              filteredTasks.map((task: any, idx: number) => {
                const title = task.title || task.name || task.subject || 'Task';
                const statusCfg = getTaskStatusConfig(task.status);
                const priorityCfg = getPriorityConfig(task.priority);
                const timeStr = formatDisplayTime(task.due_date || task.scheduled_date || task.created_at);
                return (
                  <TouchableOpacity
                    key={task.id || idx}
                    style={styles.taskCard}
                    onPress={handleTaskPress}
                    activeOpacity={0.85}
                  >
                    <View style={styles.taskCardLeft}>
                      <Ionicons name={statusCfg.icon} size={22} color={statusCfg.color} style={styles.taskIcon} />
                      <View style={styles.taskInfo}>
                        <View style={styles.taskTitleRow}>
                          <Text style={styles.taskTitle} numberOfLines={1}>{title}</Text>
                          <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                          </View>
                        </View>
                        <View style={styles.taskMetaRow}>
                          <View style={styles.taskMetaItem}>
                            <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                            <Text style={styles.taskMetaText}>{timeStr || '—'}</Text>
                          </View>
                          <View style={[styles.taskMetaItem, { marginLeft: 12 }]}>
                            <Ionicons name={priorityCfg.icon} size={13} color={priorityCfg.color} />
                            <Text style={[styles.taskMetaText, { color: priorityCfg.color, fontWeight: '700' }]}>
                              {priorityCfg.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Speed Dial Backdrop */}
      {isSpeedDialOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsSpeedDialOpen(false)}>
          <Animated.View style={[styles.backdrop, { opacity: speedDialOpacity }]} />
        </Pressable>
      )}

      {/* Speed Dial Menu */}
      {isSpeedDialOpen && (
        <View style={[styles.speedDialContainer, { bottom: Math.max(insets.bottom + 190, 200) }]} pointerEvents="box-none">
          <Animated.View style={[styles.speedDialItemWrapper, { opacity: speedDialOpacity, transform: [{ translateY: speedDialTranslation }, { scale: speedDialScale }] }]}>
            <View style={styles.speedDialLabel}><Text style={styles.speedDialLabelText}>Add Task</Text></View>
            <TouchableOpacity style={styles.speedDialBtn} activeOpacity={0.8} onPress={handleOpenAddTask}>
              <Ionicons name="checkbox-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.speedDialItemWrapper, { opacity: speedDialOpacity, transform: [{ translateY: speedDialTranslation }, { scale: speedDialScale }], marginBottom: 16 }]}>
            <View style={styles.speedDialLabel}><Text style={styles.speedDialLabelText}>Add Meeting</Text></View>
            <TouchableOpacity style={styles.speedDialBtn} activeOpacity={0.8} onPress={handleOpenAddMeeting}>
              <Ionicons name="videocam-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.mainFab, { bottom: Math.max(insets.bottom + 120, 130) }]}
        activeOpacity={0.85}
        onPress={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
      >
        <Animated.View style={{ transform: [{ rotate: mainBtnRotation }] }}>
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>

      {/* Date Picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showDatePicker}>
            <TouchableOpacity style={styles.calendarOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
              <View style={styles.calendarContent}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="inline"
                  onChange={(_: any, date?: Date) => { if (date) setSelectedDate(date); }}
                />
                <TouchableOpacity style={[styles.modalDoneBtn, { marginTop: 10 }]} onPress={() => setShowDatePicker(false)} activeOpacity={0.8}>
                  <Text style={styles.modalDoneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(_: any, date?: Date) => { setShowDatePicker(false); if (date) setSelectedDate(date); }}
          />
        )
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgWhite },
  scrollContainer: { paddingVertical: 5, paddingHorizontal: 5, gap: 5 },
  loadingArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  loadingText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  emptyBox: { alignItems: 'center', paddingVertical: 20, gap: 6, opacity: 0.6 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5, marginBottom: 5 },
  calendarHeaderTitle: { fontSize: 15, fontWeight: '800', color: '#0D0F0E' },
  todayResetBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primaryLight, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 12 },
  todayResetText: { fontSize: 11, fontWeight: '800', color: theme.primaryColor },
  monthHeaderBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  calendarOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  calendarContent: { backgroundColor: COLORS.bgWhite, borderRadius: 10, padding: 16, width: '100%', maxWidth: 320, gap: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  modalDoneBtn: { backgroundColor: theme.primaryColor, borderRadius: 10, height: 38, alignItems: 'center', justifyContent: 'center', marginTop: 14, shadowColor: theme.primaryColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  modalDoneBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#0D0F0E', fontWeight: '500', height: '100%', padding: 0 },
  dateStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  dateBtn: { alignItems: 'center', flex: 1 },
  dateDayName: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginBottom: 6, textTransform: 'capitalize' },
  dateDayNameActive: { color: theme.primaryColor, fontWeight: '700' },
  dateNumBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dateNumBoxActive: { backgroundColor: theme.primaryColor },
  dateNum: { fontSize: 14, fontWeight: '700', color: '#000000' },
  dateNumActive: { color: '#FFFFFF' },
  activeDot: { position: 'absolute', bottom: 3, width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 1 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verticalBar: { width: 3, height: 16, backgroundColor: theme.primaryColor, borderRadius: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0D0F0E', letterSpacing: 0.5 },
  countBadge: { backgroundColor: theme.primaryLight, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 10 },
  countBadgeText: { fontSize: 11, fontWeight: '800', color: theme.primaryColor },
  addButton: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  meetingCard: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 10, gap: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, flex: 1, marginRight: 8 },
  timeWrapper: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardTimeText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12.5, color: COLORS.textMuted, fontWeight: '600' },
  taskCard: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  taskCardLeft: { flexDirection: 'row', alignItems: 'center' },
  taskIcon: { marginRight: 12 },
  taskInfo: { flex: 1 },
  taskTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  taskTitle: { fontSize: 14.5, fontWeight: '700', color: COLORS.textDark, flex: 1, marginRight: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center' },
  taskMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  taskMetaText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  speedDialContainer: { position: 'absolute', right: 20, alignItems: 'flex-end', gap: 12 },
  speedDialItemWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  speedDialLabel: { backgroundColor: '#FFFFFF', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  speedDialLabelText: { fontSize: 13, fontWeight: '700', color: '#0D0F0E' },
  speedDialBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.primaryColor, alignItems: 'center', justifyContent: 'center', shadowColor: theme.primaryColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  mainFab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primaryColor, alignItems: 'center', justifyContent: 'center', shadowColor: theme.primaryColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10, zIndex: 100 },
});
