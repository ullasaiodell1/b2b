import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#DCE5E1',
  blue: '#2563EB',
  green: '#10B981',
  orange: '#F59E0B',
};

type TabType = 'Overview' | 'Quotation' | 'Order' | 'Emails';

interface DetailRowProps {
  label: string;
  value: string;
  required?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, required }) => (
  <View style={styles.detailRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.detailLabel}>{label}</Text>
      {required && <Text style={{ color: '#EF4444', marginLeft: 2, fontWeight: 'bold' }}>*</Text>}
    </View>
    <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
  </View>
);

export default function LeadDetailsScreen() {
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

  const leadName = params.name || 'Parth Solanki';
  const leadCompany = params.company || 'Parth Pvt. Ltd.';
  const leadEmail = params.email || 'parth123@gmail.com';
  const leadPhone = params.phone || '+91 45637 12345';
  const leadTag = params.tag || 'Hardware';
  const leadPriority = params.priority || 'Normal';
  const leadOwner = params.owner || 'Arjun Maheta';

  // State
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [leadInfoExpanded, setLeadInfoExpanded] = useState(true);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const [descExpanded, setDescExpanded] = useState(true);
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [emailSelectedStatus, setEmailSelectedStatus] = useState<'All' | 'Opend' | 'Sent' | 'Draft' | 'Bounce'>('All');

  const handleAction = (type: string) => {
    if (type === 'Call') {
      router.push('/(tabs)/call/index' as any);
    } else if (type === 'Task') {
      router.push('/(tabs)/task/index' as any);
    } else if (type === 'Meeting') {
      router.push('/(tabs)/visit/index' as any);
    } else {
      Alert.alert('Action triggered', `Performing ${type} action...`);
    }
  };

  // Dynamic Header Title Helper
  const renderHeaderTitle = () => {
    if (activeTab === 'Overview') {
      return (
        <Text style={styles.headerTitle}>
          <Text style={{ color: COLORS.primary }}>OVER</Text>
          <Text style={{ color: COLORS.textDark }}>VIEW</Text>
        </Text>
      );
    }
    if (activeTab === 'Quotation') {
      return (
        <Text style={styles.headerTitle}>
          <Text style={{ color: COLORS.primary }}>QUOT</Text>
          <Text style={{ color: COLORS.textDark }}>ATION</Text>
        </Text>
      );
    }
    if (activeTab === 'Order') {
      return (
        <Text style={styles.headerTitle}>
          <Text style={{ color: COLORS.primary }}>ORD</Text>
          <Text style={{ color: COLORS.textDark }}>ER</Text>
        </Text>
      );
    }
    return (
      <Text style={styles.headerTitle}>
        <Text style={{ color: COLORS.primary }}>EM</Text>
        <Text style={{ color: COLORS.textDark }}>AIL</Text>
      </Text>
    );
  };

  // Mock data for Quotation Tab
  const QUOTATIONS = [
    {
      id: 'QT-2026-001',
      type: 'Product Quotation',
      status: 'Sent',
      statusColor: COLORS.orange,
      company: 'NovaTech Solutions Pvt. Ltd.',
      contact: 'Arjun Maheta',
      location: 'The Grand Thakar Hotel , Rajkot',
      date: '22 March 2026',
      itemsCount: 21,
      amount: '₹ 10,00,000.00',
    },
    {
      id: 'QT-2026-002',
      type: 'Project Based Quotation',
      status: 'Accepted',
      statusColor: COLORS.green,
      company: 'NovaTech Solutions Pvt. Ltd.',
      contact: 'Arjun Maheta',
      location: 'The Grand Thakar Hotel , Rajkot',
      date: '22 March 2026',
      itemsCount: 21,
      amount: '₹ 10,00,000.00',
    },
    {
      id: 'QT-2026-003',
      type: 'Services Based Quotation',
      status: 'Sent',
      statusColor: COLORS.orange,
      company: 'NovaTech Solutions Pvt. Ltd.',
      contact: 'Arjun Maheta',
      location: 'The Grand Thakar Hotel , Rajkot',
      date: '22 March 2026',
      itemsCount: 21,
      amount: '₹ 10,00,000.00',
    },
  ];

  // Mock data for Order Tab
  const ORDERS = [
    {
      id: 'QT-2026-001',
      status: 'Complete',
      statusColor: COLORS.green,
      company: 'NovaTech Solutions Pvt. Ltd.',
      contact: 'Arjun Maheta',
      location: 'The Grand Thakar Hotel , Rajkot',
      date: '22 March 2026',
      itemsCount: 21,
      paymentMethod: 'Advance Payment',
      amount: '₹ 10,00,000.00',
    },
    {
      id: 'QT-2026-012',
      status: 'Pending',
      statusColor: COLORS.orange,
      company: 'Zenith System Pvt. Ltd.',
      contact: 'Khushal Nadiyapara',
      location: 'The Grand Thakar Hotel , Rajkot',
      date: '12 April 2026',
      itemsCount: 21,
      paymentMethod: 'Advance Payment',
      amount: '₹ 40,00,000.00',
    },
    {
      id: 'QT-2026-013',
      status: 'Pending',
      statusColor: COLORS.orange,
      company: 'Zenith System Pvt. Ltd.',
      contact: 'Parth Solanki',
      location: 'The Grand Thakar Hotel , Rajkot',
      date: '20 May 2026',
      itemsCount: 21,
      paymentMethod: 'Advance Payment',
      amount: '₹ 10,00,000.00',
    },
  ];

  return (
    <View style={styles.root}>
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

        <View style={{ width: 36 }} />
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
                    <Text style={styles.profileDetailText}>Rajkot</Text>
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
            <View style={styles.accordionCard}>
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
                  <DetailRow label="Title" value="----" />
                  <DetailRow label="Email" value={leadEmail} />
                  <DetailRow label="Phone" value={leadPhone} />
                  <DetailRow label="Fax" value="----" />
                  <DetailRow label="Mobile" value="----" />
                  <DetailRow label="Website" value="----" />
                  <DetailRow label="Lead Source" value="----" />
                  <DetailRow label="Lead Status" value="----" />
                  <DetailRow label="Industry" value="----" />
                  <DetailRow label="No. Of Employee" value="----" />
                  <DetailRow label="Annual Revenue" value="----" />
                  <DetailRow label="Raitng" value="----" />
                  <DetailRow label="Created By" value={leadOwner} />
                  <DetailRow label="Email Opt Out" value="----" />
                  <DetailRow label="Skype ID" value="----" />
                  <DetailRow label="Modified By" value={leadOwner} />
                  <DetailRow label="Created Time" value="Today 2:29 pm" />
                  <DetailRow label="Modified Time" value="Today 2:29 pm" />
                  <DetailRow label="Salutation" value="----" />
                  <DetailRow label="Secondary Email" value="----" />
                  <DetailRow label="Twitter" value="----" />
                  <DetailRow label="Last Activity Time" value="----" />
                  <DetailRow label="Lead Conversion Time" value="----" />
                </View>
              )}
            </View>

            {/* ACCORDION 2: ADDRESS */}
            <View style={styles.accordionCard}>
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
                  <DetailRow label="Address" value="-----" />
                </View>
              )}
            </View>

            {/* ACCORDION 3: DESCRIPTION */}
            <View style={styles.accordionCard}>
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
                  <DetailRow label="Description" value="-----" />
                </View>
              )}
            </View>

            {/* NAVIGATION BADGES CARD ROWS */}
            <TouchableOpacity 
              style={styles.badgeRowCard}
              onPress={() => router.push('/(tabs)/visit')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>VISIT</Text>
                <View style={styles.badgeCountChip}>
                  <Text style={styles.badgeCountText}>12</Text>
                </View>
              </View>
              <View style={styles.arrowCircleBg}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.badgeRowCard}
              onPress={() => handleAction('Follow Up')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>FOLLOW UP</Text>
                <View style={styles.badgeCountChip}>
                  <Text style={styles.badgeCountText}>12</Text>
                </View>
              </View>
              <View style={styles.arrowCircleBg}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.badgeRowCard}
              onPress={() => handleAction('Meeting')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>MEETING</Text>
                <View style={styles.badgeCountChip}>
                  <Text style={styles.badgeCountText}>5</Text>
                </View>
              </View>
              <View style={styles.arrowCircleBg}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.badgeRowCard}
              onPress={() => handleAction('Task')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>TASK</Text>
                <View style={styles.badgeCountChip}>
                  <Text style={styles.badgeCountText}>10</Text>
                </View>
              </View>
              <View style={styles.arrowCircleBg}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.badgeRowCard}
              onPress={() => handleAction('Call')}
              activeOpacity={0.85}
            >
              <View style={styles.badgeRowTitleLeft}>
                <View style={styles.indicatorBar} />
                <Text style={styles.badgeCardTitle}>CALL</Text>
                <View style={styles.badgeCountChip}>
                  <Text style={styles.badgeCountText}>20</Text>
                </View>
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
                onPress={() => router.push('/(tabs)/Quotation/quotation-filter')}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={16} color={COLORS.textDark} style={{ marginRight: 6 }} />
                <Text style={styles.filterIconBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            {QUOTATIONS.map((item, idx) => (
              <View key={item.id + '_' + idx} style={styles.quotationCard}>
                <View style={styles.quotationTopRow}>
                  <View style={styles.quotationTypeRow}>
                    <View style={[styles.dot, { backgroundColor: COLORS.blue }]} />
                    <Text style={styles.quotationTypeText}>{item.type}</Text>
                  </View>
                  <Text style={[styles.statusTextLabel, { color: item.statusColor }]}>+ {item.status}</Text>
                </View>

                <Text style={styles.quotationTitle}># {item.id}</Text>

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

                <View style={styles.quotationBottomRow}>
                  <View style={styles.leftMetrics}>
                    <View style={styles.metricItem}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
                      <Text style={styles.metricText}>{item.date}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Ionicons name="flag-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 5 }} />
                      <Text style={styles.metricText}>{item.itemsCount} Items</Text>
                    </View>
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
                onPress={() => router.push('/(tabs)/Order/order-filter')}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={16} color={COLORS.textDark} style={{ marginRight: 6 }} />
                <Text style={styles.filterIconBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            {ORDERS.map((item, idx) => (
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
                onPress={() => router.push('/(tabs)/email/email-filter')}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={16} color={COLORS.textDark} style={{ marginRight: 6 }} />
                <Text style={styles.filterIconBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Horizontal Filter Chips */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
              <TouchableOpacity 
                style={[
                  styles.tabChipStyle, 
                  emailSelectedStatus === 'Opend' && styles.tabChipStyleActive
                ]}
                onPress={() => setEmailSelectedStatus(emailSelectedStatus === 'Opend' ? 'All' : 'Opend')}
                activeOpacity={0.8}
              >
                <View style={[styles.chipDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.chipText}>Opend <Text style={{ fontWeight: '800' }}>12</Text></Text>
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
            {[
              {
                id: '1',
                subject: 'Order Confirmation - Website Redesi...',
                company: 'Ullas India IT Solutions Limited.',
                sentTo: 'Parth Solanki',
                status: 'Opend',
                statusColor: COLORS.green,
                date: '22 March 2026',
                deliveryStatus: 'Delivered',
              },
              {
                id: '2',
                subject: 'Order Confirmation - Website Redesi...',
                company: 'Ullas India IT Solutions Limited.',
                sentTo: 'Parth Solanki',
                status: 'Sent',
                statusColor: COLORS.blue,
                date: '22 March 2026',
                deliveryStatus: 'Delivered',
              },
            ]
              .filter(item => {
                const matchesSearch = 
                  item.subject.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                  item.company.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                  item.sentTo.toLowerCase().includes(emailSearchQuery.toLowerCase());
                const matchesStatus = emailSelectedStatus === 'All' || item.status === emailSelectedStatus;
                return matchesSearch && matchesStatus;
              })
              .map((item, idx) => (
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
              router.push('/(tabs)/Quotation/add-quotation');
            } else if (activeTab === 'Order') {
              router.push('/(tabs)/Order/add-order' as any);
            } else {
              router.push('/(tabs)/email/add-email');
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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

  // Tabs style
  tabsContainer: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    color: COLORS.primary,
    fontWeight: '900',
  },

  // Main scroll content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },

  // Profile Card styling
  profileCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  profileTopRow: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 105,
    height: 105,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 14,
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
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F2',
    paddingTop: 12,
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
    marginBottom: 4,
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
    backgroundColor: COLORS.primary,
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
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
    backgroundColor: COLORS.primary,
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
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
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
