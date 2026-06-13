import { OrderRecord, ordersState } from '@/components/OrderState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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

const { width } = Dimensions.get('window');

const TERMS_CHECKLIST = [
  'Payment due within 30 days. Late payments attract 2% monthly interest.',
  'Returns only for transit damage, reported within 48 hours of delivery.',
  'All prices ex-factory, Rajkot. Freight & insurance on buyer\'s account.',
  'GST charged as applicable. Rate changes passed on at invoicing.',
  'Disputes subject to exclusive jurisdiction of Rajkot, Gujarat courts.',
];

const DOCUMENTS = [
  { label: 'SHELL BILL', desc: 'Main Sales Tax Invoice', icon: 'document-text-outline' },
  { label: 'E-INVOICE', desc: 'GST E-Invoice With IRN', icon: 'clipboard-outline' },
  { label: 'E-WAY BILL', desc: 'Transport E-Waybill', icon: 'bus-outline' },
  { label: 'BILTY BILL', desc: 'Lorry Receipt / LR', icon: 'receipt-outline' },
];

export default function OrderDetailsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const id = params.id;
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // Safety fallback: if no id or invalid id is passed, default to first order
    const found = ordersState.find((o) => o.id === id) || ordersState[0];
    if (found) {
      setOrder(found);
    }
  }, [id]);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    }, 1200);
  };

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    );
  }

  // Helper to draw the custom shampoo/conditioner thumbnail graphics dynamically
  const renderProductMock = () => {
    return (
      <View style={styles.productMockContainer}>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 26, backgroundColor: '#4F46E5' }]} />
        </View>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 32, backgroundColor: '#EAB308' }]} />
        </View>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 30, backgroundColor: '#10B981' }]} />
        </View>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 25, backgroundColor: '#F97316' }]} />
        </View>
        <View style={styles.mockBottleGroup}>
          <View style={[styles.bottleCap, { backgroundColor: '#334155' }]} />
          <View style={[styles.bottleBody, { height: 32, backgroundColor: '#3B82F6' }]} />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── 1. HEADER ROW ─────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>ORDER </Text>
          <Text style={{ color: COLORS.textDark }}>DETAILS</Text>
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* ── 2. MAIN SCROLL CONTAINER ──────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Items Ordered */}
        {order.items.map((item, index) => {
          // Format name nicely to match screen title: e.g. "Conditioner" / "Shampoo"
          const displayTitle = item.name.toUpperCase();
          const displaySize = displayTitle === 'CONDITIONER' ? 'Green Apple | 20 ML' : 'Green Apple | 20 ML';
          const rateVal = 100.00;
          const displayPrice = item.price;

          return (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                {renderProductMock()}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{displayTitle}</Text>
                  <Text style={styles.itemSize}>{displaySize}</Text>
                  <Text style={styles.itemDescription}>Lorem Ipsum is Simply</Text>
                </View>
              </View>

              <View style={styles.pricingGrid}>
                <View style={styles.pricingRow}>
                  <View style={styles.pricingCell}>
                    <Text style={styles.priceLabel}>Pcs : <Text style={styles.priceValue}>{item.qty}</Text></Text>
                  </View>
                  <View style={styles.pricingCellAlignRight}>
                    <Text style={styles.priceLabel}>Rate : <Text style={styles.priceValue}>₹ {rateVal.toFixed(2)}</Text></Text>
                  </View>
                </View>

                <View style={styles.pricingRow}>
                  <View style={styles.pricingCell}>
                    <Text style={styles.priceLabel}>GST (%) : <Text style={styles.priceValue}>{item.gst}</Text></Text>
                  </View>
                  <View style={styles.pricingCellAlignRight}>
                    <Text style={styles.priceLabel}>Price : <Text style={styles.priceValue}>{displayPrice}</Text></Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}



        {/* Section: Basic Remark */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>BASIC REMARK</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.remarkCard}>
          <View style={styles.remarkTop}>
            <Ionicons name="location-sharp" size={15} color="#EF4444" />
            <Text style={styles.remarkNoteTitle}>Note</Text>
          </View>
          <Text style={styles.remarkText}>
            {"Lorem Ipsum is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500s."}
          </Text>
          <View style={styles.remarkFooter}>
            <Text style={styles.remarkFooterText}>Added By You</Text>
            <Text style={styles.remarkFooterText}>Feb, 24, 2026</Text>
          </View>
        </View>

        {/* Section: Terms & Conditions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>TERMS & CONDITIONS</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.termsList}>
          {TERMS_CHECKLIST.map((term, idx) => (
            <View key={idx} style={styles.termCard}>
              <View style={styles.termIndexContainer}>
                <Text style={styles.termIndexText}>{idx + 1}</Text>
              </View>
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </View>

        {/* Total Amount Green Box */}
        <View style={styles.totalBox}>
          <Text style={styles.totalBoxLabel}>Total Amount</Text>
          <Text style={styles.totalBoxVal}>{order.amount}</Text>
        </View>

        {/* Download Order Green Box */}
        <TouchableOpacity
          style={styles.downloadBox}
          activeOpacity={0.8}
          onPress={handleDownload}
          disabled={downloading}
        >
          <View>
            <Text style={styles.downloadTitle}>Download Order</Text>
            <Text style={styles.downloadSubtitle}>Export Complete Order As PDF</Text>
          </View>
          <View style={styles.downloadIconCircle}>
            {downloading ? (
              <ActivityIndicator size="small" color={theme.primaryColor} />
            ) : (
              <Ionicons
                name={downloadSuccess ? "checkmark" : "download-outline"}
                size={16}
                color={theme.primaryColor}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Grid of Documents (2x2) */}
        <View style={styles.docGrid}>
          {DOCUMENTS.map((doc, index) => (
            <View key={index} style={styles.docCard}>
              <View style={styles.docHeader}>
                <Ionicons name={doc.icon as any} size={22} color={theme.primaryColor} />
                <View style={styles.docTitles}>
                  <Text style={styles.docLabelText}>{doc.label}</Text>
                  <Text style={styles.docDescText}>{doc.desc}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.docBtn}
                activeOpacity={0.8}
                onPress={handleDownload}
              >
                <Ionicons name="download-outline" size={13} color={theme.primaryColor} />
                <Text style={styles.docBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 5,
    paddingBottom: 150,
  },

  // Item Card
  itemCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productMockContainer: {
    width: 76,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EAEFEA',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#D8E2DD',
  },
  mockBottleGroup: {
    alignItems: 'center',
    gap: 1,
  },
  bottleCap: {
    width: 4,
    height: 3,
    borderRadius: 0.5,
  },
  bottleBody: {
    width: 7,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  itemSize: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  itemDescription: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  pricingGrid: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    paddingTop: 8,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricingCell: {
    flex: 1,
  },
  pricingCellAlignRight: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  priceValue: {
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Sections Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.primaryColor,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Remark Card
  remarkCard: {
    backgroundColor: '#F9FAF9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 5,
  },
  remarkTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  remarkNoteTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  remarkText: {
    fontSize: 11.5,
    color: COLORS.textDark,
    lineHeight: 18,
    fontWeight: '500',
  },
  remarkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
    paddingTop: 8,
    marginTop: 2,
  },
  remarkFooterText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Terms Cards
  termsList: {
    gap: 5,
  },
  termCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  termIndexContainer: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termIndexText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  termText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '600',
    lineHeight: 15,
  },

  // Total Box
  totalBox: {
    backgroundColor: theme.primaryColor,
    borderRadius: 10,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  totalBoxLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  totalBoxVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // Download Box
  downloadBox: {
    backgroundColor: '#4C8070',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  downloadTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  downloadSubtitle: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 1,
  },
  downloadIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Doc Grid
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  docCard: {
    width: (width - 30) / 2,
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 8,
  },
  docHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  docTitles: {
    flex: 1,
  },
  docLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  docDescText: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 0.5,
  },
  docBtn: {
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  docBtnText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: theme.primaryColor,
  },
});
