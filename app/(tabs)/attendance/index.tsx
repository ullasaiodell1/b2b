import {
  attendanceState,
  AttendanceState,
  subscribeToAttendance,
} from '@/components/attendance/AttendanceState';
import CustomHeader from '@/components/custom/CustomHeader';
import { MonthYearPicker } from '@/components/custom/MonthYearPicker';
import RichTextEditor from '@/components/RichTextEditor';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAttendanceHistory, useAttendanceStatus } from '@/hooks/useAttendance';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import {
  AttendanceHistoryParams,
  AttendanceHistoryQueryParams,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceStatusResponse,
} from '@/types/attendance';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Helper: map backend status to frontend AttendanceStatus ──────────
export function mapBackendStatusToFrontend(backendStatusStr: string | null | undefined, isCheckedIn?: boolean): AttendanceStatus {
  if (!backendStatusStr) {
    return isCheckedIn ? 'present' : 'not_marked';
  }
  const upper = backendStatusStr.toUpperCase();
  if (
    upper === 'PRESENT' ||
    upper === 'ON_TIME' ||
    upper === 'HALF_DAY' ||
    upper === 'LATE'
  ) {
    return 'present';
  } else if (upper === 'LEAVE') {
    return 'leave';
  } else if (upper === 'ABSENT') {
    return 'absent';
  }
  return isCheckedIn ? 'present' : 'not_marked';
}

// ── Helper: map backend summary → local AttendanceState ──────────────
export function mapStatusToState(data: AttendanceStatusResponse): Partial<AttendanceState> {
  const formatTime = (raw: string | null): string => {
    if (!raw) return '--:--';
    // Handle ISO or "HH:mm" strings
    if (raw.includes('T')) {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return '--:--';
      // Shift to IST timezone (+5.5 hours)
      const istDate = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
      const h = String(istDate.getUTCHours()).padStart(2, '0');
      const m = String(istDate.getUTCMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }
    return raw;
  };

  // Calculate today's work time dynamically
  let workTime = data.work_duration || '--';
  if ((!data.work_duration || data.work_duration === '--') && data.check_in_time) {
    const parseTime = (raw: string | null): Date | null => {
      if (!raw) return null;
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    };
    const inDate = parseTime(data.check_in_time);
    if (inDate) {
      const outDate = parseTime(data.check_out_time) || new Date();
      const diffMs = outDate.getTime() - inDate.getTime();
      if (diffMs > 0) {
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const remainingMins = diffMins % 60;
        workTime = diffHours === 0 ? `${remainingMins}m` : `${diffHours}h ${remainingMins}m`;
      } else {
        workTime = '0m';
      }
    }
  }

  return {
    stampedIn: data.is_checked_in,
    stampedOut: data.is_checked_out,
    inTime: formatTime(data.check_in_time),
    outTime: formatTime(data.check_out_time),
    workTime,
    inPhoto: data.checkin_image ?? null,
    outPhoto: data.checkout_image ?? null,
    inLocation: data.checkin_location ?? null,
    outLocation: data.checkout_location ?? null,
    attendanceStatus: mapBackendStatusToFrontend(data.attendance_status, data.is_checked_in),
  };
}

// ── Helper: map backend record → AttendanceStatusResponse ──────────────
export function mapRecordToStatusResponse(row: any): AttendanceStatusResponse {
  if (!row) {
    return {
      is_checked_in: false,
      is_checked_out: false,
      check_in_time: null,
      check_out_time: null,
      work_duration: null,
      checkin_image: null,
      checkout_image: null,
      checkin_location: null,
      checkout_location: null,
      attendance_status: null,
    };
  }

  // Row status can be CHECKED_IN or CHECKED_OUT
  const isCheckedIn = row.status === 'CHECKED_IN' || row.status === 'CHECKED_OUT';
  const isCheckedOut = row.status === 'CHECKED_OUT';

  return {
    is_checked_in: isCheckedIn,
    is_checked_out: isCheckedOut,
    check_in_time: row.checkin_time || null,
    check_out_time: row.checkout_time || null,
    work_duration: row.work_duration || null,
    checkin_image: row.checkin_image_url || row.checkin_image || null,
    checkout_image: row.checkout_image_url || row.checkout_image || null,
    checkin_location: row.checkin_location || null,
    checkout_location: row.checkout_location || null,
    attendance_status: row.attendance_status || null,
  };
}

// ── Helper: parse UTC timestamp to IST timezone ────────────────────
const parseDateInIST = (raw: string | null): Date | null => {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  if (raw.length === 10 && raw.indexOf('-') === 4) {
    return new Date(`${raw}T12:00:00Z`);
  }
  return new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
};

// ── Helper: map backend record → local AttendanceRecord ─────────────
export function mapBackendRecordToFrontend(row: any): AttendanceRecord {
  const checkinDate = parseDateInIST(row.checkin_time);
  const checkoutDate = parseDateInIST(row.checkout_time);

  // Day name (e.g. "Monday")
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = checkinDate ? dayNames[checkinDate.getUTCDay()] : '--';

  // Date (e.g. "22 Jun")
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = checkinDate ? `${checkinDate.getUTCDate()} ${monthNamesShort[checkinDate.getUTCMonth()]}` : '--';

  // Map status:
  const status = mapBackendStatusToFrontend(row.attendance_status, row.status === 'CHECKED_IN' || row.status === 'CHECKED_OUT');

  // Format times as HH:mm
  const formatTime = (d: Date | null): string => {
    if (!d) return '--:--';
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const inTime = row.checkin_time && row.status !== 'MISSED' ? formatTime(checkinDate) : '--:--';
  const outTime = checkoutDate ? formatTime(checkoutDate) : '--:--';

  // Calculate work duration
  let workTime = '--';
  if (checkinDate && checkoutDate) {
    const diffMs = checkoutDate.getTime() - checkinDate.getTime();
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      workTime = diffHours === 0 ? `${remainingMins}m` : `${diffHours}h ${remainingMins}m`;
    }
  }

  return {
    id: row.id,
    day,
    date: dateStr,
    status,
    inTime,
    outTime,
    workTime,
    inPhoto: row.checkin_image_url || row.checkin_image || null,
    outPhoto: row.checkout_image_url || row.checkout_image || null,
  };
}

export function buildAttendanceHistoryParams(params?: AttendanceHistoryParams): AttendanceHistoryQueryParams {
  const queryParams: AttendanceHistoryQueryParams = {};
  if (!params) return queryParams;

  if (params.user_id) {
    queryParams.user_id = params.user_id;
  }
  if (params.attendance_status) {
    queryParams.attendance_status = params.attendance_status;
  }
  if (params.month && params.year) {
    const { month, year } = params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month

    const pad = (n: number) => String(n).padStart(2, '0');
    queryParams.startDate = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
    queryParams.endDate = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
  }
  return queryParams;
}

type StatusFilter = 'All' | 'Present' | 'Absent' | 'Leave' | 'Half Day' | 'On Time' | 'Late';


function StatusBadge({ status }: { status: AttendanceStatus }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const config = {
    present: { label: 'Present', bg: '#DCFCE7', text: '#15803D' },
    absent: { label: 'Absent', bg: '#FEE2E2', text: '#B91C1C' },
    leave: { label: 'Leave', bg: '#E0F2FE', text: '#0369A1' },
    working: { label: 'Working', bg: '#DCFCE7', text: '#15803D' },
    not_marked: { label: 'Not Marked', bg: '#F3F4F6', text: '#6B7280' },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusBadgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function useAttendance() {
  const [attendance, setAttendance] = useState<AttendanceState>(attendanceState);

  useEffect(() => {
    return subscribeToAttendance(() => {
      setAttendance({ ...attendanceState });
    });
  }, []);

  return {
    attendance,
  };
}

export default function AttendanceScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportHtml, setReportHtml] = useState('');
  const [reportInitialized, setReportInitialized] = useState(false);

  const { profile } = useProfile();
  const tasksQuery = useTasks(
    profile?.id
      ? { assigned_to: profile.id, status: 'COMPLETED' }
      : undefined,
  );

  // Dynamic date for today
  const formattedToday = React.useMemo(() => {
    const d = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  // Status query syncs local AttendanceState automatically via the hook's onSuccess
  const statusQuery = useAttendanceStatus();
  const historyQuery = useAttendanceHistory(
    selectedMonth.getMonth() + 1,
    selectedMonth.getFullYear(),
    statusFilter === 'All' ? undefined : statusFilter,
  );

  useFocusEffect(
    React.useCallback(() => {
      statusQuery.refetch();
      historyQuery.refetch();
    }, [statusQuery, historyQuery])
  );

  useEffect(() => {
    if (!reportModalVisible) {
      // Reset so next open re-initialises
      setReportInitialized(false);
      setReportHtml('');
      return;
    }

    // Wait until profile is loaded and tasks query has settled
    if (reportInitialized) return;
    if (!profile?.id) return;
    if (tasksQuery.isLoading || tasksQuery.isFetching) return;

    const rawTasks = tasksQuery.data;
    const tasksList: any[] = Array.isArray(rawTasks)
      ? rawTasks
      : Array.isArray((rawTasks as any)?.data)
        ? (rawTasks as any).data
        : [];

    if (tasksList.length > 0) {
      const lines: string[] = [];
      tasksList.forEach((t: any) => {
        lines.push(`• ${t.title || 'No Title'}`);
        if (t.description && t.description.trim()) {
          lines.push(`  ${t.description.trim()}`);
        }
        lines.push('');
      });
      const formattedHtml = lines
        .map((line) => line.trim() ? `<p>${line}</p>` : '<br/>')
        .join('');
      setReportHtml(formattedHtml);
    } else {
      setReportHtml('');
    }
    setReportInitialized(true);
  }, [reportModalVisible, reportInitialized, profile?.id, tasksQuery.data, tasksQuery.isLoading, tasksQuery.isFetching]);

  const { attendance: attState } = useAttendance();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedMonth = `${monthNames[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;

  const handlePunchIn = () => {
    if (attState.stampedIn) return;
    router.push({
      pathname: '/camera-capture',
      params: { sourceScreen: 'Attendance', attendanceAction: 'in' },
    });
  };

  const handlePunchOut = () => {
    if (!attState.stampedIn || attState.stampedOut) return;
    // Do NOT clear reportHtml here — the useEffect will build it from tasks
    setReportInitialized(false);
    setReportModalVisible(true);
  };

  const handleConfirmPunchOut = () => {
    setReportModalVisible(false);
    router.push({
      pathname: '/camera-capture',
      params: {
        sourceScreen: 'Attendance',
        attendanceAction: 'out',
        extra: reportHtml,
      },
    });
  };

  const todayStatus: AttendanceStatus = (attState.stampedIn && !attState.stampedOut)
    ? 'working'
    : (attState.attendanceStatus || (attState.stampedOut
      ? 'present'
      : 'not_marked'));

  const historyData: AttendanceRecord[] = historyQuery.data ?? [];

  const STATUS_OPTIONS: StatusFilter[] = ['All', 'Present', 'Absent', 'Leave', 'Half Day', 'On Time', 'Late'];

  const statusBadgeColor = (s: StatusFilter) => {
    switch (s) {
      case 'Present':
      case 'On Time': return { bg: '#DCFCE7', text: '#15803D' };
      case 'Absent': return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'Leave': return { bg: '#E0F2FE', text: '#0369A1' };
      case 'Half Day': return { bg: '#FFF7ED', text: '#C2410C' };
      case 'Late': return { bg: '#FEF3C7', text: '#D97706' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader title="Attendance" showSearch={false} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={statusQuery.isFetching || historyQuery.isFetching}
            onRefresh={() => {
              statusQuery.refetch();
              historyQuery.refetch();
            }}
            colors={[theme.primaryColor]}
            tintColor={theme.primaryColor}
          />
        }
      >
        {/* ── TODAY'S ATTENDANCE CARD ────────────────── */}
        <View style={styles.card}>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <Text style={styles.datePickerText}>{formattedToday}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {attState.stampedIn && (
                <View style={[styles.statusBadge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.statusBadgeText, { color: theme.primaryColor }]}>
                    Work: {attState.workTime}
                  </Text>
                </View>
              )}
              <StatusBadge status={todayStatus} />
            </View>
          </View>

          {/* Punch In / Out — Photo or Button */}
          <View style={styles.photosRow}>

            {/* ── LEFT: Punch In ── */}
            <View style={styles.photoContainer}>
              <Text style={styles.photoBoxTitle}>
                Punch In{attState.inTime !== '--:--' ? `: ${attState.inTime}` : ''}
              </Text>
              {attState.stampedIn ? (
                /* After punch-in: show the captured photo */
                attState.inPhoto ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.photoTouchable}
                    onPress={() => setSelectedImage(attState.inPhoto)}
                  >
                    <Image source={{ uri: attState.inPhoto }} style={styles.capturedPhoto} />
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.photoPlaceholder, { borderStyle: 'solid' }]}>
                    <Ionicons name="checkmark-circle" size={26} color={theme.primaryColor} />
                    <Text style={[styles.photoPlaceholderText, { color: theme.primaryColor }]}>
                      Punched In
                    </Text>
                  </View>
                )
              ) : (
                /* Before punch-in: show the Punch In button */
                <TouchableOpacity
                  onPress={handlePunchIn}
                  style={[styles.photoActionBtn, { backgroundColor: theme.primaryColor }]}
                  activeOpacity={0.85}
                >
                  <Ionicons name="log-in-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.photoActionBtnText}>Punch In</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── RIGHT: Punch Out ── */}
            <View style={styles.photoContainer}>
              <Text style={styles.photoBoxTitle}>
                Punch Out{attState.outTime !== '--:--' ? `: ${attState.outTime}` : ''}
              </Text>
              {attState.stampedOut ? (
                /* After punch-out: show the captured photo */
                attState.outPhoto ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.photoTouchable}
                    onPress={() => setSelectedImage(attState.outPhoto)}
                  >
                    <Image source={{ uri: attState.outPhoto }} style={styles.capturedPhoto} />
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.photoPlaceholder, { borderStyle: 'solid' }]}>
                    <Ionicons name="checkmark-circle" size={26} color={COLORS.danger} />
                    <Text style={[styles.photoPlaceholderText, { color: COLORS.danger }]}>
                      Punched Out
                    </Text>
                  </View>
                )
              ) : (
                /* Before punch-out: show the Punch Out button */
                <TouchableOpacity
                  onPress={handlePunchOut}
                  disabled={!attState.stampedIn}
                  style={[
                    styles.photoActionBtn,
                    { backgroundColor: !attState.stampedIn ? '#F3F4F6' : COLORS.danger },
                  ]}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={22}
                    color={!attState.stampedIn ? COLORS.textMuted : '#FFFFFF'}
                  />
                  <Text style={[
                    styles.photoActionBtnText,
                    { color: !attState.stampedIn ? COLORS.textMuted : '#FFFFFF' },
                  ]}>
                    Punch Out
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Dynamic Location Display */}
          {(attState.inLocation || attState.outLocation) && (
            <View style={styles.locationRow}>
              {attState.inLocation && (
                <View style={styles.locationSubCol}>
                  <Ionicons name="location-outline" size={13} color={theme.primaryColor} />
                  <Text style={styles.locationValueText} numberOfLines={1}>
                    In: {attState.inLocation}
                  </Text>
                </View>
              )}
              {attState.outLocation && (
                <View style={styles.locationSubCol}>
                  <Ionicons name="location-outline" size={13} color={COLORS.danger} />
                  <Text style={styles.locationValueText} numberOfLines={1}>
                    Out: {attState.outLocation}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── ATTENDANCE HISTORY ────────────────────── */}
        <View style={styles.historySection}>
          {/* Section Header */}
          <View style={styles.historyHeader}>
            <Text style={styles.historySectionTitle}>ATTENDANCE HISTORY</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {/* Status Filter Button */}
              <TouchableOpacity style={styles.monthPicker} onPress={() => setStatusModalVisible(true)}>
                <Ionicons name="filter-outline" size={14} color={theme.primaryColor} />
                <Text style={styles.monthPickerText}>{statusFilter}</Text>
                <Ionicons name="chevron-down" size={12} color={theme.primaryColor} />
              </TouchableOpacity>
              {/* Month Picker Button */}
              <TouchableOpacity style={styles.monthPicker} onPress={() => setPickerVisible(true)}>
                <Ionicons name="calendar-outline" size={14} color={theme.primaryColor} />
                <Text style={styles.monthPickerText}>{formattedMonth}</Text>
                <Ionicons name="chevron-down" size={12} color={theme.primaryColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* History Cards List */}
          {historyQuery.isLoading ? (
            <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginTop: 24 }} />
          ) : historyData.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textMuted, marginTop: 8, fontSize: 13, fontWeight: '600' }}>
                No {statusFilter === 'All' ? 'attendance' : statusFilter.toLowerCase()} records found
              </Text>
            </View>
          ) : historyData.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="calendar-outline" size={16} color={theme.primaryColor} />
                  <Text style={styles.historyDateText}>
                    {item.day}, {item.date}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.historyDetailsGrid}>
                {item.inPhoto ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.historyDetailCell}
                    onPress={() => setSelectedImage(item.inPhoto)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Text style={styles.historyDetailLabel}>In-time</Text>
                      <Ionicons name="image-outline" size={10} color={theme.primaryColor} />
                    </View>
                    <Text style={[styles.historyDetailValue, { color: theme.primaryColor }]}>
                      {item.inTime}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.historyDetailCell}>
                    <Text style={styles.historyDetailLabel}>In-time</Text>
                    <Text style={styles.historyDetailValue}>{item.inTime}</Text>
                  </View>
                )}

                {item.outPhoto ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.historyDetailCell}
                    onPress={() => setSelectedImage(item.outPhoto)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Text style={styles.historyDetailLabel}>Out-time</Text>
                      <Ionicons name="image-outline" size={10} color={theme.primaryColor} />
                    </View>
                    <Text style={[styles.historyDetailValue, { color: theme.primaryColor }]}>
                      {item.outTime}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.historyDetailCell}>
                    <Text style={styles.historyDetailLabel}>Out-time</Text>
                    <Text style={styles.historyDetailValue}>{item.outTime}</Text>
                  </View>
                )}

                <View style={styles.historyDetailCell}>
                  <Text style={styles.historyDetailLabel}>Work-time</Text>
                  <Text style={[styles.historyDetailValue, item.workTime !== '--' && { color: theme.primaryColor }]}>
                    {item.workTime}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <MonthYearPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        selectedDate={selectedMonth}
        onSelect={(date) => {
          setSelectedMonth(date);
          setPickerVisible(false);
        }}
      />

      {/* ── STATUS FILTER MODAL ── */}
      <Modal visible={statusModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = statusFilter === opt;
              const colors = statusBadgeColor(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.statusOptionRow,
                    isSelected && styles.statusOptionRowActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setStatusFilter(opt);
                    setStatusModalVisible(false);
                  }}
                >
                  <View style={[styles.statusOptionDot, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusOptionDotText, { color: colors.text }]}>
                      {opt === 'All' ? '●' : opt[0]}
                    </Text>
                  </View>
                  <Text style={[
                    styles.statusOptionText,
                    isSelected && { color: theme.primaryColor, fontWeight: '800' },
                  ]}>
                    {opt}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.primaryColor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* ── FULL SCREEN IMAGE MODAL ── */}
      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity style={styles.fullScreenCloseBtn} onPress={() => setSelectedImage(null)} activeOpacity={0.75}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* ── DAILY UPDATE REPORT MODAL (FULL SCREEN) ── */}
      <Modal visible={reportModalVisible} transparent={false} animationType="slide" onRequestClose={() => setReportModalVisible(false)}>
        <View style={[styles.fullScreenReportContainer, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16), paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
          <View style={styles.fullScreenReportHeader}>
            <TouchableOpacity onPress={() => setReportModalVisible(false)} style={styles.modalCloseBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#0D0F0E" />
            </TouchableOpacity>
            <Text style={styles.fullScreenReportTitle}>DAILY UPDATE REPORT</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.fullScreenReportContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.fullScreenReportSubtitle}>
              Please write a summary of the tasks and updates completed today before punching out.
            </Text>

            {(tasksQuery.isLoading || tasksQuery.isFetching || !reportInitialized) && reportModalVisible ? (
              <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={theme.primaryColor} />
                <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>
                  Fetching completed tasks...
                </Text>
              </View>
            ) : (
              <RichTextEditor
                key={reportHtml ? `editor-${reportHtml.length}` : 'editor-empty'}
                initialHTML={reportHtml}
                placeholder="Describe your work updates for today..."
                onChange={(html) => setReportHtml(html)}
                minHeight={250}
                autoFocus={true}
              />
            )}

            {/* Footer Buttons inside ScrollView */}
            <View style={styles.fullScreenReportFooter}>
              <TouchableOpacity
                style={styles.fullScreenCancelBtn}
                onPress={() => setReportModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.fullScreenCancelBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fullScreenConfirmBtn}
                onPress={handleConfirmPunchOut}
                activeOpacity={0.8}
              >
                <Text style={styles.fullScreenConfirmBtnText}>CONFIRM & PUNCH OUT</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 3,
  },

  // Card
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  presentIndicatorBtn: {
    backgroundColor: theme.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  presentIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.primaryColor,
  },

  // Status Badge
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },

  // Photos comparison Row
  photosRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoContainer: {
    flex: 1,
    gap: 3,
  },
  photoBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  photoPlaceholder: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.primaryColor,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFB',
    gap: 1,
  },
  photoPlaceholderText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  capturedPhoto: {
    height: 100,
    borderRadius: 12,
    width: '100%',
    resizeMode: 'cover',
  },

  // Punch button that fills the photo-box slot
  photoActionBtn: {
    height: 100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  photoActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FBFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statCellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  statCellValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
  },

  // Action Buttons
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  punchInBtn: {
    backgroundColor: theme.primaryColor,
    shadowColor: theme.primaryColor,
  },
  punchInBtnDisabled: {
    backgroundColor: '#C9D4D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  punchOutBtn: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
  },
  punchOutBtnDisabled: {
    backgroundColor: '#F3E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // History Section
  historySection: {
    gap: 4,
    marginTop: 0,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  historySectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  monthPickerText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primaryColor,
  },

  // Status Filter Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: COLORS.bgWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  statusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  statusOptionRowActive: {
    backgroundColor: '#F0FDF8',
  },
  statusOptionDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionDotText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  historyCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    gap: 5,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDateText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  historyPhotosRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  historyPhotoBox: {
    flex: 1,
    gap: 2,
  },
  historyPhotoLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  historyPhotoThumb: {
    height: 60,
    borderRadius: 8,
    width: '100%',
    resizeMode: 'cover',
  },
  historyPhotoPlaceholder: {
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EAEFF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyDetailCell: {
    alignItems: 'center',
    gap: 1,
  },
  historyDetailLabel: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  historyDetailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F4F7F5',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationSubCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationValueText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMid,
  },
  photoTouchable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  fullScreenReportContainer: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  fullScreenReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fullScreenReportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0D0F0E',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  fullScreenReportContent: {
    padding: 10,
    gap: 6,
  },
  fullScreenReportSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    lineHeight: 18,
  },

  fullScreenReportFooter: {
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 16,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgWhite,
  },
  fullScreenCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  fullScreenCancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
  },
  fullScreenConfirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F87171',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenConfirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
