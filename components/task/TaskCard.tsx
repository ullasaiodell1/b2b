import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export interface TaskCardProps {
  task: any;
  onPress?: () => void;
  onToggleCompletion?: () => void;
}

const getDisplayStatus = (status: string) => {
  const s = String(status || '').toUpperCase();
  if (s === 'COMPLETED') return 'Completed';
  if (s === 'IN_PROGRESS') return 'in progress';
  if (s === 'IN_REVIEW') return 'waiting for input';
  return 'Not Started';
};

const getDisplayPriority = (priority: string) => {
  const p = String(priority || '').toUpperCase();
  if (p === 'LOW') return 'Lowest';
  if (p === 'HIGH') return 'High';
  return 'Normal';
};

const getStatusStyle = (status: string) => {
  const displayStatus = getDisplayStatus(status);
  switch (displayStatus) {
    case 'Completed':
      return { color: '#10B981' };
    case 'Not Started':
      return { color: '#707A76' };
    case 'waiting for input':
      return { color: '#F97316' };
    case 'in progress':
      return { color: '#3B82F6' };
    default:
      return { color: '#707A76' };
  }
};

const getPriorityStyle = (priority: string) => {
  const displayPriority = getDisplayPriority(priority);
  switch (displayPriority) {
    case 'High':
      return { color: '#EF4444' };
    case 'Normal':
      return { color: '#3B82F6' };
    case 'Lowest':
      return { color: '#707A76' };
    default:
      return { color: '#707A76' };
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

        <View style={s.statusLabelContainer}>
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
        <View style={s.metaRow}>
          <Ionicons name="close-circle-outline" size={14} color={priorityConfig.color} />
          <Text style={[s.metaText, { color: priorityConfig.color }]}>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 5,
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
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});
