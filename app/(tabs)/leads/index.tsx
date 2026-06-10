import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useLeads } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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

export default function LeadsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ priority?: string; tag?: string; owner?: string }>();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const { leads, isLoading, isFetching, refetch } = useLeads();
  useEffect(() => {
    if (leads) {
      console.log('[LeadsScreen] Rendered leads data:', leads);
    }
  }, [leads]);

  // Filtering Logic
  const filteredLeads = leads.filter((lead) => {
    // 1. Search Query
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Tag Filter
    let matchesTag = true;
    if (params.tag) {
      const activeTags = params.tag.split(',');
      if (activeTags.length > 0 && activeTags[0] !== '') {
        matchesTag = activeTags.includes(lead.tag);
      }
    }

    // 3. Priority Filter
    let matchesPriority = true;
    if (params.priority) {
      matchesPriority = lead.priority === params.priority;
    }

    // 4. Owner Filter
    let matchesOwner = true;
    if (params.owner && params.owner !== 'Select Owner') {
      matchesOwner = lead.owner === params.owner;
    }

    return matchesSearch && matchesTag && matchesPriority && matchesOwner;
  });

  const hasActiveFilters = !!(params.priority || params.tag || params.owner);



  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader title="Leads" showSearch={false} />

      {/* SEARCH AND FILTERS */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads..."
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
            pathname: '/(tabs)/leads/leads-filter',
            params: {
              priority: params.priority || '',
              tag: params.tag || '',
              owner: params.owner || '',
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

      {/* ACTIVE FILTERS SUMMARY CHIP */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
            {params.priority && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Priority: {params.priority}</Text>
              </View>
            )}
            {params.tag && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Tags: {params.tag}</Text>
              </View>
            )}
            {params.owner && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Owner: {params.owner}</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => router.push('/(tabs)/leads')}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>Clear All</Text>
            <Ionicons name="close-circle" size={15} color={COLORS.danger} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* LEADS LIST */}
      {isLoading && leads.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
        >
          {filteredLeads.map((lead, idx) => (
            <TouchableOpacity
              key={lead.id + '_' + idx}
              style={styles.card}
              onPress={() => router.push({
                pathname: '/(tabs)/leads/lead-details',
                params: {
                  id: lead.id,
                  name: lead.name,
                  company: lead.company,
                  email: lead.email,
                  phone: lead.phone,
                  tag: lead.tag,
                  priority: lead.priority,
                  owner: lead.owner,
                }
              })}
              activeOpacity={0.85}
            >
              {/* Top row: Name & Tag */}
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.cardName}>{lead.name}</Text>
                  {lead.priority === 'High' && (
                    <View style={[styles.priorityTag, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={{ fontSize: 9, color: COLORS.danger, fontWeight: '900' }}>HIGH</Text>
                    </View>
                  )}
                  {lead.priority === 'Normal' && (
                    <View style={[styles.priorityTag, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={{ fontSize: 9, color: '#D97706', fontWeight: '900' }}>NORMAL</Text>
                    </View>
                  )}
                  {lead.priority === 'Low' && (
                    <View style={[styles.priorityTag, { backgroundColor: '#E0F2FE' }]}>
                      <Text style={{ fontSize: 9, color: '#0284C7', fontWeight: '900' }}>LOW</Text>
                    </View>
                  )}
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{lead.tag}</Text>
                </View>
              </View>

              {/* Company Row */}
              <View style={styles.companyRow}>
                <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                <Text style={styles.companyText}>{lead.company}</Text>
              </View>

              {/* Contacts Row */}
              <View style={styles.contactsRow}>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                  <Text style={styles.contactText} numberOfLines={1}>{lead.email}</Text>
                </View>

                <View style={styles.contactItem}>
                  <Ionicons name="phone-portrait-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                  <Text style={styles.contactText} numberOfLines={1}>{lead.phone}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredLeads.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#C2D3CC" />
              <Text style={styles.emptyTitle}>No leads found</Text>
              <Text style={styles.emptySub}>Try searching another keyword or clear filters</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* PRIMARY GREEN ROUND FAB – opens add lead */}
      <View style={[
        styles.primaryFabWrapper,
        { bottom: Math.max(insets.bottom + 90, 100) }
      ]}>
        <TouchableOpacity
          style={styles.primaryFab}
          onPress={() => router.push('/(tabs)/leads/add-lead')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    height: 42,
    position: 'relative',
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
    backgroundColor: COLORS.danger,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 8,
    paddingVertical: 0,
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
    borderColor: '#E5E5E5',
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
    color: COLORS.danger,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 5,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  priorityTag: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.tagText,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  contactsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F5F2',
    paddingTop: 8,
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  contactText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
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

  primaryFabWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
  },
  primaryFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
});

