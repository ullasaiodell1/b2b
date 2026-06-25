import { MeetingCard } from '@/components/meeting/MeetingCard';
import { updateMeetingsState } from '@/components/meeting/MeetingState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMeetings } from '@/hooks/useMeetings';
import { MeetingRecord, MeetingStatus } from '@/types/meeting';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

export interface MeetingsComponentProps {
  leadId?: string;
  leadName?: string;
  company?: string;
  phone?: string;
  email?: string;
  isEmbedded?: boolean;
}

export function MeetingsComponent({
  leadId: propLeadId,
  leadName: propLeadName,
  company: propCompany,
  phone: propPhone,
  email: propEmail,
  isEmbedded = false,
}: MeetingsComponentProps) {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const routeParams = (route.params as any) || {};

  const leadId = propLeadId !== undefined ? propLeadId : routeParams.leadId;
  const leadName = propLeadName !== undefined ? propLeadName : routeParams.leadName;
  const company = propCompany !== undefined ? propCompany : routeParams.company;
  const phone = propPhone !== undefined ? propPhone : routeParams.phone;
  const email = propEmail !== undefined ? propEmail : routeParams.email;

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const initialDate = useRef(new Date()).current;
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDate);

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateParam = selectedDate
    ? `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`
    : undefined;

  const query = useMeetings({
    startDate: dateParam,
    lead_id: leadId,
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

  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'In Process' | 'Complete' | 'Pending'>('All');

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
    const startDayOffset = firstDayOfMonth.getDay();

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

  const handleMeetingPress = (id: string) => {
    const targetScreen = leadId ? 'lead-meeting-details' : 'meeting-details';
    (navigation as any).navigate(targetScreen, { id });
  };

  const handleAddMeetingPress = () => {
    if (leadId) {
      (navigation as any).navigate('lead-add-meeting', {
        leadId,
        leadName,
        company,
      });
    } else {
      (navigation as any).navigate('add-meeting');
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
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
      {!isEmbedded && <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPage} />}

      {/* HEADER TITLE */}
      {!isEmbedded && (
        <View style={[s.headerContainer, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16), justifyContent: 'center', position: 'relative' }]}>
          {leadId && (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
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
              <Ionicons name="refresh-outline" size={13} color={theme.primaryColor} style={{ marginRight: 3 }} />
              <Text style={s.headerResetText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* DYNAMIC CALENDAR ACCORDION */}
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
          <View style={s.monthNavRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={s.navArrow} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={s.monthLabel}>{formatMonthHeader(currentMonthDate)}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={s.navArrow} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <View style={s.monthlyGridHeader}>
            {WEEKDAYS_SINGLE.map((letter, i) => (
              <View key={`lbl-${i}`} style={s.monthlyGridHeaderCell}>
                <Text style={s.monthlyGridHeaderCellText}>{letter}</Text>
              </View>
            ))}
          </View>

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

      {/* DRAWER HANDLE */}
      <View style={s.handleWrapper}>
        <TouchableOpacity
          onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
          style={s.handleTouchArea}
          activeOpacity={0.9}
        >
          <View style={s.handleBar} />
        </TouchableOpacity>
      </View>

      {/* STATUS TAB FILTER BAR */}
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

      {/* MEETING CARDS LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: isEmbedded ? 20 : insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[theme.primaryColor]} />
        }
      >
        {isLoading && meetings.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
            <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }}>
              Loading meetings...
            </Text>
          </View>
        ) : filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onPress={() => handleMeetingPress(meeting.id)}
            />
          ))
        ) : (
          <View style={s.emptyState}>
            <Ionicons name="calendar-clear-outline" size={48} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={s.emptyStateText}>No meetings match this filter.</Text>
            <Text style={s.emptyStateSubtext}>{"Tap the \"+\" button below to schedule a new one."}</Text>
          </View>
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={[
          s.fab,
          { bottom: isEmbedded ? 20 : Math.max(insets.bottom + 90, 100) },
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
  weeklyContainer: {
    paddingVertical: 12,
    backgroundColor: COLORS.bgWhite,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyDayCol: {
    alignItems: 'center',
  },
  weeklyDayName: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  activeDayName: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  weeklyNumBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeNumBox: {
    backgroundColor: COLORS.primary,
  },
  weeklyNumText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  activeNumText: {
    color: '#FFFFFF',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  monthlyContainer: {
    paddingVertical: 12,
    backgroundColor: COLORS.bgWhite,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  navArrow: {
    padding: 6,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  monthlyGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  monthlyGridHeaderCell: {
    width: width / 7,
    alignItems: 'center',
  },
  monthlyGridHeaderCellText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  monthlyGridBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthlyGridCell: {
    width: width / 7,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  monthlyNumBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthlyNumText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  outOfMonthNumText: {
    color: '#CBD5E1',
  },
  handleWrapper: {
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  handleTouchArea: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  tabBarContainer: {
    backgroundColor: COLORS.bgPage,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
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
  backBtn: {
    position: 'absolute',
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
