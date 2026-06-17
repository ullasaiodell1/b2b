import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCalls } from '@/hooks/useCalls';
import { useDeleteLead, useLeadDetails, useLeadStatuses, useUpdateLead } from '@/hooks/useLeads';
import { useMeetings } from '@/hooks/useMeetings';
import { useQuotations } from '@/hooks/useQuotations';
import { useTasks } from '@/hooks/useTasks';
import { useVisits } from '@/hooks/useVisits';
import { getOrders } from '@/services/api/order';
import { getOrderField } from '@/utils/orderHelper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Linking,
    Modal,
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

type TabType = 'Overview' | 'Quotation' | 'Order';

interface DetailRowProps {
  label: string;
  value: string;
  required?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, required }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.detailRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.detailLabel}>{label}</Text>
        {required && <Text style={{ color: '#EF4444', marginLeft: 2, fontWeight: 'bold' }}>*</Text>}
      </View>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
};





const STATUS_COLORS: Record<string, string> = {
  // ── Core Lead Statuses ─────────────────────────
  NEW: '#0EA5E9',
  CONTACTED: '#F59E0B',
  'PROPOSAL SENT': '#8B5CF6',
  PROPOSAL_SENT: '#8B5CF6',
  NEGOTIATION: '#F97316',
  WON: '#10B981',
  LOST: '#EF4444',
  JUNK: '#6B7280',
  QUALIFIED: '#3B82F6',
  UNQUALIFIED: '#9CA3AF',
  FOLLOW_UP: '#EC4899',
  'FOLLOW-UP': '#EC4899',
  FOLLOWUP: '#EC4899',
  INTERESTED: '#06B6D4',
  NOT_INTERESTED: '#F43F5E',
  'NOT INTERESTED': '#F43F5E',
  CONVERTED: '#22C55E',
  CLOSED: '#64748B',
  OPEN: '#0EA5E9',
  PENDING: '#F59E0B',
  ACTIVE: '#10B981',
  INACTIVE: '#9CA3AF',
  // ── Custom / Special Statuses ──────────────────
  TRASH: '#B91C1C',
  HYBRID: '#14B8A6',
  SPECIAL: '#EAB308',
  NOT_SPECIAL: '#7C3AED',
  'NOT SPECIAL': '#7C3AED',
  NOTSPECIAL: '#7C3AED',
  FIRE: '#EF4444',
  'LOS ANGELES': '#4F46E5',
  LOS_ANGELES: '#4F46E5',
  LOSANGELES: '#4F46E5',
  DUBAI: '#D97706',
  // ── Extra Common Variants ──────────────────────
  HOT: '#EF4444',
  WARM: '#F97316',
  COLD: '#0EA5E9',
  HOLD: '#64748B',
  'ON HOLD': '#64748B',
  ON_HOLD: '#64748B',
  IN_PROGRESS: '#3B82F6',
  'IN PROGRESS': '#3B82F6',
  INPROGRESS: '#3B82F6',
  CONTACTED_AGAIN: '#F59E0B',
  REVISIT: '#8B5CF6',
  DEMO: '#06B6D4',
  TRIAL: '#10B981',
  URGENT: '#DC2626',
  VIP: '#D97706',
  PREMIUM: '#C026D3',
  PROSPECT: '#0284C7',
  DEAD: '#374151',
  DEFERRED: '#78716C',
  ESCALATED: '#DC2626',
  RESOLVED: '#16A34A',
  // ── Quotation / Order Statuses ─────────────────
  DRAFT: '#6B7280',
  SENT: '#F59E0B',
  VIEWED: '#3B82F6',
  ACCEPTED: '#10B981',
  REJECTED: '#EF4444',
  EXPIRED: '#9CA3AF',
  REVISED: '#8B5CF6',
  CANCELLED: '#EF4444',
  APPROVED: '#10B981',
  ORDER_CREATED: '#0EA5E9',
  PROFORMA_CREATED: '#6366F1',
};

function formatAmount(amount?: number | null) {
  if (amount == null) return '₹ 0.00';
  return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function LeadDetailsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    tag?: string;
    priority?: string;
    owner?: string;
    qStatus?: string;
    qPriority?: string;
    qStartDate?: string;
    qEndDate?: string;
    qFilterApplied?: string;
    oStatus?: string;
    oStartDate?: string;
    oEndDate?: string;
    oFilterApplied?: string;
  }>();
  const qFilterActive = !!(params.qStatus || params.qPriority || params.qStartDate || params.qEndDate);
  const oFilterActive = !!(params.oStatus || params.oStartDate || params.oEndDate);
  const insets = useSafeAreaInsets();

  const [quotationSearchQuery, setQuotationSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const { data: rawLead, isLoading, isFetching, refetch } = useLeadDetails(params.id || '');

  const dbLead = React.useMemo(() => {
    if (!rawLead) return null;
    let priority: 'High' | 'Normal' | 'Low' = 'Normal';
    if (rawLead.priority === 'HOT') priority = 'High';
    else if (rawLead.priority === 'WARM') priority = 'Normal';
    else if (rawLead.priority === 'COLD') priority = 'Low';

    const tag = (rawLead.tags && rawLead.tags[0]?.name) || rawLead.tag || '';

    return {
      id: String(rawLead.id),
      name: rawLead.name || '',
      company: rawLead.company_name || rawLead.company || '',
      email: rawLead.email || '',
      phone: rawLead.phone || '',
      tag: tag,
      priority: priority,
      owner: rawLead.assigned_to_name || rawLead.owner || '',
      status: rawLead.status_name || rawLead.status || '',
      source: rawLead.source_name || rawLead.source || '',
      ...rawLead
    } as any;
  }, [rawLead]);
  const { mutateAsync: deleteLead } = useDeleteLead();
  const { mutateAsync: updateLead } = useUpdateLead();
  const { data: leadStatuses = [] } = useLeadStatuses();

  const quotationsQuery = useQuotations({ lead_id: params.id || '' });
  const { isLoading: isQuotationsLoading, isFetching: isQuotationsFetching } = quotationsQuery;
  const dbQuotations = React.useMemo(() => {
    const raw = quotationsQuery.data as any;
    if (!raw) return [];
    let list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : []));
    list = list.filter((q: any) => String(q.lead_id) === String(params.id) || String(q.dealer_id) === String(params.id));
    if (params.qStatus) {
      list = list.filter((q: any) => q.status?.toLowerCase() === params.qStatus?.toLowerCase());
    }
    if (params.qPriority) {
      if (list.length > 0 && 'priority' in list[0]) {
        list = list.filter((q: any) => q.priority?.toLowerCase() === params.qPriority?.toLowerCase());
      }
    }
    if (params.qStartDate && params.qEndDate) {
      const start = new Date(params.qStartDate);
      const end = new Date(params.qEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      list = list.filter((q: any) => {
        const qDateStr = q.quotation_date || q.date;
        if (!qDateStr) return false;
        const qDate = new Date(qDateStr);
        return qDate >= start && qDate <= end;
      });
    }
    if (quotationSearchQuery.trim()) {
      const query = quotationSearchQuery.toLowerCase().trim();
      list = list.filter((q: any) => {
        const prefix = q.prefix || 'QT';
        const qNumber = q.quotation_number ? `${prefix}-${q.quotation_number}` : q.id.slice(0, 8).toUpperCase();
        const clientName = q.company_name || q.lead_company_name || '';
        const contactName = q.contact_name || q.lead_name || '';
        return (
          qNumber.toLowerCase().includes(query) ||
          clientName.toLowerCase().includes(query) ||
          contactName.toLowerCase().includes(query)
        );
      });
    }
    return list;
  }, [quotationsQuery.data, params.qStatus, params.qPriority, params.qStartDate, params.qEndDate, quotationSearchQuery]);

  const meetingsQuery = useMeetings({ lead_id: params.id || '' });
  const dbMeetings = React.useMemo(() => {
    const raw = meetingsQuery.data as any;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : (Array.isArray(raw.followups) ? raw.followups : (Array.isArray(raw.results) ? raw.results : []))));
    return list.filter((m: any) => String(m.lead_id) === String(params.id));
  }, [meetingsQuery.data, params.id]);

  const tasksQuery = useTasks({ lead_id: params.id || '' });
  const dbTasks = React.useMemo(() => {
    const raw = tasksQuery.data as any;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : []));
    return list.filter((t: any) => String(t.lead_id) === String(params.id));
  }, [tasksQuery.data, params.id]);

  const visitsQuery = useVisits({ lead_id: params.id || '' });
  const dbVisits = React.useMemo(() => {
    const raw = visitsQuery.data as any;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : []));
    return list.filter((v: any) => String(v.lead_id) === String(params.id));
  }, [visitsQuery.data, params.id]);

  const callsQuery = useCalls();
  const dbCalls = React.useMemo(() => {
    const rawLogs = callsQuery.data?.allLogs;
    if (!rawLogs) return [];
    return rawLogs.filter((log: any) => String(log.lead_id) === String(params.id));
  }, [callsQuery.data, params.id]);

  const ordersByLeadQuery = useQuery({
    queryKey: ['orders', { lead_id: params.id || '' }],
    queryFn: () => getOrders({ lead_id: params.id } as any),
    enabled: !!params.id,
  });

  const ordersByDealerQuery = useQuery({
    queryKey: ['orders', { dealer_id: params.id || '' }],
    queryFn: () => getOrders({ dealer_id: params.id } as any),
    enabled: !!params.id,
  });

  const isOrdersLoading = ordersByLeadQuery.isLoading || ordersByDealerQuery.isLoading;

  const dbOrders = React.useMemo(() => {
    const rawLeadOrders = ordersByLeadQuery.data as any;
    const rawDealerOrders = ordersByDealerQuery.data as any;
    if (!rawLeadOrders && !rawDealerOrders) return [];

    const leadList = Array.isArray(rawLeadOrders)
      ? rawLeadOrders
      : (Array.isArray(rawLeadOrders?.data)
        ? rawLeadOrders.data
        : (Array.isArray(rawLeadOrders?.data?.data)
          ? rawLeadOrders.data.data
          : []));

    const dealerList = Array.isArray(rawDealerOrders)
      ? rawDealerOrders
      : (Array.isArray(rawDealerOrders?.data)
        ? rawDealerOrders.data
        : (Array.isArray(rawDealerOrders?.data?.data)
          ? rawDealerOrders.data.data
          : []));

    const combined = [...leadList, ...dealerList];
    const uniqueMap = new Map();
    combined.forEach((o: any) => {
      if (o && o.id) {
        uniqueMap.set(String(o.id), o);
      }
    });

    let list = Array.from(uniqueMap.values());
    list = list.map(getOrderField);

    if (params.oStatus) {
      list = list.filter((o: any) => o.status?.toLowerCase() === params.oStatus?.toLowerCase());
    }
    if (params.oStartDate && params.oEndDate) {
      const start = new Date(params.oStartDate);
      const end = new Date(params.oEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      list = list.filter((o: any) => {
        const oDateStr = o.date || o.created_at;
        if (!oDateStr) return false;
        const oDate = new Date(oDateStr);
        return oDate >= start && oDate <= end;
      });
    }
    if (orderSearchQuery.trim()) {
      const query = orderSearchQuery.toLowerCase().trim();
      list = list.filter((o: any) => {
        const orderNumber = o.orderNo || o.id || '';
        const clientName = o.clientName || '';
        const contactPerson = o.contactPerson || '';
        const location = o.hotelLocation || '';
        return (
          orderNumber.toLowerCase().includes(query) ||
          clientName.toLowerCase().includes(query) ||
          contactPerson.toLowerCase().includes(query) ||
          location.toLowerCase().includes(query)
        );
      });
    }
    return list;
  }, [ordersByLeadQuery.data, ordersByDealerQuery.data, params.oStatus, params.oStartDate, params.oEndDate, orderSearchQuery]);

  const handleRefresh = () => {
    refetch();
    quotationsQuery.refetch();
    meetingsQuery.refetch();
    tasksQuery.refetch();
    visitsQuery.refetch();
    callsQuery.refetch();
    ordersByLeadQuery.refetch();
    ordersByDealerQuery.refetch();
  };

  const leadId = params.id || dbLead?.id || '';
  const leadName = dbLead?.name || params.name || '----';
  const leadCompany = dbLead?.company || params.company || '----';
  const leadEmail = dbLead?.email || params.email || '----';
  const leadPhone = dbLead?.phone || params.phone || '----';
  const leadTag = dbLead?.tag || params.tag || '----';
  const leadPriority = dbLead?.priority || params.priority || 'Normal';
  const leadOwner = dbLead?.owner || params.owner || '----';

  // State
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [leadInfoExpanded, setLeadInfoExpanded] = useState(true);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const [visitExpanded, setVisitExpanded] = useState(false);
  const [meetingExpanded, setMeetingExpanded] = useState(false);
  const [taskExpanded, setTaskExpanded] = useState(false);
  const [callExpanded, setCallExpanded] = useState(false);

  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = React.useRef(false);

  const handleViewList = (type: 'Call' | 'Meeting' | 'Task' | 'Visit') => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    const pathMap: Record<string, string> = {
      Call: '/(tabs)/call',
      Meeting: '/(tabs)/meeting',
      Task: '/(tabs)/task',
      Visit: '/(tabs)/visit',
    };
    router.push({
      pathname: pathMap[type],
      params: {
        leadId,
        leadName,
        company: leadCompany !== '----' ? leadCompany : '',
        phone: leadPhone !== '----' ? leadPhone : '',
        email: leadEmail !== '----' ? leadEmail : '',
      },
    } as any);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  const handleAddAction = (type: 'Call' | 'Meeting' | 'Task' | 'Visit' | 'Quotation') => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    if (type === 'Call') {
      router.push({
        pathname: '/(tabs)/call/add-call',
        params: {
          leadId,
          leadName,
          phone: leadPhone !== '----' ? leadPhone : '',
        },
      });
    } else if (type === 'Meeting') {
      router.push({
        pathname: '/(tabs)/meeting/add-meeting',
        params: {
          leadId,
          leadName,
          company: leadCompany !== '----' ? leadCompany : '',
        },
      });
    } else if (type === 'Task') {
      router.push({
        pathname: '/(tabs)/task/add-task',
        params: {
          leadId,
          leadName,
        },
      });
    } else if (type === 'Visit') {
      router.push({
        pathname: '/(tabs)/visit/add-visit',
        params: {
          leadId,
        },
      });
    } else if (type === 'Quotation') {
      router.push({
        pathname: '/(tabs)/Quotation/add-quotation',
        params: {
          leadId,
          companyName: leadCompany !== '----' ? leadCompany : '',
          contactName: leadName !== '----' ? leadName : '',
          contactPhone: leadPhone !== '----' ? leadPhone : '',
          contactEmail: leadEmail !== '----' ? leadEmail : '',
        },
      });
    }
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  const handleEditLead = () => {
    if (isNavigatingRef.current) return;
    if (!params.id) {
      Alert.alert('Error', 'Lead ID is missing.');
      return;
    }
    isNavigatingRef.current = true;
    router.push({
      pathname: '/(tabs)/leads/edit-lead',
      params: {
        id: params.id,
      }
    });
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  const handleDeleteLead = () => {
    if (!params.id) return;
    Alert.alert(
      'Delete Lead',
      `Are you sure you want to delete lead "${leadName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLead(params.id!);
              Alert.alert('Success', 'Lead deleted successfully.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete lead.');
            }
          }
        }
      ]
    );
  };

  const handleClearQuotationFilters = () => {
    router.setParams({
      qStatus: '',
      qPriority: '',
      qStartDate: '',
      qEndDate: '',
      qFilterApplied: ''
    });
  };

  const handleClearOrderFilters = () => {
    router.setParams({
      oStatus: '',
      oStartDate: '',
      oEndDate: '',
      oFilterApplied: ''
    });
  };

  // Dynamic Header Title Helper
  const renderHeaderTitle = () => {
    if (activeTab === 'Overview') {
      return (
        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>OVER</Text>
          <Text style={{ color: COLORS.textDark }}>VIEW</Text>
        </Text>
      );
    }
    if (activeTab === 'Quotation') {
      return (
        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>QUOT</Text>
          <Text style={{ color: COLORS.textDark }}>ATION</Text>
        </Text>
      );
    }
    return (
      <Text style={styles.headerTitle}>
        <Text style={{ color: theme.primaryColor }}>ORD</Text>
        <Text style={{ color: COLORS.textDark }}>ER</Text>
      </Text>
    );
  };

  // Mock data for Order Tab
  const ORDERS: any[] = [];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        {renderHeaderTitle()}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.actionHeaderBtn}
            onPress={handleEditLead}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={theme.primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionHeaderBtn}
            onPress={handleDeleteLead}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SUB-TABS SELECTOR */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          {(['Overview', 'Quotation', 'Order'] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching || isQuotationsFetching} onRefresh={handleRefresh} colors={[theme.primaryColor]} />
        }
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <>
            {/* PROFILE CARD */}
            <View style={styles.profileCard}>
              <View style={styles.profileTopRow}>
                <View style={styles.profileInfoCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.profileName}>{leadName}</Text>
                    {/* Clickable Status Badge */}
                    {(() => {
                      const rawStatus = dbLead?.status_name || dbLead?.status || '';
                      const sk = rawStatus.toUpperCase();
                      const skU = sk.replace(/\s+/g, '_');
                      const badgeColor = STATUS_COLORS[sk] || STATUS_COLORS[skU] || '#9CA3AF';
                      return (
                        <TouchableOpacity
                          onPress={() => setStatusModalVisible(true)}
                          activeOpacity={0.75}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: badgeColor + '22',
                            borderWidth: 1.5,
                            borderColor: badgeColor,
                            borderRadius: 20,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            gap: 5,
                          }}
                        >
                          <View style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: badgeColor,
                          }} />
                          <Text style={{
                            fontSize: 11,
                            fontWeight: '800',
                            color: badgeColor,
                            letterSpacing: 0.2,
                          }}>
                            {rawStatus || 'Set Status'}
                          </Text>
                          <Ionicons name="chevron-down" size={11} color={badgeColor} />
                        </TouchableOpacity>
                      );
                    })()}
                  </View>

                  <View style={styles.profileDetailLine}>
                    <Ionicons name="business-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.profileDetailText}>{leadCompany}</Text>
                  </View>

                  {leadEmail !== '----' && (
                    <TouchableOpacity
                      style={styles.profileDetailLine}
                      onPress={() => Linking.openURL(`mailto:${leadEmail}`)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="mail-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                      <Text style={[styles.profileDetailText, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                        {leadEmail}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Phone — tappable, opens dialer */}
                  {leadPhone !== '----' && (
                    <TouchableOpacity
                      style={styles.profileDetailLine}
                      onPress={() => Linking.openURL(`tel:${leadPhone}`)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                      <Text style={[styles.profileDetailText, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                        {leadPhone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Location — tappable, opens Google Maps */}
                  {(() => {
                    const locationStr = [dbLead?.city_name || dbLead?.city, dbLead?.state_name || dbLead?.state].filter(Boolean).join(', ');
                    if (!locationStr) return null;
                    return (
                      <TouchableOpacity
                        style={styles.profileDetailLine}
                        onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(locationStr)}`)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="location-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <Text style={[styles.profileDetailText, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                          {locationStr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })()}
                </View>
              </View>
            </View>

            {/* STATUS CHANGE MODAL */}
            <Modal
              visible={statusModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setStatusModalVisible(false)}
            >
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
                activeOpacity={1}
                onPress={() => setStatusModalVisible(false)}
              >
                <View style={{
                  backgroundColor: '#FFFFFF',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingTop: 12,
                  paddingBottom: 32,
                  maxHeight: '70%',
                }}>
                  {/* Handle */}
                  <View style={{ width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

                  {/* Title */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: COLORS.textDark }}>Change Status</Text>
                    <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                      <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {statusUpdating ? (
                    <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                      <ActivityIndicator size="large" color={theme.primaryColor} />
                      <Text style={{ marginTop: 10, fontSize: 13, color: COLORS.textMuted, fontWeight: '600' }}>Updating status...</Text>
                    </View>
                  ) : (
                    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                      {(Array.isArray(leadStatuses) ? leadStatuses : []).map((s: any) => {
                        const statusLabel = s.name || s.label || s.status_name || String(s);
                        const statusId = s.id || s.value || s.status_id;
                        const statusKeyUnderscore = statusLabel.toUpperCase().replace(/\s+/g, '_');
                        const statusKeyExact = statusLabel.toUpperCase();
                        const color = STATUS_COLORS[statusKeyExact] || STATUS_COLORS[statusKeyUnderscore] || '#6B7280';
                        const currentStatus = dbLead?.status_name || dbLead?.status || '';
                        const isActive = currentStatus.toLowerCase() === statusLabel.toLowerCase();
                        return (
                          <TouchableOpacity
                            key={String(statusId || statusLabel)}
                            onPress={async () => {
                              if (isActive) { setStatusModalVisible(false); return; }
                              try {
                                setStatusUpdating(true);
                                // Build full payload — API requires all required fields, not just status_id
                                const r = rawLead as any;
                                const priorityMap: Record<string, string> = { HOT: 'HOT', WARM: 'WARM', COLD: 'COLD' };
                                const fullPayload = {
                                  name: r?.name || '',
                                  phone: r?.phone || '',
                                  email: r?.email || null,
                                  status_id: statusId,
                                  source_id: r?.source_id || null,
                                  alternate_phone: r?.alternate_phone || null,
                                  address_line1: r?.address_line1 || null,
                                  address_line2: r?.address_line2 || null,
                                  city_id: r?.city_id || null,
                                  state_id: r?.state_id || null,
                                  country_id: r?.country_id || null,
                                  assigned_to: r?.assigned_to || null,
                                  priority: priorityMap[r?.priority] || r?.priority || 'WARM',
                                  company_name: r?.company_name || null,
                                  designation: r?.designation || null,
                                  website: r?.website || null,
                                  gst_number: r?.gst_number || null,
                                  pan_number: r?.pan_number || null,
                                  tags: Array.isArray(r?.tags) ? r.tags.map((t: any) => t.name || t) : [],
                                  expected_revenue: r?.expected_revenue ? parseFloat(r.expected_revenue) : null,
                                  property_type: r?.property_type || null,
                                  business_type: r?.business_type || null,
                                  remarks: r?.remarks || null,
                                  interested_category_id: Array.isArray(r?.interested_category_id) ? r.interested_category_id : [],
                                };
                                await updateLead({
                                  id: params.id!,
                                  data: fullPayload,
                                });
                                await refetch();
                                setStatusModalVisible(false);
                              } catch (err: any) {
                                Alert.alert('Error', err?.message || 'Failed to update status.');
                              } finally {
                                setStatusUpdating(false);
                              }
                            }}
                            activeOpacity={0.75}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 20,
                              paddingVertical: 14,
                              backgroundColor: isActive ? color + '15' : '#FFFFFF',
                              borderBottomWidth: 1,
                              borderBottomColor: '#F3F4F6',
                            }}
                          >
                            <View style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: color,
                              marginRight: 12,
                            }} />
                            <Text style={{
                              flex: 1,
                              fontSize: 13.5,
                              fontWeight: isActive ? '900' : '600',
                              color: isActive ? color : COLORS.textDark,
                            }}>
                              {statusLabel}
                            </Text>
                            {isActive && (
                              <Ionicons name="checkmark-circle" size={20} color={color} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              </TouchableOpacity>
            </Modal>






            {/* ACCORDION 1: LEAD INFORMATION */}
            <View style={[styles.accordionCard, { marginBottom: 1 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setLeadInfoExpanded(!leadInfoExpanded)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionTitleLeft}>
                  <View style={styles.indicatorBar} />
                  <Text style={styles.accordionTitleText}>LEAD INFORMATION</Text>
                </View>
                <View style={styles.chevronBg}>
                  <Ionicons
                    name={leadInfoExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={COLORS.textDark}
                  />
                </View>
              </TouchableOpacity>

              {leadInfoExpanded && (
                <View style={styles.accordionContent}>
                  <DetailRow label="lead owner" value={leadOwner} />
                  <DetailRow label="Company" value={leadCompany} required />
                  <DetailRow label="Lead Name" value={leadName} />
                  <DetailRow label="Title" value={dbLead?.designation || "----"} />
                  <DetailRow label="Email" value={leadEmail} />
                  <DetailRow label="Phone" value={leadPhone} />
                  <DetailRow label="Mobile" value={dbLead?.alternate_phone || "----"} />
                  <DetailRow label="Website" value={dbLead?.website || "----"} />
                  <DetailRow label="Lead Source" value={leadTag} />
                  <DetailRow label="Lead Status" value={dbLead?.status_name || dbLead?.status || "----"} />
                  <DetailRow label="Created By" value={dbLead?.created_by_name || leadOwner} />
                  <DetailRow label="Modified By" value={leadOwner} />
                  <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={[styles.detailValue, { textAlign: 'left', marginTop: 6 }]} numberOfLines={0}>
                      {dbLead?.remarks || '----'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* ACCORDION 2: ADDRESS */}
            <View style={[styles.accordionCard, { marginBottom: 1 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setAddressExpanded(!addressExpanded)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionTitleLeft}>
                  <View style={styles.indicatorBar} />
                  <Text style={styles.accordionTitleText}>ADDRESS</Text>
                </View>
                <View style={styles.chevronBg}>
                  <Ionicons
                    name={addressExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={COLORS.textDark}
                  />
                </View>
              </TouchableOpacity>

              {addressExpanded && (
                <View style={styles.accordionContent}>
                  <DetailRow label="Address Line 1" value={dbLead?.address_line1 || "----"} />
                  <DetailRow label="Address Line 2" value={dbLead?.address_line2 || "----"} />
                  <DetailRow label="Country" value={dbLead?.country_name || dbLead?.country || "----"} />
                  <DetailRow label="State" value={dbLead?.state_name || dbLead?.state || "----"} />
                  <DetailRow label="City" value={dbLead?.city_name || dbLead?.city || "----"} />
                  <DetailRow label="Pincode" value={dbLead?.pincode || "----"} />
                </View>
              )}
            </View>

            {/* Collapsible Section: VISIT */}
            <View style={[styles.accordionCard, { marginBottom: 1 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setVisitExpanded(!visitExpanded)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionTitleLeft}>
                  <View style={styles.indicatorBar} />
                  <Text style={styles.accordionTitleText}>VISIT</Text>
                  <View style={styles.badgeCountChip}>
                    <Text style={styles.badgeCountText}>{Array.isArray(dbVisits) ? dbVisits.length : 0}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.addBtnCircle}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddAction('Visit');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addBtnCircle}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleViewList('Visit');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="list" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <View style={styles.chevronBg}>
                    <Ionicons
                      name={visitExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={COLORS.textDark}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {visitExpanded && (
                <View style={styles.accordionContent}>
                  {dbVisits.length === 0 ? (
                    <Text style={styles.noDataText}>No visits found.</Text>
                  ) : (
                    dbVisits.map((visit: any, index: number) => {
                      const dateStr = formatDate(visit.visit_date || visit.scheduled_time || visit.date);
                      return (
                        <View key={visit.id || index} style={styles.miniItemRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.miniItemTitle}>{visit.title || visit.purpose || 'Visit'}</Text>
                            <Text style={styles.miniItemSub}>
                              {visit.company || visit.lead_company_name || '—'} · {dateStr}
                            </Text>
                            {visit.location_address ? (
                              <Text style={styles.miniItemSub} numberOfLines={1}>{visit.location_address}</Text>
                            ) : null}
                          </View>
                          <Text style={[styles.miniItemStatus, { color: COLORS.green }]}>
                            {visit.status || 'Complete'}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>

            {/* Collapsible Section: MEETING */}
            <View style={[styles.accordionCard, { marginBottom: 1 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setMeetingExpanded(!meetingExpanded)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionTitleLeft}>
                  <View style={styles.indicatorBar} />
                  <Text style={styles.accordionTitleText}>MEETING</Text>
                  <View style={styles.badgeCountChip}>
                    <Text style={styles.badgeCountText}>{Array.isArray(dbMeetings) ? dbMeetings.length : 0}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.addBtnCircle}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddAction('Meeting');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addBtnCircle}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleViewList('Meeting');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="list" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <View style={styles.chevronBg}>
                    <Ionicons
                      name={meetingExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={COLORS.textDark}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {meetingExpanded && (
                <View style={styles.accordionContent}>
                  {dbMeetings.length === 0 ? (
                    <Text style={styles.noDataText}>No meetings found.</Text>
                  ) : (
                    dbMeetings.map((meeting: any, index: number) => {
                      const dateObj = meeting.scheduled_at ? new Date(meeting.scheduled_at) : null;
                      const dateStr = dateObj
                        ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
                        ' ' +
                        dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '—';
                      const statusColor = meeting.status === 'COMPLETED' ? COLORS.green : COLORS.orange;

                      return (
                        <View key={meeting.id || index} style={styles.miniItemRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.miniItemTitle}>{meeting.purpose || 'Follow-up'}</Text>
                            <Text style={styles.miniItemSub}>
                              Method: {meeting.follow_up_method || 'Video Meeting'} · {dateStr}
                            </Text>
                          </View>
                          <Text style={[styles.miniItemStatus, { color: statusColor }]}>
                            {meeting.status || 'Pending'}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>

            {/* Collapsible Section: TASK */}
            <View style={[styles.accordionCard, { marginBottom: 1 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setTaskExpanded(!taskExpanded)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionTitleLeft}>
                  <View style={styles.indicatorBar} />
                  <Text style={styles.accordionTitleText}>TASK</Text>
                  <View style={styles.badgeCountChip}>
                    <Text style={styles.badgeCountText}>{Array.isArray(dbTasks) ? dbTasks.length : 0}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.addBtnCircle}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddAction('Task');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addBtnCircle}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleViewList('Task');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="list" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <View style={styles.chevronBg}>
                    <Ionicons
                      name={taskExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={COLORS.textDark}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {taskExpanded && (
                <View style={styles.accordionContent}>
                  {dbTasks.length === 0 ? (
                    <Text style={styles.noDataText}>No tasks found.</Text>
                  ) : (
                    dbTasks.map((task: any, index: number) => {
                      const isCompleted = task.status?.toUpperCase() === 'COMPLETED';
                      const statusColor = isCompleted ? COLORS.green : COLORS.orange;
                      const dateStr = formatDate(task.due_date);

                      return (
                        <View key={task.id || index} style={styles.miniItemRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.miniItemTitle, isCompleted && { textDecorationLine: 'line-through', color: COLORS.textMuted }]}>
                              {task.title || 'Task'}
                            </Text>
                            <Text style={styles.miniItemSub}>
                              Due: {dateStr || '—'} · Priority: {task.priority || 'Normal'}
                            </Text>
                          </View>
                          <Text style={[styles.miniItemStatus, { color: statusColor }]}>
                            {task.status || 'Pending'}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>

            {/* Collapsible Section: CALL */}
            <View style={[styles.accordionCard, { marginBottom: 1 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setCallExpanded(!callExpanded)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionTitleLeft}>
                  <View style={styles.indicatorBar} />
                  <Text style={styles.accordionTitleText}>CALL</Text>
                  <View style={styles.badgeCountChip}>
                    <Text style={styles.badgeCountText}>{Array.isArray(dbCalls) ? dbCalls.length : 0}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.addBtnCircle}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleViewList('Call');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="list" size={12} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <View style={styles.chevronBg}>
                    <Ionicons
                      name={callExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={COLORS.textDark}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {callExpanded && (
                <View style={styles.accordionContent}>
                  {dbCalls.length === 0 ? (
                    <Text style={styles.noDataText}>No calls found.</Text>
                  ) : (
                    dbCalls.map((log: any, index: number) => {
                      let callTypeLabel = 'Incoming';
                      let callTypeColor = COLORS.incoming;
                      if (log.call_type === 'OUTBOUND') {
                        callTypeLabel = 'Outgoing';
                        callTypeColor = COLORS.outgoing;
                      } else if (log.call_type === 'MISSED') {
                        callTypeLabel = 'Missed';
                        callTypeColor = COLORS.missed;
                      }

                      let durationStr = '00:00';
                      if (log.duration_seconds) {
                        const mins = Math.floor(log.duration_seconds / 60);
                        const secs = log.duration_seconds % 60;
                        durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                      }

                      const dateObj = log.call_start_time ? new Date(log.call_start_time) : null;
                      const dateStr = dateObj
                        ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
                        ' ' +
                        dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '—';

                      return (
                        <View key={log.id || index} style={styles.miniItemRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.miniItemTitle}>Call {callTypeLabel}</Text>
                            <Text style={styles.miniItemSub}>
                              Duration: {durationStr} min · {dateStr}
                            </Text>
                            {log.remarks ? (
                              <Text style={styles.miniItemSub} numberOfLines={1}>{log.remarks}</Text>
                            ) : null}
                          </View>
                          <Text style={[styles.miniItemStatus, { color: callTypeColor }]}>
                            {callTypeLabel}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          </>
        )}

        {/* TAB 2: QUOTATION */}
        {activeTab === 'Quotation' && (
          <View style={{ gap: 5 }}>
            {/* Search and Filters Row */}
            <View style={styles.filterDatePickerRow}>
              <View style={styles.searchBarContainer}>
                <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Search quotation..."
                  placeholderTextColor="#9CA3AF"
                  value={quotationSearchQuery}
                  onChangeText={setQuotationSearchQuery}
                  autoCorrect={false}
                  autoComplete="off"
                />
                {quotationSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setQuotationSearchQuery('')} style={{ padding: 2 }}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.filterIconBtn}
                onPress={() => router.push({
                  pathname: '/(tabs)/Quotation/quotation-filter',
                  params: {
                    referrer: 'lead-details',
                    leadId: leadId,
                    qStartDate: params.qStartDate || '',
                    qEndDate: params.qEndDate || '',
                  }
                })}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={16} color={qFilterActive ? theme.primaryColor : COLORS.textDark} style={{ marginRight: 4 }} />
                <Text style={[styles.filterIconBtnText, qFilterActive && { color: theme.primaryColor }]}>
                  {qFilterActive ? 'Filters (Active)' : 'Filters'}
                </Text>
              </TouchableOpacity>

              {qFilterActive && (
                <TouchableOpacity
                  style={[styles.filterIconBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
                  onPress={handleClearQuotationFilters}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
                  <Text style={[styles.filterIconBtnText, { color: COLORS.danger }]}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {qFilterActive && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
                {!!params.qStatus && (
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => {
                      router.setParams({
                        qStatus: '',
                        qFilterApplied: params.qPriority || (params.qStartDate && params.qEndDate) ? 'true' : ''
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="funnel" size={12} color="#0369A1" style={{ marginRight: 6 }} />
                    <Text style={styles.filterChipText}>Status: {params.qStatus}</Text>
                    <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
                {!!params.qPriority && (
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => {
                      router.setParams({
                        qPriority: '',
                        qFilterApplied: params.qStatus || (params.qStartDate && params.qEndDate) ? 'true' : ''
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flag" size={12} color="#0369A1" style={{ marginRight: 6 }} />
                    <Text style={styles.filterChipText}>Priority: {params.qPriority}</Text>
                    <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
                {!!(params.qStartDate && params.qEndDate) && (
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => {
                      router.setParams({
                        qStartDate: '',
                        qEndDate: '',
                        qFilterApplied: params.qStatus || params.qPriority ? 'true' : ''
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar" size={12} color="#0369A1" style={{ marginRight: 6 }} />
                    <Text style={styles.filterChipText}>Date: {formatDate(params.qStartDate)} - {formatDate(params.qEndDate)}</Text>
                    <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}

            {/* List */}
            {isQuotationsLoading ? (
              <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginVertical: 20 }} />
            ) : dbQuotations.length === 0 ? (
              <View style={styles.placeholderTab}>
                <Ionicons name="document-text-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.placeholderTabText}>No quotations found for this lead.</Text>
              </View>
            ) : (
              dbQuotations.map((item: any, idx: number) => {
                const prefix = item.prefix || 'QT';
                const qNumber = item.quotation_number ? `${prefix}-${item.quotation_number}` : item.id.slice(0, 8).toUpperCase();
                const statusColor = STATUS_COLORS[item.status] || '#6B7280';
                const clientName = item.company_name || item.lead_company_name || '—';
                const contactName = item.contact_name || item.lead_name || '—';
                const dateStr = formatDate(item.quotation_date);
                const itemsCount = Array.isArray(item.items) ? item.items.length : item.total_items || 0;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.quotationCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isNavigatingRef.current) return;
                      isNavigatingRef.current = true;
                      router.push({
                        pathname: '/(tabs)/Quotation/quotation-details',
                        params: { id: item.id }
                      });
                      setTimeout(() => {
                        isNavigatingRef.current = false;
                      }, 1000);
                    }}
                  >
                    <View style={styles.quotationTopRow}>
                      <View style={styles.quotationTypeRow}>
                        <View style={[styles.dot, { backgroundColor: COLORS.blue }]} />
                        <Text style={styles.quotationTypeText}>Product Quotation</Text>
                      </View>
                      <Text style={[styles.statusTextLabel, { color: statusColor }]}>
                        • {item.status}
                      </Text>
                    </View>

                    <Text style={styles.quotationTitle}># {qNumber}</Text>

                    <View style={styles.cardDetailsList}>
                      <View style={styles.cardDetailItem}>
                        <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <Text style={styles.cardDetailText}>{clientName}</Text>
                      </View>
                      <View style={styles.cardDetailItem}>
                        <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <Text style={styles.cardDetailText}>{contactName}</Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.quotationBottomRow}>
                      <View style={styles.leftMetrics}>
                        <View style={styles.metricItem}>
                          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
                          <Text style={styles.metricText}>{dateStr}</Text>
                        </View>
                        <View style={styles.metricItem}>
                          <Ionicons name="flag-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
                          <Text style={styles.metricText}>{itemsCount} Items</Text>
                        </View>
                      </View>
                      <View style={styles.rightAmountCol}>
                        <Text style={styles.amountLabel}>Amount</Text>
                        <Text style={styles.amountValue}>{formatAmount(item.grand_total)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* TAB 3: ORDER */}
        {activeTab === 'Order' && (
          <View style={{ gap: 5 }}>
            {/* Search and Filters Row */}
            <View style={styles.filterDatePickerRow}>
              <View style={styles.searchBarContainer}>
                <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Search order..."
                  placeholderTextColor="#9CA3AF"
                  value={orderSearchQuery}
                  onChangeText={setOrderSearchQuery}
                  autoCorrect={false}
                  autoComplete="off"
                />
                {orderSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setOrderSearchQuery('')} style={{ padding: 2 }}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.filterIconBtn}
                onPress={() => router.push({
                  pathname: '/(tabs)/Order/order-filter',
                  params: { referrer: 'lead-details', leadId: leadId }
                })}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={16} color={oFilterActive ? theme.primaryColor : COLORS.textDark} style={{ marginRight: 4 }} />
                <Text style={[styles.filterIconBtnText, oFilterActive && { color: theme.primaryColor }]}>
                  {oFilterActive ? 'Filters (Active)' : 'Filters'}
                </Text>
              </TouchableOpacity>

              {oFilterActive && (
                <TouchableOpacity
                  style={[styles.filterIconBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
                  onPress={handleClearOrderFilters}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
                  <Text style={[styles.filterIconBtnText, { color: COLORS.danger }]}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {oFilterActive && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
                {!!params.oStatus && (
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => {
                      router.setParams({
                        oStatus: '',
                        oFilterApplied: (params.oStartDate && params.oEndDate) ? 'true' : ''
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="funnel" size={12} color="#0369A1" style={{ marginRight: 6 }} />
                    <Text style={styles.filterChipText}>Status: {params.oStatus}</Text>
                    <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
                {!!(params.oStartDate && params.oEndDate) && (
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => {
                      router.setParams({
                        oStartDate: '',
                        oEndDate: '',
                        oFilterApplied: params.oStatus ? 'true' : ''
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar" size={12} color="#0369A1" style={{ marginRight: 6 }} />
                    <Text style={styles.filterChipText}>Date: {formatDate(params.oStartDate)} - {formatDate(params.oEndDate)}</Text>
                    <Ionicons name="close" size={12} color="#0369A1" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}

            {/* List */}
            {isOrdersLoading ? (
              <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginVertical: 20 }} />
            ) : dbOrders.length === 0 ? (
              <View style={styles.placeholderTab}>
                <Ionicons name="cart-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.placeholderTabText}>No orders found for this lead.</Text>
              </View>
            ) : (
              dbOrders.map((item: any, idx: number) => {
                const orderNumber = item.orderNo || item.id;
                const clientName = item.clientName || leadCompany;
                const contactPerson = item.contactPerson || leadName;
                const location = item.hotelLocation || '—';
                const statusColor = STATUS_COLORS[item.status] || '#6B7280';
                const dateStr = item.date;
                const itemsCount = Array.isArray(item.items) ? item.items.length : item.itemsCount || 0;
                const paymentMethod = item.paymentType || '—';

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.orderCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isNavigatingRef.current) return;
                      isNavigatingRef.current = true;
                      router.push({
                        pathname: '/(tabs)/Order/order-details',
                        params: { id: item.id }
                      });
                      setTimeout(() => {
                        isNavigatingRef.current = false;
                      }, 1000);
                    }}
                  >
                    <View style={styles.orderTopRow}>
                      <Text style={styles.orderTitle}># {orderNumber}</Text>
                      <View style={styles.orderDateRow}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.blue} style={{ marginRight: 5 }} />
                        <Text style={styles.orderDateText}>{dateStr}</Text>
                      </View>
                    </View>

                    <View style={styles.cardDetailsList}>
                      <View style={styles.cardDetailItem}>
                        <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <Text style={styles.cardDetailText}>{clientName}</Text>
                      </View>
                      <View style={styles.cardDetailItem}>
                        <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <Text style={styles.cardDetailText}>{contactPerson}</Text>
                      </View>
                      <View style={styles.cardDetailItem}>
                        <Ionicons name="home-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <Text style={styles.cardDetailText}>{location}</Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.orderStatusItemsRow}>
                      <View style={styles.orderStatusContainer}>
                        <View style={[styles.statusCircleOutline, { borderColor: statusColor }]}>
                          <View style={[styles.statusCircleDot, { backgroundColor: statusColor }]} />
                        </View>
                        <Text style={[styles.orderStatusText, { color: statusColor }]}>{item.status}</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Ionicons name="flag-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
                        <Text style={styles.metricText}>{itemsCount} Items</Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.orderBottomPaymentRow}>
                      <View style={styles.paymentCol}>
                        <Text style={styles.paymentLabel}>Order By</Text>
                        <Text style={styles.paymentValue}>{paymentMethod}</Text>
                      </View>
                      <View style={styles.rightAmountCol}>
                        <Text style={styles.amountLabel}>Amount</Text>
                        <Text style={styles.amountValue}>{item.amount}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}


      </ScrollView>

      {/* TAB FLOATING ACTION BUTTON */}
      {(activeTab === 'Quotation' || activeTab === 'Order') && (
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => {
            if (isNavigatingRef.current) return;
            isNavigatingRef.current = true;
            if (activeTab === 'Quotation') {
              router.push({
                pathname: '/(tabs)/Quotation/add-quotation',
                params: {
                  referrer: 'lead-details',
                  leadId: params.id || '',
                  contactName: leadName !== '----' ? leadName : '',
                  companyName: leadCompany !== '----' ? leadCompany : '',
                  contactPhone: leadPhone !== '----' ? leadPhone : '',
                  contactEmail: leadEmail !== '----' ? leadEmail : '',
                  gstNumber: dbLead?.gst_number || '',
                  panNumber: dbLead?.pan_number || '',
                  notes: dbLead?.remarks || '',
                }
              });
            } else if (activeTab === 'Order') {
              router.push({
                pathname: '/(tabs)/Order/add-order',
                params: {
                  referrer: 'lead-details',
                  leadId: params.id || '',
                  companyName: leadCompany !== '----' ? leadCompany : '',
                  contactName: leadName !== '----' ? leadName : '',
                }
              });
            }
            setTimeout(() => {
              isNavigatingRef.current = false;
            }, 1000);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  actionHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs style
  tabsContainer: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F0',
    borderRadius: 10,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: theme.primaryColor,
    fontWeight: '900',
  },

  // Main scroll content
  scrollContent: {
    paddingHorizontal: 5,
    paddingTop: 5,
    gap: 5,
  },

  // Profile Card styling
  profileCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  profileTopRow: {
    flexDirection: 'row',
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 0,
    justifyContent: 'center',
    gap: 5,
  },
  profileName: {
    fontSize: 15.5,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  profileDetailLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetailText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F2',
    paddingTop: 5,
  },
  actionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  // Collapsible cards styling
  accordionCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 3,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
    marginRight: 8,
  },
  accordionTitleText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  chevronBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'right',
  },

  // Badge card navigation rows styling
  badgeRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  badgeRowTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeCardTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  badgeCountChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    marginLeft: 8,
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  arrowCircleBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Date picker + Filters row
  filterDatePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  datePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  datePickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  filterIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  filterIconBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0369A1',
  },

  // Quotation Card Styling
  quotationCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  quotationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotationTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  quotationTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
  },
  statusTextLabel: {
    fontSize: 11,
    fontWeight: '900',
  },
  quotationTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 8,
  },
  cardDetailsList: {
    gap: 6.5,
    marginVertical: 4,
  },
  cardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetailText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  quotationBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  rightAmountCol: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDark,
  },

  // Order Card Styling
  orderCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.green,
  },
  orderDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
  },
  orderStatusItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircleOutline: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  statusCircleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orderStatusText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  orderBottomPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCol: {
    alignItems: 'flex-start',
  },
  paymentLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  paymentValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textDark,
  },

  // Floating Action Button
  fabBtn: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },

  // Placeholder tabs
  placeholderTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  placeholderTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // Email Styling Classes
  tabChipStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    height: 28,
  },
  tabChipStyleActive: {
    borderColor: theme.primaryColor,
    backgroundColor: theme.primaryLight,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  chipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emailCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  emailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  emailStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emailDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  emailIconMargin: {
    marginRight: 10,
    marginTop: 2,
  },
  emailFieldLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 1,
  },
  emailFieldValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emailCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailFooterDateText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emailDeliveryText: {
    fontSize: 11.5,
    color: COLORS.green,
    fontWeight: '800',
  },
  noDataText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '600',
  },
  miniItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  miniItemTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  miniItemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  miniItemStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textDark,
    fontWeight: '600',
    height: '100%',
    paddingVertical: 0,
  },

});
