import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  LeadContact,
  useCreateLeadContact,
  useDeleteLeadContact,
  useLeadContacts,
  useUpdateLeadContact,
} from '@/hooks/useContacts';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LeadContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles: any = getStyles(theme);

  const params = useLocalSearchParams<{
    leadId?: string;
    leadName?: string;
    openAdd?: string;
  }>();
  const leadId = params.leadId || '';
  const leadName = params.leadName || 'Lead';

  // UI state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<LeadContact | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToPhone, setSaveToPhone] = useState(false);

  // ── API hooks ──────────────────────────────────────────────────
  const {
    data: contacts = [],
    isLoading,
    isRefetching,
    refetch,
  } = useLeadContacts(leadId);

  const createMutation = useCreateLeadContact(leadId);
  const updateMutation = useUpdateLeadContact(leadId);
  const deleteMutation = useDeleteLeadContact(leadId);

  // Auto-open modal if navigated with openAdd param
  useEffect(() => {
    if (params.openAdd === 'true') {
      openAddModal();
    }
  }, [params.openAdd]);

  // ── Modal helpers ──────────────────────────────────────────────
  const openAddModal = () => {
    setSelectedContact(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setDesignation('');
    setDepartment('');
    setNotes('');
    setIsPrimary(contacts.length === 0);
    setSaveToPhone(false);
    setModalVisible(true);
  };

  const openEditModal = (contact: LeadContact) => {
    setSelectedContact(contact);
    setFullName(contact.fullName);
    setEmail(contact.email);
    setPhone(contact.phone);
    setDesignation(contact.designation);
    setDepartment(contact.department);
    setNotes(contact.notes);
    setIsPrimary(contact.isPrimary);
    setSaveToPhone(false);
    setModalVisible(true);
  };

  const formatErrorMessage = (err: any, defaultMsg: string) => {
    if (!err) return defaultMsg;
    let errorMsg = err.message || defaultMsg;
    if (err.details && typeof err.details === 'object') {
      const details = err.details;
      const messages: string[] = [];

      for (const key of ['body', 'params', 'query']) {
        if (details[key] && typeof details[key] === 'object') {
          Object.values(details[key]).forEach((val: any) => {
            if (typeof val === 'string') {
              messages.push(val);
            }
          });
        }
      }

      if (Array.isArray(details)) {
        details.forEach((d: any) => {
          if (d?.message) {
            messages.push(d.message);
          }
        });
      }

      if (messages.length > 0) {
        errorMsg = messages.join('\n');
      }
    } else if (err.error) {
      errorMsg = err.error;
    }
    return errorMsg;
  };

  const saveToDeviceContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        const contact: Contacts.Contact = {
          contactType: Contacts.ContactTypes.Person,
          name: fullName.trim(),
          firstName: firstName,
          lastName: lastName,
          phoneNumbers: [
            {
              number: phone.trim(),
              label: 'mobile',
            },
          ],
          emails: email.trim()
            ? [
                {
                  email: email.trim(),
                  label: 'work',
                },
              ]
            : [],
          jobTitle: designation.trim(),
          department: department.trim(),
          note: notes.trim(),
        };

        try {
          await Contacts.addContactAsync(contact);
        } catch (addErr: any) {
          console.warn('Direct contact add failed (e.g. Android 16 cloud default restrictions), trying to present form:', addErr);
          try {
            await Contacts.presentFormAsync(null, contact);
          } catch (formErr: any) {
            throw new Error(`Failed to save contact programmatically and native form failed: ${formErr.message || formErr}`);
          }
        }
      } else {
        Alert.alert(
          'Permission Denied',
          'Permission to access contacts was denied. The contact was saved in the app, but not on your phone.'
        );
      }
    } catch (deviceErr: any) {
      console.error('Failed to save to device contacts:', deviceErr);
      Alert.alert(
        'Device Save Failed',
        `Failed to save contact to phone contacts: ${deviceErr?.message || 'Unknown error'}`
      );
    }
  };

  // ── Save (create or update) ────────────────────────────────────
  const handleSaveContact = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone is required.');
      return;
    }
    if (phone.trim().length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        department: department.trim(),
        notes: notes.trim(),
        is_primary: isPrimary,
      };

      if (selectedContact) {
        await updateMutation.mutateAsync({
          contactId: selectedContact.id,
          data: payload,
        });
        if (saveToPhone) {
          await saveToDeviceContacts();
        }
        Alert.alert('Success', 'Contact updated.');
      } else {
        await createMutation.mutateAsync(payload);
        if (saveToPhone) {
          await saveToDeviceContacts();
        }
        Alert.alert('Success', 'Contact added.');
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', formatErrorMessage(err, 'Failed to save contact.'));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDeleteContact = (id: string, name: string) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(id, {
              onError: (err: any) => {
                Alert.alert('Error', formatErrorMessage(err, 'Failed to delete contact.'));
              },
            });
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>CON</Text>
            <Text style={{ color: COLORS.textDark }}>TACTS</Text>
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {leadName}
          </Text>
        </View>

        {/* Balanced space placeholder */}
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.primaryColor]}
            tintColor={theme.primaryColor}
          />
        }
      >
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
          </View>
        ) : contacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={38} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No contacts found</Text>
            <Text style={styles.emptySubText}>
              Tap the "+" button at the bottom to add lead contacts
            </Text>
          </View>
        ) : (
          contacts.map((item: LeadContact) => {
            const initial = item.fullName.charAt(0).toUpperCase();
            const isDeleting =
              deleteMutation.isPending && deleteMutation.variables === item.id;

            return (
              <View key={item.id} style={styles.contactCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <View style={[styles.cardAvatarBg, { backgroundColor: COLORS.avatarBg || '#C9E4D4' }]}>
                      <Text style={[styles.cardAvatarText, { color: theme.primaryColor }]}>{initial}</Text>
                    </View>
                    <View style={styles.nameContainer}>
                      <Text style={styles.cardFullName}>{item.fullName}</Text>
                      {item.isPrimary && (
                        <View style={styles.cardPrimaryBadge}>
                          <Text style={styles.cardPrimaryText}>PRIMARY CONTACT</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.cardActionBtn} activeOpacity={0.7}>
                      <Ionicons name="pencil-outline" size={16} color={COLORS.textDark} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteContact(item.id, item.fullName)}
                      style={[styles.cardActionBtn, styles.deleteBtn]}
                      activeOpacity={0.7}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color={COLORS.danger || '#EF4444'} />
                      ) : (
                        <Ionicons name="trash-outline" size={16} color={COLORS.danger || '#EF4444'} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Email & Phone */}
                <View style={styles.cardGridRow}>
                  <TouchableOpacity
                    style={{ flex: 1.1, paddingRight: 8 }}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (item.email && item.email !== '----') {
                        Linking.openURL(`mailto:${item.email}`);
                      }
                    }}
                  >
                    <Text style={styles.fieldLabel}>Email</Text>
                    <Text style={[styles.fieldValue, item.email ? { color: '#2563EB', textDecorationLine: 'underline', fontWeight: '700' } : null]} numberOfLines={2}>
                      {item.email || '----'}
                    </Text>
                  </TouchableOpacity>
                  <View style={{ width: 1, backgroundColor: COLORS.border, alignSelf: 'stretch' }} />
                  <TouchableOpacity
                    style={{ flex: 0.9, paddingLeft: 12 }}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (item.phone && item.phone !== '----') {
                        Linking.openURL(`tel:${item.phone}`);
                      }
                    }}
                  >
                    <Text style={styles.fieldLabel}>Phone Number</Text>
                    <Text style={[styles.fieldValue, item.phone ? { color: '#16A34A', textDecorationLine: 'underline', fontWeight: '700' } : null]}>
                      {item.phone || '----'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Designation */}
                <View style={styles.cardSingleRow}>
                  <Text style={styles.fieldLabel}>Designation</Text>
                  <Text style={styles.fieldValue}>{item.designation || '----'}</Text>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Department */}
                <View style={styles.cardSingleRow}>
                  <Text style={styles.fieldLabel}>Department</Text>
                  <Text style={styles.fieldValue}>{item.department || '----'}</Text>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Notes */}
                <View style={styles.cardSingleRow}>
                  <Text style={styles.fieldLabel}>Notes</Text>
                  <Text style={styles.fieldValue} numberOfLines={0}>{item.notes || '----'}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ADD / EDIT MODAL */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBackBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
              </TouchableOpacity>

              <View style={styles.modalHeaderCenter}>
                <Text style={styles.modalTitle}>
                  {selectedContact ? 'EDIT CONTACT' : 'ADD CONTACT'}
                </Text>
                <Text style={styles.modalSubTitle} numberOfLines={1}>
                  {leadName}
                </Text>
              </View>

              {/* Balanced space placeholder */}
              <View style={{ width: 36 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.formContainer, { padding: 16, paddingBottom: 40 }]}
            >
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Full Name <Text style={{ color: COLORS.danger }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter full name"
                  placeholderTextColor={COLORS.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email & Phone */}
              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>
                    Email <Text style={{ color: COLORS.danger }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter email address"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>
                    Phone <Text style={{ color: COLORS.danger }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="9876543210"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Designation & Department */}
              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Designation</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter designation"
                    placeholderTextColor={COLORS.textMuted}
                    value={designation}
                    onChangeText={setDesignation}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Department</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter department"
                    placeholderTextColor={COLORS.textMuted}
                    value={department}
                    onChangeText={setDepartment}
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Enter notes"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {/* Primary switch */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mark as Primary Contact</Text>
                <Switch
                  value={isPrimary}
                  onValueChange={setIsPrimary}
                  trackColor={{ false: '#CBD5E1', true: theme.primaryColor + '80' }}
                  thumbColor={isPrimary ? theme.primaryColor : '#F1F5F9'}
                />
              </View>

              {/* Save to Phone switch */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Save to Phone Contacts</Text>
                <Switch
                  value={saveToPhone}
                  onValueChange={setSaveToPhone}
                  trackColor={{ false: '#CBD5E1', true: theme.primaryColor + '80' }}
                  thumbColor={saveToPhone ? theme.primaryColor : '#F1F5F9'}
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={[styles.modalActionsRow, { paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom + 8, 16) }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primaryColor }]}
                onPress={handleSaveContact}
                activeOpacity={0.85}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom + 24, 30) }]}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bgPage },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: COLORS.bgWhite,
      paddingHorizontal: 10,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: '#F4F7F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
    headerTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 0.4 },
    headerSub: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', maxWidth: 180 },
    headerAddBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: '#F4F7F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fab: {
      position: 'absolute',
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    scrollContent: { padding: 5 },
    contactCard: {
      backgroundColor: COLORS.bgWhite,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    avatarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    cardAvatarBg: {
      width: 38,
      height: 38,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E5ECE9',
    },
    cardAvatarText: {
      fontSize: 15,
      fontWeight: '800',
    },
    nameContainer: {
      flex: 1,
      gap: 2,
    },
    cardFullName: {
      fontSize: 13.5,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    cardPrimaryBadge: {
      backgroundColor: '#EAF4EE',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    cardPrimaryText: {
      fontSize: 8,
      fontWeight: '800',
      color: '#059669',
      letterSpacing: 0.2,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
    },
    cardActionBtn: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    deleteBtn: {
      backgroundColor: '#FEF2F2',
      borderColor: '#FEE2E2',
    },
    cardDivider: {
      height: 1,
      backgroundColor: COLORS.border,
      marginVertical: 10,
    },
    cardGridRow: {
      flexDirection: 'row',
    },
    cardSingleRow: {
      gap: 2,
    },
    fieldLabel: {
      fontSize: 10.5,
      fontWeight: '800',
      color: COLORS.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fieldValue: {
      fontSize: 12.5,
      fontWeight: '700',
      color: COLORS.textDark,
      marginTop: 2,
    },
    emptyContainer: {
      paddingVertical: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.textDark,
      marginTop: 8,
    },
    emptySubText: {
      fontSize: 11,
      color: COLORS.textMuted,
      fontWeight: '600',
      marginTop: 4,
      textAlign: 'center',
      paddingHorizontal: 20,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: COLORS.bgPage,
    },
    modalContent: {
      flex: 1,
      backgroundColor: COLORS.bgPage,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: COLORS.bgWhite,
      paddingHorizontal: 10,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    modalBackBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: '#F4F7F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalHeaderCenter: {
      flex: 1,
      alignItems: 'center',
      gap: 1,
    },
    modalTitle: {
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: 0.4,
      color: COLORS.textDark,
    },
    modalSubTitle: {
      fontSize: 11,
      color: COLORS.textMuted,
      fontWeight: '600',
      maxWidth: 180,
    },
    formContainer: { gap: 16 },
    formRow: { flexDirection: 'row', gap: 12 },
    inputGroup: { gap: 3 },
    inputLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    textInput: {
      height: 40,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: '#E2E8F0',
      paddingHorizontal: 12,
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.textDark,
      backgroundColor: '#FAFAFA',
    },
    notesInput: {
      height: 68,
      paddingTop: 8,
      textAlignVertical: 'top',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: '#E2E8F0',
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginTop: 4,
    },
    switchLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    modalActionsRow: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: COLORS.bgWhite,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      paddingTop: 12,
    },
    cancelBtn: {
      flex: 1,
      height: 42,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    cancelBtnText: {
      fontSize: 13.5,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    saveBtn: {
      flex: 1.2,
      height: 42,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtnText: {
      fontSize: 13.5,
      fontWeight: '900',
      color: '#FFFFFF',
    },
  });
