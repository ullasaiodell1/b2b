import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadDetails, useLeads } from '@/hooks/useLeads';
import { useMeetings } from '@/hooks/useMeetings';
import { useQuotations } from '@/hooks/useQuotations';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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

type TabType = 'Overview' | 'Quotation' | 'Order' | 'Emails';

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
  }>();
  const insets = useSafeAreaInsets();

  const { data: dbLead, isLoading, isFetching, refetch } = useLeadDetails(params.id || '');
  const { deleteLead } = useLeads();
  const { quotations: dbQuotations, isLoading: isQuotationsLoading, isFetching: isQuotationsFetching, refetch: refetchQuotations } = useQuotations({ lead_id: params.id || '' });
  const { meetings: dbMeetings, refetch: refetchMeetings } = useMeetings(undefined, params.id || '');

  const handleRefresh = () => {
    refetch();
    refetchQuotations();
    refetchMeetings();
  };

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
  const [descExpanded, setDescExpanded] = useState(true);
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [emailSelectedStatus, setEmailSelectedStatus] = useState<'All' | 'Opened' | 'Sent' | 'Draft' | 'Bounce'>('All');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleAction = (type: string) => {
    const routeParams = {
      leadId: params.id,
      leadName,
      company: leadCompany,
      phone: leadPhone,
      email: leadEmail,
    };

    if (type === 'Call') {
      router.push({ pathname: '/(tabs)/call', params: routeParams } as any);
    } else if (type === 'Task') {
      router.push({ pathname: '/(tabs)/task', params: routeParams } as any);
    } else if (type === 'Meeting') {
      router.push({ pathname: '/(tabs)/meeting', params: routeParams } as any);
    } else if (type === 'Visit') {
      router.push({ pathname: '/(tabs)/visit', params: routeParams } as any);
    } else {
      Alert.alert('Action triggered', `Performing ${type} action...`);
    }
  };

  const handleEditLead = () => {
    if (isNavigating) return;
    if (!params.id) {
      Alert.alert('Error', 'Lead ID is missing.');
      return;
    }
    setIsNavigating(true);
    router.push({
      pathname: '/(tabs)/leads/edit-lead',
      params: {
        id: params.id,
      }
    });
    setTimeout(() => {
      setIsNavigating(false);
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
    if (activeTab === 'Order') {
      return (
        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>ORD</Text>
          <Text style={{ color: COLORS.textDark }}>ER</Text>
        </Text>
      );
    }
    return (
      <Text style={styles.headerTitle}>
        <Text style={{ color: theme.primaryColor }}>EM</Text>
        <Text style={{ color: COLORS.textDark }}>AIL</Text>
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
          {(['Overview', 'Quotation', 'Order', 'Emails'] as TabType[]).map((tab) => {
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
                <Image
                  source={require('@/assets/images/lead_avatar.png')}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <View style={styles.profileInfoCol}>
                  <Text style={styles.profileName}>{leadName}</Text>

                  <View style={styles.profileDetailLine}>
                    <Ionicons name="business-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.profileDetailText}>{leadCompany}</Text>
                  </View>

                  <View style={styles.profileDetailLine}>
                    <Ionicons name="mail-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.profileDetailText}>{leadEmail}</Text>
                  </View>

                  <View style={styles.profileDetailLine}>
                    <Ionicons name="home-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.profileDetailText}>
                      {[dbLead?.city_name || dbLead?.city, dbLead?.state_name || dbLead?.state].filter(Boolean).join(', ') || '----'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleAction('Email')} activeOpacity={0.85}>
                  <Ionicons name="mail" size={16} color={COLORS.textDark} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleAction('Identity')} activeOpacity={0.85}>
                  <Ionicons name="people" size={16} color={COLORS.textDark} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleAction('Location')} activeOpacity={0.85}>
                  <Ionicons name="location" size={16} color={COLORS.textDark} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleAction('Call')} activeOpacity={0.85}>
                  <Ionicons name="call" size={16} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>
            </View>

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
                  <DetailRow label="Lead Status" value={dbLead?.status || "----"} />
                  <DetailRow label="Created By" value={dbLead?.created_by_name || leadOwner} />
                  <DetailRow label="Modified By" value={leadOwner} />
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

            {/* ACCORDION 3: DESCRIPTION */}
            <View style={[styles.accordionCard, { marginBottom: 1 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setDescExpanded(!descExpanded)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionTitleLeft}>
                  <View style={styles.indicatorBar} />
                  <Text style={styles.accordionTitleText}>DESCRIPTION</Text>
                </View>
                <View style={styles.chevronBg}>
                  <Ionicons
                    name={descExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={COLORS.textDark}
                  />
                </View>
              </TouchableOpacity>

              {descExpanded && (
                <View style={styles.accordionContent}>
                  <DetailRow label="Description" value={dbLead?.remarks || '-----'} />
                </View>
              )}
            </View>

            {/* NAVIGATION BADGES CARD ROWS */}
            <TouchableOpacity
              style={[styles.badgeRowCard, { marginBottom: 1 }]}
              onPress={() => handleAction('Visit')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>VISIT</Text>
              </View>
              <View style={styles.arrowCircleBg}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.badgeRowCard, { marginBottom: 1 }]}
              onPress={() => handleAction('Meeting')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>MEETING</Text>
              </View>
              <View style={styles.arrowCircleBg}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.badgeRowCard, { marginBottom: 1 }]}
              onPress={() => handleAction('Task')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>TASK</Text>
              </View>
              <View style={styles.arrowCircleBg}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.badgeRowCard, { marginBottom: 1 }]}
              onPress={() => handleAction('Call')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>CALL</Text>
              </View>
              <View style={styles.arrowCircleBg}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* TAB 2: QUOTATION */}
        {activeTab === 'Quotation' && (
          <View style={{ gap: 12 }}>
            {/* FilterDatePickerRow */}
            <View style={styles.filterDatePickerRow}>
              <TouchableOpacity style={styles.datePickerBtn} activeOpacity={0.8}>
                <Text style={styles.datePickerBtnText}>15 Sep 25 – 31 Dec 26</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textDark} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterIconBtn}
                onPress={() => router.push({
                  pathname: '/(tabs)/Quotation/quotation-filter',
                  params: { referrer: 'lead-details', leadId: params.id || '' }
                })}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={16} color={COLORS.textDark} style={{ marginRight: 6 }} />
                <Text style={styles.filterIconBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

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
                    onPress={() => router.push({
                      pathname: '/(tabs)/Quotation/quotation-details',
                      params: { id: item.id }
                    })}
                  >
                    <View style={styles.quotationTopRow}>
                      <View style={styles.quotationTypeRow}>
                        <View style={[styles.dot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.quotationTypeText, { color: statusColor }]}>{item.status}</Text>
                      </View>
                      <Text style={[styles.statusTextLabel, { color: statusColor }]}>+ {item.status}</Text>
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
          <View style={{ gap: 12 }}>
            {/* FilterDatePickerRow */}
            <View style={styles.filterDatePickerRow}>
              <TouchableOpacity style={styles.datePickerBtn} activeOpacity={0.8}>
                <Text style={styles.datePickerBtnText}>15 Sep 25 – 31 Dec 26</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textDark} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterIconBtn}
                onPress={() => router.push({
                  pathname: '/(tabs)/Order/order-filter',
                  params: { referrer: 'lead-details', leadId: params.id || '' }
                })}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={16} color={COLORS.textDark} style={{ marginRight: 6 }} />
                <Text style={styles.filterIconBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            {ORDERS.map((item: any, idx: number) => (
              <View key={item.id + '_' + idx} style={styles.orderCard}>
                <View style={styles.orderTopRow}>
                  <Text style={styles.orderTitle}># {item.id}</Text>
                  <View style={styles.orderDateRow}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.blue} style={{ marginRight: 5 }} />
                    <Text style={styles.orderDateText}>{item.date}</Text>
                  </View>
                </View>

                <View style={styles.cardDetailsList}>
                  <View style={styles.cardDetailItem}>
                    <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.cardDetailText}>{item.company}</Text>
                  </View>
                  <View style={styles.cardDetailItem}>
                    <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.cardDetailText}>{item.contact}</Text>
                  </View>
                  <View style={styles.cardDetailItem}>
                    <Ionicons name="home-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.cardDetailText}>{item.location}</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.orderStatusItemsRow}>
                  <View style={styles.orderStatusContainer}>
                    <View style={[styles.statusCircleOutline, { borderColor: item.statusColor }]}>
                      <View style={[styles.statusCircleDot, { backgroundColor: item.statusColor }]} />
                    </View>
                    <Text style={[styles.orderStatusText, { color: item.statusColor }]}>{item.status}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="flag-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
                    <Text style={styles.metricText}>{item.itemsCount} Items</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.orderBottomPaymentRow}>
                  <View style={styles.paymentCol}>
                    <Text style={styles.paymentLabel}>Order By</Text>
                    <Text style={styles.paymentValue}>{item.paymentMethod}</Text>
                  </View>
                  <View style={styles.rightAmountCol}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>{item.amount}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: EMAILS */}
        {activeTab === 'Emails' && (
          <View style={{ gap: 12 }}>
            {/* Search and Filters row */}
            <View style={styles.filterDatePickerRow}>
              <View style={[styles.datePickerBtn, { flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 12.5, color: COLORS.textDark, fontWeight: '600', height: '100%', padding: 0 }}
                  placeholder="Search Emails..."
                  placeholderTextColor="#9CA3AF"
                  value={emailSearchQuery}
                  onChangeText={setEmailSearchQuery}
                />
                {emailSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setEmailSearchQuery('')}>
                    <Ionicons name="close-circle" size={15} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.filterIconBtn}
                onPress={() => router.push({
                  pathname: '/(tabs)/email/email-filter',
                  params: { referrer: 'lead-details', id: params.id || '' }
                })}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={16} color={COLORS.textDark} style={{ marginRight: 6 }} />
                <Text style={styles.filterIconBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Horizontal Filter Chips */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 1 }}>
              <TouchableOpacity
                style={[
                  styles.tabChipStyle,
                  emailSelectedStatus === 'Opened' && styles.tabChipStyleActive
                ]}
                onPress={() => setEmailSelectedStatus(emailSelectedStatus === 'Opened' ? 'All' : 'Opened')}
                activeOpacity={0.8}
              >
                <View style={[styles.chipDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.chipText}>Opened <Text style={{ fontWeight: '800' }}>12</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabChipStyle,
                  emailSelectedStatus === 'Sent' && styles.tabChipStyleActive
                ]}
                onPress={() => setEmailSelectedStatus(emailSelectedStatus === 'Sent' ? 'All' : 'Sent')}
                activeOpacity={0.8}
              >
                <View style={[styles.chipDot, { backgroundColor: COLORS.blue }]} />
                <Text style={styles.chipText}>Sent <Text style={{ fontWeight: '800' }}>20</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabChipStyle,
                  emailSelectedStatus === 'Draft' && styles.tabChipStyleActive
                ]}
                onPress={() => setEmailSelectedStatus(emailSelectedStatus === 'Draft' ? 'All' : 'Draft')}
                activeOpacity={0.8}
              >
                <View style={[styles.chipDot, { backgroundColor: COLORS.orange }]} />
                <Text style={styles.chipText}>Draft <Text style={{ fontWeight: '800' }}>05</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabChipStyle,
                  emailSelectedStatus === 'Bounce' && styles.tabChipStyleActive
                ]}
                onPress={() => setEmailSelectedStatus(emailSelectedStatus === 'Bounce' ? 'All' : 'Bounce')}
                activeOpacity={0.8}
              >
                <View style={[styles.chipDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.chipText}>Bounce <Text style={{ fontWeight: '800' }}>02</Text></Text>
              </TouchableOpacity>
            </View>

            {/* Email Cards List */}
            {[]
              .filter((item: any) => {
                const matchesSearch =
                  item.subject.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                  item.company.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                  item.sentTo.toLowerCase().includes(emailSearchQuery.toLowerCase());
                const matchesStatus = emailSelectedStatus === 'All' || item.status === emailSelectedStatus;
                return matchesSearch && matchesStatus;
              })
              .map((item: any, idx) => (
                <View key={item.id + '_' + idx} style={styles.emailCard}>
                  <View style={styles.emailCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.dot, { backgroundColor: item.statusColor, marginRight: 6 }]} />
                      <Text style={[styles.emailStatusText, { color: item.statusColor }]}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.cardDetailsList}>
                    <View style={styles.emailDetailRow}>
                      <Ionicons name="calendar-outline" size={15} color={COLORS.textMuted} style={styles.emailIconMargin} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.emailFieldLabel}>Subject</Text>
                        <Text style={styles.emailFieldValue}>{item.subject}</Text>
                      </View>
                    </View>

                    <View style={styles.emailDetailRow}>
                      <Ionicons name="business-outline" size={15} color={COLORS.textMuted} style={styles.emailIconMargin} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.emailFieldLabel}>Company Name</Text>
                        <Text style={styles.emailFieldValue}>{item.company}</Text>
                      </View>
                    </View>

                    <View style={styles.emailDetailRow}>
                      <Ionicons name="person-outline" size={15} color={COLORS.textMuted} style={styles.emailIconMargin} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.emailFieldLabel}>Sent To</Text>
                        <Text style={styles.emailFieldValue}>{item.sentTo}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.emailCardFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                      <Text style={styles.emailFooterDateText}>{item.date}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.green} style={{ marginRight: 4 }} />
                      <Text style={styles.emailDeliveryText}>{item.deliveryStatus}</Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      {/* TAB FLOATING ACTION BUTTON */}
      {(activeTab === 'Quotation' || activeTab === 'Order' || activeTab === 'Emails') && (
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => {
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
            } else {
              router.push({
                pathname: '/(tabs)/email/add-email',
                params: { referrer: 'lead-details', leadId: params.id || '' }
              });
            }
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
  profileImage: {
    width: 105,
    height: 105,
    borderRadius: 5,
    backgroundColor: '#F3F4F6',
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 16,
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

  // Quotation Card Styling
  quotationCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginRight: 6,
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
});
