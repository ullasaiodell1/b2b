import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COMPANIES = ['Ullas India IT Solutions Limited.', 'Zenith System Pvt. Ltd.', 'NovaTech Solutions Pvt. Ltd.'];
const RECIPIENTS = ['Parth Solanki', 'Khushal Nadiyapara', 'Arjun Maheta'];

export default function AddEmailScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { referrer, leadId } = route.params ?? {};
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (referrer === 'lead-details' && leadId) {
      navigation.navigate('leads', {
        screen: 'lead-details',
        params: { id: leadId }
      } as any);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (referrer === 'lead-details' && leadId) {
          navigation.navigate('leads', {
            screen: 'lead-details',
            params: { id: leadId }
          } as any);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [referrer, leadId])
  );

  const [subject, setSubject] = useState('');
  const [company, setCompany] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [body, setBody] = useState('');

  const [activePicker, setActivePicker] = useState<'company' | 'sentTo' | null>(null);

  // Keyboard visibility state
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

  const handleSelectOption = (value: string) => {
    if (activePicker === 'company') setCompany(value);
    else if (activePicker === 'sentTo') setSentTo(value);
    setActivePicker(null);
  };

  const handleSave = () => {
    if (!subject || !body) {
      Alert.alert('Required Fields', 'Please fill in Subject and Email Body.');
      return;
    }

    Alert.alert('Success', 'Email sent successfully!', [
      { text: 'OK', onPress: handleBack }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>EMAIL</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: keyboardVisible ? 200 : 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Subject <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Subject Line"
              placeholderTextColor="#9CA3AF"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Company Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Name</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('company')}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !company && styles.placeholderText]}>
                {company || 'Select Company Name'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Sent To */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sent To</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setActivePicker('sentTo')}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !sentTo && styles.placeholderText]}>
                {sentTo || 'Select Recipient'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Email Body */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Email Body <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Type your message details here..."
              placeholderTextColor="#9CA3AF"
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ── SAVE BUTTON ───────────────────────── */}
        <View style={styles.nonStickySaveContainer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                Select {activePicker === 'company' ? 'Company' : 'Recipient'}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(activePicker === 'company' ? COMPANIES : RECIPIENTS).map((opt) => (
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
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
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
    gap: 5,
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
  multilineInput: {
    height: 120,
    paddingVertical: 12,
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
  nonStickySaveContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  saveBtn: {
    backgroundColor: COLORS.saveBtnBg,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
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
