import { updateMeetingsState } from '@/components/meeting/MeetingState';
import { COLORS } from '@/constants/theme';
import { useMeetings } from '@/hooks/useMeetings';
import { MeetingRecord, MeetingStatus } from '@/types/meeting';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SINGLE = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MeetingScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    leadId?: string;
    leadName?: string;
    company?: string;
    phone?: string;
    email?: string;
  }>();
  const insets = useSafeAreaInsets();

  // 2. Date States
  // Initialize to actual today's date
  const initialDate = useRef(new Date()).current;
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDate);

  // 1. Dynamic Meeting State — filtered by selectedDate via the hook
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateParam = selectedDate
    ? `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`
    : undefined;

  const query = useMeetings({
    startDate: dateParam,
    lead_id: params.leadId,
  });

  const { isLoading, isFetching, refetch } = query;
  const rawMeetings: any[] = Array.isArray(query.data)
    ? query.data
    : (query.data?.data || query.data?.followups || query.data?.results || []);

  const meetings = rawMeetings.map((item: any): MeetingRecord => {
    const dateObj = item.scheduled_at ? new Date(item.scheduled_at) : new Date();
    const fromTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const toDateObj = new Date(dateObj);
    toDateObj.setHours(toDateObj.getHours() + 1);
    const toTime = toDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const scheduledAt = item.scheduled_at
      ? dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '';
    const scheduledDateStr = item.scheduled_at
      ? `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`
      : '';
    let status: MeetingStatus = 'Pending';
    if (item.status === 'COMPLETED') status = 'Complete';
    else if (item.status === 'IN_PROGRESS' || item.status === 'RESCHEDULED') status = 'In-Process';

    return {
      id: String(item.id || ''),
      title: item.purpose || item.follow_up_method || 'Follow-up',
      venue: item.remarks || '',
      location: item.follow_up_method || 'Hybrid',
      isAllDay: false,
      fromTime,
      toTime,
      host: item.assigned_to_name || item.lead_name || '',
      status,
      notes: item.remarks ? [item.remarks] : [],
      attachments: [],
      createdTime: item.created_at || '',
      modifiedTime: item.updated_at || '',
      purpose: item.purpose || '',
      method: item.follow_up_method || '',
      scheduledAt,
      scheduledDate: scheduledDateStr,
      leadId: item.lead_id ? String(item.lead_id) : undefined,
    };
  });

  useEffect(() => {
    if (query.data) {
      updateMeetingsState(meetings);
    }
  }, [query.data]);

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

  const isDateChanged = !isSameDay(selectedDate, initialDate) || !isSameDay(currentMonthDate, initialDate);

  const handleResetDate = () => {
    setSelectedDate(initialDate);
    setCurrentMonthDate(initialDate);
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


  // Card Press
  const handleMeetingPress = (id: string) => {
    (navigation as any).navigate('meeting-details', { id });
  };

  // FAB Press
  const handleAddMeetingPress = () => {
    if (params.leadId) {
      (navigation as any).navigate('add-meeting', {
        leadId: params.leadId,
        leadName: params.leadName,
        company: params.company,
      });
    } else {
      (navigation as any).navigate('add-meeting');
    }
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
        {params.leadId && (
          <TouchableOpacity
            onPress={() => {
              (navigation as any).navigate('leads', {
                screen: 'lead-details',
                params: {
                  id: params.leadId,
                  name: params.leadName,
                  company: params.company,
                  phone: params.phone,
                  email: params.email,
                }
              });
            }}
            style={[s.backBtn, { top: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) + 2 }]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        )}
        <View style={s.centerLogoSection}>
          <Image source={require('@/assets/images/icon.png')} style={{ width: 20, height: 20, marginRight: 6 }} resizeMode="contain" />
          <Text style={s.logoText}>BASALT</Text>
        </View>
        {isDateChanged && (
          <TouchableOpacity
            onPress={handleResetDate}
            style={[s.headerResetBtn, { top: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) + 4 }]}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={13} color={COLORS.primary} style={{ marginRight: 3 }} />
            <Text style={s.headerResetText}>Today</Text>
          </TouchableOpacity>
        )}
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
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >
        {isLoading && meetings.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }}>
              Loading meetings...
            </Text>
          </View>
        ) : filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => {
            const cfg = getStatusConfig(meeting.status);
            return (
              <TouchableOpacity
                key={meeting.id}
                style={s.card}
                activeOpacity={0.88}
                onPress={() => handleMeetingPress(meeting.id)}
              >
                {/* ── Row 1: Title + Status ─────────────────── */}
                <View style={s.cardHead}>
                  <Text style={s.cardTitle} numberOfLines={1}>
                    {meeting.title || 'Follow-up'}
                  </Text>
                  <View style={[s.statusPill, { backgroundColor: cfg.color + '18' }]}>
                    <View style={[s.statusDot, { backgroundColor: cfg.color }]} />
                    <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                {/* ── Row 2: Purpose ───────────────────────── */}
                {!!meeting.purpose && (
                  <View style={s.cardMetaRow}>
                    <Ionicons name="document-text-outline" size={13} color={COLORS.textMuted} />
                    <Text style={s.cardMetaLabel}>Purpose: </Text>
                    <Text style={s.cardMetaValue} numberOfLines={1}>{meeting.purpose}</Text>
                  </View>
                )}

                {/* ── Row 3: Method ───────────────────────── */}
                <View style={s.cardMetaRow}>
                  <Ionicons name="videocam-outline" size={13} color={COLORS.textMuted} />
                  <Text style={s.cardMetaLabel}>Method: </Text>
                  <Text style={s.cardMetaValue}>
                    {meeting.method || meeting.location || '—'}
                  </Text>
                </View>

                {/* ── Row 4: Scheduled Date & Time ─────────── */}
                <View style={s.cardMetaRow}>
                  <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                  <Text style={s.cardMetaLabel}>Scheduled: </Text>
                  <Text style={s.cardMetaValue}>
                    {meeting.scheduledAt || `${meeting.fromTime}`}
                  </Text>
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
    paddingHorizontal: 10,
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
  headerResetBtn: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  headerResetText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
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
    height: 60,
    paddingHorizontal: 1,
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
    width: 30,
    height: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeNumBox: {
    backgroundColor: COLORS.primary,
  },
  weeklyNumText: {
    fontSize: 12,
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
    paddingHorizontal: 1,
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
    height: 1,
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


  // Tab filter styling
  tabBarContainer: {
    paddingHorizontal: 8,
    marginVertical: 8,
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
    paddingVertical: 0,
    paddingHorizontal: 5,

  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
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
    marginTop: 1,
  },
  cardMetaText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  cardMetaLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  cardMetaValue: {
    fontSize: 12.5,
    color: COLORS.textDark,
    fontWeight: '600',
    flex: 1,
  },

  backBtn: {
    position: 'absolute',
    left: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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

