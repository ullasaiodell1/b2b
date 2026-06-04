import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { meetingsState, updateMeetingsState, MeetingRecord, subscribeToMeetings } from '@/components/MeetingState';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
  success: '#10B981',
  info: '#3B82F6',
  danger: '#EF4444',
};

export default function MeetingDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const id = route.params?.id;

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
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
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

  const cfg = getStatusConfig(meeting.status);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── 1. HEADER ROW ─────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEETINGS</Text>
      </View>

      {/* ── 2. RELATED / DETAILS TABS ─────────────── */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {/* RELATED TAB */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'RELATED' && styles.tabButtonActive]}
            onPress={() => setActiveTab('RELATED')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="git-branch-outline"
              size={16}
              color={activeTab === 'RELATED' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'RELATED' && styles.tabButtonTextActive]}>
              RELEATED
            </Text>
          </TouchableOpacity>

          {/* DETAILS TAB */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'DETAILS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('DETAILS')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="list-outline"
              size={16}
              color={activeTab === 'DETAILS' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'DETAILS' && styles.tabButtonTextActive]}>
              DETAILS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── 3. RELATED VIEW ───────────────────────── */}
        {activeTab === 'RELATED' ? (
          <View style={styles.tabContent}>
            {/* Card 1: Meeting Info Summary */}
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

            {/* Card 2: Client Location */}
            <View style={styles.locationCard}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.locationTitle}>Client location</Text>
                <Text style={styles.locationValue}>{meeting.location || 'Rajkot'}</Text>
              </View>
              <View style={styles.locationIconWrap}>
                <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              </View>
            </View>

            {/* Section: Notes */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>| NOTES</Text>
              <TouchableOpacity onPress={handleAddNote} style={styles.plusIconWrap} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Render Notes list */}
            {meeting.notes && meeting.notes.length > 0 ? (
              meeting.notes.map((noteText, idx) => (
                <View key={`note-${idx}`} style={styles.noteCard}>
                  <Text style={styles.noteText}>{noteText}</Text>
                  <View style={styles.noteFooter}>
                    <Text style={styles.noteFooterText}>Added By You</Text>
                    <Text style={styles.noteFooterText}>Feb, 24, 2026</Text>
                  </View>
                </View>
              ))
            ) : (
              // Fallback default note card matching screenshot
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>
                  {"Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500s, When An Unknown Printer Took A Galley Of Type And Scrambled It To Make A Type Specimen Book."}
                </Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteFooterText}>Added By You</Text>
                  <Text style={styles.noteFooterText}>Feb, 24, 2026</Text>
                </View>
              </View>
            )}

            {/* Dashed Add notes block */}
            <View style={styles.dashedBox}>
              <View style={styles.dashedIconWrap}>
                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.dashedTitle}>Add more notes</Text>
              <Text style={styles.dashedSubtitle}>Keep track of important details, ideas or reminders for this task.</Text>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleAddNote} activeOpacity={0.8}>
                <Text style={styles.outlineBtnText}>+ WRITE A NOTE</Text>
              </TouchableOpacity>
            </View>

            {/* Section: Attachments */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>| ATTACHMENTS</Text>
              <TouchableOpacity onPress={handleAddAttachment} style={styles.plusIconWrap} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Render Attachments list */}
            {meeting.attachments && meeting.attachments.length > 0 ? (
              meeting.attachments.map((file, idx) => (
                <View key={`attach-${idx}`} style={styles.attachmentCard}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.attachmentTitle}>{file.name}</Text>
                    <Text style={styles.attachmentSubtitle}>{file.size} · Added Feb 23</Text>
                  </View>
                  <View style={styles.attachmentIconWrap}>
                    <Ionicons name="download-outline" size={18} color={COLORS.textDark} />
                  </View>
                </View>
              ))
            ) : (
              // Fallback default attachment card matching screenshot
              <View style={styles.attachmentCard}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.attachmentTitle}>Demo_brief.Pdf</Text>
                  <Text style={styles.attachmentSubtitle}>2.4 MB · Added Feb 23</Text>
                </View>
                <View style={styles.attachmentIconWrap}>
                  <Ionicons name="download-outline" size={18} color={COLORS.textDark} />
                </View>
              </View>
            )}

            {/* Dashed Add attachments block */}
            <View style={styles.dashedBox}>
              <View style={styles.dashedIconWrap}>
                <Ionicons name="attach-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.dashedTitle}>No more attachments</Text>
              <Text style={styles.dashedSubtitle}>Upload files, images or docs relevant to this task.</Text>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleAddAttachment} activeOpacity={0.8}>
                <Text style={styles.outlineBtnText}>+ WRITE A NOTE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          
          // ── 4. DETAILS VIEW ─────────────────────────
          <View style={styles.tabContent}>
            
            {/* Show All Fields Toggle Switch */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show All Fields</Text>
              <Switch
                value={showAllFields}
                onValueChange={setShowAllFields}
                trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Card 1: Meetings Information */}
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={styles.verticalBar} />
                <Text style={styles.detailCardTitle}>MEETINGS INFORMATION</Text>
              </View>

              <View style={styles.fieldsList}>
                {/* Title */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Title *</Text>
                  <Text style={styles.fieldValue}>{meeting.title}</Text>
                </View>
                {/* Meeting Venue */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Meeting Venue *</Text>
                  <Text style={styles.fieldValue}>{meeting.venue || 'Client Location'}</Text>
                </View>
                {/* Location */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Location</Text>
                  <Text style={[styles.fieldValue, { color: COLORS.success, fontWeight: '700' }]}>
                    {meeting.location || 'Rajkot'}
                  </Text>
                </View>
                {/* From */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>From *</Text>
                  <Text style={styles.fieldValue}>Today {meeting.fromTime || '3:00 pm'}</Text>
                </View>
                {/* To */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>To *</Text>
                  <Text style={styles.fieldValue}>Today {meeting.toTime || '3:00 pm'}</Text>
                </View>
                {/* Host */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Host</Text>
                  <Text style={styles.fieldValue}>{meeting.host || 'Parth Solanki'}</Text>
                </View>

                {/* Conditional Fields depending on Toggle Switch */}
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

            {/* Card 2: Additional Info */}
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={styles.verticalBar} />
                <Text style={styles.detailCardTitle}>MEETING ADDITIONAL INFORMATION</Text>
              </View>
              
              <View style={styles.fieldsList}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>checked in status *</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 16,
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

  // Related/Details Tabs
  tabBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
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
    gap: 8,
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
    color: COLORS.primary,
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  tabContent: {
    gap: 14,
  },

  // Dynamic Meeting Summary Card
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
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
    gap: 6,
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

  // Client location Card
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
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  plusIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDF3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Note Card
  noteCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
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

  // Dashed boxes
  dashedBox: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    padding: 16,
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

  // Attachment Card
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

  // DETAILS VIEW styles
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
