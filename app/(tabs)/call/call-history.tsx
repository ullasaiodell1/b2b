import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCalls } from '@/hooks/useCalls';
import { CallRecord } from '@/types/call';
import { syncDeviceCallLogs } from '@/utils/callLogSync';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type CallType = 'All' | 'Incoming' | 'Outgoing' | 'Missed';


function formatCallLog(item: any, leadInfo: { name: string; phone: string }): CallRecord {
  let type: 'Incoming' | 'Outgoing' | 'Missed' = 'Incoming';
  if (item.call_type === 'INBOUND') type = 'Incoming';
  else if (item.call_type === 'OUTBOUND') type = 'Outgoing';
  else if (item.call_type === 'MISSED') type = 'Missed';

  let duration = '00:00 min';
  if (item.duration_seconds !== undefined && item.duration_seconds !== null) {
    const mins = Math.floor(item.duration_seconds / 60);
    const secs = item.duration_seconds % 60;
    duration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
  }

  let dateTime = '';
  if (item.call_start_time) {
    const date = new Date(item.call_start_time);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    dateTime = date.toLocaleDateString('en-IN', options).replace(' pm', 'pm').replace(' am', 'am');
  }

  return {
    id: String(item.id),
    name: leadInfo.name,
    phoneNumber: leadInfo.phone,
    dateTime: dateTime || 'Unknown',
    duration,
    type,
    lead_id: String(item.lead_id),
  };
}

export default function CallHistoryScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string }>();

  const [activeTab, setActiveTab] = useState<CallType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('All Dates');

  const query = useCalls();
  const rawData = query.data;
  const loading = query.isLoading;
  const isFetching = query.isFetching;
  const refetch = query.refetch;

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncDeviceCallLogs();
    } catch (e) {
      console.error('[CallHistoryScreen] Error syncing call logs during refresh:', e);
    } finally {
      await refetch();
      setRefreshing(false);
    }
  };

  useEffect(() => {
    syncDeviceCallLogs();
  }, []);

  const handleResetDate = () => {
    setSearchQuery('');
    setActiveTab('All');
  };

  const callLogs = useMemo(() => {
    if (!rawData) return [];
    const { leads, allLogs } = rawData;
    const leadMap: Record<string, { name: string; phone: string }> = {};
    leads.forEach((l: any) => {
      leadMap[String(l.id)] = {
        name: l.name || 'Unknown',
        phone: l.phone || l.mobile || '',
      };
    });

    const mapped: CallRecord[] = allLogs.map((item: any) => {
      const leadInfo = leadMap[String(item.lead_id)] || { name: 'Unknown', phone: '' };
      return formatCallLog(item, leadInfo);
    });

    // Extract call_start_time to allow sorting
    allLogs.forEach((item: any, idx: number) => {
      if (mapped[idx]) {
        (mapped[idx] as any).call_start_time = item.call_start_time;
      }
    });

    // Sort by call_start_time DESC
    mapped.sort((a: any, b: any) => {
      const dateA = a.call_start_time ? new Date(a.call_start_time).getTime() : 0;
      const dateB = b.call_start_time ? new Date(b.call_start_time).getTime() : 0;
      return dateB - dateA;
    });

    return mapped;
  }, [rawData]);

  // Filter call logs based on active tab and search query
  const filteredLogs = callLogs.filter((log) => {
    if (params.leadId && String(log.lead_id) !== String(params.leadId)) {
      return false;
    }

    const matchesTab = activeTab === 'All' || log.type === activeTab;
    const matchesSearch =
      log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.phoneNumber.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const renderCallItem = ({ item }: { item: CallRecord }) => {
    const config = {
      Incoming: { bg: COLORS.incomingBg, text: COLORS.incoming, icon: 'arrow-down-outline', label: 'Incoming' },
      Outgoing: { bg: COLORS.outgoingBg, text: COLORS.outgoing, icon: 'arrow-up-outline', label: 'Outgoing' },
      Missed: { bg: COLORS.missedBg, text: COLORS.missed, icon: 'close', label: 'Missed' },
    }[item.type];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{item.dateTime}</Text>
            </View>
            <View style={[styles.detailRow, { marginTop: 4 }]}>
              <Ionicons name="call-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{item.phoneNumber}</Text>
              <Text style={styles.durationDivider}>•</Text>
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>

          {/* Type Badge */}
          <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon as any} size={11} color={config.text} style={{ marginRight: 3 }} />
            <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader
        title={params.leadName ? `History - ${params.leadName}` : 'Call History'}
        showSearch={false}
        showBack={true}
      />

      {/* ── FILTERS & SEARCH ROW ───────────────────── */}
      <View style={styles.searchSection}>
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          {(['All', 'Incoming', 'Outgoing', 'Missed'] as CallType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, number..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Date picker row */}
        <View style={styles.datePickerRow}>
          <TouchableOpacity style={styles.datePickerBtn}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.datePickerText}>{dateRange}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResetDate} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Reset</Text>
            <Ionicons name="refresh-outline" size={14} color={theme.primaryColor} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── LIST OR LOADING ────────────────────────── */}
      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={styles.loadingText}>Syncing CRM Call Logs...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredLogs}
            keyExtractor={(item) => item.id}
            renderItem={renderCallItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing || isFetching}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyArea}>
                <Ionicons name="call-outline" size={48} color="#C2D3CC" />
                <Text style={styles.emptyTitle}>No call logs found</Text>
                <Text style={styles.emptySub}>Try changing your filter settings</Text>
              </View>
            }
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  searchSection: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEFF1',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.bgWhite,
  },
  tabButtonText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F5',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '500',
  },

  // Date Row
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F6F5',
  },
  datePickerText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.primaryColor,
  },

  // List Items
  listContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 5,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactInfo: {
    flex: 1,
    gap: 3,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  durationDivider: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  durationText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '700',
  },

  // Badges
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // States
  loadingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  simFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    gap: 6,
  },
  simFabText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
