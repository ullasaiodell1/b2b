import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
};

type TaskStatus = 'Completed' | 'Not Started' | 'waiting for input' | 'in progress';
type PriorityType = 'High' | 'Normal' | 'Lowest';

interface Task {
  id: string;
  title: string;
  due: string;
  priority: PriorityType;
  status: TaskStatus;
}

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Website Redesign',
    due: '16 Feb 2026 • 10:00 AM',
    priority: 'High',
    status: 'Completed',
  },
  {
    id: '2',
    title: 'Product Demo',
    due: '16 Feb 2026 • 10:00 AM',
    priority: 'Normal',
    status: 'Not Started',
  },
  {
    id: '3',
    title: 'Api Rate Limiting Setup',
    due: '16 Feb 2026 • 10:00 AM',
    priority: 'Lowest',
    status: 'Not Started',
  },
  {
    id: '4',
    title: 'Update CRM Database',
    due: '16 Feb 2026 • 10:00 AM',
    priority: 'High',
    status: 'waiting for input',
  },
  {
    id: '5',
    title: 'Send Follow-Up Emails',
    due: '16 Feb 2026 • 10:00 AM',
    priority: 'Lowest',
    status: 'in progress',
  },
  {
    id: '6',
    title: 'Website Redesign',
    due: '16 Feb 2026 • 10:00 AM',
    priority: 'High',
    status: 'Completed',
  },
];

export default function TaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | TaskStatus>('All');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [dateRange, setDateRange] = useState('28 Dec 22 – 10 Jan 23');

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const nextStatus: TaskStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
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
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || task.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const notStartedCount = tasks.filter(t => t.status === 'Not Started').length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16), justifyContent: 'center', position: 'relative' }]}>
        <View style={styles.centerLogoSection}>
          <Ionicons name="star" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.logoText}>BASALT</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Search & Filters Row */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search Taks..."
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

        {/* Date Selector Row */}
        <View style={styles.dateSelectorRow}>
          <TouchableOpacity 
            style={styles.datePickerDropdown} 
            activeOpacity={0.8}
            onPress={() => Alert.alert('Select Date Range', 'Calendar date range picker opened.')}
          >
            <Text style={styles.dateText}>{dateRange}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textDark} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dateResetBtn}
            onPress={() => setDateRange('28 Dec 22 – 10 Jan 23')}
            activeOpacity={0.8}
          >
            <Text style={styles.dateResetBtnText}>Reset</Text>
            <Ionicons name="refresh-outline" size={14} color={COLORS.textDark} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Tasks List */}
        <View style={styles.tasksList}>
          {filteredTasks.map(task => {
            const isCompleted = task.status === 'Completed';
            const statusConfig = getStatusStyle(task.status);
            const priorityConfig = getPriorityStyle(task.priority);

            return (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskCard}
                activeOpacity={0.9}
                onPress={() => router.push({
                  pathname: '/(tabs)/task/task-details',
                  params: {
                    title: task.title,
                    due: task.due,
                    priority: task.priority,
                    status: task.status,
                  }
                } as any)}
              >
                
                {/* Header Row: Checkbox, Title, Status */}
                <View style={styles.cardHeader}>
                  <TouchableOpacity 
                    onPress={() => toggleTaskCompletion(task.id)}
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
                  {/* Due Date */}
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={15} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{task.due}</Text>
                  </View>

                  {/* Priority */}
                  <View style={[styles.metaRow, { marginTop: 4 }]}>
                    <Ionicons name="close-circle-outline" size={15} color={priorityConfig.color} />
                    <Text style={[styles.metaText, { color: priorityConfig.color }]}>
                      {task.priority}
                    </Text>
                  </View>
                </View>

              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom + 90, 100) }]}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/task/add-task')}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },

  // Search & Filter Row
  searchFilterRow: {
    flexDirection: 'row',
    gap: 12,
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
    borderColor: COLORS.primary,
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
    gap: 8,
    paddingBottom: 14,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgPage,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
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
    gap: 12,
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  datePickerDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  dateResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  dateResetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
