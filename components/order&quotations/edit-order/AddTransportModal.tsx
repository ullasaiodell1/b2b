import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateCourier } from '@/hooks/useCourier';
import { useCities, useCountries, useStates } from '@/hooks/useLocation';

interface AddTransportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (partnerName: string) => void;
}

const SERVICE_TYPE_OPTIONS = ['Standard', 'Express', 'Priority', 'Same Day', 'Overnight'];

export default function AddTransportModal({
  visible,
  onClose,
  onSuccess,
}: AddTransportModalProps) {
  const theme = useTheme();
  const primaryColor = theme.primaryColor;
  const primaryLight = theme.primaryLight || '#FEF2F2';

  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerContact, setNewPartnerContact] = useState('');
  const [newPartnerCountry, setNewPartnerCountry] = useState('');
  const [newPartnerCountryId, setNewPartnerCountryId] = useState('');
  const [newPartnerState, setNewPartnerState] = useState('');
  const [newPartnerStateId, setNewPartnerStateId] = useState('');
  const [newPartnerCity, setNewPartnerCity] = useState('');
  const [newPartnerCityId, setNewPartnerCityId] = useState('');
  const [newPartnerServiceType, setNewPartnerServiceType] = useState('Standard');
  const [newPartnerRating, setNewPartnerRating] = useState('4.5');
  const [newPartnerGst, setNewPartnerGst] = useState('');
  const [newPartnerStatus, setNewPartnerStatus] = useState(true);

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false);

  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const { data: countriesData } = useCountries(countrySearch);
  const { data: statesData } = useStates(newPartnerCountryId, stateSearch);
  const { data: citiesData } = useCities(newPartnerStateId, citySearch);

  const createCourierMutation = useCreateCourier();

  const resetForm = () => {
    setNewPartnerName('');
    setNewPartnerContact('');
    setNewPartnerCountry('');
    setNewPartnerCountryId('');
    setNewPartnerState('');
    setNewPartnerStateId('');
    setNewPartnerCity('');
    setNewPartnerCityId('');
    setNewPartnerServiceType('Standard');
    setNewPartnerRating('4.5');
    setNewPartnerGst('');
    setNewPartnerStatus(true);
  };

  const handleCreate = async () => {
    if (!newPartnerName.trim()) {
      Alert.alert('Validation Error', 'Transport Name is required.');
      return;
    }
    if (!newPartnerContact.trim()) {
      Alert.alert('Validation Error', 'Contact Number is required.');
      return;
    }
    if (newPartnerContact.trim().length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit contact number.');
      return;
    }
    if (!newPartnerCountryId) {
      Alert.alert('Validation Error', 'Country selection is required.');
      return;
    }
    if (!newPartnerStateId) {
      Alert.alert('Validation Error', 'State selection is required.');
      return;
    }
    if (!newPartnerCityId) {
      Alert.alert('Validation Error', 'City selection is required.');
      return;
    }

    try {
      const newCourierData = {
        courier_name: newPartnerName.trim(),
        contact_number: parseInt(newPartnerContact.trim(), 10) || 0,
        country: newPartnerCountryId,
        state: newPartnerStateId,
        city: newPartnerCityId,
        service_type: newPartnerServiceType,
        efficiency_rating: parseFloat(newPartnerRating) || 4.5,
        gst_number: newPartnerGst.trim() || null,
        is_available: newPartnerStatus,
      };

      await createCourierMutation.mutateAsync(newCourierData);
      onSuccess(newPartnerName.trim());
      resetForm();
    } catch (err: any) {
      console.error('[Create Courier Error]:', err);
      // Fallback/offline success behavior preserved from original
      onSuccess(newPartnerName.trim());
      resetForm();
      Alert.alert('Success', 'Courier registered locally!');
    }
  };

  const handleCancel = () => {
    onClose();
    resetForm();
  };

  return (
    <>
      <Modal transparent animationType="fade" visible={visible} onRequestClose={handleCancel}>
        <View style={styles.modalOverlayCentered}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalFormCard}>
            <View style={styles.modalFormHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalFormTitle}>Add Transport</Text>
                <Text style={styles.modalFormSubtitle}>Register a new courier service.</Text>
              </View>
              <TouchableOpacity onPress={handleCancel} style={styles.modalFormCloseBtn}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalFormScrollContent} style={{ flexShrink: 1 }}>
              <View style={styles.modalFormBody}>
                <View style={styles.gridRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>Transport Name
                    </Text>
                    <TextInput
                      style={styles.textInputStyle}
                      placeholder="e.g. BlueDart"
                      placeholderTextColor="#9CA3AF"
                      value={newPartnerName}
                      onChangeText={setNewPartnerName}
                    />
                  </View>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>Contact Number
                    </Text>
                    <TextInput
                      style={styles.textInputStyle}
                      placeholder="e.g. 9876543210"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      value={newPartnerContact}
                      onChangeText={setNewPartnerContact}
                      maxLength={10}
                    />
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>Country
                    </Text>
                    <TouchableOpacity
                      style={styles.selectTrigger}
                      onPress={() => setShowCountryModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.selectTriggerText, !newPartnerCountry && { color: '#9CA3AF' }]} numberOfLines={1}>
                        {newPartnerCountry || 'Select Country'}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>State
                    </Text>
                    <TouchableOpacity
                      style={styles.selectTrigger}
                      onPress={() => {
                        if (!newPartnerCountry) {
                          Alert.alert('Required Field', 'Please select Country first.');
                          return;
                        }
                        setShowStateModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.selectTriggerText, !newPartnerState && { color: '#9CA3AF' }]} numberOfLines={1}>
                        {newPartnerState || (newPartnerCountry ? 'Select State' : 'Select Country first')}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>
                      <Text style={{ color: COLORS.danger }}>* </Text>City
                    </Text>
                    <TouchableOpacity
                      style={styles.selectTrigger}
                      onPress={() => {
                        if (!newPartnerState) {
                          Alert.alert('Required Field', 'Please select State first.');
                          return;
                        }
                        setShowCityModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.selectTriggerText, !newPartnerCity && { color: '#9CA3AF' }]} numberOfLines={1}>
                        {newPartnerCity || (newPartnerState ? 'Select City' : 'Select State first')}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Service Type</Text>
                    <TouchableOpacity
                      style={styles.selectTrigger}
                      onPress={() => setShowServiceTypeModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectTriggerText}>{newPartnerServiceType}</Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Efficiency Rating (0-5)</Text>
                    <TextInput
                      style={styles.textInputStyle}
                      placeholder="4.5"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={newPartnerRating}
                      onChangeText={setNewPartnerRating}
                    />
                  </View>

                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>GST Number</Text>
                    <TextInput
                      style={styles.textInputStyle}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      placeholderTextColor="#9CA3AF"
                      value={newPartnerGst}
                      onChangeText={setNewPartnerGst}
                    />
                  </View>
                </View>

                <View style={styles.availabilityCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.availabilityTitle}>Availability Status</Text>
                    <Text style={styles.availabilitySubtitle}>Toggle courier operational status</Text>
                  </View>
                  <Switch
                    value={newPartnerStatus}
                    onValueChange={setNewPartnerStatus}
                    trackColor={{ false: '#D1D5DB', true: '#E0F2FE' }}
                    thumbColor={newPartnerStatus ? '#0284C7' : '#9CA3AF'}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFormFooter}>
              <TouchableOpacity
                style={styles.modalFormCancelBtn}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.modalFormCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalFormSubmitBtn, { backgroundColor: '#4CB5BD' }]}
                onPress={handleCreate}
                activeOpacity={0.8}
              >
                <Text style={styles.modalFormSubmitBtnText}>Create Transport</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* COUNTRY SELECT MODAL */}
      <Modal transparent animationType="slide" visible={showCountryModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: 24, maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search country..."
                placeholderTextColor="#9CA3AF"
                value={countrySearch}
                onChangeText={setCountrySearch}
              />
              {countrySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(countriesData || []).map((opt: any) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setNewPartnerCountry(opt.name);
                    setNewPartnerCountryId(opt.id);
                    setNewPartnerState('');
                    setNewPartnerStateId('');
                    setNewPartnerCity('');
                    setNewPartnerCityId('');
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt.name}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* STATE SELECT MODAL */}
      <Modal transparent animationType="slide" visible={showStateModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStateModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: 24, maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search state..."
                placeholderTextColor="#9CA3AF"
                value={stateSearch}
                onChangeText={setStateSearch}
              />
              {stateSearch.length > 0 && (
                <TouchableOpacity onPress={() => setStateSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(statesData || []).map((opt: any) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setNewPartnerState(opt.name);
                    setNewPartnerStateId(opt.id);
                    setNewPartnerCity('');
                    setNewPartnerCityId('');
                    setShowStateModal(false);
                    setStateSearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt.name}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CITY SELECT MODAL */}
      <Modal transparent animationType="slide" visible={showCityModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCityModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: 24, maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search city..."
                placeholderTextColor="#9CA3AF"
                value={citySearch}
                onChangeText={setCitySearch}
              />
              {citySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCitySearch('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(citiesData || []).map((opt: any) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setNewPartnerCity(opt.name);
                    setNewPartnerCityId(opt.id);
                    setShowCityModal(false);
                    setCitySearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalRowText}>{opt.name}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* SERVICE TYPE SELECT MODAL */}
      <Modal transparent animationType="slide" visible={showServiceTypeModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowServiceTypeModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service Type</Text>
              <TouchableOpacity onPress={() => setShowServiceTypeModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {SERVICE_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setNewPartnerServiceType(opt);
                    setShowServiceTypeModal(false);
                  }}
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
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 620,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  modalFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F0FDFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalFormTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalFormSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  modalFormCloseBtn: {
    padding: 4,
  },
  modalFormScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalFormBody: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formField: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
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
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  selectTriggerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    marginTop: 6,
  },
  availabilityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  availabilitySubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  modalFormFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalFormCancelBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFormCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalFormSubmitBtn: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFormSubmitBtnText: {
    fontSize: 12.5,
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
    maxHeight: '75%',
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#FAFAFA',
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
