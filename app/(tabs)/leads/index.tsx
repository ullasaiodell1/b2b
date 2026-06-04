import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { leadsState, subscribeToLeads, LeadRecord } from '@/components/LeadState';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#DCE5E1',
  tagBg: '#ECFDF5',
  tagText: '#047857',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export default function LeadsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ priority?: string; tag?: string; owner?: string }>();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<LeadRecord[]>(leadsState);
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Speed Dial FAB Animation
  const speedDialAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(speedDialAnim, {
      toValue: isFabOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [isFabOpen]);

  // + rotates to × when open
  const mainBtnRotation = speedDialAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const speedDialScale = speedDialAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const speedDialOpacity = speedDialAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.4, 1],
  });

  const speedDialTranslation = speedDialAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  useEffect(() => {
    return subscribeToLeads(() => {
      setLeads([...leadsState]);
    });
  }, []);

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

  const handleFabAction = (route: string) => {
    setIsFabOpen(false);
    router.push(route as any);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16), justifyContent: 'center', position: 'relative' }]}>
        <View style={styles.centerLogoSection}>
          <Ionicons name="star" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.logoText}>BASALT</Text>
        </View>
      </View>

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
      <ScrollView 
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
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
              </View>
              <View style={styles.tagBadge}>
                <Ionicons name="pricetag-outline" size={10} color={COLORS.tagText} style={{ marginRight: 4 }} />
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

      {/* FAB OVERLAY BACKDROP */}
      {isFabOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setIsFabOpen(false)}
        >
          <Animated.View style={[styles.fabBackdrop, { opacity: speedDialOpacity }]} />
        </Pressable>
      )}

      {/* EXPANDABLE FAB OPTION MENU */}
      {isFabOpen && (
        <Animated.View style={[
          styles.fabMenuContainer,
          {
            bottom: Math.max(insets.bottom + 160, 170),
            opacity: speedDialOpacity,
            transform: [
              { translateY: speedDialTranslation },
              { scale: speedDialScale },
            ],
          }
        ]}>
          {/* Add Lead */}
          <View style={styles.fabMenuItem}>
            <Text style={styles.fabMenuLabel}>Add Lead</Text>
            <TouchableOpacity 
              style={styles.fabMiniBtn} 
              onPress={() => handleFabAction('/(tabs)/leads/add-lead')}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Add Call */}
          <View style={styles.fabMenuItem}>
            <Text style={styles.fabMenuLabel}>Add Call</Text>
            <TouchableOpacity 
              style={styles.fabMiniBtn} 
              onPress={() => handleFabAction('/(tabs)/call/add-call')}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Add Meeting */}
          <View style={styles.fabMenuItem}>
            <Text style={styles.fabMenuLabel}>Add Meeting</Text>
            <TouchableOpacity 
              style={styles.fabMiniBtn} 
              onPress={() => handleFabAction('/(tabs)/meeting/add-meeting')}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Add Visit */}
          <View style={styles.fabMenuItem}>
            <Text style={styles.fabMenuLabel}>Add Visit</Text>
            <TouchableOpacity 
              style={styles.fabMiniBtn} 
              onPress={() => handleFabAction('/(tabs)/visit/add-visit')}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Add Task */}
          <View style={styles.fabMenuItem}>
            <Text style={styles.fabMenuLabel}>Add Task</Text>
            <TouchableOpacity 
              style={styles.fabMiniBtn} 
              onPress={() => handleFabAction('/(tabs)/task/add-task')}
              activeOpacity={0.8}
            >
              <Ionicons name="checkbox" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* PRIMARY GREEN ROUND FAB – always shows + */}
      <View style={[
        styles.primaryFabWrapper,
        { bottom: Math.max(insets.bottom + 90, 100) }
      ]}>
        <TouchableOpacity
          style={styles.primaryFab}
          onPress={() => setIsFabOpen(!isFabOpen)}
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
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
    paddingHorizontal: 20,
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
    color: COLORS.danger,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
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

  // FAB Expandable Overlay
  fabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    zIndex: 90,
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
  fabMenuContainer: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 95,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fabMenuLabel: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fabMiniBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0D0F0E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
