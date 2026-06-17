import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrderDetails } from '@/hooks/useOrders';
import { getAuthToken } from '@/utils/storage';
import { serverDetails } from '@/config';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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

  const id = params.id as string;
  const { data: order, isLoading } = useOrderDetails(id);

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [courierSlipDownloading, setCourierSlipDownloading] = useState(false);
  const [courierSlipSuccess, setCourierSlipSuccess] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    }, 1200);
  };

  const handleDownloadCourierSlip = async () => {
    if (!id) return;
    setCourierSlipDownloading(true);
    try {
      const token = await getAuthToken();
      const downloadUrl = `${serverDetails.serverProxyURL}/orders/${id}/courier-slip`;

      if (Platform.OS === 'web') {
        const response = await fetch(downloadUrl, {
          headers: { Authorization: token || '' },
        });
        if (!response.ok) throw new Error('Failed to download courier slip');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `courier-slip-${id.slice(0, 8).toUpperCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setCourierSlipSuccess(true);
      } else {
        const localUri = FileSystem.documentDirectory + `courier-slip-${id.slice(0, 8).toUpperCase()}.pdf`;
        const { uri } = await FileSystem.downloadAsync(
          downloadUrl,
          localUri,
          { headers: { Authorization: token || '' } }
        );
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share Courier Slip',
            UTI: 'com.adobe.pdf',
          });
          setCourierSlipSuccess(true);
        } else {
          Alert.alert('Downloaded', `Courier slip saved to:\n${uri}`);
        }
      }
    } catch (err: any) {
      console.error('[CourierSlip Download Error]:', err);
      Alert.alert('Error', err?.message || 'Failed to download courier slip PDF.');
    } finally {
      setCourierSlipDownloading(false);
      setTimeout(() => setCourierSlipSuccess(false), 3000);
    }
  };

  if (isLoading || !order) {
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
        {/* Section: Customer & Shipping Details */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>CUSTOMER & SHIPPING DETAILS</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsGrid}>

            {/* Customer Name */}
            <View style={styles.detailsRow}>
              <Ionicons name="person-outline" size={15} color={theme.primaryColor} style={styles.detailsIcon} />
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>CUSTOMER NAME</Text>
                <Text style={styles.detailsValue}>{order.contactPerson || order.clientName || 'Katrina Kaif'}</Text>
              </View>
            </View>

            {/* Created Date */}
            <View style={styles.detailsRow}>
              <Ionicons name="calendar-outline" size={15} color={theme.primaryColor} style={styles.detailsIcon} />
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>CREATED DATE</Text>
                <Text style={styles.detailsValue}>{order.date || '08/06/2026'}</Text>
              </View>
            </View>

            {/* Sales Representative */}
            <View style={styles.detailsRow}>
              <Ionicons name="briefcase-outline" size={15} color={theme.primaryColor} style={styles.detailsIcon} />
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>SALES REPRESENTATIVE</Text>
                <Text style={styles.detailsValue}>{(order.sales_representative || order.approvedBy || 'UTSAV').toUpperCase()}</Text>
              </View>
            </View>

            {/* Current Status */}
            <View style={styles.detailsRow}>
              <Ionicons name="ribbon-outline" size={15} color={theme.primaryColor} style={styles.detailsIcon} />
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>CURRENT STATUS</Text>
                <View style={[styles.statusBadge, { alignSelf: 'flex-start', marginTop: 2 },
                (order.status || 'DRAFT').toUpperCase() === 'COMPLETED' || (order.status || 'DRAFT').toUpperCase() === 'DELIVERED'
                  ? styles.scannedBadge
                  : (order.status || 'DRAFT').toUpperCase() === 'CANCELLED'
                    ? styles.releaseBadge
                    : styles.pendingBadge
                ]}>
                  <Text style={[styles.statusBadgeText, {
                    color: (order.status || 'DRAFT').toUpperCase() === 'COMPLETED' || (order.status || 'DRAFT').toUpperCase() === 'DELIVERED'
                      ? '#03543F'
                      : (order.status || 'DRAFT').toUpperCase() === 'CANCELLED'
                        ? '#991B1B'
                        : '#92400E'
                  }]}>
                    {(order.status || 'DRAFT').toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Shipping Address */}
            <View style={[styles.detailsRow, { width: '100%', borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Ionicons name="location-outline" size={15} color={theme.primaryColor} style={styles.detailsIcon} />
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>SHIPPING ADDRESS</Text>
                <Text style={[styles.detailsValue, { lineHeight: 18 }]}>
                  {order.hotelLocation || 'Clock Tower Road\nJodhpur, Rajasthan, 342001\nIndia'}
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* Section: Items Ordered */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>ITEMS ORDERED</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* Dynamic Items Ordered */}
        {((order as any).items || []).map((item: any, index: number) => {
          const displayTitle = (item.item_name || item.name || 'Item').toUpperCase();
          const displayCode = item.item_code || item.code || '';
          const displayDesc = item.item_description || item.description || '';

          const getCleanNumber = (val: any) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
              const cleaned = val.replace(/[^0-9.]/g, '');
              return parseFloat(cleaned) || 0;
            }
            return 0;
          };

          const rateVal = getCleanNumber(item.unit_price || item.price || item.rate) || 0.00;
          const qtyVal = getCleanNumber(item.quantity || item.qty) || 0;
          const gstVal = getCleanNumber(item.gst_percentage || item.gst) || 0;
          const discountVal = getCleanNumber(item.discount_percentage || item.discount || item.item_discount) || 0;
          const unitLabel = item.uom || item.unit || item.unit_of_measure || 'Pcs';

          // Taxable Amount (Price - Discount) * Qty
          const discountAmount = rateVal * (discountVal / 100);
          const taxableAmount = (rateVal - discountAmount) * qtyVal;
          const taxAmount = taxableAmount * (gstVal / 100);
          const lineTotal = taxableAmount + taxAmount;

          const displayQty = String(qtyVal);
          const displayGst = gstVal > 0 ? `${gstVal}%` : '0%';
          const displayRate = '₹' + rateVal.toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const displayTotal = '₹' + lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 });

          const imageUrl = (Array.isArray(item.images) && item.images.length > 0)
            ? item.images[0]
            : (typeof item.images === 'string' && item.images
              ? item.images
              : (item.image_url || item.image || null));

          return (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
                ) : (
                  renderProductMock()
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{displayTitle}</Text>
                  {displayCode ? (
                    <Text style={styles.itemSize}>SKU / Code: {displayCode}</Text>
                  ) : null}
                  {displayDesc ? (
                    <Text style={styles.itemDescription} numberOfLines={2}>{displayDesc}</Text>
                  ) : (
                    <Text style={styles.itemDescription}>No description provided</Text>
                  )}
                </View>
              </View>

              <View style={styles.pricingGrid}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Qty</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Unit</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.4 }]}>Unit Price</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>GST %</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.4, textAlign: 'right' }]}>Total</Text>
                </View>
                {/* Table Data Row */}
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{displayQty}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{unitLabel}</Text>
                  <Text style={[styles.tableCell, { flex: 1.4 }]}>{displayRate}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{displayGst}</Text>
                  <Text style={[styles.tableCell, styles.tableCellTotal, { flex: 1.4, textAlign: 'right' }]}>{displayTotal}</Text>
                </View>
              </View>
            </View>
          );
        })}


        {/* Total Amount Green Box */}
        <View style={styles.totalBox}>
          <Text style={styles.totalBoxLabel}>Total Amount</Text>
          <Text style={styles.totalBoxVal}>{order.amount}</Text>
        </View>

        {/* Download Courier Slip */}
        <TouchableOpacity
          style={[styles.downloadBox, { backgroundColor: '#1E4D3B' }]}
          activeOpacity={0.8}
          onPress={handleDownloadCourierSlip}
          disabled={courierSlipDownloading}
        >
          <View>
            <Text style={styles.downloadTitle}>Download Courier Slip</Text>
            <Text style={styles.downloadSubtitle}>Export Shipping Label As PDF</Text>
          </View>
          <View style={styles.downloadIconCircle}>
            {courierSlipDownloading ? (
              <ActivityIndicator size="small" color={theme.primaryColor} />
            ) : (
              <Ionicons
                name={courierSlipSuccess ? 'checkmark' : 'receipt-outline'}
                size={16}
                color={theme.primaryColor}
              />
            )}
          </View>
        </TouchableOpacity>

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
                name={downloadSuccess ? 'checkmark' : 'download-outline'}
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
    paddingTop: 5,
    gap: 5,
    paddingBottom: 150,
  },

  // Item Card
  itemCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 5,
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
  productImage: {
    width: 76,
    height: 52,
    borderRadius: 10,
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
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    paddingTop: 6,
    gap: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F7F5',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 3,
  },
  tableHeaderCell: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tableCellTotal: {
    fontWeight: '900',
    color: '#16A34A',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  scannedBadge: {
    backgroundColor: '#DEF7EC',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  releaseBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginVertical: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailsRow: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
    paddingBottom: 8,
    marginBottom: 8,
  },
  detailsIcon: {
    marginTop: 2,
  },
  detailsCol: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  detailsValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
});
