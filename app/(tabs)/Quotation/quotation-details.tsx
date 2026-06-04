import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
  blueBadge: '#E0F2FE',
  blueText: '#0369A1',
};

const ITEMS_DATA = [
  {
    id: '1',
    name: 'CONDITIONER',
    spec: 'Green Apple | 20 ML',
    desc: 'Lorem Ipsum is Simply',
    pcs: '1200',
    rate: '₹ 100.00',
    gst: '18 %',
    price: '₹ 10,00,000.00',
  },
  {
    id: '2',
    name: 'SHAMPOO',
    spec: 'Green Apple | 20 ML',
    desc: 'Lorem Ipsum is Simply',
    pcs: '1200',
    rate: '₹ 100.00',
    gst: '18 %',
    price: '₹ 10,00,000.00',
  },
];

const TERMS_CONDITIONS = [
  { id: '1', text: 'Payment due within 30 days. Late payments attract 2% monthly interest.' },
  { id: '2', text: 'Returns only for transit damage, reported within 48 hours of delivery.' },
  { id: '3', text: 'All prices ex-factory, Rajkot. Freight & insurance on buyer\'s account.' },
  { id: '4', text: 'GST charged as applicable. Rate changes passed on at invoicing.' },
  { id: '5', text: 'Disputes subject to exclusive jurisdiction of Rajkot, Gujarat courts.' },
];

const DOC_ACTIONS = [
  {
    id: 'shell',
    title: 'SHELL BILL',
    sub: 'Main Sales Tax Invoice',
    icon: 'document-text-outline',
  },
  {
    id: 'e_invoice',
    title: 'E-INVOICE',
    sub: 'GST E-Invoice With IRN',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'e_way',
    title: 'E-WAY BILL',
    sub: 'Transport E-Waybill',
    icon: 'bus-outline',
  },
  {
    id: 'bilty',
    title: 'BILTY BILL',
    sub: 'Lorry Receipt / LR',
    icon: 'receipt-outline',
  },
];

export default function QuotationDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleDownload = (docTitle: string) => {
    Alert.alert('Download Started', `${docTitle} is downloading...`);
  };

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
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          <Text style={{ color: COLORS.primary }}>QUOTATION </Text>
          <Text style={{ color: COLORS.textDark }}>DETAILS</Text>
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* PRODUCTS LIST */}
        {ITEMS_DATA.map((item) => (
          <View key={item.id} style={styles.productCard}>
            <View style={styles.productTopRow}>
              <Image 
                source={require('@/assets/images/cosmetic_product_mockup.png')} 
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productDetailsCol}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSpec}>{item.spec}</Text>
                <Text style={styles.productDesc}>{item.desc}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.productStatsGrid}>
              <View style={styles.statsGridCol}>
                <Text style={styles.gridLabel}>Pcs : <Text style={styles.gridVal}>{item.pcs}</Text></Text>
                <Text style={styles.gridLabel}>GST (%) : <Text style={styles.gridVal}>{item.gst}</Text></Text>
              </View>

              <View style={[styles.statsGridCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.gridLabel}>Rate : <Text style={styles.gridVal}>{item.rate}</Text></Text>
                <Text style={styles.gridLabel}>Price : <Text style={styles.gridPriceVal}>{item.price}</Text></Text>
              </View>
            </View>
          </View>
        ))}

        {/* BASIC REMARK SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIndicatorBar} />
          <Text style={styles.sectionTitle}>BASIC REMARK</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.remarkCard}>
          <View style={styles.remarkTitleRow}>
            <Ionicons name="pin" size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.remarkTitleText}>Note</Text>
          </View>
          <Text style={styles.remarkBodyText}>
            {"Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500s."}
          </Text>
          <View style={styles.remarkFooterRow}>
            <Text style={styles.remarkFooterText}>Added By You</Text>
            <Text style={styles.remarkFooterText}>Feb. 24, 2026</Text>
          </View>
        </View>

        {/* TERMS & CONDITIONS SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIndicatorBar} />
          <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.termsContainer}>
          {TERMS_CONDITIONS.map((cond) => (
            <View key={cond.id} style={styles.termRow}>
              <View style={styles.termBadge}>
                <Text style={styles.termBadgeText}>{cond.id}</Text>
              </View>
              <Text style={styles.termText}>{cond.text}</Text>
            </View>
          ))}
        </View>

        {/* TOTAL AMOUNT CONTAINER */}
        <View style={styles.totalAmountBanner}>
          <Text style={styles.totalAmountLabel}>Total Amount</Text>
          <Text style={styles.totalAmountVal}>₹ 10,00,000.00</Text>
        </View>

        {/* DOWNLOAD ORDER ACTION BANNER */}
        <TouchableOpacity 
          style={styles.downloadOrderBanner}
          onPress={() => handleDownload('Complete Order PDF')}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.downloadOrderTitle}>Download Order</Text>
            <Text style={styles.downloadOrderSub}>Export Complete Order As PDF</Text>
          </View>
          <View style={styles.downloadOrderIconBg}>
            <Ionicons name="download" size={20} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* GRID ACTIONS */}
        <View style={styles.docGrid}>
          {DOC_ACTIONS.map((doc) => (
            <View key={doc.id} style={styles.gridDocCard}>
              <View style={styles.docCardIconBg}>
                <Ionicons name={doc.icon as any} size={24} color={COLORS.primary} />
              </View>
              
              <Text style={styles.docCardTitle}>{doc.title}</Text>
              <Text style={styles.docCardSub} numberOfLines={2}>{doc.sub}</Text>
              
              <TouchableOpacity 
                style={styles.docCardBtn}
                onPress={() => handleDownload(doc.title)}
                activeOpacity={0.75}
              >
                <Ionicons name="download-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.docCardBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },

  // Product card styling
  productCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  productTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 90,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productDetailsCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  productSpec: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  productDesc: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  productStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsGridCol: {
    flex: 1,
    gap: 6,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  gridVal: {
    fontWeight: '800',
    color: COLORS.textDark,
  },
  gridPriceVal: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
  },

  // Section divider headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionIndicatorBar: {
    width: 3.5,
    height: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 10,
  },

  // Remark card
  remarkCard: {
    backgroundColor: '#FAFDFB',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 8,
  },
  remarkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remarkTitleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  remarkBodyText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    lineHeight: 16,
  },
  remarkFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  remarkFooterText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
  },

  // Terms and conditions
  termsContainer: {
    gap: 10,
  },
  termRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  termBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.blueBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  termBadgeText: {
    color: COLORS.blueText,
    fontSize: 11,
    fontWeight: '800',
  },
  termText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 14,
  },

  // Total amount
  totalAmountBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
  },
  totalAmountLabel: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  totalAmountVal: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },

  // Download complete order
  downloadOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#437E6B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  downloadOrderTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  downloadOrderSub: {
    color: '#E0EDE9',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  downloadOrderIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Document Grid Actions
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 4,
  },
  gridDocCard: {
    width: '48%',
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  docCardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  docCardTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  docCardSub: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    height: 28,
  },
  docCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    height: 32,
    width: '100%',
    marginTop: 4,
  },
  docCardBtnText: {
    color: COLORS.primary,
    fontSize: 10.5,
    fontWeight: '800',
  },
});
