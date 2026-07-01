import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeads } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  const [showModal, setShowModal] = useState(false);

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
    setShowModal(false);
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
                onPress={() => setShowModal(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.changeLeadBtnText, { color: primaryColor }]}>
                  Change Lead
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={primaryColor}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.selectedLeadInfo}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.cardName}>{selectedLead.name}</Text>
                {(selectedLead.is_verified === true || selectedLead.is_verified === 1 || String(selectedLead.is_verified) === 'true') ? (
                  <Ionicons name="shield-checkmark-outline" size={14} color="#16A34A" />
                ) : null}
                {(selectedLead.is_customer === true || selectedLead.is_customer === 1 || String(selectedLead.is_customer) === 'true' || selectedLead.lead_type === 'CUSTOMER' || selectedLead.leadType === 'CUSTOMER') ? (
                  <Ionicons name="checkmark-circle-outline" size={14} color="#2563EB" />
                ) : null}
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
                  <TouchableOpacity
                    style={styles.contactItem}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(`mailto:${selectedLead.email}`)}
                  >
                    <Ionicons name="mail-outline" size={14} color="#2563EB" style={{ marginRight: 6 }} />
                    <Text style={[styles.contactText, { color: '#2563EB', textDecorationLine: 'underline', fontWeight: '700' }]} numberOfLines={1}>
                      {selectedLead.email}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {selectedLead.phone ? (
                  <TouchableOpacity
                    style={styles.contactItem}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(`tel:${selectedLead.phone}`)}
                  >
                    <Ionicons name="phone-portrait-outline" size={14} color="#16A34A" style={{ marginRight: 6 }} />
                    <Text style={[styles.contactText, { color: '#16A34A', textDecorationLine: 'underline', fontWeight: '700' }]} numberOfLines={1}>
                      {selectedLead.phone}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.selectGroup}>
          <Text style={styles.inputLabel}>
            Select Lead <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={COLORS.textMuted}
              style={styles.inputIcon}
            />
            <Text style={[styles.textInput, { color: '#9CA3AF' }]}>
              Select Lead
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* SELECT LEAD MODAL */}
      <Modal transparent animationType="slide" visible={showModal} onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Lead</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name, company..."
                placeholderTextColor="#9CA3AF"
                value={leadSearchQuery}
                onChangeText={setLeadSearchQuery}
                autoCorrect={false}
                autoComplete="off"
              />
              {leadSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setLeadSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {isLoadingLeads ? (
              <ActivityIndicator size="small" color={primaryColor} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
                {filteredLeads.map((lead: any, idx: number) => {
                  const isSelected = selectedLeadId === lead.id;
                  return (
                    <TouchableOpacity
                      key={lead.id + '_' + idx}
                      style={styles.modalRowItem}
                      onPress={() => handleLeadSelect(lead)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.modalRowText}>{lead.name || 'No Name'}</Text>
                          {(lead.is_verified === true || lead.is_verified === 1 || String(lead.is_verified) === 'true') ? (
                            <Ionicons name="shield-checkmark-outline" size={14} color="#16A34A" />
                          ) : null}
                          {(lead.is_customer === true || lead.is_customer === 1 || String(lead.is_customer) === 'true' || lead.lead_type === 'CUSTOMER' || lead.leadType === 'CUSTOMER') ? (
                            <Ionicons name="checkmark-circle-outline" size={14} color="#2563EB" />
                          ) : null}
                        </View>
                        <Text style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' }}>
                          {lead.company || 'No Company'} • {lead.phone || 'No Phone'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  );
                })}
                {filteredLeads.length === 0 && (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>
                      No matches found
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  // Form Picker Trigger styling
  selectGroup: {
    gap: 5,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  required: {
    color: '#EF4444',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    padding: 0,
  },
  // Modal layout styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
});
