import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface TaskCardProps {
  task: any;
  onPress?: () => void;
  onToggleCompletion?: () => void;
}

const getDisplayStatus = (status: string) => {
  const s = String(status || '').trim().toUpperCase().replace(/[\s_]/g, '');
  if (s === 'COMPLETED' || s === 'DONE') return 'Completed';
  if (s === 'INPROGRESS') return 'In Progress';
  if (s === 'INREVIEW' || s === 'WAITINGFORINPUT') return 'In Review';
  if (s === 'CANCELLED' || s === 'CANCELED') return 'Cancelled';
  if (s === 'TODO' || s === 'NOTSTARTED') return 'To Do';
  return 'To Do';
};

const getDisplayPriority = (priority: string) => {
  const p = String(priority || '').trim().toUpperCase().replace(/[\s_]/g, '');
  if (p === 'LOW' || p === 'LOWEST') return 'Low';
  if (p === 'MEDIUM' || p === 'NORMAL') return 'Medium';
  if (p === 'HIGH') return 'High';
  if (p === 'URGENT' || p === 'HOT') return 'Urgent';
  return 'Medium';
};

const getStatusStyle = (status: string) => {
  const displayStatus = getDisplayStatus(status);
  switch (displayStatus) {
    case 'Completed':
      return { color: '#10B981', bgColor: '#ECFDF5' };
    case 'In Progress':
      return { color: '#3B82F6', bgColor: '#EFF6FF' };
    case 'In Review':
      return { color: '#F97316', bgColor: '#FFF3E0' };
    case 'Cancelled':
      return { color: '#707A76', bgColor: '#F4F7F5' };
    case 'To Do':
    default:
      return { color: '#EF4444', bgColor: '#FEF2F2' };
  }
};

const getPriorityStyle = (priority: string) => {
  const displayPriority = getDisplayPriority(priority);
  switch (displayPriority) {
    case 'Urgent':
      return { color: '#EF4444', bgColor: '#FEF2F2', icon: 'alert-circle-outline' as const };
    case 'High':
      return { color: '#F97316', bgColor: '#FFF3E0', icon: 'arrow-up-circle-outline' as const };
    case 'Medium':
      return { color: '#3B82F6', bgColor: '#EFF6FF', icon: 'remove-circle-outline' as const };
    case 'Low':
    default:
      return { color: '#707A76', bgColor: '#F9FAFB', icon: 'arrow-down-circle-outline' as const };
  }
};

const formatDate = (dateStr: any) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onToggleCompletion }) => {
  const displayStatus = getDisplayStatus(task.status);
  const isCompleted = displayStatus === 'Completed';
  const statusConfig = getStatusStyle(task.status);
  const priorityConfig = getPriorityStyle(task.priority);
  const formattedDue = formatDate(task.due_date);

  return (
    <TouchableOpacity
      style={s.taskCard}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
      onPress={onPress}
    >
      {/* Header Row: Checkbox, Title, Status */}
      <View style={s.cardHeader}>
        <TouchableOpacity
          onPress={onToggleCompletion}
          style={s.checkboxTouch}
          activeOpacity={0.7}
          disabled={!onToggleCompletion}
        >
          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          ) : (
            <View style={s.emptyCircle} />
          )}
        </TouchableOpacity>

        <Text style={[s.taskTitle, isCompleted && s.taskTitleCompleted]}>
          {task.title}
        </Text>

        <View style={[s.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <View style={[s.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[s.statusLabelText, { color: statusConfig.color }]}>
            {displayStatus}
          </Text>
        </View>
      </View>

      {/* Meta details */}
      <View style={s.cardMeta}>
        <View style={s.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text style={s.metaText}>{formattedDue}</Text>
        </View>
        <View style={[s.priorityBadge, { backgroundColor: priorityConfig.bgColor }]}>
          <Ionicons name={priorityConfig.icon} size={14} color={priorityConfig.color} />
          <Text style={[s.priorityText, { color: priorityConfig.color }]}>
            {getDisplayPriority(task.priority)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  taskCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxTouch: {
    marginRight: 10,
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
  },
  taskTitle: {
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    flexShrink: 0,
  },
  statusLabelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 32,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    flexShrink: 0,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
