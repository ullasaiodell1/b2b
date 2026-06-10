import { OrderRecord, ordersState, updateOrdersState } from '@/components/OrderState';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
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

const CLIENT_OPTIONS = ['NovaTech Solutions Pvt. Ltd.', 'Zenith System Pvt. Ltd.', 'Ullas India IT Solutions Limited.'];
const CONTACT_OPTIONS = ['Arjun Maheta', 'Khushal Nadiyapara', 'Parth Solanki'];
const STATUS_OPTIONS = ['Complete', 'Pending', 'Inprogress', 'Out Of Delivery', 'Delivered'];
const PAYMENT_OPTIONS = ['Advance Payment', 'Cash on Delivery', 'Bank Transfer'];

export default function AddOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [orderNo, setOrderNo] = useState('');
  const [clientName, setClientName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [status, setStatus] = useState<OrderRecord['status']>('Pending');
  const [paymentType, setPaymentType] = useState('Advance Payment');
  const [amount, setAmount] = useState('');
  const [itemsCount, setItemsCount] = useState('');

  const [activePicker, setActivePicker] = useState<'client' | 'contact' | 'status' | 'payment' | null>(null);

  const handleSelectOption = (val: string) => {
    if (activePicker === 'client') setClientName(val);
    else if (activePicker === 'contact') setContactPerson(val);
    else if (activePicker === 'status') setStatus(val as OrderRecord['status']);
    else if (activePicker === 'payment') setPaymentType(val);
    setActivePicker(null);
  };

  const handleSave = () => {
    if (!orderNo || !clientName || !contactPerson || !hotelLocation || !amount || !itemsCount) {
      Alert.alert('Required Fields', 'Please fill in all mandatory (*) fields.');
      return;
    }

    const formattedAmount = amount.startsWith('₹') ? amount : `₹ ${amount}`;

    const newOrder: OrderRecord = {
      id: String(ordersState.length + 1),
      orderNo,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      clientName,
      contactPerson,
      hotelLocation,
      status,
      itemsCount: parseInt(itemsCount) || 1,
      paymentType,
      amount: formattedAmount,
      items: [
        {
          name: 'ITEM ORDERED',
          description: 'Custom Order Item details',
          price: formattedAmount,
          qty: itemsCount,
          gst: '18%',
          total: formattedAmount,
        }
      ]
    };

    updateOrdersState([newOrder, ...ordersState]);

    Alert.alert('Success', 'Order created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: COLORS.primary }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>ORDER</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Order Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Order Number <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. QT-2026-025"
              placeholderTextColor="#9CA3AF"
              value={orderNo}
              onChangeText={setOrderNo}
            />
          </View>

          {/* Client Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Client Name <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('client')}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !clientName && styles.placeholderText]}>
                {clientName || 'Select Client Name'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Contact Person */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Contact Person <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('contact')}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !contactPerson && styles.placeholderText]}>
                {contactPerson || 'Select Contact Person'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Hotel Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Hotel Location <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. The Grand Thakar Hotel, Rajkot"
              placeholderTextColor="#9CA3AF"
              value={hotelLocation}
              onChangeText={setHotelLocation}
            />
          </View>

          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Status <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('status')}
              activeOpacity={0.85}
            >
              <Text style={styles.pickerValueText}>{status}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Payment Method */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Method</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('payment')}
              activeOpacity={0.85}
            >
              <Text style={styles.pickerValueText}>{paymentType}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Items Count */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Items Count <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 21"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={itemsCount}
              onChangeText={setItemsCount}
            />
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Amount <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 10,00,000.00"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Save */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 10, 16) }]}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>save</Text>
        </TouchableOpacity>
      </View>

      {/* OPTIONS MODAL */}
      <Modal transparent animationType="slide" visible={activePicker !== null}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActivePicker(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {activePicker === 'client' ? 'Client' : activePicker === 'contact' ? 'Contact' : activePicker === 'status' ? 'Status' : 'Payment Type'}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(
                activePicker === 'client' ? CLIENT_OPTIONS :
                  activePicker === 'contact' ? CONTACT_OPTIONS :
                    activePicker === 'status' ? STATUS_OPTIONS :
                      PAYMENT_OPTIONS
              ).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => handleSelectOption(opt)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 20,
    gap: 5,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    backgroundColor: '#FFFFFF',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  pickerValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: COLORS.saveBtnBg,
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
