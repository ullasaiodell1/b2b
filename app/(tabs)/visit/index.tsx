import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Visit {
  id: string;
  name: string;
  company: string;
  location: string;
  status: 'Pending' | 'Complete' | 'Draft' | 'Bounce';
  lat: string;
  lng: string;
  avatar: any;
}

const VISIT_DATA: Visit[] = [
  {
    id: '1',
    name: 'Luis Downing',
    company: 'Luis Pvt. Ltd.',
    location: 'Western India.',
    status: 'Pending',
    lat: '18.4729° N',
    lng: '73.8567° E',
    avatar: require('@/assets/images/avatar_luis.png'),
  },
  {
    id: '2',
    name: 'Sherry Davis',
    company: 'Sherry Pvt. Ltd.',
    location: 'South Korea',
    status: 'Complete',
    lat: '37.5056° N',
    lng: '127.0498° E',
    avatar: require('@/assets/images/avatar_sherry.png'),
  },
  {
    id: '3',
    name: 'Luis Downing',
    company: 'Luis Pvt. Ltd.',
    location: 'Western India.',
    status: 'Pending',
    lat: '18.4729° N',
    lng: '73.8567° E',
    avatar: require('@/assets/images/avatar_luis.png'),
  },
  {
    id: '4',
    name: 'Sherry Davis',
    company: 'Sherry Pvt. Ltd.',
    location: 'South Korea',
    status: 'Complete',
    lat: '37.5056° N',
    lng: '127.0498° E',
    avatar: require('@/assets/images/avatar_sherry.png'),
  },
];

export default function VisitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; company?: string; dateRange?: string }>();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'All' | 'Complete' | 'Pending' | 'Bounce'>('All');

  // Filter calculations for top counts
  const totalCount = VISIT_DATA.length + 26; // Match "30" from mockup
  const completeCount = VISIT_DATA.filter(v => v.status === 'Complete').length + 10; // Match "12"
  const pendingCount = VISIT_DATA.filter(v => v.status === 'Pending').length; // Match "2"
  const bounceCount = 6; // Dummy match for list

  // Filtering Logic
  const filteredVisits = VISIT_DATA.filter((v) => {
    // Search Query
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Top Pill filter
    let matchesPill = true;
    if (selectedStatusTab !== 'All') {
      matchesPill = v.status === selectedStatusTab;
    }

    // Filter Param (from Filter Screen)
    let matchesParamStatus = true;
    if (params.status) {
      matchesParamStatus = v.status === params.status;
    }

    let matchesParamCompany = true;
    if (params.company && params.company !== 'Select Company') {
      matchesParamCompany = v.company === params.company;
    }

    return matchesSearch && matchesPill && matchesParamStatus && matchesParamCompany;
  });

  const hasActiveFilters = !!(params.status || params.company);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader title="Visit" showSearch={false} />

      {/* SEARCH AND FILTERS */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search visit..."
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
          style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          onPress={() => router.push({
            pathname: '/(tabs)/visit/visit-filter',
            params: {
              status: params.status || '',
              company: params.company || '',
              dateRange: params.dateRange || '',
            }
          })}
          activeOpacity={0.8}
        >
          <Ionicons
            name="funnel-outline"
            size={16}
            color={hasActiveFilters ? COLORS.primary : COLORS.textDark}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.filterBtnText, hasActiveFilters && styles.filterBtnTextActive]}>Filters</Text>
          {hasActiveFilters && (
            <View style={styles.filterDotBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL STATUS FILTER PILLS */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          <TouchableOpacity
            style={[styles.pill, selectedStatusTab === 'All' && styles.pillActive]}
            onPress={() => setSelectedStatusTab('All')}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: COLORS.blue }]} />
            <Text style={[styles.pillText, selectedStatusTab === 'All' && styles.pillTextActive]}>
              Total Visit <Text style={{ fontWeight: '800' }}>{totalCount}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, selectedStatusTab === 'Complete' && styles.pillActive]}
            onPress={() => setSelectedStatusTab('Complete')}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
            <Text style={[styles.pillText, selectedStatusTab === 'Complete' && styles.pillTextActive]}>
              Complete <Text style={{ fontWeight: '800' }}>{completeCount}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, selectedStatusTab === 'Pending' && styles.pillActive]}
            onPress={() => setSelectedStatusTab('Pending')}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: COLORS.orange }]} />
            <Text style={[styles.pillText, selectedStatusTab === 'Pending' && styles.pillTextActive]}>
              Pending <Text style={{ fontWeight: '800' }}>{pendingCount}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, selectedStatusTab === 'Bounce' && styles.pillActive]}
            onPress={() => setSelectedStatusTab('Bounce')}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: COLORS.red }]} />
            <Text style={[styles.pillText, selectedStatusTab === 'Bounce' && styles.pillTextActive]}>
              Bounce <Text style={{ fontWeight: '800' }}>{bounceCount}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ACTIVE FILTERS SUMMARY CHIP */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
            {params.status && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Status: {params.status}</Text>
              </View>
            )}
            {params.company && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Company: {params.company}</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => router.push('/(tabs)/visit')}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>Clear All</Text>
            <Ionicons name="close-circle" size={15} color={COLORS.red} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* VISITS LIST */}
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredVisits.map((visit) => {
          const isPending = visit.status === 'Pending';
          const isComplete = visit.status === 'Complete';
          const statusColor = isPending ? COLORS.orange : isComplete ? COLORS.green : COLORS.red;

          return (
            <View key={visit.id} style={styles.card}>
              <Image source={visit.avatar} style={styles.cardAvatar} />

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{visit.name}</Text>

                <View style={styles.cardRow}>
                  <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                  <Text style={styles.cardText} numberOfLines={1}>{visit.company}</Text>
                </View>

                <View style={styles.cardRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                  <Text style={styles.cardText} numberOfLines={1}>{visit.location}</Text>
                </View>

                {/* Status Row with outline circle */}
                <View style={styles.cardRow}>
                  <View style={[styles.statusCircleOutline, { borderColor: statusColor }]}>
                    <View style={[styles.statusCircleDot, { backgroundColor: statusColor }]} />
                  </View>
                  <Text style={[styles.statusText, { color: statusColor }]}>{visit.status}</Text>
                </View>

                {/* Geo Coordinates */}
                <View style={styles.coordinatesContainer}>
                  <View style={styles.coordinateItem}>
                    <Ionicons name="globe-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
                    <Text style={styles.coordinateText}>{visit.lat}</Text>
                  </View>
                  <View style={styles.coordinateItem}>
                    <Ionicons name="globe-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
                    <Text style={styles.coordinateText}>{visit.lng}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {filteredVisits.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={48} color="#C2D3CC" />
            <Text style={styles.emptyTitle}>No visits found</Text>
            <Text style={styles.emptySub}>Try adjusting search criteria or clear status filters</Text>
          </View>
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={[styles.fabBtn, { bottom: Math.max(insets.bottom + 90, 100) }]}
        onPress={() => router.push('/(tabs)/visit/add-visit')}
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
    paddingBottom: 14,
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
  searchSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 12,
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
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textDark,
    fontWeight: '600',
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
    height: 42,
  },
  filterBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  filterBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  filterBtnTextActive: {
    color: COLORS.primary,
  },
  filterDotBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red,
  },

  // Pills styling
  pillsContainer: {
    backgroundColor: COLORS.bgWhite,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pillsScroll: {
    paddingHorizontal: 10,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    height: 30,
  },
  pillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Active filters banner styling
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between',
  },
  activeFiltersScroll: {
    gap: 6,
    alignItems: 'center',
  },
  filterBadgeChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.red,
  },

  // List card styling
  listContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  cardAvatar: {
    width: 95,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
    gap: 4.5,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Status outline badge styling
  statusCircleOutline: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusCircleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Geolocation details
  coordinatesContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  coordinateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Floating Action Button
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

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
import CustomHeader from '@/components/custom/CustomHeader';
