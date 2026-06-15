import { CustomTimePicker } from '@/components/custom/CustomTimePicker';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateCall } from '@/hooks/useCalls';
import { useLeads } from '@/hooks/useLeads';
import { useUpload } from '@/hooks/useUpload';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddCallScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const routeParams = useLocalSearchParams<{
    leadId?: string;
    leadName?: string;
    phone?: string;
  }>();
  const insets = useSafeAreaInsets();

  const { mutateAsync: addCall, isPending: isAdding } = useCreateCall();
  const { data: rawLeads = [], isLoading: isLeadsLoading } = useLeads();

  const leads = React.useMemo(() => {
    return rawLeads.map((item: any) => {
      let priority: 'High' | 'Normal' | 'Low' = 'Normal';
      const rawPriority = (item.priority || '').toUpperCase();
      if (rawPriority === 'HOT' || rawPriority === 'HIGH') priority = 'High';
      else if (rawPriority === 'WARM' || rawPriority === 'NORMAL') priority = 'Normal';
      else if (rawPriority === 'COLD' || rawPriority === 'LOW') priority = 'Low';

      const tag = (item.tags && Array.isArray(item.tags) && item.tags[0]?.name)
        || item.tag
        || '';

      return {
        id: String(item.id),
        name: item.name || '',
        company: item.company_name || item.company || '',
        email: item.email || '',
        phone: item.phone || '',
        tag: tag,
        priority: priority,
        owner: item.assigned_to_name || item.owner || '',
        status: item.status_name || item.status || '',
        source: item.source_name || item.source || '',
        ...item,
      } as any;
    });
  }, [rawLeads]);

  const uploadMutation = useUpload();
  const [isUploading, setIsUploading] = useState(false);

  const [callType, setCallType] = useState<'Outbound' | 'Inbound' | 'Missed'>('Outbound');
  const [showCallTypeModal, setShowCallTypeModal] = useState(false);

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadName, setSelectedLeadName] = useState<string | null>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [recordingName, setRecordingName] = useState<string | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');

  // Keyboard visibility state
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
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

  // Initialize selected lead from parameters
  useEffect(() => {
    if (routeParams.leadId) {
      setSelectedLeadId(routeParams.leadId);
      setSelectedLeadName(routeParams.leadName || 'Selected Lead');
    }
  }, [routeParams.leadId, routeParams.leadName]);

  const formatDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours} : ${minutes} : ${seconds}`;
  };

  const handleRecordingPick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const pickedAsset = res.assets[0];
        setRecordingName(pickedAsset.name);
        setIsUploading(true);
        try {
          const uploadRes = await uploadMutation.mutateAsync({
            uri: pickedAsset.uri,
            fileName: pickedAsset.name,
            type: pickedAsset.mimeType || 'audio/mpeg',
          });
          console.log('[Recording Upload Success]:', uploadRes);
          const url = uploadRes?.url || uploadRes?.data?.url || uploadRes?.filePath || '';
          setRecordingUri(url);
        } catch (err: any) {
          console.error('[Recording Upload Error]:', err);
          Alert.alert('Upload Failed', err?.message || 'Failed to upload recording file.');
          setRecordingName(null);
          setRecordingUri(null);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (err) {
      console.log('Error picking recording:', err);
    }
  };

  const handleSave = async () => {
    if (!selectedLeadId) {
      Alert.alert('Required Fields', 'Please select a Lead.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Required Fields', 'Please fill in Subject.');
      return;
    }

    // Compute duration in MM:SS format
    const diffMs = endTime && endTime.getTime() > startTime.getTime()
      ? endTime.getTime() - startTime.getTime()
      : 0;
    const diffSecs = Math.round(diffMs / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    try {
      await addCall({
        lead_id: selectedLeadId,
        name: subject,
        type: callType === 'Outbound' ? 'Outgoing' : callType === 'Inbound' ? 'Incoming' : 'Missed',
        duration: durationStr,
        remarks: remarks || undefined,
        recordingUrl: recordingUri || undefined,
      });

      Alert.alert('Success', 'Call log created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error('[AddCallScreen handleSave Error]:', err);
      Alert.alert('Error', err?.message || 'Failed to create call log.');
    }
  };

  // Filter leads list for modal search
  const filteredLeads = leads.filter((lead: any) => {
    const query = leadSearchQuery.toLowerCase();
    const nameMatch = (lead.name || '').toLowerCase().includes(query);
    const companyMatch = (lead.company || '').toLowerCase().includes(query);
    return nameMatch || companyMatch;
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

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
            <Text style={{ color: theme.primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>CALL</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: keyboardVisible ? 200 : 30, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Lead Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Lead <Text style={{ color: theme.primaryColor }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowLeadModal(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !selectedLeadId && styles.placeholderText]}>
                {selectedLeadName || 'Select a lead'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowCallTypeModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.pickerValueText}>{callType}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Date <Text style={{ color: theme.primaryColor }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.pickerValueText}>{formatDate(date)}</Text>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) {
                    setDate(selected);
                  }
                }}
              />
            )}
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Subject <Text style={{ color: theme.primaryColor }}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief description of the call"
              placeholderTextColor="#9CA3AF"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Start Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Start Time <Text style={{ color: theme.primaryColor }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowStartTimePicker(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.pickerValueText}>{formatTime(startTime)}</Text>
              <Ionicons name="time-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            <CustomTimePicker
              visible={showStartTimePicker}
              onClose={() => setShowStartTimePicker(false)}
              selectedDate={startTime}
              onSelect={(selected) => {
                setShowStartTimePicker(false);
                setStartTime(selected);
              }}
            />
          </View>

          {/* End Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>End Time</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowEndTimePicker(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.pickerValueText, !endTime && styles.placeholderText]}>
                {endTime ? formatTime(endTime) : '-- : -- : --'}
              </Text>
              <Ionicons name="time-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            <CustomTimePicker
              visible={showEndTimePicker}
              onClose={() => setShowEndTimePicker(false)}
              selectedDate={endTime || new Date()}
              onSelect={(selected) => {
                setShowEndTimePicker(false);
                setEndTime(selected);
              }}
            />
          </View>

          {/* Recording */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recording</Text>
            <TouchableOpacity
              style={styles.uploadDropzone}
              onPress={isUploading ? undefined : handleRecordingPick}
              activeOpacity={isUploading ? 1 : 0.8}
            >
              <View style={styles.uploadIconContainer}>
                <Ionicons name="mic-outline" size={20} color={theme.primaryColor} />
              </View>
              <View style={styles.uploadTextContainer}>
                <Text style={styles.uploadTitleText} numberOfLines={1}>
                  {isUploading ? 'Uploading recording...' : (recordingName || 'Select audio file or upload recording')}
                </Text>
                <Text style={styles.uploadSubText}>
                  {isUploading ? 'Please wait...' : 'MP3, WAV or M4A – max 20MB'}
                </Text>
              </View>
              {isUploading ? (
                <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginRight: 8 }} />
              ) : (
                <TouchableOpacity style={styles.browseBtn} activeOpacity={0.8} onPress={handleRecordingPick}>
                  <Text style={styles.browseBtnText}>Browse</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Remarks */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Remarks</Text>
            <TextInput
              style={[styles.textInput, { height: 80, paddingTop: 10 }]}
              placeholder="Enter remarks..."
              placeholderTextColor="#9CA3AF"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ── SAVE BUTTON ───────────────────────── */}
        <View style={styles.nonStickySaveContainer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={isAdding ? undefined : handleSave}
            activeOpacity={0.85}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>SAVE</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* TYPE DROPDOWN MODAL */}
      <Modal transparent animationType="slide" visible={showCallTypeModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCallTypeModal(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Type</Text>
              <TouchableOpacity onPress={() => setShowCallTypeModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {['Outbound', 'Inbound', 'Missed'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalRowItem}
                  onPress={() => {
                    setCallType(opt as any);
                    setShowCallTypeModal(false);
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

      {/* LEAD SELECTION MODAL */}
      <Modal transparent animationType="slide" visible={showLeadModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLeadModal(false)}
        >
          <View style={[styles.modalContent, { maxHeight: '60%', paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Lead</Text>
              <TouchableOpacity onPress={() => setShowLeadModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Search Input for Leads inside Modal */}
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search lead by name or company..."
                placeholderTextColor="#9CA3AF"
                value={leadSearchQuery}
                onChangeText={setLeadSearchQuery}
              />
              {leadSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setLeadSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {isLeadsLoading ? (
              <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={{ paddingHorizontal: 20 }}>
                {filteredLeads.map((lead: any) => (
                  <TouchableOpacity
                    key={lead.id}
                    style={styles.modalRowItem}
                    onPress={() => {
                      setSelectedLeadId(lead.id);
                      setSelectedLeadName(lead.name);
                      setShowLeadModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalRowText}>{lead.name}</Text>
                      {lead.company ? (
                        <Text style={{ fontSize: 11, color: COLORS.textMuted }}>{lead.company}</Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))}
                {filteredLeads.length === 0 && (
                  <Text style={{ textAlign: 'center', marginVertical: 20, color: COLORS.textMuted }}>No leads found.</Text>
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    paddingHorizontal: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginBottom: 10,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  formContainer: {
    gap: 5,
  },
  inputGroup: {
    gap: 4,
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
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  nonStickySaveContainer: {
    marginTop: 16,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
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
    maxHeight: '60%',
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
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    height: '100%',
  },
  uploadDropzone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.primaryColor,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    gap: 5,
  },
  uploadIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextContainer: {
    flex: 1,
    gap: 5,
  },
  uploadTitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  uploadSubText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  browseBtn: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  browseBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.primaryColor,
  },
});
