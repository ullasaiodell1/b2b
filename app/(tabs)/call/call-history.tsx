import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Fallback to dynamic import to prevent bundling crashes on unsupported platforms
let CallLogs: any = null;
try {
  CallLogs = require('react-native-call-log').default;
} catch (e) {
  console.log('react-native-call-log not loaded or unavailable in this environment');
}

type CallType = 'All' | 'Incoming' | 'Outgoing' | 'Missed';

interface CallRecord {
  id: string;
  name: string;
  phoneNumber: string;
  dateTime: string;
  duration: string;
  type: 'Incoming' | 'Outgoing' | 'Missed';
}

const MOCK_CALL_LOGS: CallRecord[] = [
  {
    id: '1',
    name: 'Khushal Nadiyapara',
    phoneNumber: '+91 12345 67890',
    dateTime: '20 Jan 2026, 12:02pm',
    duration: '18.00 min',
    type: 'Incoming',
  },
  {
    id: '2',
    name: 'Parth Solanki',
    phoneNumber: '+91 12345 67890',
    dateTime: '20 Jan 2026, 12:03pm',
    duration: '10.50 min',
    type: 'Outgoing',
  },
  {
    id: '3',
    name: 'Jigar Kalariya',
    phoneNumber: '+91 12345 67890',
    dateTime: '20 Jan 2026, 12:30pm',
    duration: '00.00 min',
    type: 'Missed',
  },
  {
    id: '4',
    name: 'Khushal Nadiyapara',
    phoneNumber: '+91 12345 67890',
    dateTime: '19 Jan 2026, 03:45pm',
    duration: '12.00 min',
    type: 'Incoming',
  },
  {
    id: '5',
    name: 'Parth Solanki',
    phoneNumber: '+91 12345 67890',
    dateTime: '18 Jan 2026, 06:10pm',
    duration: '05.20 min',
    type: 'Outgoing',
  },
  {
    id: '6',
    name: 'Khushal Nadiyapara',
    phoneNumber: '+91 12345 67890',
    dateTime: '18 Jan 2026, 10:30am',
    duration: '15.40 min',
    type: 'Incoming',
  },
  {
    id: '7',
    name: 'Parth Solanki',
    phoneNumber: '+91 12345 67890',
    dateTime: '17 Jan 2026, 02:22pm',
    duration: '08.10 min',
    type: 'Outgoing',
  },
  {
    id: '8',
    name: 'Jigar Kalariya',
    phoneNumber: '+91 12345 67890',
    dateTime: '17 Jan 2026, 11:15am',
    duration: '00.00 min',
    type: 'Missed',
  },
  {
    id: '9',
    name: 'Anjon Patel',
    phoneNumber: '+91 99988 77766',
    dateTime: '16 Jan 2026, 09:30am',
    duration: '00.00 min',
    type: 'Missed',
  },
];

export default function CallHistoryScreen() {
  const [activeTab, setActiveTab] = useState<CallType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [callLogs, setCallLogs] = useState<CallRecord[]>(MOCK_CALL_LOGS);
  const [dateRange, setDateRange] = useState('20 Dec 25 - 20 Jan 26');

  useEffect(() => {
    fetchRealCallLogs();
  }, []);

  const fetchRealCallLogs = async () => {
    if (Platform.OS !== 'android' || !CallLogs) {
      return; // Gracefully rely on high-fidelity mock list on iOS or Simulators
    }

    try {
      setLoading(true);
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        {
          title: 'Call Log Permission',
          message: 'Basalt App needs access to your call logs to sync call histories.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const logs = await CallLogs.loadAll();
        if (logs && logs.length > 0) {
          // Format Android native call logs to match our interface
          const formatted: CallRecord[] = logs.map((log: any, index: number) => {
            let type: 'Incoming' | 'Outgoing' | 'Missed' = 'Incoming';
            if (log.type === 'OUTGOING') type = 'Outgoing';
            if (log.type === 'MISSED') type = 'Missed';

            const durationSec = parseInt(log.duration || '0', 10);
            const durationMin = (durationSec / 60).toFixed(2) + ' min';

            return {
              id: log.timestamp + '-' + index,
              name: log.name || 'Unknown Contact',
              phoneNumber: log.phoneNumber || 'Private Number',
              dateTime: new Date(parseInt(log.timestamp)).toLocaleString(),
              duration: durationMin,
              type,
            };
          });
          setCallLogs(formatted);
        }
      }
    } catch (e) {
      console.log('Error loading native call logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDate = () => {
    setDateRange('20 Dec 25 - 20 Jan 26');
    setSearchQuery('');
    setActiveTab('All');
  };

  // Filter call logs based on active tab and search query
  const filteredLogs = callLogs.filter((log) => {
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
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader title="Call History" showSearch={false} />

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
            <Ionicons name="refresh-outline" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── LIST OR LOADING ────────────────────────── */}
      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Syncing Android Call Logs...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredLogs}
            keyExtractor={(item) => item.id}
            renderItem={renderCallItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyArea}>
                <Ionicons name="call-outline" size={48} color="#C2D3CC" />
                <Text style={styles.emptyTitle}>No call logs found</Text>
                <Text style={styles.emptySub}>Try changing your filter settings</Text>
              </View>
            }
          />

          {/* Call Simulation Float Action Button */}
          <TouchableOpacity
            style={styles.simFab}
            activeOpacity={0.85}
            onPress={() => {
              const names = ['Anjon Patel', 'Dharmesh Vala', 'Vijay Rathod', 'Nirav Chawda', 'Harshil Shah'];
              const numbers = ['+91 99887 76655', '+91 98765 43210', '+91 91234 56789', '+91 88877 66655'];
              const types: ('Incoming' | 'Outgoing' | 'Missed')[] = ['Incoming', 'Outgoing', 'Missed'];

              const newCall: CallRecord = {
                id: Date.now().toString(),
                name: names[Math.floor(Math.random() * names.length)],
                phoneNumber: numbers[Math.floor(Math.random() * numbers.length)],
                dateTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', Today',
                duration: Math.floor(Math.random() * 20) + '.00 min',
                type: types[Math.floor(Math.random() * types.length)],
              };

              setCallLogs([newCall, ...callLogs]);
            }}
          >
            <Ionicons name="flash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.simFabText}>Simulate Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: COLORS.primary,
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
