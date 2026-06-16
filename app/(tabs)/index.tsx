import CustomHeader from '@/components/custom/CustomHeader';
import QuickBall from '@/components/custom/QuickBall';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useAppPermissions } from '@/hooks/useAppPermissions';
import { syncDeviceCallLogs } from '@/utils/callLogSync';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const { dashboardData, orderData, visitsData } = raw;

  const dash = (dashboardData as any)?.data || {};
  const order = (orderData as any)?.data || orderData || {};
  const visits = (visitsData as any)?.data || [];
  const totalVisits = (visitsData as any)?.total ?? visits.length ?? 0;

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
    revenue_generated: `₹${(dash.counters?.totalRevenue || 0).toLocaleString('en-IN')}`,
    assigned_target: `₹${(dash.counters?.pipelineValue || 0).toLocaleString('en-IN')}`,
    lead_data: {
      Daily: null, // will fall back to mock
      Weekly: null, // will fall back to mock
      Monthly: monthlyData
    },
    lead_conversion_ratio: {
      leads: dash.counters?.totalLeads || 0,
      quotations: dash.counters?.activeDeals || 0,
      orders: order.summary?.total_orders || 0,
      average_ratio: `${dash.counters?.conversionRate || 0}%`
    },
    order_status_summary: {
      pending: order.summary?.pending_orders || 0,
      confirmed: Math.max(0, (order.summary?.total_orders || 0) - (order.summary?.pending_orders || 0) - (order.summary?.completed_orders || 0)),
      completed: order.summary?.completed_orders || 0
    }
  };
}

// ── Main Screen ────────────────────────────────────────

export default function HomeScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();
  const [leadFilter, setLeadFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
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
  const { data: rawData, isLoading, isFetching, refetch } = useAnalysis();

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
  const apiBarData = apiData?.order_status_summary;
  const barPending = apiBarData?.pending ?? 0;
  const barConfirmed = apiBarData?.confirmed ?? 0;
  const barCompleted = apiBarData?.completed ?? 0;

  const barData = {
    labels: ['Pending', 'Confirmed', 'Completed'],
    datasets: [{ data: [barPending, barConfirmed, barCompleted] }],
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
            onRefresh={refetch}
            colors={[primaryColor]}
          />
        }
      >
        {/* Total Visit Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: primaryColor }]}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <Text style={styles.heroLabel}>Total Visit</Text>
          <Text style={styles.heroValue}>{totalVisits}</Text>
        </View>

        {/* ── Total Lead Created – Line Chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TOTAL LEAD CREATED</Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {(['Daily', 'Weekly', 'Monthly'] as const).map((filter) => {
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
          <Text style={styles.cardTitle}>LEAD CONVERSION RATIO</Text>

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
        </View>

        {/* ── Revenue Generated ── */}
        <View style={styles.card}>
          <Text style={styles.metricLabel}>Revenue Generated</Text>
          <Text style={styles.metricValue}>{revenueGenerated}</Text>
        </View>

        {/* ── Assigned Target ── */}
        <View style={styles.card}>
          <Text style={styles.metricLabel}>Assigned Target</Text>
          <Text style={styles.metricValue}>{assignedTarget}</Text>
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
            showValuesOnTopOfBars={true}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
          />

          {/* Legend */}
          <View style={styles.barLegendRow}>
            {[
              { label: 'Pending', count: barPending, color: COLORS.peach },
              { label: 'Confirmed', count: barConfirmed, color: COLORS.darkBrown },
              { label: 'Completed', count: barCompleted, color: primaryColor },
            ].map((item) => (
              <View key={item.label} style={styles.barLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.barLegendText}>{item.label}</Text>
                <Text style={styles.barLegendCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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
    justifyContent: 'space-around',
    marginTop: 4,
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
});

