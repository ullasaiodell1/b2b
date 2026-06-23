import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadSources, useLeadStatuses, useLeadTags, useUsers } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COMMON_TAGS = ['Follow-up', 'Urgent', 'Warm Lead', 'Cold Lead', 'Corporate', 'Retail'];
const FALLBACK_STAGES = [
  'New',
  'Contacted',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Qualified',
  'Lost',
  'Junk',
  'TRASH',
  'HYBRID',
  'SPECIAL',
];

const STAGE_COLORS: Record<string, string> = {
  'New': '#3B82F6',
  'Contacted': '#F59E0B',
  'Proposal Sent': '#8B5CF6',
  'Negotiation': '#F97316',
  'Won': '#10B981',
  'Qualified': '#34D399',
  'Lost': '#EF4444',
  'Junk': '#9CA3AF',
  'TRASH': '#A78BFA',
  'HYBRID': '#B91C1C',
  'SPECIAL': '#2563EB',
};

const getStageColor = (name: string) => {
  if (!name) return '#6B7280';
  const match = Object.keys(STAGE_COLORS).find(
    (key) => key.toLowerCase() === name.trim().toLowerCase()
  );
  return match ? STAGE_COLORS[match] : '#6B7280';
};

export default function LeadsFilterScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params as {
    priority?: string;
    tag?: string;
    owner?: string;
    assigned_to?: string;
    dateRange?: string;
    from_date?: string;
    to_date?: string;
    status?: string;
    source?: string;
    source_id?: string;
  }) ?? {};
  const insets = useSafeAreaInsets();

  // State values initialized from active filters
  const [priority, setPriority] = useState(() => {
    if (params.priority === 'HOT') return 'High';
    if (params.priority === 'WARM') return 'Normal';
    if (params.priority === 'COLD') return 'Low';
    return params.priority || 'All Priorities';
  });
  const [dateRange, setDateRange] = useState(params.dateRange || 'Select date range');

  const [fromDate, setFromDate] = useState<Date>(() => {
    if (params.from_date) {
      const d = new Date(params.from_date);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });

  const [toDate, setToDate] = useState<Date>(() => {
    if (params.to_date) {
      const d = new Date(params.to_date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [source, setSource] = useState(params.source || 'All Sources');
  const [sourceId, setSourceId] = useState(params.source_id || '');
  const [owner, setOwner] = useState(params.owner || 'All Users');
  const [ownerId, setOwnerId] = useState(params.assigned_to || '');
  const [leadType, setLeadType] = useState(params.tag || 'All Leads');
  const [selectedStages, setSelectedStages] = useState<string[]>(() => {
    if (params.status) {
      return params.status.split(',').filter(Boolean);
    }
    return [];
  });

  // Modal visibility and state
  const [activePicker, setActivePicker] = useState<'dateRange' | 'priority' | 'source' | 'owner' | 'leadType' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // API Queries
  const { data: usersData } = useUsers();
  const { data: sourcesData } = useLeadSources();
  const { data: tagsData } = useLeadTags();
  const { data: statusesData } = useLeadStatuses();

  // Memoized options for select dropdowns
  const dynamicSources = React.useMemo(() => {
    return sourcesData && sourcesData.length > 0
      ? ['All Sources', ...sourcesData.map((s: any) => s.name)]
      : ['All Sources'];
  }, [sourcesData]);

  const dynamicOwners = React.useMemo(() => {
    return usersData && usersData.length > 0
      ? ['All Users', ...usersData.map((u: any) => u.name)]
      : ['All Users'];
  }, [usersData]);

  const dynamicLeadTypes = ['All Leads', 'Verified', 'Customer'];

  const dynamicStages = React.useMemo(() => {
    return statusesData && statusesData.length > 0
      ? statusesData.map((s: any) => s.name)
      : FALLBACK_STAGES;
  }, [statusesData]);

  // Sync selectedStages with database statuses once loaded, if no filter was previously applied
  React.useEffect(() => {
    if (statusesData && statusesData.length > 0 && !params.status && selectedStages.length === 0) {
      setSelectedStages(statusesData.map((s: any) => s.name));
    } else if ((!statusesData || statusesData.length === 0) && !params.status && selectedStages.length === 0) {
      setSelectedStages(FALLBACK_STAGES);
    }
  }, [statusesData]);

  const toggleStage = (stageName: string) => {
    if (selectedStages.includes(stageName)) {
      setSelectedStages(selectedStages.filter((s) => s !== stageName));
    } else {
      setSelectedStages([...selectedStages, stageName]);
    }
  };

  const toggleAllStages = () => {
    if (selectedStages.length === dynamicStages.length) {
      setSelectedStages([]);
    } else {
      setSelectedStages(dynamicStages);
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toISODateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleReset = () => {
    setPriority('All Priorities');
    setDateRange('Select date range');
    setSource('All Sources');
    setSourceId('');
    setOwner('All Users');
    setOwnerId('');
    setLeadType('All Leads');
    setSelectedStages(dynamicStages);
    const d = new Date();
    d.setDate(d.getDate() - 7);
    setFromDate(d);
    setToDate(new Date());
  };

  const handleClearApplied = () => {
    router.navigate({
      pathname: '/(tabs)/leads',
      params: {
        priority: '',
        tag: '',
        owner: '',
        assigned_to: '',
        source: '',
        source_id: '',
        status: '',
        dateRange: '',
        from_date: '',
        to_date: '',
      } as any
    });
  };

  const handleApply = () => {
    const statusParam =
      selectedStages.length === 0
        ? '__NONE__'
        : selectedStages.length < dynamicStages.length
          ? selectedStages.join(',')
          : '';

    let priorityParam = '';
    if (priority === 'High') priorityParam = 'HOT';
    else if (priority === 'Normal') priorityParam = 'WARM';
    else if (priority === 'Low') priorityParam = 'COLD';

    router.navigate({
      pathname: '/(tabs)/leads',
      params: {
        priority: priorityParam,
        tag: leadType !== 'All Leads' ? leadType : '',
        owner: owner !== 'All Users' ? owner : '',
        assigned_to: ownerId,
        source: source !== 'All Sources' ? source : '',
        source_id: sourceId,
        status: statusParam,
        dateRange: dateRange !== 'Select date range' ? dateRange : '',
        from_date: dateRange === 'Custom Range' ? toISODateStr(fromDate) : '',
        to_date: dateRange === 'Custom Range' ? toISODateStr(toDate) : '',
      } as any
    });
  };

  const getPickerOptions = () => {
    switch (activePicker) {
      case 'dateRange':
        return [];
      case 'priority':
        return ['All Priorities', 'High', 'Normal', 'Low'];
      case 'source':
        return dynamicSources;
      case 'owner':
        return dynamicOwners;
      case 'leadType':
        return dynamicLeadTypes;
      default:
        return [];
    }
  };

  const getSelectedValue = () => {
    switch (activePicker) {
      case 'dateRange':
        return dateRange;
      case 'priority':
        return priority;
      case 'source':
        return source;
      case 'owner':
        return owner;
      case 'leadType':
        return leadType;
      default:
        return '';
    }
  };

  const handleSelectValue = (value: string) => {
    switch (activePicker) {
      case 'dateRange':
        setDateRange(value);
        break;
      case 'priority':
        setPriority(value);
        break;
      case 'source':
        setSource(value);
        if (value === 'All Sources') {
          setSourceId('');
        } else {
          const selectedObj = sourcesData?.find((s: any) => s.name === value);
          setSourceId(selectedObj?.id || '');
        }
        break;
      case 'owner':
        setOwner(value);
        if (value === 'All Users') {
          setOwnerId('');
        } else {
          const selectedObj = usersData?.find((u: any) => u.name === value);
          setOwnerId(selectedObj?.id || '');
        }
        break;
      case 'leadType':
        setLeadType(value);
        break;
    }
    setActivePicker(null);
    setSearchQuery('');
  };

  const filteredOptions = React.useMemo(() => {
    const opts = getPickerOptions();
    if (!searchQuery.trim()) return opts;
    const q = searchQuery.toLowerCase().trim();
    return opts.filter((opt) => opt.toLowerCase().includes(q));
  }, [activePicker, searchQuery, dynamicSources, dynamicOwners, dynamicLeadTypes]);

  const showSearch = activePicker === 'source' || activePicker === 'owner' || activePicker === 'leadType';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Lead Filters</Text>
          <Text style={styles.headerSubtitle}>Adjust filters and apply them when you are ready.</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 80, 100), paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* DATE RANGE */}
        <View style={styles.section}>
          <View style={styles.customDateRow}>
            <View style={styles.customDateColumn}>
              <Text style={styles.customDateLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.customDateBox}
                onPress={() => setShowFromPicker(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.customDateText}>{formatDate(fromDate)}</Text>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.customDateColumn}>
              <Text style={styles.customDateLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.customDateBox}
                onPress={() => setShowToPicker(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.customDateText}>{formatDate(toDate)}</Text>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PRIORITY */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIORITY</Text>
          <TouchableOpacity
            style={styles.filterBox}
            onPress={() => setActivePicker('priority')}
            activeOpacity={0.85}
          >
            <Text style={styles.filterBoxText}>{priority}</Text>
          </TouchableOpacity>
        </View>

        {/* SOURCE */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SOURCE</Text>
          <TouchableOpacity
            style={styles.filterBox}
            onPress={() => setActivePicker('source')}
            activeOpacity={0.85}
          >
            <Text style={styles.filterBoxText}>{source}</Text>
          </TouchableOpacity>
        </View>

        {/* ASSIGNED TO */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ASSIGNED TO</Text>
          <TouchableOpacity
            style={styles.filterBox}
            onPress={() => setActivePicker('owner')}
            activeOpacity={0.85}
          >
            <Text style={styles.filterBoxText}>{owner}</Text>
          </TouchableOpacity>
        </View>

        {/* LEAD TYPE */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEAD TYPE</Text>
          <TouchableOpacity
            style={styles.filterBox}
            onPress={() => setActivePicker('leadType')}
            activeOpacity={0.85}
          >
            <Text style={styles.filterBoxText}>{leadType}</Text>
          </TouchableOpacity>
        </View>

        {/* VISIBLE STAGES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>VISIBLE STAGES</Text>
            <TouchableOpacity onPress={toggleAllStages} style={styles.toggleAllBtn} activeOpacity={0.7}>
              <Text style={styles.toggleAllText}>
                {selectedStages.length === dynamicStages.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.stagesContainer}>
            {dynamicStages.map((stage: string, idx: number) => {
              const isSelected = selectedStages.includes(stage);
              const stageColor = getStageColor(stage);
              return (
                <TouchableOpacity
                  key={stage + '_' + idx}
                  style={[
                    styles.stageRow,
                    isSelected && styles.stageRowActive
                  ]}
                  onPress={() => toggleStage(stage)}
                  activeOpacity={0.85}
                >
                  <View style={styles.stageRowLeft}>
                    <View style={[styles.stageDot, { backgroundColor: stageColor }]} />
                    <Text style={[styles.stageText, isSelected ? styles.stageTextActive : styles.stageTextInactive]}>
                      {stage}
                    </Text>
                  </View>
                  <Text style={[styles.stageStatusText, isSelected ? styles.stageStatusActive : styles.stageStatusInactive]}>
                    {isSelected ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        <TouchableOpacity
          onPress={handleReset}
          style={styles.resetBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClearApplied}
          style={styles.clearAppliedBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.clearAppliedBtnText}>Clear Applied</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleApply}
          style={styles.applyBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* FROM DATE PICKER */}
      {showFromPicker &&
        (Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showFromPicker}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowFromPicker(false)}
            >
              <View style={styles.dateModalContent}>
                <Text style={styles.modalTitle}>Select From Date</Text>
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="inline"
                  onChange={(_e, selected) => {
                    if (selected) setFromDate(selected);
                  }}
                />
                <TouchableOpacity
                  style={[styles.applyBtn, { width: '100%' }]}
                  onPress={() => setShowFromPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={(_e, selected) => {
              setShowFromPicker(false);
              if (selected) setFromDate(selected);
            }}
          />
        ))}

      {/* TO DATE PICKER */}
      {showToPicker &&
        (Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showToPicker}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowToPicker(false)}
            >
              <View style={styles.dateModalContent}>
                <Text style={styles.modalTitle}>Select To Date</Text>
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="inline"
                  onChange={(_e, selected) => {
                    if (selected) setToDate(selected);
                  }}
                />
                <TouchableOpacity
                  style={[styles.applyBtn, { width: '100%' }]}
                  onPress={() => setShowToPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            onChange={(_e, selected) => {
              setShowToPicker(false);
              if (selected) setToDate(selected);
            }}
          />
        ))}

      {/* BOTTOM SHEET SELECTOR MODAL */}
      <Modal
        transparent
        animationType="slide"
        visible={activePicker !== null}
        onRequestClose={() => {
          setActivePicker(null);
          setSearchQuery('');
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setActivePicker(null);
            setSearchQuery('');
          }}
        >
          <View style={styles.modalContent}>
            {/* Drag handle / Indicator */}
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === 'dateRange' && 'Select Date Range'}
                {activePicker === 'priority' && 'Select Priority'}
                {activePicker === 'source' && 'Select Source'}
                {activePicker === 'owner' && 'Select Owner'}
                {activePicker === 'leadType' && 'Select Lead Type'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setActivePicker(null);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {showSearch && (
              <View style={styles.modalSearchContainer}>
                <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {filteredOptions.map((opt: string, idx: number) => {
                const isSelected = getSelectedValue() === opt;
                return (
                  <TouchableOpacity
                    key={opt + '_' + idx}
                    style={styles.modalRowItem}
                    onPress={() => handleSelectValue(opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalRowText, isSelected && styles.modalRowTextActive]}>
                      {opt}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={theme.primaryColor || '#0ea5e9'} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
  },
  toggleAllBtn: {
    paddingVertical: 2,
    paddingLeft: 12,
  },
  toggleAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primaryColor || '#0ea5e9',
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  filterBoxText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  stagesContainer: {
    gap: 8,
  },
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  stageRowActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  stageRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  stageText: {
    fontSize: 14,
  },
  stageTextActive: {
    fontWeight: '700',
    color: '#0F172A',
  },
  stageTextInactive: {
    fontWeight: '600',
    color: '#94A3B8',
  },
  stageStatusText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  stageStatusActive: {
    fontWeight: '800',
    color: '#0F172A',
  },
  stageStatusInactive: {
    fontWeight: '600',
    color: '#94A3B8',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resetBtn: {
    paddingVertical: 12,
    paddingRight: 12,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearAppliedBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  clearAppliedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  applyBtn: {
    flex: 1.2,
    height: 44,
    backgroundColor: theme.primaryColor || '#0ea5e9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '65%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalRowText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  modalRowTextActive: {
    color: theme.primaryColor || '#0ea5e9',
    fontWeight: '700',
  },
  customDateRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  customDateColumn: {
    flex: 1,
    gap: 4,
  },
  customDateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  customDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  customDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  dateModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 340,
    gap: 16,
    alignItems: 'center',
  },
});
