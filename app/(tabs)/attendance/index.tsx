import {
  attendanceState,
  AttendanceState,
  subscribeToAttendance,
} from '@/components/attendance/AttendanceState';
import CustomHeader from '@/components/custom/CustomHeader';
import { MonthYearPicker } from '@/components/custom/MonthYearPicker';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAttendanceHistory, useAttendanceStatus } from '@/hooks/useAttendance';
import { AttendanceRecord, AttendanceStatus } from '@/types/attendance';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type StatusFilter = 'All' | 'Present' | 'Absent' | 'Leave';


function StatusBadge({ status }: { status: AttendanceStatus }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const config = {
    present: { label: 'Present', bg: '#DCFCE7', text: '#15803D' },
    absent: { label: 'Absent', bg: '#FEE2E2', text: '#B91C1C' },
    leave: { label: 'Leave', bg: '#E0F2FE', text: '#0369A1' },
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

  // Status query syncs local AttendanceState automatically via the hook's onSuccess
  useAttendanceStatus();
  const historyQuery = useAttendanceHistory(
    selectedMonth.getMonth() + 1,
    selectedMonth.getFullYear(),
    statusFilter === 'All' ? undefined : statusFilter,
  );

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
    router.push({
      pathname: '/camera-capture',
      params: { sourceScreen: 'Attendance', attendanceAction: 'out' },
    });
  };

  const todayStatus: AttendanceStatus = attState.stampedOut
    ? 'present'
    : attState.stampedIn
      ? 'present'
      : 'not_marked';

  const historyData: AttendanceRecord[] = historyQuery.data ?? [];

  const STATUS_OPTIONS: StatusFilter[] = ['All', 'Present', 'Absent', 'Leave'];

  const statusBadgeColor = (s: StatusFilter) => {
    switch (s) {
      case 'Present': return { bg: '#DCFCE7', text: '#15803D' };
      case 'Absent':  return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'Leave':   return { bg: '#E0F2FE', text: '#0369A1' };
      default:        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader title="Attendance" showSearch={false} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TODAY'S ATTENDANCE CARD ────────────────── */}
        <View style={styles.card}>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{"TODAY'S ATTENDANCE"}</Text>
            <StatusBadge status={todayStatus} />
          </View>

          {/* Date Picker Row */}
          <View style={styles.datePickerRow}>
            <Text style={styles.datePickerText}>Friday, 21 February 2025</Text>
            <TouchableOpacity style={styles.presentIndicatorBtn}>
              <Text style={styles.presentIndicatorText}>+ Present</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Preview Boxes */}
          <View style={styles.photosRow}>
            {/* Punch In Photo */}
            <View style={styles.photoContainer}>
              <Text style={styles.photoBoxTitle}>Punch In Photo</Text>
              {attState.inPhoto ? (
                <Image source={{ uri: attState.inPhoto }} style={styles.capturedPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={24} color={COLORS.textMuted} />
                  <Text style={styles.photoPlaceholderText}>No Photo</Text>
                </View>
              )}
            </View>

            {/* Punch Out Photo */}
            <View style={styles.photoContainer}>
              <Text style={styles.photoBoxTitle}>Punch Out Photo</Text>
              {attState.outPhoto ? (
                <Image source={{ uri: attState.outPhoto }} style={styles.capturedPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={24} color={COLORS.textMuted} />
                  <Text style={styles.photoPlaceholderText}>No Photo</Text>
                </View>
              )}
            </View>
          </View>

          {/* Time & Duration Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statCellLabel}>In-Time</Text>
              <Text style={styles.statCellValue}>{attState.inTime}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statCellLabel}>Out-Time</Text>
              <Text style={styles.statCellValue}>{attState.outTime}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statCellLabel}>Work-time</Text>
              <Text style={styles.statCellValue}>{attState.workTime}</Text>
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

          {/* Buttons Row */}
          <View style={styles.buttonsRow}>
            {/* Punch In Button */}
            <TouchableOpacity
              onPress={handlePunchIn}
              disabled={attState.stampedIn}
              style={[
                styles.actionBtn,
                styles.punchInBtn,
                attState.stampedIn && styles.punchInBtnDisabled,
              ]}
              activeOpacity={0.85}
            >
              {attState.stampedIn ? (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Punched In</Text>
                </>
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Punch In</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Punch Out Button */}
            <TouchableOpacity
              onPress={handlePunchOut}
              disabled={!attState.stampedIn || attState.stampedOut}
              style={[
                styles.actionBtn,
                styles.punchOutBtn,
                (!attState.stampedIn || attState.stampedOut) && styles.punchOutBtnDisabled,
              ]}
              activeOpacity={0.85}
            >
              {attState.stampedOut ? (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Punched Out</Text>
                </>
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Punch Out</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
                <Text style={styles.historyDateText}>
                  {item.day} — {item.date}
                </Text>
                <StatusBadge status={item.status} />
              </View>

              {/* Photos comparison inside history card */}
              <View style={styles.historyPhotosRow}>
                {/* Punch In */}
                <View style={styles.historyPhotoBox}>
                  <Text style={styles.historyPhotoLabel}>Punch In Photo</Text>
                  {item.inPhoto ? (
                    <Image source={{ uri: item.inPhoto }} style={styles.historyPhotoThumb} />
                  ) : (
                    <View style={styles.historyPhotoPlaceholder}>
                      <Ionicons name="image-outline" size={16} color={COLORS.textMuted} />
                    </View>
                  )}
                </View>

                {/* Punch Out */}
                <View style={styles.historyPhotoBox}>
                  <Text style={styles.historyPhotoLabel}>Punch Out Photo</Text>
                  {item.outPhoto ? (
                    <Image source={{ uri: item.outPhoto }} style={styles.historyPhotoThumb} />
                  ) : (
                    <View style={styles.historyPhotoPlaceholder}>
                      <Ionicons name="image-outline" size={16} color={COLORS.textMuted} />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.historyDetailsGrid}>
                <View style={styles.historyDetailCell}>
                  <Text style={styles.historyDetailLabel}>In-time</Text>
                  <Text style={styles.historyDetailValue}>{item.inTime}</Text>
                </View>
                <View style={styles.historyDetailCell}>
                  <Text style={styles.historyDetailLabel}>Out-time</Text>
                  <Text style={styles.historyDetailValue}>{item.outTime}</Text>
                </View>
                <View style={styles.historyDetailCell}>
                  <Text style={styles.historyDetailLabel}>Work-time</Text>
                  <Text style={[styles.historyDetailValue, { color: theme.primaryColor }]}>
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
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 5,
  },

  // Card
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
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
    gap: 5,
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
    borderColor: '#D2DDD7',
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
    gap: 4,
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
    gap: 5,
    marginTop: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  historyPhotosRow: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#F8FBFA',
    borderRadius: 12,
    padding: 10,
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
    height: 50,
    borderRadius: 8,
    width: '100%',
    resizeMode: 'cover',
  },
  historyPhotoPlaceholder: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#EAEFF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  historyDetailCell: {
    alignItems: 'center',
    gap: 2,
  },
  historyDetailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  historyDetailValue: {
    fontSize: 13,
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
});
