import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BarChart,
  LineChart,
  PieChart,
} from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64; // card padding 18*2 + scroll padding 16*2

const COLORS = {
  primary: '#346556',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E5ECE9',
  peach: '#E2C0B1',
  darkBrown: '#39241E',
};

// ── DATA ─────────────────────────────────────────────

const LEAD_DATA = {
  Daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{ data: [3, 7, 5, 9, 6, 8] }],
  },
  Weekly: {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [{ data: [18, 24, 20, 30] }],
  },
  Monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [45, 60, 55, 70, 65, 80] }],
  },
};

const PIE_DATA = [
  {
    name: 'Leads',
    population: 30,
    color: COLORS.primary,
    legendFontColor: COLORS.textDark,
    legendFontSize: 13,
  },
  {
    name: 'Quotation',
    population: 10,
    color: COLORS.peach,
    legendFontColor: COLORS.textDark,
    legendFontSize: 13,
  },
  {
    name: 'Orders',
    population: 340,
    color: COLORS.darkBrown,
    legendFontColor: COLORS.textDark,
    legendFontSize: 13,
  },
];

const BAR_DATA = {
  labels: ['Pending', 'Confirmed', 'Completed'],
  datasets: [{ data: [20, 40, 100] }],
};

// ── Shared chart config ───────────────────────────────

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(52, 101, 86, ${opacity})`,
  labelColor: () => COLORS.textMuted,
  style: { borderRadius: 12 },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: COLORS.primary,
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#EDF2F0',
    strokeWidth: 1,
  },
};

// ── Main Screen ────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [leadFilter, setLeadFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const lineData = LEAD_DATA[leadFilter];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* Header */}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: Math.max(
              insets.top + 8,
              Platform.OS === 'ios' ? 44 : 16
            ),
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={{ width: 36 }} />

          <View style={styles.centerLogoSection}>
            <Ionicons name="star" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.logoText}>BASALT</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/notification' as any)}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Visit Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <Text style={styles.heroLabel}>Total Visit</Text>
          <Text style={styles.heroValue}>100</Text>
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
                  <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
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
            <Text style={styles.leadStatsValue}>20</Text>
            <Text style={styles.leadStatsLabel}>Total Lead Created</Text>
          </View>
        </View>

        {/* ── Lead Conversion Ratio – Pie Chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>LEAD CONVERSION RATIO</Text>

          <PieChart
            data={PIE_DATA}
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

          {/* Extra ratio callout */}
          <View style={styles.ratioCallout}>
            <Text style={styles.ratioValue}>1.05</Text>
            <Text style={styles.ratioLabel}>Average Conversion Ratio</Text>
          </View>
        </View>

        {/* ── Revenue Generated ── */}
        <View style={styles.card}>
          <Text style={styles.metricLabel}>Revenue Generated</Text>
          <Text style={styles.metricValue}>₹10 Lkh</Text>
        </View>

        {/* ── Assigned Target ── */}
        <View style={styles.card}>
          <Text style={styles.metricLabel}>Assigned Target</Text>
          <Text style={styles.metricValue}>₹5 Lkh</Text>
        </View>

        {/* ── Order Status Summary – Bar Chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ORDER STATUS SUMMARY</Text>

          <BarChart
            data={BAR_DATA}
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
              { label: 'Pending', count: 20, color: COLORS.peach },
              { label: 'Confirmed', count: 40, color: COLORS.darkBrown },
              { label: 'Completed', count: 100, color: COLORS.primary },
            ].map((item) => (
              <View key={item.label} style={styles.barLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.barLegendText}>{item.label}</Text>
                <Text style={styles.barLegendCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },

  // ── Header ──
  headerContainer: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 20,
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
    padding: 16,
    gap: 14,
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.primary,
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
    color: COLORS.primary,
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
