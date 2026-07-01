import React, { useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRouter, useFocusEffect } from 'expo-router';

import { COLORS } from '@/constants/theme';
import CustomHeader from '@/components/custom/CustomHeader';
import { useTheme } from '@/hooks/use-theme';
import { useVisits } from '@/hooks/useVisits';
import { VisitCard } from './VisitCard';

export interface VisitsComponentProps {
  leadId?: string;
  leadName?: string;
  company?: string;
  phone?: string;
  email?: string;
  isEmbedded?: boolean;
}

export function VisitsComponent({
  leadId: propLeadId,
  leadName: propLeadName,
  company: propCompany,
  phone: propPhone,
  email: propEmail,
  isEmbedded = false,
}: VisitsComponentProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params as {
    status?: string;
    company?: string;
    dateRange?: string;
    leadId?: string;
    leadName?: string;
    phone?: string;
    email?: string;
    referrer?: string;
  }) || {};
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const leadId = propLeadId !== undefined ? propLeadId : params.leadId;
  const leadName = propLeadName !== undefined ? propLeadName : params.leadName;
  const company = propCompany !== undefined ? propCompany : params.company;

  const handleBack = () => {
    navigation.goBack();
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const apiFilterParams = React.useMemo(() => {
    const p: any = {};
    if (params.status) p.status = params.status;
    if (params.dateRange) p.dateRange = params.dateRange;
    if (leadId) p.lead_id = leadId;
    return p;
  }, [params.status, params.dateRange, leadId]);

  const { data: responseData, isLoading, refetch } = useVisits(apiFilterParams) as any;

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );
  const visits = Array.isArray(responseData)
    ? responseData
    : (Array.isArray(responseData?.data)
      ? responseData.data
      : (Array.isArray(responseData?.data?.data)
        ? responseData.data.data
        : []));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'All' | 'Complete' | 'Pending' | 'Bounce'>('All');

  const getDisplayStatus = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'COMPLETE') return 'Complete';
    if (s === 'DRAFT') return 'Draft';
    if (s === 'BOUNCE') return 'Bounce';
    return 'Pending';
  };

  // Filter calculations for top counts
  const totalCount = visits.length;
  const completeCount = visits.filter((v: any) => getDisplayStatus(v.status) === 'Complete').length;
  const pendingCount = visits.filter((v: any) => getDisplayStatus(v.status) === 'Pending').length;
  const bounceCount = visits.filter((v: any) => getDisplayStatus(v.status) === 'Bounce').length;

  const parseDate = (str: string): Date | null => {
    try {
      const parts = str.trim().split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    } catch (e) {
      console.log('Error parsing date:', e);
    }
    return null;
  };

  // Filtering Logic
  const filteredVisits = visits.filter((v: any) => {
    // Search Query
    const titleVal = v.title || '';
    const companyVal = v.company || v.lead_company_name || '';
    const visitTypeVal = v.visit_type || 'Site Visit';
    const locationVal = v.location_address || '';

    const matchesSearch =
      titleVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitTypeVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locationVal.toLowerCase().includes(searchQuery.toLowerCase());

    // Top Pill filter
    let matchesPill = true;
    if (selectedStatusTab !== 'All') {
      matchesPill = getDisplayStatus(v.status) === selectedStatusTab;
    }

    // Filter Param (from Filter Screen)
    let matchesParamStatus = true;
    if (params.status) {
      matchesParamStatus = getDisplayStatus(v.status) === params.status;
    }

    let matchesParamCompany = true;
    if (!leadId && company && company !== 'Select Company') {
      matchesParamCompany = (v.company === company || v.lead_company_name === company);
    }

    let matchesDate = true;
    if (params.dateRange && params.dateRange.includes(' - ')) {
      const parts = params.dateRange.split(' - ');
      const from = parseDate(parts[0]);
      const to = parseDate(parts[1]);
      if (from && to && v.scheduled_time) {
        const logDate = new Date(v.scheduled_time);
        const logTime = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).getTime();
        const fromTime = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
        const toTime = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
        matchesDate = logTime >= fromTime && logTime <= toTime;
      }
    }

    return matchesSearch && matchesPill && matchesParamStatus && matchesParamCompany && matchesDate;
  });

  const hasActiveFilters = !!(params.status || (company && company !== 'Select Company') || params.dateRange);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      {!isEmbedded && <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />}

      {!isEmbedded && (
        <CustomHeader
          title="Visit"
          showSearch={false}
          showBack={!!leadId}
          onBackPress={handleBack}
        />
      )}

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
          onPress={() => {
            const targetScreen = leadId ? 'lead-visit-filter' : 'visit-filter';
            navigation.navigate(targetScreen, {
              status: params.status || '',
              company: company || '',
              dateRange: params.dateRange || '',
              leadId: leadId || '',
            });
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="funnel-outline"
            size={16}
            color={hasActiveFilters ? theme.primaryColor : COLORS.textDark}
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
            {company && company !== 'Select Company' && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Company: {company}</Text>
              </View>
            )}
            {params.dateRange && (
              <View style={styles.filterBadgeChip}>
                <Text style={styles.filterBadgeText}>Date: {params.dateRange}</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              const targetScreen = leadId ? 'lead-visit' : 'index';
              navigation.navigate(targetScreen, { status: undefined, company: undefined, dateRange: undefined, leadId });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>Clear All</Text>
            <Ionicons name="close-circle" size={15} color={COLORS.red} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* VISITS LIST */}
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: isEmbedded ? 20 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primaryColor} />
        }
      >
        {isLoading && filteredVisits.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
          </View>
        ) : null}
        {filteredVisits.map((visit: any) => (
          <VisitCard
            key={visit.id}
            visit={visit}
            onPress={() => {
              const targetScreen = leadId ? 'lead-visit-details' : 'visit-details';
              navigation.navigate(targetScreen, {
                id: visit.id,
                leadId: visit.lead_id || leadId || '',
              });
            }}
          />
        ))}

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
        style={[styles.fabBtn, { bottom: isEmbedded ? 20 : Math.max(insets.bottom + 120, 130) }]}
        onPress={() => {
          const targetScreen = leadId ? 'lead-add-visit' : 'add-visit';
          navigation.navigate(targetScreen, { leadId: leadId || '' });
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  searchSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 10,
    gap: 2,
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
    borderColor: theme.primaryColor,
    backgroundColor: theme.primaryLight,
  },
  filterBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  filterBtnTextActive: {
    color: theme.primaryColor,
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
    paddingVertical: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pillsScroll: {
    paddingHorizontal: 5,
    gap: 2,
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
    borderColor: theme.primaryColor,
    backgroundColor: theme.primaryLight,
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
    color: theme.primaryColor,
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

  // Floating Action Button
  fabBtn: {
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
