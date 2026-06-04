import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { meetingsState, subscribeToMeetings, MeetingRecord } from '@/components/MeetingState';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SINGLE = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MeetingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 1. Dynamic Meeting State
  const [meetings, setMeetings] = useState<MeetingRecord[]>(meetingsState);
  useEffect(() => {
    return subscribeToMeetings(() => {
      setMeetings([...meetingsState]);
    });
  }, []);

  // 2. Date States
  // Initialize to March 16, 2026 to match the screenshots exactly
  const initialDate = new Date(2026, 2, 16);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDate);

  // 3. Tab Filter State
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'In Process' | 'Complete' | 'Pending'>('All');

  // 4. Calendar Expansion Animation State
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: isCalendarExpanded ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [isCalendarExpanded]);

  // Calendar heights & opacities
  const calendarHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [74, 280],
  });

  const weeklyOpacity = heightAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  const monthlyOpacity = heightAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  // 5. Calendar Helper Functions
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const getWeekDays = (baseDate: Date) => {
    const sunday = new Date(baseDate);
    // Find Sunday of this week
    sunday.setDate(baseDate.getDate() - baseDate.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  };

  const getMonthGridDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOffset = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // First cell in the 6x7 grid (can be in previous month)
    const startDate = new Date(year, month, 1 - startDayOffset);
    return Array.from({ length: 42 }).map((_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d;
    });
  };

  const formatMonthHeader = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatWeekRangeText = (date: Date) => {
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    
    const fmt = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    };
    return `${fmt(sunday)} – ${fmt(saturday)}`;
  };

  // Navigators
  const handlePrevMonth = () => {
    const prev = new Date(currentMonthDate);
    prev.setMonth(currentMonthDate.getMonth() - 1);
    setCurrentMonthDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonthDate);
    next.setMonth(currentMonthDate.getMonth() + 1);
    setCurrentMonthDate(next);
  };

  const handleResetDate = () => {
    setSelectedDate(initialDate);
    setCurrentMonthDate(initialDate);
  };

  // Card Press
  const handleMeetingPress = (id: string) => {
    router.push({
      pathname: '/(tabs)/meeting/meeting-details',
      params: { id },
    } as any);
  };

  // FAB Press
  const handleAddMeetingPress = () => {
    router.push('/(tabs)/meeting/add-meeting' as any);
  };

  // Status-specific mapping helpers
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Complete':
      case 'Completed':
        return { color: COLORS.success, label: 'Completed' };
      case 'In-Process':
      case 'In Process':
        return { color: COLORS.info, label: 'In Process' };
      case 'Pending':
      default:
        return { color: COLORS.danger, label: 'Pending' };
    }
  };

  const getMeetingType = (meeting: MeetingRecord) => {
    const titleLower = meeting.title.toLowerCase();
    if (titleLower.includes('demo')) return 'Demo Meeting';
    if (titleLower.includes('support') || titleLower.includes('issue')) return 'In-Person Meeting';
    if (meeting.location === 'Online') return 'Video Meeting';
    if (meeting.location === 'In-Person') return 'In-Person Meeting';
    return 'Video Meeting'; // Default fallback matching the screenshots
  };

  // 6. Data Filtering Logic
  const filteredMeetings = meetings.filter((meeting) => {
    // A. Filter by Tab status
    if (activeTab !== 'All') {
      const normalizedStatus = meeting.status === 'Complete' ? 'Completed' : meeting.status;
      const normalizedTab = activeTab === 'Complete' ? 'Completed' : activeTab;
      if (normalizedTab === 'Upcoming') {
        if (meeting.status !== 'Pending') return false;
      } else if (normalizedStatus !== normalizedTab) {
        return false;
      }
    }
    return true;
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPage} />
      
      {/* ── 1. HEADER TITLE ────────────────────────── */}
      <View style={[s.headerContainer, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16), justifyContent: 'center', position: 'relative' }]}>
        <View style={s.centerLogoSection}>
          <Ionicons name="star" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={s.logoText}>BASALT</Text>
        </View>
      </View>

      {/* ── 2. DYNAMIC CALENDAR ACCORDION ────────── */}
      <Animated.View style={[s.calendarWrapper, { height: calendarHeight }]}>
        
        {/* COLLAPSED WEEKLY STRIP */}
        <Animated.View style={[s.weeklyContainer, { opacity: weeklyOpacity, pointerEvents: isCalendarExpanded ? 'none' : 'auto' }]}>
          <View style={s.weeklyRow}>
            {getWeekDays(selectedDate).map((day, index) => {
              const isActive = isSameDay(day, selectedDate);
              return (
                <TouchableOpacity
                  key={`week-${index}`}
                  style={s.weeklyDayCol}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedDate(day);
                    setCurrentMonthDate(day);
                  }}
                >
                  <Text style={[s.weeklyDayName, isActive && s.activeDayName]}>
                    {WEEKDAYS_SHORT[day.getDay()]}
                  </Text>
                  <View style={[s.weeklyNumBox, isActive && s.activeNumBox]}>
                    <Text style={[s.weeklyNumText, isActive && s.activeNumText]}>
                      {day.getDate()}
                    </Text>
                    {isActive && <View style={s.activeDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* EXPANDED MONTHLY GRID */}
        <Animated.View style={[s.monthlyContainer, { opacity: monthlyOpacity, pointerEvents: isCalendarExpanded ? 'auto' : 'none' }]}>
          {/* Month Navigator Header */}
          <View style={s.monthNavRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={s.navArrow} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={s.monthLabel}>{formatMonthHeader(currentMonthDate)}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={s.navArrow} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels Header Row */}
          <View style={s.monthlyGridHeader}>
            {WEEKDAYS_SINGLE.map((letter, i) => (
              <View key={`lbl-${i}`} style={s.monthlyGridHeaderCell}>
                <Text style={s.monthlyGridHeaderCellText}>{letter}</Text>
              </View>
            ))}
          </View>

          {/* Grid Cells (6 rows x 7 days) */}
          <View style={s.monthlyGridBody}>
            {getMonthGridDays(currentMonthDate).map((day, i) => {
              const isActive = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === currentMonthDate.getMonth();
              return (
                <TouchableOpacity
                  key={`month-cell-${i}`}
                  style={s.monthlyGridCell}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedDate(day);
                    setCurrentMonthDate(day);
                  }}
                >
                  <View style={[s.monthlyNumBox, isActive && s.activeNumBox]}>
                    <Text
                      style={[
                        s.monthlyNumText,
                        isActive && s.activeNumText,
                        !isActive && !isCurrentMonth && s.outOfMonthNumText,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

      </Animated.View>

      {/* ── 3. DRAWER HANDLE / COLLAPSE PILL ─────── */}
      <View style={s.handleWrapper}>
        <TouchableOpacity
          onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
          style={s.handleTouchArea}
          activeOpacity={0.9}
        >
          <View style={s.handleBar} />
        </TouchableOpacity>
      </View>

      {/* ── 4. DATE RANGE SELECTOR & RESET (Collapsed Only) ── */}
      {!isCalendarExpanded && (
        <View style={s.filterRow}>
          <TouchableOpacity 
            style={s.dropdownBox} 
            activeOpacity={0.8}
            onPress={() => setIsCalendarExpanded(true)}
          >
            <Text style={s.dropdownText}>{formatWeekRangeText(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={s.resetBtn} onPress={handleResetDate} activeOpacity={0.8}>
            <Text style={s.resetText}>Reset</Text>
            <Ionicons name="reload-outline" size={14} color={COLORS.textDark} style={s.resetIcon} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── 5. STATUS TAB FILTER BAR ────────────────── */}
      <View style={s.tabBarContainer}>
        <View style={s.tabBar}>
          {(isCalendarExpanded
            ? (['All', 'Upcoming', 'In Process', 'Complete'] as const)
            : (['All', 'In Process', 'Complete', 'Pending'] as const)
          ).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[s.tabButton, isActive && s.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabButtonText, isActive && s.tabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── 6. MEETING CARDS LIST ────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => {
            const cfg = getStatusConfig(meeting.status);
            return (
              <TouchableOpacity
                key={meeting.id}
                style={s.card}
                activeOpacity={0.88}
                onPress={() => handleMeetingPress(meeting.id)}
              >
                {/* Header Row: Title & Status */}
                <View style={s.cardHead}>
                  <Text style={s.cardTitle} numberOfLines={1}>{meeting.title}</Text>
                  <View style={s.statusPill}>
                    <View style={[s.statusDot, { backgroundColor: cfg.color }]} />
                    <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                {/* Team / Host Row */}
                <View style={s.cardMetaRow}>
                  <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
                  <Text style={s.cardMetaText}>{meeting.host || 'Development Team'}</Text>
                </View>

                {/* Footer Row: Type (Left) & Time (Right) */}
                <View style={s.cardMetaRowSpace}>
                  <View style={s.cardMetaRow}>
                    <Ionicons name="videocam-outline" size={13} color={COLORS.textMuted} />
                    <Text style={s.cardMetaText}>{getMeetingType(meeting)}</Text>
                  </View>
                  <View style={s.cardMetaRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                    <Text style={s.cardMetaText}>Today , {meeting.fromTime || '11:06 am'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={s.emptyState}>
            <Ionicons name="calendar-clear-outline" size={48} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={s.emptyStateText}>No meetings match this filter.</Text>
            <Text style={s.emptyStateSubtext}>{"Tap the \"+\" button below to schedule a new one."}</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── 7. FLOATING ACTION BUTTON (FAB) ─────── */}
      <TouchableOpacity
        style={[
          s.fab,
          { bottom: Math.max(insets.bottom + 90, 100) },
        ]}
        activeOpacity={0.85}
        onPress={handleAddMeetingPress}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  headerContainer: {
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  centerLogoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 2,
  },
  calendarWrapper: {
    backgroundColor: COLORS.bgPage,
    overflow: 'hidden',
  },

  // Weekly collapsed styling
  weeklyContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 74,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyDayCol: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  activeDayName: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  weeklyNumBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeNumBox: {
    backgroundColor: COLORS.primary,
  },
  weeklyNumText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  activeNumText: {
    color: '#FFFFFF',
    transform: [{ translateY: -2 }],
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },

  // Monthly expanded styling
  monthlyContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 280,
    paddingHorizontal: 16,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 36,
    marginBottom: 8,
  },
  navArrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  monthlyGridHeader: {
    flexDirection: 'row',
    height: 30,
    backgroundColor: '#EDF3F1',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  monthlyGridHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthlyGridHeaderCellText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  monthlyGridBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthlyGridCell: {
    width: `${100 / 7}%`,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  monthlyNumBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthlyNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  outOfMonthNumText: {
    color: '#D1D5DB',
  },

  // Capsule handles
  handleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgPage,
    height: 18,
  },
  handleTouchArea: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5D0CB',
  },

  // Dropdown Row
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 12,
  },
  dropdownBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 38,
  },
  dropdownText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 38,
    gap: 6,
  },
  resetText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  resetIcon: {
    transform: [{ translateY: 0.5 }],
  },

  // Tab filter styling
  tabBarContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
    backgroundColor: COLORS.bgPage,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EDF3F1',
    borderRadius: 14,
    padding: 4,
    height: 44,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },

  // Scroll listings
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaRowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cardMetaText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // FAB
  fab: {
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
    zIndex: 100,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
