import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ActivityEvent, useLeadActivity } from '@/hooks/useActivity';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
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

// ─── Action type config ──────────────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  'TASK CREATED': { label: 'TASK CREATED', color: '#7C3AED' },
  'TASK_CREATED': { label: 'TASK CREATED', color: '#7C3AED' },
  ACTION: { label: 'ACTION', color: '#0284C7' },
  ATTACHED: { label: 'ATTACHED', color: '#059669' },
  UPDATED: { label: 'UPDATED', color: '#D97706' },
  'FOLLOW-UP': { label: 'FOLLOW-UP', color: '#E11D48' },
  FOLLOW_UP: { label: 'FOLLOW-UP', color: '#E11D48' },
  FOLLOWUP: { label: 'FOLLOW-UP', color: '#E11D48' },
  CREATED: { label: 'CREATED', color: '#16A34A' },
  DELETED: { label: 'DELETED', color: '#DC2626' },
  STATUS: { label: 'STATUS', color: '#0EA5E9' },
  NOTE: { label: 'NOTE', color: '#6B7280' },
  REMINDER: { label: 'REMINDER', color: '#8B5CF6' },
};

function getActionConfig(type: string) {
  const key = (type || '').toUpperCase().trim();
  return (
    ACTION_CONFIG[key] ||
    ACTION_CONFIG[key.replace(/\s+/g, '_')] ||
    { label: key || 'ACTION', color: '#6B7280' }
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatEventTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const hours = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${month} ${day}, ${h12}:${mins} ${ampm}`;
  } catch {
    return iso;
  }
}

/** Returns "Jun 18, 2026" style label */
function formatDateLabel(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Returns "YYYY-MM-DD" for comparison */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(iso: string, date: Date): boolean {
  if (!iso) return false;
  try {
    return new Date(iso).toDateString() === date.toDateString();
  } catch {
    return false;
  }
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTER_TABS = ['All', 'Task', 'Action', 'Updated', 'Follow-Up', 'Reminder'] as const;
type FilterTab = typeof FILTER_TABS[number];

function matchesFilter(event: ActivityEvent, filter: FilterTab): boolean {
  if (filter === 'All') return true;
  const key = event.action_type.toUpperCase();
  if (filter === 'Task') return key.includes('TASK');
  if (filter === 'Action') return key === 'ACTION';
  if (filter === 'Updated') return key === 'UPDATED';
  if (filter === 'Follow-Up') return key.includes('FOLLOW');
  if (filter === 'Reminder') return key === 'REMINDER';
  return true;
}

// ─── Single event row ─────────────────────────────────────────────────────────
const EventRow: React.FC<{ event: ActivityEvent; isLast: boolean }> = ({ event, isLast }) => {
  const cfg = getActionConfig(event.action_type);
  const theme = useTheme();
  const dotColor = cfg.color === '#6B7280' ? theme.primaryColor : cfg.color;

  return (
    <View style={r.eventRow}>
      <View style={r.timelineCol}>
        <View style={[r.timelineDot, { backgroundColor: dotColor }]} />
        {!isLast && <View style={[r.timelineLine, { backgroundColor: theme.primaryColor, opacity: 0.25 }]} />}
      </View>

      <View style={[r.eventContent, isLast && { paddingBottom: 0 }]}>
        <View style={r.eventTopRow}>
          <Text style={r.actorText}>{event.actor}</Text>
          <View style={[r.typeBadge, { backgroundColor: cfg.color + '18' }]}>
            <Text style={[r.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <View style={r.dotSep} />
          <Text style={r.timeText}>{formatEventTime(event.created_at)}</Text>
        </View>

        {!!event.description && (
          <Text style={r.descText}>{event.description}</Text>
        )}
      </View>
    </View>
  );
};

const r = StyleSheet.create({
  eventRow: {
    flexDirection: 'row',
    gap: 12
  },
  timelineCol: {
    alignItems: 'center',
    width: 16,
    paddingTop: 4
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    minHeight: 24
  },
  eventContent: {
    flex: 1,
    paddingBottom: 20,
    gap: 4
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6
  },
  actorText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDark
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3
  },
  dotSep: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600'
  },
  descText: {
    fontSize: 13,
    color: COLORS.textMid,
    fontWeight: '600',
    lineHeight: 19
  },
});

// ─── Calendar Picker (inline modal) ──────────────────────────────────────────
interface CalendarPickerProps {
  visible: boolean;
  date: Date;
  primaryColor: string;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  visible, date, primaryColor, onConfirm, onClose,
}) => {
  const [tempDate, setTempDate] = useState<Date>(date);

  const handleChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (selected) onConfirm(selected);
      onClose();
    } else {
      if (selected) setTempDate(selected);
    }
  };

  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={handleChange}
      />
    );
  }

  // iOS — inline inside a modal
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={cp.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={cp.sheet}>
          {/* Title */}
          <View style={cp.sheetHeader}>
            <Text style={cp.sheetTitle}>Select Date</Text>
            <TouchableOpacity onPress={onClose} style={cp.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={COLORS.textMid} />
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={tempDate}
            mode="date"
            display="inline"
            themeVariant="light"
            accentColor={primaryColor}
            onChange={handleChange}
            style={{ width: '100%' }}
          />

          {/* Action row */}
          <View style={cp.actionRow}>
            <TouchableOpacity style={cp.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={cp.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[cp.confirmBtn, { backgroundColor: primaryColor }]}
              onPress={() => { onConfirm(tempDate); onClose(); }}
              activeOpacity={0.8}
            >
              <Text style={cp.confirmText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const cp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    paddingBottom: 16
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.3
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMid
  },
  confirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LeadActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { primaryColor, primaryLight } = useTheme();

  const params = useLocalSearchParams<{ leadId?: string; leadName?: string }>();
  const leadId = params.leadId || '';
  const leadName = params.leadName || 'Lead';

  const { data = [] as ActivityEvent[], isLoading, isFetching, refetch } = useLeadActivity(leadId);

  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // ── Combined filter: type tab + date ─────────────────────
  const filtered = useMemo(() => {
    return data.filter((e: ActivityEvent) => {
      const passesTab = matchesFilter(e, activeFilter);
      const passesDate = selectedDate ? isSameDay(e.created_at, selectedDate) : true;
      return passesTab && passesDate;
    });
  }, [data, activeFilter, selectedDate]);

  // ── Date badge label ──────────────────────────────────────
  const dateBadgeLabel = selectedDate ? formatDateLabel(selectedDate) : null;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>
            <Text style={{ color: primaryColor }}>ACTIVITY </Text>
            <Text style={{ color: COLORS.textDark }}>LOG</Text>
          </Text>
          <Text style={s.headerSub} numberOfLines={1}>{leadName}</Text>
        </View>

        {/* Calendar icon button */}
        <TouchableOpacity
          style={[s.calendarBtn, selectedDate && { backgroundColor: primaryColor }]}
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={selectedDate ? '#FFFFFF' : COLORS.textDark}
          />
        </TouchableOpacity>
      </View>

      {/* ── DATE FILTER STRIP ───────────────────────────────── */}
      {dateBadgeLabel && (
        <View style={[s.dateBanner, { backgroundColor: primaryLight }]}>
          <Ionicons name="calendar" size={13} color={primaryColor} />
          <Text style={[s.dateBannerText, { color: primaryColor }]}>
            Showing: {dateBadgeLabel}
          </Text>
          <TouchableOpacity
            onPress={() => setSelectedDate(null)}
            style={s.clearDateBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={15} color={primaryColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── FILTER TABS ─────────────────────────────────────── */}
      <View style={s.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[s.filterChip, isActive && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                onPress={() => setActiveFilter(tab)}
                activeOpacity={0.8}
              >
                <Text style={[s.filterChipText, isActive && { color: '#FFFFFF' }]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── EVENT LIST ──────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[primaryColor]} />
        }
      >
        {isLoading ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={s.loadingText}>Loading activity...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="time-outline" size={48} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={s.emptyTitle}>
              {selectedDate ? `No activity on ${dateBadgeLabel}` : 'No activity yet'}
            </Text>
            <Text style={s.emptySub}>
              {selectedDate
                ? 'Try a different date or clear the date filter.'
                : 'Activity events for this lead will appear here.'}
            </Text>
            {selectedDate && (
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                style={[s.clearDatePill, { borderColor: primaryColor }]}
                activeOpacity={0.7}
              >
                <Text style={[s.clearDatePillText, { color: primaryColor }]}>Clear Date Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={s.timelineContainer}>
            {/* Header row */}
            <View style={s.logHeader}>
              <View style={s.logHeaderLeft}>
                <Ionicons name="time-outline" size={15} color={primaryColor} />
                <Text style={[s.logHeaderTitle, { color: primaryColor }]}>ACTIVITY LOG</Text>
              </View>
              <Text style={[s.logHeaderCount, { color: primaryColor }]}>
                {filtered.length} {filtered.length === 1 ? 'EVENT' : 'TOTAL EVENTS'}
              </Text>
            </View>

            <View style={s.logDivider} />

            <View style={s.eventsWrapper}>
              {filtered.map((event: ActivityEvent, index: number) => (
                <EventRow
                  key={event.id + '_' + index}
                  event={event}
                  isLast={index === filtered.length - 1}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── CALENDAR PICKER ─────────────────────────────────── */}
      <CalendarPicker
        visible={showCalendar}
        date={selectedDate ?? new Date()}
        primaryColor={primaryColor}
        onConfirm={(date) => setSelectedDate(date)}
        onClose={() => setShowCalendar(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingBottom: 14,
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
  headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
  headerTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 0.4 },
  headerSub: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', maxWidth: 180 },

  // Calendar icon button (replaces totalBadge)
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Date filter banner
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  dateBannerText: { flex: 1, fontSize: 12, fontWeight: '700' },
  clearDateBtn: { padding: 2 },

  // Filter bar
  filterBar: {
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  filterScroll: { paddingHorizontal: 5, gap: 3 },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipText: { fontSize: 12, fontWeight: '700', color: COLORS.textMid },

  // Scroll
  scrollContent: { padding: 5 },

  // Timeline card
  timelineContainer: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  logHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  logHeaderCount: {
    fontSize: 11,
    fontWeight: '800'
  },
  logDivider: {
    height: 1,
    backgroundColor: '#F3F4F6'
  },
  eventsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },

  // States
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600'
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 30
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6
  },
  clearDatePill: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  clearDatePillText: {
    fontSize: 13,
    fontWeight: '700'
  },
});
