import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTask } from '@/hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TaskDetailsComponentProps {
  id?: string;
  isEmbedded?: boolean;
}

export function TaskDetailsComponent({
  id: propId,
  isEmbedded = false,
}: TaskDetailsComponentProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params as { [key: string]: any }) || {};
  const insets = useSafeAreaInsets();

  const [showAllFields, setShowAllFields] = useState(false);

  const id = propId !== undefined ? propId : params.id;

  const { data: responseData } = useTask(id) as any;
  const task = responseData?.id
    ? responseData
    : (responseData?.data
      ? (Array.isArray(responseData.data)
        ? responseData.data[0]
        : (responseData.data.data || responseData.data))
      : responseData);

  const getDisplayStatus = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'IN_PROGRESS') return 'In Progress';
    if (s === 'IN_REVIEW') return 'In Review';
    if (s === 'CANCELLED') return 'Cancelled';
    if (s === 'TODO') return 'To Do';
    return 'To Do';
  };

  const getDisplayPriority = (priority: string) => {
    const p = String(priority || '').toUpperCase();
    if (p === 'LOW') return 'Lowest';
    if (p === 'HIGH') return 'High';
    return 'Normal';
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

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }) + ' ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch {
      return String(dateStr);
    }
  };

  const taskTitle = task?.title || (params.title as string) || '';
  const taskDue = formatDateTime(task?.due_date || params.due_date || params.due);
  const taskPriority = getDisplayPriority(task?.priority || (params.priority as string));
  const taskStatus = getDisplayStatus(task?.status || (params.status as string));
  const taskDescription = task?.description || (params.description as string) || '';
  const taskAssignedToName = task?.assigned_to_fullname || task?.assigned_to_name || (params.assigned_to_name as string) || '';
  const taskCreatedByName = task?.created_by_name || (params.created_by_name as string) || '---';
  const taskCreatedAt = formatDateTime(task?.created_at || params.created_at);
  const taskUpdatedAt = formatDateTime(task?.updated_at || params.updated_at);
  const taskLeadName = task?.lead_name || (params.leadName as string) || '';

  const handleEditTask = () => {
    const isLeadFlow = route.name?.startsWith('lead-');
    const targetScreen = isLeadFlow ? 'lead-edit-task' : 'edit-task';
    navigation.navigate(targetScreen, {
      id: id || '',
      title: taskTitle,
      description: taskDescription,
      due_date: task?.due_date || (params.due_date as string) || '',
      priority: task?.priority || (params.priority as string) || '',
      status: task?.status || (params.status as string) || '',
      assignedTo: task?.assigned_to || (params.assigned_to as string) || '',
      assignedToName: taskAssignedToName,
      leadId: task?.lead_id || (params.lead_id as string) || '',
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      {!isEmbedded && <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />}

      {/* HEADER */}
      {!isEmbedded && (
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>TA</Text>
            <Text style={{ color: COLORS.textDark }}>SK</Text>
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleEditTask}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={theme.primaryColor} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Show All Fields Toggle Switch */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show All Fields</Text>
          <Switch
            value={showAllFields}
            onValueChange={setShowAllFields}
            trackColor={{ false: '#D1D5DB', true: theme.primaryColor }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </View>

        {/* Tasks Information Section */}
        <View style={styles.detailsBlock}>
          <View style={styles.detailsBlockHeader}>
            <View style={styles.detailsBlockHeaderLeft}>
              <View style={styles.verticalGreenLine} />
              <Text style={styles.sectionTitle}>TASKS INFORMATION</Text>
            </View>
            {isEmbedded && (
              <TouchableOpacity onPress={handleEditTask} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned To</Text>
              <Text style={styles.infoValue}>{taskAssignedToName || '---'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Related Lead</Text>
              <Text style={styles.infoValue}>{taskLeadName || '---'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subject <Text style={{ color: '#EF4444' }}>*</Text></Text>
              <Text style={styles.infoValue}>{taskTitle}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Due Date</Text>
              <Text style={styles.infoValue}>{taskDue}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{taskStatus}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Priority</Text>
              <Text style={styles.infoValue}>{taskPriority}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created By</Text>
              <Text style={styles.infoValue}>{taskCreatedByName}</Text>
            </View>

            {taskDescription ? (
              <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 4, borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={[styles.infoValue, { color: COLORS.textDark, marginTop: 2 }]}>{taskDescription}</Text>
              </View>
            ) : null}

            {showAllFields && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created Time</Text>
                  <Text style={styles.infoValue}>{taskCreatedAt}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Modified Time</Text>
                  <Text style={styles.infoValue}>{taskUpdatedAt}</Text>
                </View>
              </>
            )}
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 150,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  detailsBlock: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 12,
  },
  detailsBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsBlockHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verticalGreenLine: {
    width: 3,
    height: 16,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
