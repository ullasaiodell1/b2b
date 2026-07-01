import CustomHeader from '@/components/custom/CustomHeader';
import { MonthYearPicker } from '@/components/custom/MonthYearPicker';
import QuickBall from '@/components/custom/QuickBall';
import { updateOrderFilterState } from '@/components/order&quotations/OrderState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useAppPermissions } from '@/hooks/useAppPermissions';
import { useHolidays } from '@/hooks/useHolidays';
import { syncDeviceCallLogs } from '@/utils/callLogSync';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  BarChart,
  LineChart,
  PieChart,
} from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 36;

// ── FALLBACK/MOCK DATA ────────────────────────────────

const LEAD_DATA_MOCK = {
  Daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
  },
  Weekly: {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [{ data: [0, 0, 0, 0] }],
  },
  Monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
  },
};

function formatAnalysisData(raw: any) {
  if (!raw) return null;
  const { dashboardData, orderData, visitsData, dealerStats } = raw;

  const dash = (dashboardData as any)?.data || dashboardData || {};
  const order = (orderData as any)?.data || orderData || {};
  const visits = (visitsData as any)?.data || [];
  const totalVisits = (visitsData as any)?.total ?? visits.length ?? 0;

  const dealer = (dealerStats as any)?.data || dealerStats || {};
  const dealerSummary = dealer.summary || {};

  const counters = dash.counters || {};

  // Parse Monthly lead creation/revenue trends
  const monthlyRevenue = dash.monthlyRevenue || [];
  const labels = monthlyRevenue.map((r: any) => r.month) || [];
  const data = monthlyRevenue.map((r: any) => r.revenue) || [];

  // Format to fit LEAD_DATA_MOCK structure
  const monthlyData = labels.length > 0 ? {
    labels,
    datasets: [{ data }],
    total: data.reduce((sum: number, val: number) => sum + val, 0)
  } : null;

  // Format return object to conform to HomeScreen expectations
  return {
    total_visits: totalVisits,
    revenue_generated: `₹${(counters.totalRevenue || 0).toLocaleString('en-IN')}`,
    assigned_target: `₹${(counters.pipelineValue || 0).toLocaleString('en-IN')}`,

    // Detailed metrics for our grid sections:
    crm: {
      totalLeads: counters.totalLeads ?? 0,
      totalCustomers: counters.totalCustomers ?? 0,
      activeDeals: counters.activeDeals ?? 0,
      conversionRate: `${counters.conversionRate ?? 0}%`,
      pipelineValue: `₹${(counters.pipelineValue || 0).toLocaleString('en-IN')}`,
    },
    financials: {
      netRevenue: `₹${(counters.txnNetRevenue || 0).toLocaleString('en-IN')}`,
      totalSales: `₹${(counters.txnTotalSales || 0).toLocaleString('en-IN')}`,
      totalPurchases: `₹${(counters.txnTotalPurchases || 0).toLocaleString('en-IN')}`,
      saleReturns: `₹${(counters.txnSaleReturns || 0).toLocaleString('en-IN')}`,
      totalRevenue: `₹${(counters.totalRevenue || 0).toLocaleString('en-IN')}`,
    },
    orderSummary: {
      totalOrders: order.summary?.total_orders ?? 0,
      completedOrders: order.summary?.completed_orders ?? 0,
      pendingOrders: order.summary?.pending_orders ?? 0,
      customOrders: order.summary?.custom_orders_count ?? order.summary?.custom_orders ?? 0,
      avgOrderValue: `₹${(order.summary?.avg_order_value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      totalRevenue: `₹${(order.summary?.total_revenue || 0).toLocaleString('en-IN')}`,
    },
    bookingAnalysis: {
      productsBooked: order.bookingAnalysis?.products_booked ?? 0,
      totalBooked: order.bookingAnalysis?.total_booked ?? 0,
      tempBooked: order.bookingAnalysis?.total_temp_booked ?? 0,
    },
    dealerStats: {
      totalDealers: dealerSummary.totalDealers ?? 0,
      totalQuotations: dealerSummary.totalQuotations ?? 0,
      convertedOrders: dealerSummary.convertedOrders ?? 0,
      conversionRatio: dealerSummary.conversionRatio ?? 0,
      totalRevenue: dealerSummary.totalRevenue ?? 0,
      totalOutstanding: dealerSummary.totalOutstanding ?? 0
    },

    lead_data: {
      Daily: null, // will fall back to mock
      Weekly: null, // will fall back to mock
      Monthly: monthlyData
    },
    lead_conversion_ratio: {
      leads: dealerSummary.totalDealers || 0,
      quotations: dealerSummary.totalQuotations || 0,
      orders: dealerSummary.convertedOrders || 0,
      average_ratio: `${dealerSummary.conversionRatio ?? 0}%`
    },
    order_status_summary: {
      pending: order.summary?.pending_orders || 0,
      confirmed: Math.max(0, (order.summary?.total_orders || 0) - (order.summary?.pending_orders || 0) - (order.summary?.completed_orders || 0)),
      completed: order.summary?.completed_orders || 0,
      items: (order.statusBreakdown || order.status_breakdown || []).map((item: any) => {
        const label = String(item?.status || item?.label || item?.state || '');
        const count = Number(item?.count ?? item?._count ?? item?.value ?? item?.total ?? 0);
        return { label, count };
      }).filter((item: any) => item.label && item.count > 0)
    }
  };
}

// ── Main Screen ────────────────────────────────────────

export default function HomeScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  // BackHandler logic is moved below to be in scope of refetch queries.

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPeriodModal, setShowPeriodModal] = useState<boolean>(false);

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;

  const formatPeriodLabel = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleStatusClick = (statusLabel: string) => {
    const statusValue = statusLabel.toUpperCase();

    updateOrderFilterState({
      status: statusValue,
      dateRange: '',
      payment_status: '',
      order_type: '',
      source_type: '',
      startDate: '',
      endDate: '',
    });
    router.navigate('/(tabs)/Order' as any);
  };

  const insets = useSafeAreaInsets();
  const [leadFilter, setLeadFilter] = useState<'Daily' | 'Monthly'>('Daily');
  const { primaryColor } = useTheme();

  // Build chartConfig inside render so it reacts to primaryColor changes
  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => {
      // Convert primaryColor hex to rgba
      const hex = primaryColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: () => COLORS.textMuted,
    style: { borderRadius: 12 },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: primaryColor,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#EDF2F0',
      strokeWidth: 1,
    },
  };

  const { requestAllPermissions } = useAppPermissions();

  useEffect(() => {
    (async () => {
      const results = await requestAllPermissions();
      if (results) {
        const allGranted = Object.values(results).every((granted) => granted);
        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'Some permissions were denied. Please allow all permissions in settings for the best experience.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      }
    })();
  }, []);

  useEffect(() => {
    syncDeviceCallLogs();
  }, []);

  // Fetch analysis data from API using hook
  const { data: rawData, isLoading, isFetching, refetch } = useAnalysis({
    year: selectedYear,
    month: selectedMonth
  });
  const { data: holidaysData, refetch: refetchHolidays } = useHolidays();

  const handleRefresh = () => {
    refetch();
    refetchHolidays();
  };

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      refetchHolidays();

      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [refetch, refetchHolidays])
  );

  const apiData = React.useMemo(() => {
    return formatAnalysisData(rawData);
  }, [rawData]);

  if (isLoading) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
        <CustomHeader title="Home" showSearch={false} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }}>
            Loading dashboard data...
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Parsed API Data / Fallbacks ────────────────────────
  const totalVisits = apiData?.total_visits ?? 0;

  const revenueGenerated = apiData?.revenue_generated ?? '₹0';
  const assignedTarget = apiData?.assigned_target ?? '₹0';

  const crmMetrics = apiData?.crm || {
    totalLeads: 0,
    totalCustomers: 0,
    activeDeals: 0,
    conversionRate: '0%',
    pipelineValue: '₹0'
  };

  const financialMetrics = apiData?.financials || {
    netRevenue: '₹0',
    totalSales: '₹0',
    totalPurchases: '₹0',
    saleReturns: '₹0',
    totalRevenue: '₹0'
  };

  const bookingMetrics = apiData?.bookingAnalysis || {
    productsBooked: 0,
    totalBooked: 0,
    tempBooked: 0
  };

  const crmItems = [
    { label: 'Total Leads', value: crmMetrics.totalLeads, icon: 'people-outline', iconColor: primaryColor },
    { label: 'Total Customers', value: crmMetrics.totalCustomers, icon: 'person-add-outline', iconColor: COLORS.info },
    { label: 'Active Deals', value: crmMetrics.activeDeals, icon: 'briefcase-outline', iconColor: COLORS.warning },
    { label: 'Conversion Rate', value: crmMetrics.conversionRate, icon: 'trending-up-outline', iconColor: COLORS.success },
    { label: 'Pipeline Value', value: crmMetrics.pipelineValue, icon: 'analytics-outline', iconColor: COLORS.peach, fullWidth: true },
  ];

  const financialItems = [
    { label: 'Net Revenue', value: financialMetrics.netRevenue, icon: 'cash-outline', iconColor: COLORS.success },
    { label: 'Total Sales', value: financialMetrics.totalSales, icon: 'wallet-outline', iconColor: COLORS.info },
    { label: 'Total Purchases', value: financialMetrics.totalPurchases, icon: 'cart-outline', iconColor: COLORS.danger },
    { label: 'Sale Returns', value: financialMetrics.saleReturns, icon: 'refresh-circle-outline', iconColor: COLORS.warning },
    { label: 'Total Revenue (Other)', value: financialMetrics.totalRevenue, icon: 'stats-chart-outline', iconColor: primaryColor, fullWidth: true },
  ];

  const bookingItems = [
    { label: 'Products Booked', value: bookingMetrics.productsBooked, icon: 'cube-outline', iconColor: COLORS.info },
    { label: 'Total Booked Units', value: bookingMetrics.totalBooked, icon: 'bookmark-outline', iconColor: COLORS.success },
    { label: 'Temporary Booked', value: bookingMetrics.tempBooked, icon: 'hourglass-outline', iconColor: COLORS.warning },
    { label: 'Total Visits', value: totalVisits, icon: 'eye-outline', iconColor: primaryColor },
  ];

  // Lead created data parsing
  const apiLeadData = apiData?.lead_data as any;
  const leadDataDaily: any = apiLeadData?.Daily ?? LEAD_DATA_MOCK.Daily;
  const leadDataWeekly: any = apiLeadData?.Weekly ?? LEAD_DATA_MOCK.Weekly;
  const leadDataMonthly: any = apiLeadData?.Monthly ?? LEAD_DATA_MOCK.Monthly;

  const leadData = {
    Daily: {
      labels: leadDataDaily.labels ?? LEAD_DATA_MOCK.Daily.labels,
      datasets: [{
        data: leadDataDaily.datasets?.[0]?.data ?? leadDataDaily.data ?? LEAD_DATA_MOCK.Daily.datasets[0].data
      }]
    },
    Weekly: {
      labels: leadDataWeekly.labels ?? LEAD_DATA_MOCK.Weekly.labels,
      datasets: [{
        data: leadDataWeekly.datasets?.[0]?.data ?? leadDataWeekly.data ?? LEAD_DATA_MOCK.Weekly.datasets[0].data
      }]
    },
    Monthly: {
      labels: leadDataMonthly.labels ?? LEAD_DATA_MOCK.Monthly.labels,
      datasets: [{
        data: leadDataMonthly.datasets?.[0]?.data ?? leadDataMonthly.data ?? LEAD_DATA_MOCK.Monthly.datasets[0].data
      }]
    }
  };

  const lineData = leadData[leadFilter as keyof typeof leadData];
  const totalLeadCreated = apiLeadData?.[leadFilter]?.total ?? apiLeadData?.[leadFilter.toLowerCase()]?.total ?? 0;

  // Pie chart data parsing
  const apiPieData = apiData?.lead_conversion_ratio;
  const pieLeads = apiPieData?.leads ?? 0;
  const pieQuotations = apiPieData?.quotations ?? 0;
  const pieOrders = apiPieData?.orders ?? 0;
  const averageRatio = apiPieData?.average_ratio ?? '0%';

  const dealerSummary = apiData?.dealerStats || {
    totalDealers: 0,
    totalQuotations: 0,
    convertedOrders: 0,
    conversionRatio: 0,
    totalRevenue: 0,
    totalOutstanding: 0
  };

  const hasPieData = pieLeads > 0 || pieQuotations > 0 || pieOrders > 0;
  const displayLeads = hasPieData ? pieLeads : 0;
  const displayQuotations = hasPieData ? pieQuotations : 0;
  const displayOrders = hasPieData ? pieOrders : 0;

  const pieData = [
    {
      name: 'Leads',
      population: displayLeads,
      color: primaryColor,
      legendFontColor: COLORS.textDark,
      legendFontSize: 13,
    },
    {
      name: 'Quotation',
      population: displayQuotations,
      color: COLORS.peach,
      legendFontColor: COLORS.textDark,
      legendFontSize: 13,
    },
    {
      name: 'Orders',
      population: displayOrders,
      color: COLORS.darkBrown,
      legendFontColor: COLORS.textDark,
      legendFontSize: 13,
    },
  ];

  // Bar chart data parsing
  const apiBarData = apiData?.order_status_summary as any;

  const getStatusCountFromItems = (statusName: string) => {
    const norm = statusName.toUpperCase();
    if (apiBarData?.items && Array.isArray(apiBarData.items) && apiBarData.items.length > 0) {
      const found = apiBarData.items.find((item: any) =>
        String(item?.label || '').toUpperCase() === norm
      );
      if (found) return Number(found.count || 0);
    }

    // Fallback to counters if items list is empty
    if (norm === 'PENDING') return apiBarData?.pending ?? 0;
    if (norm === 'COMPLETED') return apiBarData?.completed ?? 0;
    if (norm === 'APPROVED') return apiBarData?.confirmed ?? 0;
    return 0;
  };

  const barItems = [
    { label: 'Pending', count: getStatusCountFromItems('PENDING'), color: COLORS.peach },
    { label: 'Approved', count: getStatusCountFromItems('APPROVED'), color: COLORS.darkBrown },
    { label: 'Dispatched', count: getStatusCountFromItems('DISPATCHED'), color: COLORS.info },
    { label: 'Completed', count: getStatusCountFromItems('COMPLETED'), color: primaryColor },
    { label: 'Cancelled', count: getStatusCountFromItems('CANCELLED'), color: COLORS.danger },
  ];

  const formatStatusLabel = (label: string) => {
    return label
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const barLabels = barItems.map((item: any) => formatStatusLabel(item.label));
  const barCounts = barItems.map((item: any) => item.count);

  const barData = {
    labels: barLabels,
    datasets: [{ data: barCounts }],
  };

  const upcomingHolidays = React.useMemo(() => {
    if (!holidaysData || !Array.isArray(holidaysData)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidaysData
      .filter((h: any) => {
        if (!h?.date) return false;
        const hDate = new Date(h.date);
        return !isNaN(hDate.getTime()) && hDate >= today;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [holidaysData]);

  const formatHolidayDate = (dateStr: string) => {
    if (!dateStr) return '----';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader title="Home" showSearch={false} />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            colors={[primaryColor]}
          />
        }
      >
        {/* Total Visit Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: primaryColor }]}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Total Visit</Text>
              <Text style={styles.heroValue}>{totalVisits}</Text>
            </View>

            {/* Year & Month Selector */}
            <TouchableOpacity
              style={styles.selectorBtn}
              onPress={() => setShowPeriodModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.selectorText}>
                {formatPeriodLabel(selectedDate)}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Holidays Card */}
        <View style={styles.card}>
          <View style={styles.holidayHeader}>
            <Ionicons name="gift-outline" size={18} color={primaryColor} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>UPCOMING HOLIDAYS</Text>
          </View>

          {upcomingHolidays.length > 0 ? (
            <View style={styles.holidayList}>
              {upcomingHolidays.map((holiday: any, index: number) => (
                <View
                  key={holiday.id || index}
                  style={[
                    styles.holidayItem,
                    index < upcomingHolidays.length - 1 && styles.holidayItemBorder
                  ]}
                >
                  <View style={styles.holidayInfo}>
                    <Text style={styles.holidayName} numberOfLines={1}>{holiday.name}</Text>
                    <Text style={styles.holidayDate}>{formatHolidayDate(holiday.date)}</Text>
                  </View>
                  <View style={styles.holidayBadge}>
                    <Text style={styles.holidayBadgeText}>Holiday</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.holidayEmpty}>
              <Ionicons name="calendar-outline" size={24} color="#94A3B8" />
              <Text style={styles.holidayEmptyText}>No upcoming holidays scheduled</Text>
            </View>
          )}
        </View>

        {/* ── Total Lead Created – Line Chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TOTAL LEAD CREATED</Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {(['Daily', 'Monthly'] as const).map((filter) => {
              const isActive = leadFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setLeadFilter(filter)}
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabBtnText, isActive && { color: primaryColor, fontWeight: '800' }]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Line Chart */}
          <LineChart
            data={lineData}
            width={CHART_WIDTH}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
            withInnerLines={true}
            withOuterLines={false}
            withShadow={false}
          />

          <View style={styles.leadStatsBox}>
            <Text style={styles.leadStatsValue}>{totalLeadCreated}</Text>
            <Text style={styles.leadStatsLabel}>Total Lead Created</Text>
          </View>
        </View>

        {/* ── Lead Conversion Ratio – Pie Chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CRM</Text>

          {hasPieData ? (
            <PieChart
              data={pieData}
              width={CHART_WIDTH}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              center={[0, 0]}
              absolute={false}
              style={styles.chartStyle}
            />
          ) : (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAF9', borderRadius: 12, marginVertical: 8, gap: 8 }}>
              <Ionicons name="pie-chart-outline" size={44} color={COLORS.textMuted} />
              <Text style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: '600' }}>
                No lead conversion data recorded
              </Text>
            </View>
          )}

          {/* Extra ratio callout */}
          <View style={styles.ratioCallout}>
            <Text style={[styles.ratioValue, { color: primaryColor }]}>{averageRatio}</Text>
            <Text style={styles.ratioLabel}>Average Conversion Ratio</Text>
          </View>

          {/* Detailed Dealer Stats Grid */}
          <View style={styles.gridContainer}>
            <View style={[styles.gridItem, styles.gridItemHalf]}>
              <View style={[styles.gridIconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="people-outline" size={16} color="#0284C7" />
              </View>
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridItemLabel}>Total Dealers</Text>
                <Text style={styles.gridItemValue}>{dealerSummary.totalDealers}</Text>
              </View>
            </View>

            <View style={[styles.gridItem, styles.gridItemHalf]}>
              <View style={[styles.gridIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-text-outline" size={16} color="#D97706" />
              </View>
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridItemLabel}>Total Quotations</Text>
                <Text style={styles.gridItemValue}>{dealerSummary.totalQuotations}</Text>
              </View>
            </View>

            <View style={[styles.gridItem, styles.gridItemHalf]}>
              <View style={[styles.gridIconContainer, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="cart-outline" size={16} color="#15803D" />
              </View>
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridItemLabel}>Converted Orders</Text>
                <Text style={styles.gridItemValue}>{dealerSummary.convertedOrders}</Text>
              </View>
            </View>

            <View style={[styles.gridItem, styles.gridItemHalf]}>
              <View style={[styles.gridIconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="stats-chart-outline" size={16} color="#7C3AED" />
              </View>
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridItemLabel}>Conversion Ratio</Text>
                <Text style={styles.gridItemValue}>{dealerSummary.conversionRatio}%</Text>
              </View>
            </View>

            <View style={[styles.gridItem, styles.gridItemHalf]}>
              <View style={[styles.gridIconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="cash-outline" size={16} color="#0284C7" />
              </View>
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridItemLabel}>Total Revenue</Text>
                <Text style={styles.gridItemValue} numberOfLines={1}>
                  ₹{(dealerSummary.totalRevenue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={[styles.gridItem, styles.gridItemHalf]}>
              <View style={[styles.gridIconContainer, { backgroundColor: dealerSummary.totalOutstanding >= 0 ? '#DCFCE7' : '#FEE2E2' }]}>
                <Ionicons name="wallet-outline" size={16} color={dealerSummary.totalOutstanding >= 0 ? '#15803D' : '#DC2626'} />
              </View>
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridItemLabel}>Total Outstanding</Text>
                <Text style={styles.gridItemValue} numberOfLines={1}>
                  ₹{(dealerSummary.totalOutstanding ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Order Status Summary – Bar Chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ORDER STATUS SUMMARY</Text>

          <BarChart
            data={barData}
            width={CHART_WIDTH}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(52, 101, 86, ${opacity})`,
              barPercentage: 0.55,
            }}
            style={styles.chartStyle}
            withInnerLines={true}
            withHorizontalLabels={false}
            withVerticalLabels={false}
            showValuesOnTopOfBars={true}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
          />

          {/* Legend */}
          <View style={styles.barLegendRow}>
            {barItems.map((item: any) => (
              <TouchableOpacity
                key={item.label}
                style={styles.barLegendItem}
                onPress={() => handleStatusClick(item.label)}
                activeOpacity={0.7}
              >
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.barLegendText}>{formatStatusLabel(item.label)}</Text>
                <Text style={styles.barLegendCount}>{item.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Year & Month Selector Modal */}
      <MonthYearPicker
        visible={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        selectedDate={selectedDate}
        onSelect={(date) => {
          setSelectedDate(date);
          setShowPeriodModal(false);
        }}
      />

      {/* Quick Ball / Smart Toolbox (shows only on home screen) */}
      <QuickBall />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },

  // ── Header ──
  headerContainer: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 10,
    paddingBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    position: 'relative',
  },
  centerLogoSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll ──
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 5,
  },

  // ── Hero Card ──
  heroCard: {
    borderRadius: 16,
    padding: 24,
    height: 120,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute',
    right: -40,
    top: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 16,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute',
    right: -10,
    top: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 14,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 14,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },

  // ── Tabs ──
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F0',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    fontWeight: '800',
  },

  // ── Chart common ──
  chartStyle: {
    borderRadius: 12,
    marginHorizontal: -4,
  },

  // ── Lead stats ──
  leadStatsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  leadStatsValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  leadStatsLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // ── Pie ratio callout ──
  ratioCallout: {
    alignItems: 'center',
    backgroundColor: '#F4F7F5',
    borderRadius: 12,
    paddingVertical: 12,
  },
  ratioValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  ratioLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },

  // ── Metric cards ──
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // ── Bar legend ──
  barLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 4,
    gap: 8,
  },
  barLegendItem: {
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  barLegendText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  barLegendCount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  // ── Holidays Card Styles ──
  holidayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  holidayList: {
    gap: 2,
  },
  holidayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  holidayItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  holidayInfo: {
    flex: 1,
    gap: 4,
  },
  holidayName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  holidayDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  holidayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  holidayBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  holidayEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  holidayEmptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  gridItem: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#EDF2F0',
  },
  gridItemHalf: {
    width: '48.5%',
  },
  gridItemFull: {
    width: '100%',
  },
  gridIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTextContainer: {
    flex: 1,
  },
  gridItemLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  gridItemValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

