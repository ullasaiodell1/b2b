import CustomHeader from '@/components/custom/CustomHeader';
import { updateLeadsState } from '@/components/lead/LeadState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeads } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
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

export default function LeadsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams<{
    priority?: string;
    tag?: string;
    owner?: string;
    assigned_to?: string;
    source?: string;
    source_id?: string;
    status?: string;
    dateRange?: string;
    from_date?: string;
    to_date?: string;
  }>();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');

  const apiParams = React.useMemo(() => {
    const p: any = {};
    if (params.priority) p.priority = params.priority;
    if (params.source_id) p.source_id = params.source_id;
    if (params.assigned_to) p.assigned_to = params.assigned_to;
    if (params.from_date) p.from_date = params.from_date;
    if (params.to_date) p.to_date = params.to_date;
    if (params.tag === 'Verified') {
      p.is_verified = 'true';
    } else if (params.tag === 'Customer') {
      p.is_customer = 'true';
    } else if (params.tag) {
      p.tag = params.tag;
    }
    return p;
  }, [params.priority, params.source_id, params.assigned_to, params.from_date, params.to_date, params.tag]);

  const leadsQuery = useLeads(apiParams);
  const { data: rawLeads = [], isLoading, isFetching, refetch } = leadsQuery;

  useEffect(() => {
    if (leadsQuery.data) {
      console.log('[useLeads] Query success data count:', leadsQuery.data.length);
      updateLeadsState(leadsQuery.data);
    }
  }, [leadsQuery.data]);

  useEffect(() => {
    if (leadsQuery.isError) {
      console.error('[useLeads] Query error:', leadsQuery.error);
    }
  }, [leadsQuery.isError, leadsQuery.error]);

  const { primaryColor, primaryLight } = useTheme();

  const leads = React.useMemo(() => {
    return rawLeads.map((item: any) => {
      let priority: 'High' | 'Normal' | 'Low' = 'Normal';
      const rawPriority = (item.priority || '').toUpperCase();
      if (rawPriority === 'HOT' || rawPriority === 'HIGH') priority = 'High';
      else if (rawPriority === 'WARM' || rawPriority === 'NORMAL') priority = 'Normal';
      else if (rawPriority === 'COLD' || rawPriority === 'LOW') priority = 'Low';

      const tag = (item.tags && Array.isArray(item.tags) && item.tags[0]?.name)
        || item.tag
        || '';

      return {
        id: String(item.id),
        name: item.name || '----',
        company: item.company_name || item.company || '----',
        email: item.email || '----',
        phone: item.phone || '----',
        tag: tag || '----',
        priority: priority,
        owner: item.assigned_to_name || item.owner || '----',
        status: item.status_name || item.status || '----',
        source: item.source_name || item.source || '----',
        ...item,
      } as any;
    });
  }, [rawLeads]);
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
      if (params.tag === 'Verified') {
        matchesTag = lead.is_verified === true || lead.is_verified === 1 || String(lead.is_verified) === 'true' || lead.tag === 'Verified';
      } else if (params.tag === 'Customer') {
        matchesTag = lead.is_customer === true || lead.is_customer === 1 || String(lead.is_customer) === 'true' || lead.tag === 'Customer';
      } else {
        const activeTags = params.tag.split(',');
        if (activeTags.length > 0 && activeTags[0] !== '') {
          matchesTag = activeTags.includes(lead.tag);
        }
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

    // 5. Source Filter
    let matchesSource = true;
    if (params.source) {
      matchesSource = lead.source === params.source;
    }

    // 6. Status/Stage Filter
    let matchesStatus = true;
    if (params.status) {
      if (params.status === '__NONE__') {
        matchesStatus = false;
      } else {
        const activeStatuses = params.status.split(',').filter(Boolean);
        if (activeStatuses.length > 0) {
          matchesStatus = activeStatuses.some(
            (statusName) => (lead.status || '').toLowerCase() === statusName.toLowerCase()
          );
        }
      }
    }

    // 7. Date Range Filter
    let matchesDate = true;
    if (params.dateRange && params.dateRange !== 'Select date range') {
      const createdDate = new Date(lead.created_at || lead.createdAt);
      if (!isNaN(createdDate.getTime())) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (params.dateRange === 'Today') {
          matchesDate = createdDate >= today;
        } else if (params.dateRange === 'Yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = createdDate >= yesterday && createdDate < today;
        } else if (params.dateRange === 'Last 7 Days') {
          const last7 = new Date(today);
          last7.setDate(last7.getDate() - 7);
          matchesDate = createdDate >= last7;
        } else if (params.dateRange === 'Last 30 Days') {
          const last30 = new Date(today);
          last30.setDate(last30.getDate() - 30);
          matchesDate = createdDate >= last30;
        } else if (params.dateRange === 'This Month') {
          const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = createdDate >= firstDayThisMonth;
        } else if (params.dateRange === 'Last Month') {
          const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          matchesDate = createdDate >= firstDayLastMonth && createdDate <= lastDayLastMonth;
        } else if (params.dateRange === 'Custom Range') {
          if (params.from_date && params.to_date) {
            const fromD = new Date(params.from_date);
            const toD = new Date(params.to_date);
            toD.setHours(23, 59, 59, 999);
            matchesDate = createdDate >= fromD && createdDate <= toD;
          }
        }
      }
    }

    return matchesSearch && matchesTag && matchesPriority && matchesOwner && matchesSource && matchesStatus && matchesDate;
  });

  const hasActiveFilters = !!(params.priority || params.tag || params.owner || params.source || params.status || params.dateRange || params.from_date || params.to_date);

  const isNavigatingRef = React.useRef(false);

  const handleLeadPress = (lead: any) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    router.push({
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
    });
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };



  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
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
          style={[
            styles.filterBtn,
            hasActiveFilters && { borderColor: primaryColor, backgroundColor: primaryLight }
          ]}
          onPress={() => {
            if (isNavigatingRef.current) return;
            isNavigatingRef.current = true;
            router.push({
              pathname: '/(tabs)/leads/leads-filter',
              params: {
                priority: params.priority || '',
                tag: params.tag || '',
                owner: params.owner || '',
                assigned_to: params.assigned_to || '',
                source: params.source || '',
                source_id: params.source_id || '',
                status: params.status || '',
                dateRange: params.dateRange || '',
                from_date: params.from_date || '',
                to_date: params.to_date || '',
              }
            });
            setTimeout(() => {
              isNavigatingRef.current = false;
            }, 1000);
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="funnel-outline"
            size={16}
            color={hasActiveFilters ? primaryColor : COLORS.textDark}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.filterBtnText, hasActiveFilters && { color: primaryColor }]}>Filters</Text>
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
                <Text style={styles.filterBadgeText}>
                  {params.tag === 'Verified' || params.tag === 'Customer' ? `Type: ${params.tag}` : `Tags: ${params.tag}`}
                </Text>
              </View>
            )}
            {params.owner && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Owner: {params.owner}</Text>
              </View>
            )}
            {params.source && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Source: {params.source}</Text>
              </View>
            )}
            {params.status && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Stages: {params.status === '__NONE__' ? 'None' : params.status}</Text>
              </View>
            )}
            {params.dateRange && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>
                  Date: {params.dateRange === 'Custom Range' && params.from_date && params.to_date
                    ? `${params.from_date} to ${params.to_date}`
                    : params.dateRange}
                </Text>
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
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[primaryColor]} />
          }
        >
          {filteredLeads.map((lead, idx) => (
            <TouchableOpacity
              key={lead.id + '_' + idx}
              style={styles.card}
              onPress={() => handleLeadPress(lead)}
              activeOpacity={0.85}
            >
              {/* Top row: Name & Tag */}
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.cardName}>{lead.name}</Text>
                  {(lead.is_verified === true || lead.is_verified === 1 || String(lead.is_verified) === 'true') ? (
                    <Ionicons name="shield-checkmark-outline" size={14} color="#16A34A" />
                  ) : null}
                  {(lead.is_customer === true || lead.is_customer === 1 || String(lead.is_customer) === 'true' || lead.lead_type === 'CUSTOMER' || lead.leadType === 'CUSTOMER') ? (
                    <Ionicons name="checkmark-circle-outline" size={14} color="#2563EB" />
                  ) : null}
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
                <TouchableOpacity
                  style={styles.contactItem}
                  activeOpacity={0.7}
                  onPress={(e) => {
                    if (lead.email) {
                      Linking.openURL(`mailto:${lead.email}`);
                    }
                  }}
                >
                  <Ionicons name="mail-outline" size={14} color="#2563EB" style={{ marginRight: 6 }} />
                  <Text style={[styles.contactText, lead.email ? styles.contactLink : null]} numberOfLines={1}>
                    {lead.email || '—'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contactItem}
                  activeOpacity={0.7}
                  onPress={(e) => {
                    if (lead.phone) {
                      Linking.openURL(`tel:${lead.phone}`);
                    }
                  }}
                >
                  <Ionicons name="call-outline" size={14} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text style={[styles.contactText, lead.phone ? styles.contactLinkGreen : null]} numberOfLines={1}>
                    {lead.phone || '—'}
                  </Text>
                </TouchableOpacity>
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
          style={[styles.primaryFab, { backgroundColor: primaryColor, shadowColor: primaryColor }]}
          onPress={() => {
            if (isNavigatingRef.current) return;
            isNavigatingRef.current = true;
            router.push('/(tabs)/leads/add-lead');
            setTimeout(() => {
              isNavigatingRef.current = false;
            }, 1000);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
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
  filterBtnActive: {},
  filterBtnTextActive: {},
  filterBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
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
  contactLink: {
    color: '#2563EB',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  contactLinkGreen: {
    color: '#16A34A',
    fontWeight: '700',
    textDecorationLine: 'underline',
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
});

