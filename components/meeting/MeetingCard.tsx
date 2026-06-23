import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { MeetingRecord } from '@/types/meeting';

export interface MeetingCardProps {
  meeting: any;
  onPress?: () => void;
  isCompact?: boolean;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Complete':
    case 'Completed':
    case 'COMPLETED':
      return { color: COLORS.success, label: 'Completed' };
    case 'In-Process':
    case 'In Process':
    case 'IN_PROGRESS':
    case 'RESCHEDULED':
      return { color: COLORS.info, label: 'In Process' };
    case 'Pending':
    case 'PENDING':
    default:
      return { color: COLORS.danger, label: 'Pending' };
  }
};

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onPress, isCompact = false }) => {
  const title = meeting.title || meeting.purpose || meeting.follow_up_method || 'Follow-up';
  const statusStr = meeting.status || 'Pending';
  const cfg = getStatusConfig(statusStr);
  const purpose = meeting.purpose || '';
  const method = meeting.method || meeting.follow_up_method || meeting.location || '—';
  
  let scheduledAt = meeting.scheduledAt;
  if (!scheduledAt && meeting.scheduled_at) {
    const dateObj = new Date(meeting.scheduled_at);
    scheduledAt = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (!scheduledAt && meeting.fromTime) {
    scheduledAt = meeting.fromTime;
  }
  if (!scheduledAt) {
    scheduledAt = '—';
  }

  if (isCompact) {
    return (
      <TouchableOpacity
        style={s.compactContainer}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={s.compactMain}>
          <Text style={s.compactTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={s.compactSub} numberOfLines={1}>
            Method: {method} · {scheduledAt}
          </Text>
        </View>
        <Text style={[s.compactStatus, { color: cfg.color }]}>
          {cfg.label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.88}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* ── Row 1: Title + Status ─────────────────── */}
      <View style={s.cardHead}>
        <Text style={s.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={[s.statusPill, { backgroundColor: cfg.color + '18' }]}>
          <View style={[s.statusDot, { backgroundColor: cfg.color }]} />
          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* ── Row 2: Purpose ───────────────────────── */}
      {!!purpose && (
        <View style={s.cardMetaRow}>
          <Ionicons name="document-text-outline" size={13} color={COLORS.textMuted} />
          <Text style={s.cardMetaLabel}>Purpose: </Text>
          <Text style={s.cardMetaValue} numberOfLines={1}>
            {purpose}
          </Text>
        </View>
      )}

      {/* ── Row 3: Method ───────────────────────── */}
      <View style={s.cardMetaRow}>
        <Ionicons name="videocam-outline" size={13} color={COLORS.textMuted} />
        <Text style={s.cardMetaLabel}>Method: </Text>
        <Text style={s.cardMetaValue}>
          {method}
        </Text>
      </View>

      {/* ── Row 4: Scheduled Date & Time ─────────── */}
      <View style={s.cardMetaRow}>
        <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
        <Text style={s.cardMetaLabel}>Scheduled: </Text>
        <Text style={s.cardMetaValue}>
          {scheduledAt}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
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
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
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
  // Compact Styles (for Leads accordion)
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  compactMain: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  compactSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  compactStatus: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
  },
});
