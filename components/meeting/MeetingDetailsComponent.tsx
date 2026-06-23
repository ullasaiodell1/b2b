import { MeetingRecord, meetingsState, subscribeToMeetings, updateMeetingsState } from '@/components/meeting/MeetingState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface MeetingDetailsComponentProps {
  id: string;
  onBack?: () => void;
  hideHeader?: boolean;
}

export const MeetingDetailsComponent: React.FC<MeetingDetailsComponentProps> = ({
  id,
  onBack,
  hideHeader = false,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [meeting, setMeeting] = useState<MeetingRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'RELATED' | 'DETAILS'>('RELATED');
  const [showAllFields, setShowAllFields] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Subscribe to state updates so updates reflect instantly
  useEffect(() => {
    const fetchMeeting = () => {
      const found = meetingsState.find((m) => m.id === id);
      if (found) {
        setMeeting({ ...found });
      } else if (meetingsState.length > 0) {
        setMeeting({ ...meetingsState[0] });
      }
    };

    fetchMeeting();
    return subscribeToMeetings(fetchMeeting);
  }, [id]);

  if (!meeting) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Meeting details not found...</Text>
      </View>
    );
  }

  // Mappers
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Complete':
      case 'Completed':
        return { color: COLORS.success, label: 'Completed' };
      case 'In-Process':
      case 'In Process':
        return { color: COLORS.info, label: 'In Process' };
      case 'Pending':
      default:
        return { color: COLORS.danger, label: 'Pending' };
    }
  };

  const getMeetingType = (meeting: MeetingRecord) => {
    const titleLower = meeting.title.toLowerCase();
    if (titleLower.includes('demo')) return 'Demo Meeting';
    if (titleLower.includes('support') || titleLower.includes('issue')) return 'In-Person Meeting';
    if (meeting.location === 'Online') return 'Video Meeting';
    if (meeting.location === 'In-Person') return 'In-Person Meeting';
    return 'Video Meeting';
  };

  // Actions for adding notes and attachments dynamically
  const handleAddNote = () => {
    setNewNoteText('');
    setNoteModalVisible(true);
  };

  const handleSaveNote = () => {
    if (newNoteText.trim() && meeting) {
      const updated = meetingsState.map((m) => {
        if (m.id === meeting.id) {
          return {
            ...m,
            notes: [...m.notes, newNoteText.trim()],
            modifiedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return m;
      });
      updateMeetingsState(updated);
      setNewNoteText('');
      setNoteModalVisible(false);
    }
  };

  const handleImagePick = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', `Permission to access ${useCamera ? 'camera' : 'photo library'} is required.`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        });

      if (!result.canceled && result.assets && result.assets.length > 0 && meeting) {
        const asset = result.assets[0];
        const fileName = asset.fileName || asset.uri.split('/').pop() || 'photo.jpg';

        let sizeStr = '1.8 MB'; // fallback
        if (asset.fileSize) {
          if (asset.fileSize > 1024 * 1024) {
            sizeStr = `${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB`;
          } else {
            sizeStr = `${(asset.fileSize / 1024).toFixed(0)} KB`;
          }
        }

        const updated = meetingsState.map((m) => {
          if (m.id === meeting.id) {
            return {
              ...m,
              attachments: [
                ...m.attachments,
                { name: fileName, size: sizeStr },
              ],
              modifiedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return m;
        });
        updateMeetingsState(updated);
      }
    } catch (err) {
      console.warn('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleDocumentPickDirect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && meeting) {
        const asset = result.assets[0];
        const fileName = asset.name;

        let sizeStr = '0 B';
        if (asset.size) {
          if (asset.size > 1024 * 1024) {
            sizeStr = `${(asset.size / (1024 * 1024)).toFixed(1)} MB`;
          } else {
            sizeStr = `${(asset.size / 1024).toFixed(0)} KB`;
          }
        } else {
          sizeStr = '1.8 MB'; // fallback
        }

        const updated = meetingsState.map((m) => {
          if (m.id === meeting.id) {
            return {
              ...m,
              attachments: [
                ...m.attachments,
                { name: fileName, size: sizeStr },
              ],
              modifiedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return m;
        });
        updateMeetingsState(updated);
      }
    } catch (err) {
      console.warn('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleAddAttachment = () => {
    Alert.alert(
      'Upload Attachment',
      'Choose a source for your file:',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImagePick(true),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleImagePick(false),
        },
        {
          text: 'Choose Document',
          onPress: () => handleDocumentPickDirect(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const cfg = getStatusConfig(meeting.status);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ROW ─────────────────────────── */}
      {!hideHeader && (
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MEETINGS</Text>
        </View>
      )}

      {/* ── RELATED / DETAILS TABS ─────────────── */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'RELATED' && styles.tabButtonActive]}
            onPress={() => setActiveTab('RELATED')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="git-branch-outline"
              size={16}
              color={activeTab === 'RELATED' ? theme.primaryColor : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'RELATED' && styles.tabButtonTextActive]}>
              RELEATED
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'DETAILS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('DETAILS')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="list-outline"
              size={16}
              color={activeTab === 'DETAILS' ? theme.primaryColor : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'DETAILS' && styles.tabButtonTextActive]}>
              DETAILS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* RELATED VIEW */}
        {activeTab === 'RELATED' ? (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle} numberOfLines={1}>{meeting.title}</Text>
                <View style={styles.statusPill}>
                  <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <View style={styles.cardMetaRow}>
                <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
                <Text style={styles.cardMetaText}>{meeting.host || 'Development Team'}</Text>
              </View>

              <View style={styles.cardMetaRowSpace}>
                <View style={styles.cardMetaRow}>
                  <Ionicons name="videocam-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.cardMetaText}>{getMeetingType(meeting)}</Text>
                </View>
                <View style={styles.cardMetaRow}>
                  <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.cardMetaText}>Today , {meeting.fromTime || '11:06 am'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.locationCard}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.locationTitle}>Client location</Text>
                <Text style={styles.locationValue}>{meeting.location || 'Rajkot'}</Text>
              </View>
              <View style={styles.locationIconWrap}>
                <Ionicons name="location-outline" size={18} color={theme.primaryColor} />
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>| NOTES</Text>
              <TouchableOpacity onPress={handleAddNote} style={styles.plusIconWrap} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {meeting.notes && meeting.notes.map((noteText, idx) => (
              <View key={`note-${idx}`} style={styles.noteCard}>
                <Text style={styles.noteText}>{noteText}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteFooterText}>Added By You</Text>
                  <Text style={styles.noteFooterText}>Feb, 24, 2026</Text>
                </View>
              </View>
            ))}

            <View style={styles.dashedBox}>
              <View style={styles.dashedIconWrap}>
                <Ionicons name="copy-outline" size={20} color={theme.primaryColor} />
              </View>
              <Text style={styles.dashedTitle}>Add more notes</Text>
              <Text style={styles.dashedSubtitle}>Keep track of important details, ideas or reminders for this task.</Text>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleAddNote} activeOpacity={0.8}>
                <Text style={styles.outlineBtnText}>+ WRITE A NOTE</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>| ATTACHMENTS</Text>
              <TouchableOpacity onPress={handleAddAttachment} style={styles.plusIconWrap} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {meeting.attachments && meeting.attachments.map((file, idx) => (
              <View key={`attach-${idx}`} style={styles.attachmentCard}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.attachmentTitle}>{file.name}</Text>
                  <Text style={styles.attachmentSubtitle}>{file.size} · Added Feb 23</Text>
                </View>
                <View style={styles.attachmentIconWrap}>
                  <Ionicons name="download-outline" size={18} color={COLORS.textDark} />
                </View>
              </View>
            ))}

            <View style={styles.dashedBox}>
              <View style={styles.dashedIconWrap}>
                <Ionicons name="attach-outline" size={20} color={theme.primaryColor} />
              </View>
              <Text style={styles.dashedTitle}>No more attachments</Text>
              <Text style={styles.dashedSubtitle}>Upload files, images or docs relevant to this task.</Text>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleAddAttachment} activeOpacity={0.8}>
                <Text style={styles.outlineBtnText}>+ ADD ATTACHMENT</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* DETAILS VIEW */
          <View style={styles.tabContent}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show All Fields</Text>
              <Switch
                value={showAllFields}
                onValueChange={setShowAllFields}
                trackColor={{ false: '#D1D5DB', true: theme.primaryColor }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={styles.verticalBar} />
                <Text style={styles.detailCardTitle}>MEETINGS INFORMATION</Text>
              </View>

              <View style={styles.fieldsList}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Title <Text style={{ color: COLORS.danger }}>*</Text></Text>
                  <Text style={styles.fieldValue}>{meeting.title}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Meeting Venue <Text style={{ color: COLORS.danger }}>*</Text></Text>
                  <Text style={styles.fieldValue}>{meeting.venue || 'Client Location'}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Location</Text>
                  <Text style={[styles.fieldValue, { color: COLORS.success, fontWeight: '700' }]}>
                    {meeting.location || 'Rajkot'}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>From <Text style={{ color: COLORS.danger }}>*</Text></Text>
                  <Text style={styles.fieldValue}>Today {meeting.fromTime || '3:00 pm'}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>To <Text style={{ color: COLORS.danger }}>*</Text></Text>
                  <Text style={styles.fieldValue}>Today {meeting.toTime || '3:00 pm'}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Host</Text>
                  <Text style={styles.fieldValue}>{meeting.host || 'Parth Solanki'}</Text>
                </View>

                {showAllFields && (
                  <>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Created By</Text>
                      <Text style={styles.fieldValue}>Parth Solanki</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Modified By</Text>
                      <Text style={styles.fieldValue}>Parth Solanki</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Created Time</Text>
                      <Text style={styles.fieldValue}>Today 2:29 pm</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Modified Time</Text>
                      <Text style={styles.fieldValue}>Today 2:29 pm</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={styles.verticalBar} />
                <Text style={styles.detailCardTitle}>MEETING ADDITIONAL INFORMATION</Text>
              </View>

              <View style={styles.fieldsList}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>checked in status <Text style={{ color: COLORS.danger }}>*</Text></Text>
                  <Text style={[styles.fieldValue, { color: COLORS.textDark, textTransform: 'uppercase' }]}>PLANNED</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* NOTE INPUT MODAL */}
      <Modal
        visible={noteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Note</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="Type your note here..."
              placeholderTextColor={COLORS.textMuted}
              value={newNoteText}
              onChangeText={setNewNoteText}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => {
                  setNoteModalVisible(false);
                  setNewNoteText('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSaveNote}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  tabBarContainer: {
    paddingHorizontal: 8,
    paddingTop: 5,
    backgroundColor: COLORS.bgPage,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EDF3F1',
    borderRadius: 14,
    padding: 4,
    height: 44,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: theme.primaryColor,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 5,
  },
  tabContent: {
    gap: 5,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaRowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cardMetaText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  locationValue: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  plusIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#EDF3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  noteText: {
    fontSize: 12.5,
    color: COLORS.textDark,
    lineHeight: 18,
    fontWeight: '500',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteFooterText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  dashedBox: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#C5D0CB',
    gap: 8,
    marginBottom: 8,
  },
  dashedIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  dashedSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  outlineBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#C5D0CB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  attachmentCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachmentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  attachmentSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  attachmentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EDF3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  detailCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  verticalBar: {
    width: 3,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
  },
  detailCardTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  fieldsList: {
    gap: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'right',
    maxWidth: '65%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 13,
    color: COLORS.textDark,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#EDF3F1',
  },
  modalBtnSave: {
    backgroundColor: theme.primaryColor,
  },
  modalBtnTextCancel: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 12.5,
  },
  modalBtnTextSave: {
    color: COLORS.bgWhite,
    fontWeight: '800',
    fontSize: 12.5,
  },
});
