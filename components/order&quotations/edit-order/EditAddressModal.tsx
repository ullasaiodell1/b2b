import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EditAddressModalProps {
  visible: boolean;
  onClose: () => void;
  billingAddress: string;
  shippingAddress: string;
  sameAsBilling: boolean;
  onConfirm: (billing: string, shipping: string, same: boolean) => void;
}

export default function EditAddressModal({
  visible,
  onClose,
  billingAddress,
  shippingAddress,
  sameAsBilling,
  onConfirm,
}: EditAddressModalProps) {
  const theme = useTheme();
  const primaryColor = theme.primaryColor;
  const primaryLight = theme.primaryLight || '#FEF2F2';

  const [tempBillingAddress, setTempBillingAddress] = useState('');
  const [tempShippingAddress, setTempShippingAddress] = useState('');
  const [tempSameAsBilling, setTempSameAsBilling] = useState(true);

  const [isLocatingBilling, setIsLocatingBilling] = useState(false);
  const [isLocatingShipping, setIsLocatingShipping] = useState(false);

  useEffect(() => {
    if (visible) {
      setTempBillingAddress(billingAddress);
      setTempShippingAddress(shippingAddress);
      setTempSameAsBilling(sameAsBilling);
    }
  }, [visible, billingAddress, shippingAddress, sameAsBilling]);

  const handleGetLocation = async (target: 'billing' | 'shipping') => {
    const setLocating = target === 'billing' ? setIsLocatingBilling : setIsLocatingShipping;
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = location.coords;

      let geocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const addr = geocode[0];
        const streetPart = [addr.name, addr.street, addr.district].filter(Boolean).join(', ');
        const cityPart = [addr.city, addr.subregion].filter(Boolean).join(', ');
        const statePart = addr.region ? `${addr.region}` : '';
        const pinPart = addr.postalCode ? `${addr.postalCode}` : '';
        const countryPart = addr.country || '';

        const fullAddress = [
          streetPart,
          cityPart,
          [statePart, pinPart].filter(Boolean).join(' - '),
          countryPart,
        ]
          .filter((v) => v && v.trim())
          .join(', ');

        if (target === 'billing') {
          setTempBillingAddress(fullAddress);
          if (tempSameAsBilling) {
            setTempShippingAddress(fullAddress);
          }
        } else {
          setTempShippingAddress(fullAddress);
        }
      } else {
        Alert.alert('Error', 'No address details found for your current location.');
      }
    } catch (error: any) {
      console.error('[Get Location Error]:', error);
      Alert.alert('Error', 'Failed to retrieve your current location: ' + (error?.message || ''));
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(tempBillingAddress, tempShippingAddress, tempSameAsBilling);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[styles.modalContent, { maxHeight: '80%' }]}
          activeOpacity={1}
          onPress={() => { }}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>EDIT ADDRESSES</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            {/* Billing address */}
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.inputLabelGrey}>BILLING ADDRESS</Text>
                <TouchableOpacity
                  style={styles.locationBtn}
                  onPress={() => handleGetLocation('billing')}
                  disabled={isLocatingBilling}
                >
                  {isLocatingBilling ? (
                    <ActivityIndicator size="small" color={primaryColor} />
                  ) : (
                    <>
                      <Ionicons name="location-outline" size={14} color={primaryColor} />
                      <Text style={{ color: primaryColor, fontSize: 11, fontWeight: '800' }}>GPS</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.textInputStyle, { height: 60, textAlignVertical: 'top' }]}
                multiline={true}
                numberOfLines={3}
                value={tempBillingAddress}
                onChangeText={(v) => {
                  setTempBillingAddress(v);
                  if (tempSameAsBilling) setTempShippingAddress(v);
                }}
                placeholder="Enter billing address..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Same as billing switch */}
            <View style={styles.switchRow}>
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: COLORS.textDark }}>
                Shipping address is same as Billing
              </Text>
              <Switch
                value={tempSameAsBilling}
                onValueChange={(val) => {
                  setTempSameAsBilling(val);
                  if (val) setTempShippingAddress(tempBillingAddress);
                }}
                trackColor={{ false: '#D1D5DB', true: primaryLight }}
                thumbColor={tempSameAsBilling ? primaryColor : '#F3F4F6'}
              />
            </View>

            {/* Shipping address */}
            {!tempSameAsBilling && (
              <View style={{ gap: 4, marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.inputLabelGrey}>SHIPPING ADDRESS</Text>
                  <TouchableOpacity
                    style={styles.locationBtn}
                    onPress={() => handleGetLocation('shipping')}
                    disabled={isLocatingShipping}
                  >
                    {isLocatingShipping ? (
                      <ActivityIndicator size="small" color={primaryColor} />
                    ) : (
                      <>
                        <Ionicons name="location-outline" size={14} color={primaryColor} />
                        <Text style={{ color: primaryColor, fontSize: 11, fontWeight: '800' }}>GPS</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.textInputStyle, { height: 60, textAlignVertical: 'top' }]}
                  multiline={true}
                  numberOfLines={3}
                  value={tempShippingAddress}
                  onChangeText={setTempShippingAddress}
                  placeholder="Enter shipping address..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            {/* Confirm / Cancel */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingBottom: 30 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: '#D1D5DB', borderWidth: 1 }]}
                onPress={onClose}
              >
                <Text style={{ color: COLORS.textDark, fontWeight: '800', fontSize: 13 }}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: primaryColor }]}
                onPress={handleConfirm}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  inputLabelGrey: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  textInputStyle: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    height: 38,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 4,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginVertical: 4,
  },
  modalBtn: {
    width: '48%',
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
