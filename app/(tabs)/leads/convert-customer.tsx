import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useConvertLeadToCustomer, useLeadDetails } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
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

// ─── Main Screen Component ───────────────────────────────────────────────────
export default function ConvertCustomerScreen() {
  const theme = useTheme();
  const primaryColor = theme.primaryColor || '#2563EB';
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params ?? {};
  const insets = useSafeAreaInsets();

  const leadName: string = params.leadName || params.name || 'Lead';

  // API hooks
  const { data: lead, isLoading: isLoadingDetails } = useLeadDetails(params.id);
  const convertLeadMutation = useConvertLeadToCustomer();

  // Form states
  const [openingBalance, setOpeningBalance] = useState('0.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Pre-fill form when lead details load
  React.useEffect(() => {
    if (lead) {
      if (lead.opening_balance !== undefined && lead.opening_balance !== null) {
        setOpeningBalance(String(lead.opening_balance));
      }
    }
  }, [lead]);

  const handleConvert = async () => {
    if (!openingBalance.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter the opening balance.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const balanceNum = parseFloat(openingBalance) || 0;

      // Preserve existing verification details from the lead object
      const payload = {
        opening_balance: balanceNum,
        number_of_properties: lead?.verification_details?.number_of_properties ?? 0,
        cities_of_operation: lead?.verification_details?.cities_of_operation ?? [],
        currently_purchasing_from: lead?.verification_details?.currently_purchasing_from ?? '',
        verification_notes: lead?.verification_details?.verification_notes ?? '',
      };

      console.log('[ConvertCustomer] Convert payload:', payload);

      await convertLeadMutation.mutateAsync({
        id: params.id,
        data: payload,
      });

      Toast.show({
        type: 'success',
        text1: 'Conversion Successful',
        text2: 'Lead converted to customer successfully',
      });

      navigation.popToTop();
    } catch (err: any) {
      console.error('[ConvertCustomer] Convert error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to convert lead to customer';
      Toast.show({
        type: 'error',
        text1: 'Conversion Failed',
        text2: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 52 : 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Convert Lead to Customer</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {leadName}
          </Text>
        </View>
      </View>

      {isLoadingDetails ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }}>
            Loading lead details...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: keyboardVisible ? 240 : Math.max(insets.bottom + 30, 40), paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Opening Balance ── */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Opening Balance (₹)</Text>
              <Text style={[styles.requiredStar, { color: COLORS.danger }]}>*</Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                openingBalance.length > 0 && { borderColor: '#2563EB' },
              ]}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              onSubmitEditing={handleConvert}
            />
            <Text style={styles.inputSubtext}>
              Enter the initial balance for this customer's ledger transactions.
            </Text>
          </View>

          {/* ── Bottom Action Button ── */}
          <View style={styles.bottomBarInline}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: '#2563EB' },
                (isSubmitting || convertLeadMutation.isPending) && { opacity: 0.6 }
              ]}
              onPress={handleConvert}
              disabled={isSubmitting || convertLeadMutation.isPending}
              activeOpacity={0.85}
            >
              {isSubmitting || convertLeadMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Convert to Customer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── Screen Styling ──────────────────────────────────────────────────────────
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
    scroll: { flex: 1, paddingHorizontal: 16 },
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
    inputSubtext: {
      fontSize: 11.5,
      color: '#64748B',
      fontStyle: 'italic',
      marginTop: 6,
    },
    bottomBarInline: {
      flexDirection: 'row',
      paddingTop: 12,
      gap: 10,
      marginTop: 20,
    },
    submitBtn: {
      flex: 1,
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
  });
