import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrderDetails } from '@/hooks/useOrders';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    }, 1200);
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

          // Taxable Amount (Price - Discount) * Qty
          const discountAmount = rateVal * (discountVal / 100);
          const taxableAmount = (rateVal - discountAmount) * qtyVal;
          const taxAmount = taxableAmount * (gstVal / 100);
          const lineTotal = taxableAmount + taxAmount;

          const displayQty = String(qtyVal);
          const displayGst = gstVal > 0 ? `${gstVal}%` : '0%';
          const displayRate = '₹ ' + rateVal.toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const displayTotal = '₹ ' + lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 });

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
                <View style={styles.pricingRow}>
                  <View style={styles.pricingCell}>
                    <Text style={styles.priceLabel}>Qty : <Text style={styles.priceValue}>{displayQty} Pcs</Text></Text>
                  </View>
                  <View style={styles.pricingCellAlignRight}>
                    <Text style={styles.priceLabel}>Rate : <Text style={styles.priceValue}>{displayRate}</Text></Text>
                  </View>
                </View>

                <View style={styles.pricingRow}>
                  <View style={styles.pricingCell}>
                    <Text style={styles.priceLabel}>
                      GST : <Text style={styles.priceValue}>{displayGst}</Text>
                      {discountVal > 0 ? ` (Disc: ${discountVal}%)` : ''}
                    </Text>
                  </View>
                  <View style={styles.pricingCellAlignRight}>
                    <Text style={styles.priceLabel}>Price : <Text style={[styles.priceValue, { color: theme.primaryColor }]}>{displayTotal}</Text></Text>
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



        {/* Section: Barcodes */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>ORDER BARCODES</Text>
          <View style={styles.sectionLine} />
        </View>

        {(!order.barcodes || order.barcodes.length === 0) ? (
          <View style={styles.emptyCard}>
            <Ionicons name="barcode-outline" size={22} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No barcodes associated with this order</Text>
          </View>
        ) : (
          <View style={styles.barcodeList}>
            {order.barcodes.map((bc: any, idx: number) => (
              <View key={idx} style={styles.barcodeCard}>
                <Ionicons name="barcode-outline" size={20} color={theme.primaryColor} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.barcodeText}>{bc.barcode || bc.code || 'N/A'}</Text>
                  <Text style={styles.barcodeSubtext}>
                    {bc.item_name || bc.name || 'Product Barcode'} {bc.qty ? `| Qty: ${bc.qty}` : ''}
                  </Text>
                </View>
                {bc.status && (
                  <View style={[styles.statusBadge, bc.status.toLowerCase() === 'scanned' ? styles.scannedBadge : styles.pendingBadge]}>
                    <Text style={[styles.statusBadgeText, { color: bc.status.toLowerCase() === 'scanned' ? '#03543F' : '#92400E' }]}>{bc.status.toUpperCase()}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section: Inventory Reservations */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>INVENTORY RESERVATIONS</Text>
          <View style={styles.sectionLine} />
        </View>

        {(!order.reservations || order.reservations.length === 0) ? (
          <View style={styles.emptyCard}>
            <Ionicons name="bookmark-outline" size={20} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No reservations found for this order</Text>
          </View>
        ) : (
          <View style={styles.reservationList}>
            {order.reservations.map((res: any, idx: number) => {
              const isReserved = (res.status || 'Active').toLowerCase() === 'active' || (res.status || 'Active').toLowerCase() === 'reserved';
              return (
                <View key={idx} style={styles.reservationCard}>
                  <View style={styles.reservationHeader}>
                    <Ionicons name="calendar-outline" size={14} color={theme.primaryColor} />
                    <Text style={styles.reservationTitle}>Reservation {res.reservation_no || res.id?.slice(0, 8).toUpperCase() || idx + 1}</Text>
                    <View style={[styles.statusBadge, isReserved ? styles.reservedBadge : styles.releaseBadge]}>
                      <Text style={[styles.statusBadgeText, { color: isReserved ? '#1E40AF' : '#991B1B' }]}>{(res.status || 'Active').toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.reservationDetails}>
                    <Text style={styles.resDetailText}>
                      Item: <Text style={styles.resDetailValue}>{res.item_name || res.product_name || 'N/A'}</Text>
                    </Text>
                    <Text style={styles.resDetailText}>
                      Reserved Qty: <Text style={styles.resDetailValue}>{res.reserved_qty || res.quantity || '0'} Pcs</Text>
                    </Text>
                    {res.warehouse_name && (
                      <Text style={styles.resDetailText}>
                        Warehouse: <Text style={styles.resDetailValue}>{res.warehouse_name}</Text>
                      </Text>
                    )}
                    {res.expires_at && (
                      <Text style={styles.resDetailText}>
                        Expires: <Text style={styles.resDetailValue}>{new Date(res.expires_at).toLocaleDateString()}</Text>
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
  emptyCard: {
    backgroundColor: '#F9FAF9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  barcodeList: {
    gap: 8,
    marginVertical: 4,
  },
  barcodeCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barcodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  barcodeSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
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
  reservedBadge: {
    backgroundColor: '#E0F2FE',
  },
  releaseBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  reservationList: {
    gap: 8,
    marginVertical: 4,
  },
  reservationCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 8,
  },
  reservationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
    paddingBottom: 6,
  },
  reservationTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  reservationDetails: {
    gap: 4,
  },
  resDetailText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  resDetailValue: {
    color: COLORS.textDark,
    fontWeight: '700',
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
