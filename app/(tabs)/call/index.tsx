import { COLORS } from '@/constants/theme';
import { useCalls } from '@/hooks/useCalls';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '@/components/custom/CustomHeader';

type CallType = 'All' | 'Incoming' | 'Outgoing' | 'Missed';

export default function CallHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { calls, filter: filters, updateFilter, isLoading, isFetching, refetch } = useCalls();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<CallType>('All');

  const handleClearStatusFilter = () => {
    updateFilter({
      ...filters,
      status: '',
    });
  };

  const handleClearDateFilter = () => {
    updateFilter({
      ...filters,
      dateRange: '28 Dec 22 - 10 Jan 23',
    });
  };

  // Filter logs
  const filteredLogs = calls.filter((log) => {
    const matchesTab = activeTab === 'All' || log.type === activeTab;

    // Status filter from Call Filter screen
    let matchesStatus = true;
    if (filters.status) {
      matchesStatus = log.type === filters.status;
    }

    const matchesSearch =
      log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.phoneNumber.includes(searchQuery);

    return matchesTab && matchesStatus && matchesSearch;
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader title="Call" showSearch={false} />

      {/* TOP SEARCH & FILTER BAR */}
      <View style={styles.topBar}>
        {/* Tab Capsules */}
        <View style={styles.tabContainer}>
          {(['All', 'Incoming', 'Outgoing', 'Missed'] as CallType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search input and Filters button */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
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

          <TouchableOpacity
            style={[styles.filterBtn, !!filters.status && styles.filterBtnActive]}
            onPress={() => router.push('/(tabs)/call/call-filter' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="funnel-outline" size={16} color={filters.status ? COLORS.primary : COLORS.textDark} style={{ marginRight: 6 }} />
            <Text style={[styles.filterBtnText, !!filters.status && styles.filterBtnTextActive]}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Active Filter Bubbles */}
        {(filters.status !== '' || (filters.dateRange && filters.dateRange !== '28 Dec 22 - 10 Jan 23')) && (
          <View style={styles.bubbleRow}>
            {filters.status !== '' && (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{filters.status}</Text>
                <TouchableOpacity onPress={handleClearStatusFilter}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}

            {filters.dateRange && filters.dateRange !== '28 Dec 22 - 10 Jan 23' && (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{filters.dateRange}</Text>
                <TouchableOpacity onPress={handleClearDateFilter}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* SCROLLABLE LIST */}
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >
        {isLoading && calls.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }}>Loading call history...</Text>
          </View>
        ) : (
          filteredLogs.map((item, idx) => {
            const config = {
              Incoming: { bg: COLORS.incomingBg, text: COLORS.incoming, icon: 'checkmark-sharp', label: 'Incoming' },
              Outgoing: { bg: COLORS.outgoingBg, text: COLORS.outgoing, icon: 'arrow-up', label: 'Outgoing' },
              Missed: { bg: COLORS.missedBg, text: COLORS.missed, icon: 'arrow-down', label: 'Missed' },
            }[item.type];

            return (
              <View key={item.id + '_' + idx} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>

                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.detailText}>{item.dateTime}</Text>
                    </View>

                    <View style={[styles.detailRow, { marginTop: 3 }]}>
                      <Ionicons name="phone-portrait-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.detailText}>{item.phoneNumber}</Text>
                      <Ionicons name="time-outline" size={14} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
                      <Text style={styles.detailText}>{item.duration}</Text>
                    </View>
                  </View>

                  <View style={[styles.badge, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon as any} size={11} color={config.text} style={{ marginRight: 3 }} />
                    <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {filteredLogs.length === 0 && (
          <View style={styles.emptyArea}>
            <Ionicons name="call-outline" size={48} color="#C2D3CC" />
            <Text style={styles.emptyTitle}>No call logs found</Text>
            <Text style={styles.emptySub}>Try changing your filter settings</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button to Add Call */}
      <TouchableOpacity
        style={[styles.fabBtn, { bottom: Math.max(insets.bottom + 90, 100) }]}
        onPress={() => router.push('/(tabs)/call/add-call' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  topBar: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F7F5',
    borderRadius: 10,
    padding: 3,
    height: 40,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1.5,
  },
  tabButtonText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textDark,
    fontWeight: '600',
    height: '100%',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40,
  },
  filterBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  filterBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  filterBtnTextActive: {
    color: COLORS.primary,
  },
  bubbleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5D0CB',
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 5,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
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
    gap: 4,
  },
  contactName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  emptyArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  fabBtn: {
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
});
