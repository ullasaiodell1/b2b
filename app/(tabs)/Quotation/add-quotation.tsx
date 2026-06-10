import { COLORS } from '@/constants/theme';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { CreateQuotationPayload, QuotationItem } from '@/types/quotation';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ItemLine {
  tempId: string;
  item_name: string;
  item_code: string;
  item_description: string;
  quantity: string;
  unit_price: string;
  gst_percentage: string;
  item_discount: string;
}

function makeEmptyItem(): ItemLine {
  return {
    tempId: String(Date.now() + Math.random()),
    item_name: '',
    item_code: '',
    item_description: '',
    quantity: '1',
    unit_price: '0',
    gst_percentage: '18',
    item_discount: '0',
  };
}

function calcItem(item: ItemLine) {
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.unit_price) || 0;
  const disc = parseFloat(item.item_discount) || 0;
  const gst = parseFloat(item.gst_percentage) || 0;

  const rawAmt = qty * rate;
  const discAmt = rawAmt * (disc / 100);
  const taxable = rawAmt - discAmt;
  const gstAmt = taxable * (gst / 100);
  const totalAmt = taxable + gstAmt;

  return {
    amount: parseFloat(taxable.toFixed(2)),
    gst_amount: parseFloat(gstAmt.toFixed(2)),
    total: parseFloat(totalAmt.toFixed(2)),
  };
}

function formatAmount(n: number) {
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export default function AddQuotationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createMutation = useCreateQuotation();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [quotationDate, setQuotationDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<ItemLine[]>([makeEmptyItem()]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateItem = (idx: number, key: keyof ItemLine, val: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, makeEmptyItem()]);

  const removeItem = (idx: number) => {
    if (items.length === 1) {
      Alert.alert('Info', 'At least one item is required.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Totals ─────────────────────────────────────────────────────────────────
  let subTotal = 0;
  let taxTotal = 0;
  items.forEach((item) => {
    const { amount, gst_amount } = calcItem(item);
    subTotal += amount;
    taxTotal += gst_amount;
  });
  const grandTotal = subTotal + taxTotal;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    // Validate required item fields
    for (let i = 0; i < items.length; i++) {
      if (!items[i].item_name.trim()) {
        Alert.alert('Validation', `Item ${i + 1} name is required.`);
        return;
      }
      if (!parseFloat(items[i].quantity) || parseFloat(items[i].quantity) <= 0) {
        Alert.alert('Validation', `Item ${i + 1} quantity must be greater than 0.`);
        return;
      }
    }

    const mappedItems: QuotationItem[] = items.map((item) => {
      const { amount, gst_amount } = calcItem(item);
      return {
        item_name: item.item_name.trim(),
        item_code: item.item_code.trim() || null,
        item_description: item.item_description.trim() || null,
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        gst_percentage: parseFloat(item.gst_percentage) || 0,
        item_discount: parseFloat(item.item_discount) || 0,
        amount,
        gst_amount,
      } as QuotationItem;
    });

    const payload: CreateQuotationPayload = {
      quotation_date: quotationDate.toISOString(),
      status: 'DRAFT',
      company_name: companyName.trim() || null,
      contact_name: contactName.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
      gst_number: gstNumber.trim() || null,
      pan_number: panNumber.trim() || null,
      notes: notes.trim() || null,
      sub_total: parseFloat(subTotal.toFixed(2)),
      tax_total: parseFloat(taxTotal.toFixed(2)),
      grand_total: parseFloat(grandTotal.toFixed(2)),
      discount_percentage: 0,
      discount_amount: 0,
      items: mappedItems,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        Alert.alert('Success', 'Quotation created successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (err: any) => {
        const msg =
          err?.message ||
          err?.error ||
          (Array.isArray(err?.details) ? err.details.map((d: any) => d.message).join('\n') : null) ||
          'Failed to create quotation.';
        Alert.alert('Error', msg);
      },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: COLORS.primary }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>QUOTATION</Text>
          </Text>
          <Text style={styles.headerSub}>Fill In The Details Below</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── QUOTATION INFORMATION ────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>QUOTATION INFORMATION</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.card}>
          {/* Date */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Quotation Date *</Text>
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.selectTriggerText}>
                {quotationDate.toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.textInputBox, { height: 72, paddingTop: 10 }]}
              placeholder="Enter notes or terms..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={quotationDate}
            mode="date"
            display="default"
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) setQuotationDate(selected);
            }}
          />
        )}

        {/* ── CLIENT / CONTACT DETAILS ─────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>CLIENT DETAILS</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.card}>
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Company Name</Text>
            <TextInput
              style={styles.textInputBox}
              placeholder="Enter company name"
              placeholderTextColor="#9CA3AF"
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Contact Name</Text>
            <TextInput
              style={styles.textInputBox}
              placeholder="Enter contact person name"
              placeholderTextColor="#9CA3AF"
              value={contactName}
              onChangeText={setContactName}
            />
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInputBox}
                placeholder="Phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
              />
            </View>
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInputBox}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={contactEmail}
                onChangeText={setContactEmail}
              />
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.inputLabel}>GST Number</Text>
              <TextInput
                style={styles.textInputBox}
                placeholder="GSTIN"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                value={gstNumber}
                onChangeText={setGstNumber}
              />
            </View>
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.inputLabel}>PAN Number</Text>
              <TextInput
                style={styles.textInputBox}
                placeholder="PAN"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                value={panNumber}
                onChangeText={setPanNumber}
              />
            </View>
          </View>
        </View>

        {/* ── ITEMS ────────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>ITEMS</Text>
          <View style={styles.sectionLine} />
        </View>

        {items.map((item, idx) => {
          const { amount, gst_amount, total } = calcItem(item);
          return (
            <View key={item.tempId} style={styles.itemCard}>
              {/* Item header */}
              <View style={styles.itemHeader}>
                <View style={styles.itemIndexBadge}>
                  <Text style={styles.itemIndexText}>{idx + 1}</Text>
                </View>
                <Text style={styles.itemHeading} numberOfLines={1}>
                  {item.item_name || `Item ${idx + 1}`}
                </Text>
                <TouchableOpacity
                  style={styles.deleteItemBtn}
                  onPress={() => removeItem(idx)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput
                  style={styles.textInputBox}
                  placeholder="Enter item / product name"
                  placeholderTextColor="#9CA3AF"
                  value={item.item_name}
                  onChangeText={(v) => updateItem(idx, 'item_name', v)}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Item Code</Text>
                <TextInput
                  style={styles.textInputBox}
                  placeholder="SKU / HSN / SAC code"
                  placeholderTextColor="#9CA3AF"
                  value={item.item_code}
                  onChangeText={(v) => updateItem(idx, 'item_code', v)}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.textInputBox}
                  placeholder="Optional description"
                  placeholderTextColor="#9CA3AF"
                  value={item.item_description}
                  onChangeText={(v) => updateItem(idx, 'item_description', v)}
                />
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Qty *</Text>
                  <TextInput
                    style={styles.textInputBox}
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={(v) => updateItem(idx, 'quantity', v)}
                  />
                </View>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Unit Price *</Text>
                  <TextInput
                    style={styles.textInputBox}
                    keyboardType="numeric"
                    value={item.unit_price}
                    onChangeText={(v) => updateItem(idx, 'unit_price', v)}
                  />
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>GST %</Text>
                  <TextInput
                    style={styles.textInputBox}
                    keyboardType="numeric"
                    value={item.gst_percentage}
                    onChangeText={(v) => updateItem(idx, 'gst_percentage', v)}
                  />
                </View>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Discount %</Text>
                  <TextInput
                    style={styles.textInputBox}
                    keyboardType="numeric"
                    value={item.item_discount}
                    onChangeText={(v) => updateItem(idx, 'item_discount', v)}
                  />
                </View>
              </View>

              {/* Item total preview */}
              <View style={styles.itemTotalRow}>
                <Text style={styles.itemTotalLabel}>
                  Taxable: <Text style={styles.itemTotalVal}>{formatAmount(amount)}</Text>
                  {'  '}GST: <Text style={styles.itemTotalVal}>{formatAmount(gst_amount)}</Text>
                </Text>
                <Text style={styles.itemGrandTotal}>{formatAmount(total)}</Text>
              </View>
            </View>
          );
        })}

        {/* Add Item button */}
        <TouchableOpacity style={styles.addItemBtn} onPress={addItem} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.addItemBtnText}>Add Item</Text>
        </TouchableOpacity>

        {/* ── ORDER TOTAL SUMMARY ───────────────────── */}
        <View style={styles.totalSummaryCard}>
          <View style={styles.totalSummaryRow}>
            <Text style={styles.totalSummaryLabel}>Subtotal</Text>
            <Text style={styles.totalSummaryVal}>{formatAmount(subTotal)}</Text>
          </View>
          <View style={styles.totalSummaryRow}>
            <Text style={styles.totalSummaryLabel}>Tax Total</Text>
            <Text style={styles.totalSummaryVal}>{formatAmount(taxTotal)}</Text>
          </View>
          <View style={[styles.totalSummaryRow, styles.totalSummaryGrand]}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandVal}>{formatAmount(grandTotal)}</Text>
          </View>
        </View>

        {/* ── SAVE BUTTON ───────────────────────────── */}
        <TouchableOpacity
          style={[styles.saveBtn, createMutation.isPending && { opacity: 0.6 }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={createMutation.isPending}
        >
          <Text style={styles.saveBtnText}>
            {createMutation.isPending ? 'Creating...' : 'Create Quotation'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 14.5, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },

  scrollContent: { padding: 12, paddingBottom: 48, gap: 10 },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: COLORS.border },

  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  formField: { gap: 5 },
  inputLabel: { fontSize: 11.5, fontWeight: '700', color: COLORS.textMuted },
  textInputBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  selectTriggerText: { fontSize: 13, color: COLORS.textDark, fontWeight: '600' },
  gridRow: { flexDirection: 'row', gap: 10 },

  // Item cards
  itemCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIndexText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  itemHeading: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  deleteItemBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FBF9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemTotalLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  itemTotalVal: { fontWeight: '800', color: COLORS.textDark },
  itemGrandTotal: { fontSize: 13.5, fontWeight: '900', color: COLORS.primary },

  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: 10,
    height: 44,
    backgroundColor: COLORS.primaryLight,
  },
  addItemBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },

  // Order total summary
  totalSummaryCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  totalSummaryGrand: { borderBottomWidth: 0 },
  totalSummaryLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  totalSummaryVal: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  grandLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  grandVal: { fontSize: 15, fontWeight: '900', color: COLORS.primary },

  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
});
