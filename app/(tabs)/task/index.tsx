import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { TaskRecord } from '@/types/task';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

type TaskStatus = 'Completed' | 'Not Started' | 'waiting for input' | 'in progress';
type PriorityType = 'High' | 'Normal' | 'Lowest';

type Task = TaskRecord;

export default function TaskScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams<{
    leadId?: string;
    leadName?: string;
    company?: string;
    phone?: string;
    email?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | TaskStatus>('All');

  const { tasks, isLoading, isFetching, refetch } = useTasks(params.leadId ? { lead_id: params.leadId } : undefined);
  const updateTaskMutation = useUpdateTask();

  const toggleTaskCompletion = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
    try {
      await updateTaskMutation.mutateAsync({ id: task.id, data: { status: nextStatus } });
    } catch (err) {
      console.error('[TaskScreen] toggle completion error:', err);
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
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

  const getPriorityStyle = (priority: PriorityType) => {
    switch (priority) {
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

  const leadTasks = params.leadId
    ? tasks.filter(task => task.lead_id === params.leadId)
    : tasks;

  const filteredTasks = leadTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || task.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalCount = leadTasks.length;
  const completedCount = leadTasks.filter(t => t.status === 'Completed').length;
  const notStartedCount = leadTasks.filter(t => t.status === 'Not Started').length;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader
        title="Task"
        showSearch={false}
        showBack={!!params.leadId}
        onBackPress={() => {
          if (params.leadId) {
            router.push({
              pathname: '/(tabs)/leads/lead-details',
              params: {
                id: params.leadId,
                name: params.leadName,
                company: params.company,
                phone: params.phone,
                email: params.email,
              }
            } as any);
          } else {
            router.back();
          }
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
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
                onPress={() => router.push('/(tabs)/task/task-filter' as any)}
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
                filteredTasks.map(task => {
                  const isCompleted = task.status === 'Completed';
                  const statusConfig = getStatusStyle(task.status as TaskStatus);
                  const priorityConfig = getPriorityStyle(task.priority as PriorityType);

                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.taskCard}
                      activeOpacity={0.9}
                      onPress={() => router.push({
                        pathname: '/(tabs)/task/task-details',
                        params: {
                          id: task.id,
                          title: task.title,
                          due: task.due,
                          priority: task.priority,
                          status: task.status,
                          description: task.description || '',
                          assigned_to: task.assigned_to || '',
                          assigned_to_name: task.assigned_to_name || '',
                          lead_id: task.lead_id || '',
                        }
                      } as any)}
                    >
                      {/* Header Row: Checkbox, Title, Status */}
                      <View style={styles.cardHeader}>
                        <TouchableOpacity
                          onPress={() => toggleTaskCompletion(task)}
                          style={styles.checkboxTouch}
                          activeOpacity={0.7}
                        >
                          {isCompleted ? (
                            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                          ) : (
                            <View style={styles.emptyCircle} />
                          )}
                        </TouchableOpacity>

                        <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                          {task.title}
                        </Text>

                        <View style={styles.statusLabelContainer}>
                          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                          <Text style={[styles.statusLabelText, { color: statusConfig.color }]}>
                            {task.status}
                          </Text>
                        </View>
                      </View>

                      {/* Meta details */}
                      <View style={styles.cardMeta}>
                        <View style={styles.metaRow}>
                          <Ionicons name="calendar-outline" size={15} color={COLORS.textMuted} />
                          <Text style={styles.metaText}>{task.due}</Text>
                        </View>
                        <View style={[styles.metaRow, { marginTop: 4 }]}>
                          <Ionicons name="close-circle-outline" size={15} color={priorityConfig.color} />
                          <Text style={[styles.metaText, { color: priorityConfig.color }]}>
                            {task.priority}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom + 90, 100) }]}
        activeOpacity={0.85}
        onPress={() => router.push({
          pathname: '/(tabs)/task/add-task',
          params: {
            leadId: params.leadId || '',
            leadName: params.leadName || '',
          }
        } as any)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 5,
    paddingBottom: 150,
  },

  // Search & Filter Row
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

  // Stats Chips
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

  // Tasks List
  tasksList: {
    gap: 5,
    marginTop: 4,
  },
  taskCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
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

  // Meta info
  cardMeta: {
    paddingLeft: 30,
    marginTop: 8,
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

  // Floating Action Button
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
