import CustomHeader from '@/components/custom/CustomHeader';
import { MonthYearPicker } from '@/components/custom/MonthYearPicker';
import { COLORS } from '@/constants/theme';
import { useAttendance } from '@/hooks/useAttendance';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

type AttendanceStatus = 'present' | 'absent' | 'late' | 'not_marked';
type FilterType = 'Present' | 'Absent' | 'Late';

// Hardcoded historical data
const HISTORY_DATA = [
  {
    id: 1, day: 'Monday', date: 'FEB 24',
    status: 'present' as AttendanceStatus,
    inTime: '09:12', outTime: '18:48', workTime: '9h 36m',
    inPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    outPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  },
  {
    id: 2, day: 'Tuesday', date: 'FEB 25',
    status: 'present' as AttendanceStatus,
    inTime: '09:05', outTime: '18:02', workTime: '8h 57m',
    inPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    outPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  },
  {
    id: 3, day: 'Wednesday', date: 'FEB 26',
    status: 'late' as AttendanceStatus,
    inTime: '10:45', outTime: '19:00', workTime: '8h 15m',
    inPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    outPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  },
  {
    id: 4, day: 'Thursday', date: 'FEB 27',
    status: 'absent' as AttendanceStatus,
    inTime: '--:--', outTime: '--:--', workTime: '--',
    inPhoto: null,
    outPhoto: null,
  },
];

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const config = {
    present: { label: 'Present', bg: '#DCFCE7', text: '#15803D' },
    absent: { label: 'Absent', bg: '#FEE2E2', text: '#B91C1C' },
    late: { label: 'Late', bg: '#FEF3C7', text: '#92400E' },
    not_marked: { label: 'Not Marked', bg: '#F3F4F6', text: '#6B7280' },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusBadgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

export default function AttendanceScreen() {
  const router = useRouter();
  const { attendance: attState } = useAttendance();
  const [activeFilter, setActiveFilter] = useState<FilterType>('Present');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedMonth = `${monthNames[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;

  const handlePunchIn = () => {
    if (attState.stampedIn) return;
    router.push({
      pathname: '/camera-capture',
      params: {
        sourceScreen: 'Attendance',
        attendanceAction: 'in',
      },
    } as any);
  };

  const handlePunchOut = () => {
    if (!attState.stampedIn || attState.stampedOut) return;
    router.push({
      pathname: '/camera-capture',
      params: {
        sourceScreen: 'Attendance',
        attendanceAction: 'out',
      },
    } as any);
  };

  const todayStatus: AttendanceStatus = attState.stampedOut
    ? 'present'
    : attState.stampedIn
      ? 'present'
      : 'not_marked';

  const filteredHistory = HISTORY_DATA.filter((item) => {
    if (activeFilter === 'Present') return item.status === 'present';
    if (activeFilter === 'Absent') return item.status === 'absent';
    if (activeFilter === 'Late') return item.status === 'late';
    return true;
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader title="Attendance" showSearch={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
                  <Ionicons name="location-outline" size={13} color={COLORS.primary} />
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
            <TouchableOpacity style={styles.monthPicker} onPress={() => setPickerVisible(true)}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
              <Text style={styles.monthPickerText}>{formattedMonth}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Filters Row */}
          <View style={styles.filtersContainer}>
            {(['Present', 'Absent', 'Late'] as FilterType[]).map((f) => {
              const isActive = activeFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={[styles.filterTab, isActive && styles.filterTabActive]}
                >
                  <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* History Cards List */}
          {filteredHistory.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyCardHeader}>
                <Text style={styles.historyDateText}>
                  {item.day} — {item.date}
                </Text>
                <TouchableOpacity style={styles.presentIndicatorBtn}>
                  <Text style={styles.presentIndicatorText}>+ {item.status === 'present' ? 'Present' : item.status === 'late' ? 'Late' : 'Absent'}</Text>
                </TouchableOpacity>
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
                  <Text style={[styles.historyDetailValue, { color: COLORS.primary }]}>
                    {item.workTime}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  presentIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
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
    color: COLORS.primary,
  },

  // Filters
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEFF1',
    borderRadius: 10,
    padding: 3,
    gap: 5,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.bgWhite,
  },
  filterTabText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },

  // History Card
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
