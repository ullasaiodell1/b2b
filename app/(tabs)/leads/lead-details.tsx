import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteLead, useLeadDetails } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LeadInfoCard from '@/components/lead/details/LeadInfoCard';
import OverviewTab from '@/components/lead/details/OverviewTab';
import QuotationTab from '@/components/lead/details/QuotationTab';
import OrderTab from '@/components/lead/details/OrderTab';
import LedgerTab from '@/components/lead/details/LedgerTab';

type TabType = 'Overview' | 'Quotation' | 'Order' | 'Ledger';

export default function LeadDetailsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { primaryColor } = theme;

  const [activeTab, setActiveTab] = useState<TabType>((params.activeTab as TabType) || 'Overview');

  React.useEffect(() => {
    if (params.activeTab) {
      setActiveTab(params.activeTab as TabType);
    }
  }, [params.activeTab]);
  const isNavigatingRef = React.useRef(false);

  const { data: rawLead, isLoading, refetch } = useLeadDetails(params.id || '');
  const { mutateAsync: deleteLead } = useDeleteLead();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

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

  const leadId = params.id || dbLead?.id || '';
  const leadName = dbLead?.name || params.name || '----';
  const leadCompany = dbLead?.company || params.company || '----';
  const leadEmail = dbLead?.email || params.email || '----';
  const leadPhone = dbLead?.phone || params.phone || '----';

  const handleEditLead = () => {
    if (isNavigatingRef.current) return;
    if (!params.id) {
      Alert.alert('Error', 'Lead ID is missing.');
      return;
    }
    isNavigatingRef.current = true;
    navigation.navigate('edit-lead' as never, {
      id: params.id,
    } as never);
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
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete lead.');
            }
          }
        }
      ]
    );
  };

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
        <Text style={{ color: theme.primaryColor }}>LED</Text>
        <Text style={{ color: COLORS.textDark }}>GER</Text>
      </Text>
    );
  };

  if (isLoading || !dbLead) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>Loading Details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
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
          {(['Overview', 'Quotation', 'Order', 'Ledger'] as TabType[]).map((tab) => {
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
        {activeTab === 'Overview' && (
          <>
            <LeadInfoCard
              rawLead={rawLead}
              dbLead={dbLead}
              onStatusUpdated={refetch}
            />
            <OverviewTab
              leadId={leadId}
              dbLead={dbLead}
              rawLead={rawLead}
            />
          </>
        )}

        {activeTab === 'Quotation' && (
          <QuotationTab
            leadId={leadId}
            dbLead={dbLead}
            qStatus={params.qStatus}
            qPriority={params.qPriority}
            qStartDate={params.qStartDate}
            qEndDate={params.qEndDate}
          />
        )}

        {activeTab === 'Order' && (
          <OrderTab
            leadId={leadId}
            dbLead={dbLead}
            oStatus={params.oStatus}
            oStartDate={params.oStartDate}
            oEndDate={params.oEndDate}
          />
        )}

        {activeTab === 'Ledger' && (
          <LedgerTab
            leadId={leadId}
            dbLead={dbLead}
            lType={params.lType}
            lCategory={params.lCategory}
            lStartDate={params.lStartDate}
            lEndDate={params.lEndDate}
          />
        )}
      </ScrollView>

      {/* TAB FLOATING ACTION BUTTON */}
      {(activeTab === 'Quotation' || activeTab === 'Order') && (
        <TouchableOpacity
          style={[styles.fabBtn, { bottom: Math.max(insets.bottom + 120, 130) }]}
          onPress={() => {
            if (isNavigatingRef.current) return;
            isNavigatingRef.current = true;
            if (activeTab === 'Quotation') {
              navigation.navigate('lead-add-quotation' as never, {
                referrer: 'lead-details',
                leadId: leadId,
                contactName: leadName !== '----' ? leadName : '',
                companyName: leadCompany !== '----' ? leadCompany : '',
                contactPhone: leadPhone !== '----' ? leadPhone : '',
                contactEmail: leadEmail !== '----' ? leadEmail : '',
                gstNumber: dbLead?.gst_number || '',
                panNumber: dbLead?.pan_number || '',
                notes: dbLead?.remarks || '',
              } as never);
            } else if (activeTab === 'Order') {
              navigation.navigate('lead-add-order' as never, {
                referrer: 'lead-details',
                leadId: leadId,
                companyName: leadCompany !== '----' ? leadCompany : '',
                contactName: leadName !== '----' ? leadName : '',
              } as never);
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
  scrollContent: {
    paddingHorizontal: 5,
    paddingTop: 5,
    gap: 5,
  },
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
});
