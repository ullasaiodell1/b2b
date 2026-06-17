import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeads } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface LeadSelectCardProps {
  selectedLeadId: string | null;
  onSelectLead: (leadId: string | null, leadName: string | null, leadCompany: string | null) => void;
  initialLeadId?: string;
  initialLeadName?: string;
  initialLeadCompany?: string;
}

export function LeadSelectCard({
  selectedLeadId,
  onSelectLead,
  initialLeadId,
  initialLeadName,
  initialLeadCompany
}: LeadSelectCardProps) {
  const { primaryColor } = useTheme();
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [showLeadList, setShowLeadList] = useState(!initialLeadId);

  const leadsQuery = useLeads();
  const { data: rawLeads = [], isLoading: isLoadingLeads } = leadsQuery;

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
        name: item.name || '',
        company: item.company_name || item.company || '',
        email: item.email || '',
        phone: item.phone || '',
        tag: tag,
        priority: priority,
        owner: item.assigned_to_name || item.owner || '',
        status: item.status_name || item.status || '',
        source: item.source_name || item.source || '',
        ...item,
      };
    });
  }, [rawLeads]);

  // Find the selected lead details if available
  const selectedLead = React.useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find((l: any) => l.id === selectedLeadId) || {
      id: selectedLeadId,
      name: initialLeadName || '',
      company: initialLeadCompany || '',
      priority: undefined,
      tag: undefined,
      email: undefined,
      phone: undefined,
    };
  }, [leads, selectedLeadId, initialLeadName, initialLeadCompany]);

  const filteredLeads = React.useMemo(() => {
    if (!leadSearchQuery) return leads;
    return leads.filter((lead: any) =>
      lead.name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(leadSearchQuery.toLowerCase())
    );
  }, [leads, leadSearchQuery]);

  const handleLeadSelect = (lead: any) => {
    onSelectLead(lead.id, lead.name, lead.company);
    setShowLeadList(false);
    setLeadSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {selectedLeadId ? (
        <View style={styles.selectedLeadCard}>
          <View style={styles.selectedLeadHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="person-circle-outline" size={20} color={primaryColor} />
              <Text style={styles.selectedLeadTitle}>Selected Lead</Text>
            </View>
            {initialLeadId ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="lock-closed-outline" size={13} color={COLORS.textMuted} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.textMuted }}>Locked</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.changeLeadBtn}
                onPress={() => setShowLeadList(!showLeadList)}
                activeOpacity={0.7}
              >
                <Text style={[styles.changeLeadBtnText, { color: primaryColor }]}>
                  {showLeadList ? 'Hide List' : 'Change Lead'}
                </Text>
                <Ionicons
                  name={showLeadList ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={primaryColor}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.selectedLeadInfo}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.cardName}>{selectedLead.name}</Text>
                {selectedLead.priority ? (
                  <View style={[
                    styles.priorityTag,
                    selectedLead.priority === 'High' && { backgroundColor: '#FEE2E2' },
                    selectedLead.priority === 'Normal' && { backgroundColor: '#FEF3C7' },
                    selectedLead.priority === 'Low' && { backgroundColor: '#E0F2FE' },
                  ]}>
                    <Text style={{
                      fontSize: 9,
                      color: selectedLead.priority === 'High' ? COLORS.danger : (selectedLead.priority === 'Normal' ? '#D97706' : '#0284C7'),
                      fontWeight: '900'
                    }}>
                      {selectedLead.priority.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
              </View>
              {selectedLead.tag ? (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{selectedLead.tag}</Text>
                </View>
              ) : null}
            </View>

            {selectedLead.company ? (
              <View style={styles.companyRow}>
                <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                <Text style={styles.companyText}>{selectedLead.company}</Text>
              </View>
            ) : null}

            {(selectedLead.email || selectedLead.phone) ? (
              <View style={styles.contactsRow}>
                {selectedLead.email ? (
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.contactText} numberOfLines={1}>{selectedLead.email}</Text>
                  </View>
                ) : null}

                {selectedLead.phone ? (
                  <View style={styles.contactItem}>
                    <Ionicons name="phone-portrait-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.contactText} numberOfLines={1}>{selectedLead.phone}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.noLeadSelectedCard}>
          <Ionicons name="alert-circle-outline" size={20} color="#B91C1C" />
          <Text style={styles.noLeadSelectedText}>No Lead Selected. Please select a lead below.</Text>
        </View>
      )}

      {showLeadList && !initialLeadId && (
        <View style={styles.leadListContainer}>
          <Text style={styles.sectionLabel}>Select Lead <Text style={styles.required}>*</Text></Text>
          
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search leads to select..."
              placeholderTextColor="#9CA3AF"
              value={leadSearchQuery}
              onChangeText={setLeadSearchQuery}
            />
            {leadSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setLeadSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.hintText}>
            💡 Tap a lead card below to select it.
          </Text>

          {isLoadingLeads ? (
            <ActivityIndicator size="small" color={primaryColor} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.leadsContainer}>
              {filteredLeads.slice(0, 10).map((lead: any, idx: number) => {
                const isSelected = selectedLeadId === lead.id;
                return (
                  <TouchableOpacity
                    key={lead.id + '_' + idx}
                    style={[
                      styles.leadListItemCard,
                      isSelected && { borderColor: primaryColor, backgroundColor: '#F0FDF4' }
                    ]}
                    onPress={() => handleLeadSelect(lead)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cardName}>{lead.name}</Text>
                  </TouchableOpacity>
                );
              })}

              {filteredLeads.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={32} color="#C2D3CC" />
                  <Text style={styles.emptyTitle}>No leads found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectedLeadCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  selectedLeadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  selectedLeadTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  changeLeadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeLeadBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  selectedLeadInfo: {
    gap: 6,
  },
  noLeadSelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  noLeadSelectedText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B91C1C',
    flex: 1,
  },
  leadListContainer: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  required: {
    color: '#EF4444',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
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
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  hintText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  leadsContainer: {
    gap: 8,
  },
  leadListItemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 4,
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
    paddingVertical: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
