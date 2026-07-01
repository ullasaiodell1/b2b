import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { TaskRecord } from '@/types/task';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCard } from './TaskCard';

type TaskStatus = 'Completed' | 'Not Started' | 'waiting for input' | 'in progress';
type Task = TaskRecord;

export interface TasksComponentProps {
  leadId?: string;
  leadName?: string;
  company?: string;
  phone?: string;
  email?: string;
  isEmbedded?: boolean;
  startDate?: string;
  endDate?: string;
}

const formatDateToYYYYMMDD = (dateVal: string | Date | undefined | null, addOneDay = false) => {
  if (!dateVal) return undefined;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return undefined;
    if (addOneDay) {
      d.setDate(d.getDate() + 1);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return undefined;
  }
};

export function TasksComponent({
  leadId,
  leadName,
  company,
  phone,
  email,
  isEmbedded = false,
  startDate,
  endDate,
}: TasksComponentProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const route = useRoute<any>();
  const routeParams = (route.params as any) || {};

  const effectiveLeadId = leadId !== undefined ? leadId : routeParams.leadId;
  const effectiveLeadName = leadName !== undefined ? leadName : routeParams.leadName;
  const effectiveCompany = company !== undefined ? company : routeParams.company;
  const effectivePhone = phone !== undefined ? phone : routeParams.phone;
  const effectiveEmail = email !== undefined ? email : routeParams.email;
  const effectiveStartDate = startDate !== undefined ? startDate : routeParams.startDate;
  const effectiveEndDate = endDate !== undefined ? endDate : routeParams.endDate;

  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | TaskStatus>('All');

  const apiParams: any = {};
  if (effectiveLeadId) {
    apiParams.lead_id = effectiveLeadId;
  }
  const formattedStart = formatDateToYYYYMMDD(effectiveStartDate);
  const formattedEnd = formatDateToYYYYMMDD(effectiveEndDate, true);
  if (formattedStart) {
    apiParams.startDate = formattedStart;
  }
  if (formattedEnd) {
    apiParams.endDate = formattedEnd;
  }
  apiParams.limit = 10;
  apiParams.offset = 0;

  const { data: responseData, isLoading, isFetching, refetch } = useTasks(apiParams) as any;

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );
  const tasks = Array.isArray(responseData)
    ? responseData
    : (Array.isArray(responseData?.data)
        ? responseData.data
        : (Array.isArray(responseData?.data?.data)
            ? responseData.data.data
            : []));
  const updateTaskMutation = useUpdateTask();

  const getDisplayStatus = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'IN_PROGRESS') return 'in progress';
    if (s === 'IN_REVIEW') return 'waiting for input';
    return 'Not Started';
  };

  const getBackendStatus = (displayStatus: string) => {
    switch (displayStatus) {
      case 'Completed': return 'COMPLETED';
      case 'in progress': return 'IN_PROGRESS';
      case 'waiting for input': return 'IN_REVIEW';
      default: return 'TODO';
    }
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

  const toggleTaskCompletion = async (task: Task) => {
    const currentDisplay = getDisplayStatus(task.status);
    const nextDisplay = currentDisplay === 'Completed' ? 'Not Started' : 'Completed';
    const nextBackend = getBackendStatus(nextDisplay);
    try {
      await updateTaskMutation.mutateAsync({ id: task.id, data: { status: nextBackend } });
    } catch (err) {
      console.error('[TasksComponent] toggle completion error:', err);
    }
  };

  const leadTasks = effectiveLeadId
    ? tasks.filter((task: any) => task.lead_id === effectiveLeadId)
    : tasks;

  const filteredTasks = leadTasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || getDisplayStatus(task.status) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalCount = leadTasks.length;
  const completedCount = leadTasks.filter((t: any) => getDisplayStatus(t.status) === 'Completed').length;
  const notStartedCount = leadTasks.filter((t: any) => getDisplayStatus(t.status) === 'Not Started').length;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      {!isEmbedded && <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />}

      {!isEmbedded && (
        <CustomHeader
          title="Task"
          showSearch={false}
          showBack={!!effectiveLeadId}
          onBackPress={() => {
            navigation.goBack();
          }}
        />
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isEmbedded ? 20 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[theme.primaryColor]} />
        }
      >

        {isLoading && tasks.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
            <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }}>Loading tasks...</Text>
          </View>
        ) : (
          <>
            {/* Search & Filters Row */}
            <View style={styles.searchFilterRow}>
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                  placeholder="Search Tasks..."
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                style={styles.filterBtn}
                activeOpacity={0.8}
                onPress={() => {
                  const isLeadFlow = route.name?.startsWith('lead-') || !!effectiveLeadId;
                  const targetScreen = isLeadFlow ? 'lead-task-filter' : 'task-filter';
                  navigation.navigate(targetScreen, { leadId: effectiveLeadId });
                }}
              >
                <Ionicons name="funnel-outline" size={16} color={COLORS.textDark} />
                <Text style={styles.filterBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Stats horizontal row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
              <TouchableOpacity
                style={[styles.statChip, selectedFilter === 'All' && styles.statChipActive]}
                onPress={() => setSelectedFilter('All')}
                activeOpacity={0.8}
              >
                <View style={[styles.statDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.statChipText}>Total Task {totalCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statChip, selectedFilter === 'Completed' && styles.statChipActive]}
                onPress={() => setSelectedFilter('Completed')}
                activeOpacity={0.8}
              >
                <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statChipText}>Complete {completedCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statChip, selectedFilter === 'Not Started' && styles.statChipActive]}
                onPress={() => setSelectedFilter('Not Started')}
                activeOpacity={0.8}
              >
                <View style={[styles.statDot, { backgroundColor: '#707A76' }]} />
                <Text style={styles.statChipText}>Not Started {notStartedCount}</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.tasksList}>
              {filteredTasks.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="checkmark-done-outline" size={48} color="#C2D3CC" />
                  <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }}>No tasks found</Text>
                </View>
              ) : (
                filteredTasks.map((task: any) => {
                  const displayStatus = getDisplayStatus(task.status);
                  const formattedDue = formatDate(task.due_date);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleCompletion={() => toggleTaskCompletion(task)}
                      onPress={() => {
                        const isLeadFlow = route.name?.startsWith('lead-') || !!effectiveLeadId;
                        const targetScreen = isLeadFlow ? 'lead-task-details' : 'task-details';
                        navigation.navigate(targetScreen, {
                          id: task.id,
                          title: task.title,
                          due: formattedDue,
                          due_date: task.due_date,
                          priority: getDisplayPriority(task.priority),
                          status: displayStatus,
                          description: task.description || '',
                          assigned_to: task.assigned_to || '',
                          assigned_to_name: task.assigned_to_fullname || task.assigned_to_name || '',
                          lead_id: task.lead_id || '',
                        });
                      }}
                    />
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: isEmbedded ? 20 : Math.max(insets.bottom + 120, 130) }]}
        activeOpacity={0.85}
        onPress={() => {
          const isLeadFlow = route.name?.startsWith('lead-') || !!effectiveLeadId;
          const targetScreen = isLeadFlow ? 'lead-add-task' : 'add-task';
          navigation.navigate(targetScreen, {
            leadId: effectiveLeadId || '',
            leadName: effectiveLeadName || '',
          });
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 5,
  },
  searchFilterRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgPage,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textDark,
    padding: 0,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primaryColor,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 16,
    gap: 6,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  statsScroll: {
    gap: 5,
    paddingBottom: 1,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgPage,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statChipActive: {
    borderColor: theme.primaryColor,
    backgroundColor: theme.primaryLight,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tasksList: {
    gap: 5,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
});
