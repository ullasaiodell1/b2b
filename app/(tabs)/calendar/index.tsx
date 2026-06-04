import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  primaryDark: '#204036',
  bgPage: '#FFFFFF',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#6B7280',
  border: '#E8EFEC',
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
  cardBg: '#FFFFFF',
  backdrop: 'rgba(0, 0, 0, 0.4)',
};

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

// Initial data templates
const INITIAL_MEETINGS = [
  {
    id: 'm1',
    title: 'Years of Excellence',
    time: 'Today , 11:06 am',
    team: 'Development Team',
    type: 'Video Meeting',
  },
  {
    id: 'm2',
    title: 'Client Presentation',
    time: 'Today , 11:06 am',
    team: 'Development Team',
    type: 'Video Meeting',
  },
];

const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Website Redesign',
    status: 'Completed',
    statusColor: '#10B981',
    time: '16 Feb 2026 • 10:00 AM',
    priority: 'High',
    priorityColor: '#EF4444',
    icon: 'checkmark-circle',
    priorityIcon: 'close-circle',
  },
  {
    id: 't2',
    title: 'Product Demo',
    status: 'In Progress',
    statusColor: '#3B82F6',
    time: '18 Feb 2026 • 10:00 AM',
    priority: 'Normal',
    priorityColor: '#3B82F6',
    icon: 'sync-outline',
    priorityIcon: 'checkmark-circle-outline',
  },
  {
    id: 't3',
    title: 'Api Rate Limiting Setup',
    status: 'Not Started',
    statusColor: '#6B7280',
    time: '16 Feb 2026 • 10:00 AM',
    priority: 'Lowest',
    priorityColor: '#9CA3AF',
    icon: 'ellipse-outline',
    priorityIcon: 'arrow-down-circle-outline',
  },
];

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for list data to make creation interactive
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Speed Dial FAB state
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const speedDialAnim = useRef(new Animated.Value(0)).current;

  // Trigger animations when speed dial state updates
  useEffect(() => {
    Animated.spring(speedDialAnim, {
      toValue: isSpeedDialOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [isSpeedDialOpen]);

  // Compute weekly date strip selector starting from Sunday
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      fullDate: date,
    };
  });

  // Filter tasks and meetings based on search bar text
  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Speed dial button rotation & transitions
  const mainBtnRotation = speedDialAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const speedDialScale = speedDialAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const speedDialOpacity = speedDialAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.4, 1],
  });

  const speedDialTranslation = speedDialAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  // Action handlers
  const handleOpenAddMeeting = () => {
    setIsSpeedDialOpen(false);
    router.push('/(tabs)/meeting/add-meeting' as any);
  };

  const handleOpenAddTask = () => {
    setIsSpeedDialOpen(false);
    router.push('/(tabs)/task/add-task' as any);
  };

  const handleMeetingPress = (meetingId: string) => {
    router.push({
      pathname: '/(tabs)/meeting/meeting-details',
      params: { id: meetingId },
    } as any);
  };

  const handleTaskPress = (taskId: string) => {
    router.push('/(tabs)/task' as any);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* Custom navigation bar header */}
      <CustomHeader title="Calendar" showSearch={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Search input field */}
        <View style={styles.searchSection}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Weekly date strip selector */}
        <View style={styles.dateStrip}>
          {weekDays.map((day) => {
            const isActive = isSameDay(day.fullDate, selectedDate);
            return (
              <TouchableOpacity
                key={day.fullDate.toISOString()}
                style={styles.dateBtn}
                onPress={() => setSelectedDate(day.fullDate)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateDayName, isActive && styles.dateDayNameActive]}>
                  {day.name}
                </Text>
                <View style={[styles.dateNumBox, isActive && styles.dateNumBoxActive]}>
                  <Text style={[styles.dateNum, isActive && styles.dateNumActive]}>
                    {day.date}
                  </Text>
                  {isActive && <View style={styles.activeDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Meetings Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.verticalBar} />
            <Text style={styles.sectionTitle}>MEETINGS</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.7}
            onPress={handleOpenAddMeeting}
          >
            <Ionicons name="add" size={18} color="#0D0F0E" />
          </TouchableOpacity>
        </View>

        {/* Meetings Cards */}
        {filteredMeetings.map((meeting) => (
          <TouchableOpacity
            key={meeting.id}
            style={styles.meetingCard}
            onPress={() => handleMeetingPress(meeting.id)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {meeting.title}
              </Text>
              <View style={styles.timeWrapper}>
                <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                <Text style={styles.cardTimeText}>{meeting.time}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{meeting.team}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="videocam-outline" size={14} color={COLORS.success} />
              <Text style={[styles.metaText, { color: COLORS.success, fontWeight: '700' }]}>
                {meeting.type}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Tasks Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.verticalBar} />
            <Text style={styles.sectionTitle}>TASKS</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.7}
            onPress={handleOpenAddTask}
          >
            <Ionicons name="add" size={18} color="#0D0F0E" />
          </TouchableOpacity>
        </View>

        {/* Tasks Cards */}
        {filteredTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => handleTaskPress(task.id)}
            activeOpacity={0.85}
          >
            <View style={styles.taskCardLeft}>
              <Ionicons
                name={task.icon as any}
                size={22}
                color={task.statusColor}
                style={styles.taskIcon}
              />
              <View style={styles.taskInfo}>
                <View style={styles.taskTitleRow}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: task.statusColor }]} />
                    <Text style={[styles.statusText, { color: task.statusColor }]}>
                      {task.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.taskMetaRow}>
                  <View style={styles.taskMetaItem}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.taskMetaText}>{task.time}</Text>
                  </View>

                  <View style={[styles.taskMetaItem, { marginLeft: 12 }]}>
                    <Ionicons
                      name={task.priorityIcon as any}
                      size={13}
                      color={task.priorityColor}
                    />
                    <Text style={[styles.taskMetaText, { color: task.priorityColor, fontWeight: '700' }]}>
                      {task.priority}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Speed Dial Backdrop */}
      {isSpeedDialOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setIsSpeedDialOpen(false)}
        >
          <Animated.View style={[styles.backdrop, { opacity: speedDialOpacity }]} />
        </Pressable>
      )}

      {/* Speed Dial Menu Container */}
      {isSpeedDialOpen && (
        <View
          style={[
            styles.speedDialContainer,
            { bottom: Math.max(insets.bottom + 160, 170) },
          ]}
          pointerEvents="box-none"
        >
          {/* Add Task Speed Dial Option */}
          <Animated.View
            style={[
              styles.speedDialItemWrapper,
              {
                opacity: speedDialOpacity,
                transform: [
                  { translateY: speedDialTranslation },
                  { scale: speedDialScale },
                ],
              },
            ]}
          >
            <View style={styles.speedDialLabel}>
              <Text style={styles.speedDialLabelText}>Add Task</Text>
            </View>
            <TouchableOpacity
              style={styles.speedDialBtn}
              activeOpacity={0.8}
              onPress={handleOpenAddTask}
            >
              <Ionicons name="checkbox-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          {/* Add Meeting Speed Dial Option */}
          <Animated.View
            style={[
              styles.speedDialItemWrapper,
              {
                opacity: speedDialOpacity,
                transform: [
                  { translateY: speedDialTranslation },
                  { scale: speedDialScale },
                ],
                marginBottom: 16,
              },
            ]}
          >
            <View style={styles.speedDialLabel}>
              <Text style={styles.speedDialLabelText}>Add Meeting</Text>
            </View>
            <TouchableOpacity
              style={styles.speedDialBtn}
              activeOpacity={0.8}
              onPress={handleOpenAddMeeting}
            >
              <Ionicons name="videocam-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Main Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[styles.mainFab, { bottom: Math.max(insets.bottom + 90, 100) }]}
        activeOpacity={0.85}
        onPress={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
      >
        <Animated.View style={{ transform: [{ rotate: mainBtnRotation }] }}>
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0D0F0E',
    fontWeight: '500',
    height: '100%',
    padding: 0,
  },
  dateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateBtn: {
    alignItems: 'center',
    flex: 1,
  },
  dateDayName: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  dateDayNameActive: {
    color: '#346556',
    fontWeight: '700',
  },
  dateNumBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dateNumBoxActive: {
    backgroundColor: '#346556',
  },
  dateNum: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  dateNumActive: {
    color: '#FFFFFF',
  },
  activeDot: {
    position: 'absolute',
    bottom: 3,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalBar: {
    width: 3,
    height: 16,
    backgroundColor: '#346556',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D0F0E',
    letterSpacing: 0.5,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Backdrop overlay styling
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop,
  },

  // FAB Speed Dial Layout
  mainFab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
  speedDialContainer: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 999,
  },
  speedDialItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speedDialLabel: {
    backgroundColor: '#0D0F0E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  speedDialLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  speedDialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0D0F0E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
});
