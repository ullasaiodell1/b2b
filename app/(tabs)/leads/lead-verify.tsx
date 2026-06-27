import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCities, useConvertLeadToCustomer, useLeadDetails, useVerifyLead } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
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
import Toast from 'react-native-toast-message';


// ─── City Combobox ────────────────────────────────────────────────────────────

interface SelectedCity {
  id: string | number;
  name: string;
  label: string; // "city, state, country"
}

interface CityDropdownProps {
  selectedCities: SelectedCity[];
  onAdd: (city: SelectedCity) => void;
  onRemove: (cityId: string | number) => void;
  primaryColor: string;
}

function CityDropdown({ selectedCities, onAdd, onRemove, primaryColor }: CityDropdownProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchRef = useRef<TextInput>(null);

  // Debounced search — only query when user has typed
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 350);
  }, []);

  const { data: cities = [], isFetching } = useCities(debouncedSearch);

  const open = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(slideAnim, { toValue: 1, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start(() => searchRef.current?.focus());
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      setSearch('');
      setDebouncedSearch('');
    });
  };

  const handleSelect = (city: any) => {
    // Build label from city object fields
    const cleanQuotes = (str: string) => str.trim().replace(/^['"]|['"]$/g, '').trim();
    const cityName = cleanQuotes(city.city || city.name || city.label || '');
    const stateName = cleanQuotes(city.state || city.state_name || '');
    const countryName = cleanQuotes(city.country || city.country_name || '');
    const parts = [cityName, stateName, countryName].filter(Boolean);
    const label = parts.join(', ');
    const id = city.id ?? city._id ?? label;

    const isAlreadySelected = selectedCities.some((c) => String(c.id) === String(id));
    if (isAlreadySelected) {
      onRemove(id);
    } else {
      onAdd({ id, name: cityName, label });
    }
  };
  const sheetTranslate = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] });

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity style={cs.trigger} onPress={open} activeOpacity={0.8}>
        <Ionicons name="location-outline" size={15} color={COLORS.textMuted} style={{ marginRight: 6 }} />
        <Text style={[cs.triggerText, selectedCities.length > 0 && { color: primaryColor }]} numberOfLines={1}>
          {selectedCities.length === 0
            ? 'Search and select city...'
            : selectedCities.map((c) => c.name).join(', ')}
        </Text>
        <Ionicons name="chevron-down" size={13} color={selectedCities.length > 0 ? primaryColor : COLORS.textMuted} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      {/* Selected city chips */}
      {selectedCities.length > 0 && (
        <View style={cs.chipsRow}>
          {selectedCities.map((city) => (
            <View key={String(city.id)} style={[cs.chip, { borderColor: primaryColor, backgroundColor: primaryColor + '15' }]}>
              <Text style={[cs.chipText, { color: primaryColor }]} numberOfLines={1}>{city.name}</Text>
              <TouchableOpacity onPress={() => onRemove(city.id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Ionicons name="close" size={12} color={primaryColor} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Modal Bottom Sheet */}
      <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
        {/* Backdrop */}
        <Animated.View style={[cs.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[cs.sheet, { paddingBottom: Math.max(insets.bottom + 12, 20), transform: [{ translateY: sheetTranslate }] }]}>
          <View style={cs.handleBar} />

          {/* Header */}
          <View style={cs.sheetHeader}>
            <Text style={[cs.sheetTitle, { color: primaryColor }]}>Cities of Operation</Text>
            {selectedCities.length > 0 && (
              <TouchableOpacity onPress={() => { selectedCities.forEach((c) => onRemove(c.id)); }} style={cs.clearBtn}>
                <Ionicons name="close-circle" size={14} color={COLORS.danger} style={{ marginRight: 3 }} />
                <Text style={cs.clearText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={cs.sheetDivider} />

          {/* Search bar */}
          <View style={cs.searchBar}>
            <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              ref={searchRef}
              style={cs.searchInput}
              placeholder="Type city name..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={handleSearchChange}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {isFetching && <ActivityIndicator size="small" color={primaryColor} style={{ marginLeft: 6 }} />}
            {search.length > 0 && !isFetching && (
              <TouchableOpacity onPress={() => { setSearch(''); setDebouncedSearch(''); }}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* City List */}
          <FlatList
            data={cities}
            keyExtractor={(item, idx) => String(item.id ?? item._id ?? idx)}
            showsVerticalScrollIndicator={false}
            style={cs.optionList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={cs.emptyBox}>
                <Ionicons name="location-outline" size={28} color="#CBD5E1" />
                <Text style={cs.emptyText}>
                  {isFetching ? 'Searching cities...' : 'No cities found'}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const cleanQuotes = (str: string) => str.trim().replace(/^['"]|['"]$/g, '').trim();
              const cityName = cleanQuotes(item.city || item.name || '');
              const stateName = cleanQuotes(item.state || item.state_name || '');
              const countryName = cleanQuotes(item.country || item.country_name || '');
              const parts = [cityName, stateName, countryName].filter(Boolean);
              const label = parts.join(', ');
              const id = item.id ?? item._id ?? label;
              const isSelected = selectedCities.some((c) => String(c.id) === String(id));

              return (
                <TouchableOpacity
                  style={[cs.optionRow, isSelected && { backgroundColor: primaryColor + '12' }]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={[cs.checkCircle, isSelected && { borderColor: primaryColor, backgroundColor: primaryColor }]}>
                    {isSelected && <Ionicons name="checkmark" size={11} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[cs.optionPrimary, isSelected && { color: primaryColor, fontWeight: '800' }]}>
                      {cityName}
                    </Text>
                    {(stateName || countryName) ? (
                      <Text style={cs.optionSecondary} numberOfLines={1}>
                        {[stateName, countryName].filter(Boolean).join(', ')}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={cs.optionSep} />}
          />
        </Animated.View>
      </Modal>
    </>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function LeadVerifyScreen() {
  const theme = useTheme();
  const primaryColor = theme.primaryColor || '#0ea5e9';
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params ?? {};
  const insets = useSafeAreaInsets();

  const leadName: string = params.leadName || params.name || 'Lead';

  // API hooks
  const verifyLeadMutation = useVerifyLead();
  const { data: lead, isLoading: isLoadingDetails } = useLeadDetails(params.id);

  // Form state
  const [numProperties, setNumProperties] = useState('');
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>([]);
  const [currentlyPurchasingFrom, setCurrentlyPurchasingFrom] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Conversion state & hook
  const convertLeadMutation = useConvertLeadToCustomer();
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('0.00');

  // Pre-fill form when lead details load
  React.useEffect(() => {
    if (lead) {
      if (lead.opening_balance !== undefined && lead.opening_balance !== null) {
        setOpeningBalance(String(lead.opening_balance));
      }
      if (lead.verification_details) {
        const details = lead.verification_details;
        if (details.number_of_properties !== undefined && details.number_of_properties !== null) {
          setNumProperties(String(details.number_of_properties));
        }
        if (details.currently_purchasing_from) {
          setCurrentlyPurchasingFrom(details.currently_purchasing_from);
        }
        if (details.verification_notes) {
          setVerificationNotes(details.verification_notes);
        }
        if (Array.isArray(details.cities_of_operation)) {
          const parsedCities: SelectedCity[] = details.cities_of_operation.map((cityName: string) => {
            const cleanQuotes = (str: string) => str.trim().replace(/^['"]|['"]$/g, '').trim();
            const cleanedCityName = cleanQuotes(cityName);
            const commaIdx = cleanedCityName.indexOf(',');
            const name = commaIdx !== -1 ? cleanedCityName.substring(0, commaIdx).trim() : cleanedCityName;
            return {
              id: cityName,
              name: name,
              label: cleanedCityName,
            };
          });
          setSelectedCities(parsedCities);
        }
      }
    }
  }, [lead]);

  const handleAddCity = (city: SelectedCity) => {
    setSelectedCities((prev) => [...prev, city]);
  };

  const handleRemoveCity = (cityId: string | number) => {
    setSelectedCities((prev) => prev.filter((c) => String(c.id) !== String(cityId)));
  };

  const handleSubmit = async () => {
    if (!numProperties.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter the number of properties.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        number_of_properties: parseInt(numProperties, 10) || 0,
        cities_of_operation: selectedCities.map((c) => c.label || c.name),
        currently_purchasing_from: currentlyPurchasingFrom,
        verification_notes: verificationNotes,
      };

      console.log('[LeadVerify] Submit payload:', payload);

      const hasVerificationDetails = !!lead?.verification_details;

      await verifyLeadMutation.mutateAsync({
        id: params.id,
        data: payload,
        isUpdate: hasVerificationDetails,
      });

      Toast.show({
        type: 'success',
        text1: 'Verification Successful',
        text2: 'Lead verification details updated successfully',
      });

      navigation.goBack();
    } catch (err: any) {
      console.error('[LeadVerify] Submit error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update verification details';
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvert = async () => {
    try {
      const balanceNum = parseFloat(openingBalance) || 0;
      const payload = {
        opening_balance: balanceNum,
        number_of_properties: parseInt(numProperties, 10) || 0,
        cities_of_operation: selectedCities.map((c) => c.label || c.name),
        currently_purchasing_from: currentlyPurchasingFrom,
        verification_notes: verificationNotes,
      };

      await convertLeadMutation.mutateAsync({
        id: params.id,
        data: payload,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Lead successfully converted to customer',
      });

      setConvertModalVisible(false);
      navigation.goBack();
    } catch (err: any) {
      console.error('[LeadVerify] Convert error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to convert lead to customer';
      Toast.show({
        type: 'error',
        text1: 'Conversion Failed',
        text2: msg,
      });
    }
  };

  const isFormValid = true; // button always active
  const isPending = isSubmitting || verifyLeadMutation.isPending;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 52 : 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Verify Lead Details</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {leadName}
          </Text>
        </View>
        {lead?.is_verified && lead?.lead_type !== 'CUSTOMER' ? (
          <TouchableOpacity
            style={[styles.convertBtn, { backgroundColor: primaryColor }]}
            onPress={() => setConvertModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.convertBtnText}>Convert to Customer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.verifyBadge, { backgroundColor: primaryColor + '18', borderColor: primaryColor + '40' }]}
            onPress={() => {}}
            disabled={true}
            activeOpacity={1}
          >
            <Ionicons name="shield-checkmark-outline" size={14} color={primaryColor} />
            <Text style={[styles.verifyBadgeText, { color: primaryColor }]}>
              {lead?.lead_type === 'CUSTOMER' ? 'Customer' : 'Verify'}
            </Text>
          </TouchableOpacity>
        )}
      </View>


      {isLoadingDetails ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }}>
            Loading lead verification details...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 90, 110), paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >


          {/* ── Number of Properties ── */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Number of Properties</Text>
              <Text style={[styles.requiredStar, { color: COLORS.danger }]}>*</Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                numProperties.length > 0 && { borderColor: primaryColor },
              ]}
              placeholder="Enter number of properties"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={numProperties}
              onChangeText={setNumProperties}
              returnKeyType="next"
            />
          </View>

          {/* ── Cities of Operation ── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Cities of Operation</Text>
            <CityDropdown
              selectedCities={selectedCities}
              onAdd={handleAddCity}
              onRemove={handleRemoveCity}
              primaryColor={primaryColor}
            />
          </View>

          {/* ── Currently Purchasing From ── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Currently Purchasing From</Text>
            <TextInput
              style={[
                styles.textInput,
                currentlyPurchasingFrom.length > 0 && { borderColor: primaryColor },
              ]}
              placeholder="Enter Currently Purchasing From"
              placeholderTextColor="#94A3B8"
              value={currentlyPurchasingFrom}
              onChangeText={setCurrentlyPurchasingFrom}
              returnKeyType="next"
            />
          </View>

          {/* ── Verification Notes ── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Verification Notes</Text>
            <TextInput
              style={[
                styles.textArea,
                verificationNotes.length > 0 && { borderColor: primaryColor },
              ]}
              placeholder="Add any additional verification notes here..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={verificationNotes}
              onChangeText={setVerificationNotes}
            />
          </View>
        </ScrollView>
      )}

      {/* ── Bottom Action Bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: primaryColor },
            (isPending || isLoadingDetails) && { opacity: 0.6 }
          ]}
          onPress={handleSubmit}
          disabled={isPending || isLoadingDetails}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Submit Verification</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Convert to Customer Modal */}
      <Modal
        visible={convertModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!convertLeadMutation.isPending) setConvertModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Convert Lead to Customer</Text>
            <Text style={styles.modalSubtitle}>
              This will permanently convert this lead to a customer. Please enter the opening balance for this new customer.
            </Text>

            <View style={styles.modalFieldGroup}>
              <View style={styles.modalFieldLabelRow}>
                <Text style={styles.modalFieldLabel}>OPENING BALANCE (₹)</Text>
                <Text style={{ color: COLORS.danger, fontWeight: '700' }}> *</Text>
              </View>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={openingBalance}
                onChangeText={setOpeningBalance}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.modalInputSubtext}>
                Enter the initial balance for this customer's ledger.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setConvertModalVisible(false)}
                disabled={convertLeadMutation.isPending}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  { backgroundColor: primaryColor },
                  convertLeadMutation.isPending && { opacity: 0.6 }
                ]}
                onPress={handleConvert}
                disabled={convertLeadMutation.isPending}
              >
                {convertLeadMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Convert to Customer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

// ─── City Dropdown Styles ─────────────────────────────────────────────────────

const cs = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 120,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 16,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  clearBtn: { flexDirection: 'row', alignItems: 'center' },
  clearText: { fontSize: 12, fontWeight: '700', color: COLORS.danger },
  sheetDivider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    paddingVertical: 0,
  },
  optionList: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionPrimary: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionSecondary: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 1,
  },
  optionSep: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 8 },
  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      gap: 10,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 9,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    headerTextBlock: { flex: 1 },
    headerTitle: {
      fontSize: 16,
      fontWeight: '900',
      color: '#0F172A',
      letterSpacing: 0.2,
    },
    headerSubtitle: {
      fontSize: 12,
      color: '#64748B',
      fontWeight: '500',
      marginTop: 2,
    },
    verifyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    verifyBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    scroll: { flex: 1, paddingHorizontal: 16 },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderLeftWidth: 3,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 20,
    },
    infoBannerText: {
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    fieldGroup: { marginBottom: 18 },
    fieldLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 3 },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: '#374151',
      letterSpacing: 0.1,
      marginBottom: 8,
    },
    requiredStar: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    textInput: {
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 14,
      fontWeight: '500',
      color: '#1E293B',
      backgroundColor: '#FFFFFF',
    },
    textArea: {
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingTop: 13,
      paddingBottom: 13,
      fontSize: 14,
      fontWeight: '500',
      color: '#1E293B',
      backgroundColor: '#FFFFFF',
      minHeight: 110,
    },
    bottomBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#64748B',
    },
    submitBtn: {
      flex: 2,
      height: 48,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    convertBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    convertBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      width: '100%',
      maxWidth: 360,
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
      marginBottom: 10,
    },
    modalSubtitle: {
      fontSize: 14,
      color: '#64748B',
      lineHeight: 20,
      marginBottom: 20,
    },
    modalFieldGroup: {
      marginBottom: 20,
    },
    modalFieldLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    modalFieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: '#475569',
      letterSpacing: 0.5,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      fontWeight: '500',
      color: '#1E293B',
      backgroundColor: '#FFFFFF',
    },
    modalInputSubtext: {
      fontSize: 12,
      color: '#64748B',
      fontStyle: 'italic',
      marginTop: 6,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    modalCancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#D1D5DB',
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 80,
    },
    modalCancelBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#374151',
    },
    modalSubmitBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 120,
    },
    modalSubmitBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

