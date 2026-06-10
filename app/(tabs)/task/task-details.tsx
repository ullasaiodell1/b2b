import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
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

interface Attachment {
  id: string;
  name: string;
  size: string;
  added: string;
}

export default function TaskDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'RELATED' | 'DETAILS'>('RELATED');
  const [showAllFields, setShowAllFields] = useState(false);

  // Retrieve task info from route params or fallback to mock data
  const taskTitle = (params.title as string) || 'Website Redesign';
  const taskDue = (params.due as string) || '18 Feb 2028 • 10:00 AM';
  const taskPriority = (params.priority as string) || 'High';
  const taskStatus = (params.status as string) || 'Completed';

  // Dynamic Notes State
  const [notes, setNotes] = useState<string[]>([
    "Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500s, When An Unknown Printer Took A Galley Of Type And Scrambled It To Make A Type Specimen Book."
  ]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Dynamic Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: '1', name: 'Demo_brief.Pdf', size: '2.6 MB', added: 'Feb 23' }
  ]);

  const handleAddAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedAsset = result.assets[0];
        const fileSize = pickedAsset.size
          ? `${(pickedAsset.size / (1024 * 1024)).toFixed(1)} MB`
          : '1.4 MB';

        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        setAttachments(prev => [
          {
            id: String(Date.now()),
            name: pickedAsset.name,
            size: fileSize,
            added: dateStr,
          },
          ...prev
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick a document.');
    }
  };

  const handleEditTask = () => {
    Alert.alert('Edit Task', 'Open update task edit page...');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={{ color: COLORS.primary }}>TA</Text>
          <Text style={{ color: COLORS.textDark }}>SK</Text>
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── TAB SELECTOR CAPSULE ──────────────────── */}
      <View style={styles.tabContainer}>
        <View style={styles.tabCapsule}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'RELATED' && styles.tabButtonActive]}
            onPress={() => setActiveTab('RELATED')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="git-network-outline"
              size={16}
              color={activeTab === 'RELATED' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'RELATED' && styles.tabButtonTextActive]}>
              RELATED
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
              color={activeTab === 'DETAILS' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'DETAILS' && styles.tabButtonTextActive]}>
              DETAILS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {activeTab === 'RELATED' ? (
          /* ── RELATED TAB CONTENT ───────────────── */
          <View style={styles.tabContentContainer}>

            {/* Task Main Details Card */}
            <View style={styles.mainTaskCard}>
              <View style={styles.mainCardHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.mainCardTitle}>{taskTitle}</Text>
                <TouchableOpacity onPress={handleEditTask} activeOpacity={0.7}>
                  <Ionicons name="create-outline" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.mainCardMeta}>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{taskDue}</Text>
                </View>

                <View style={[styles.metaRow, { marginTop: 6 }]}>
                  <View style={styles.badgeRow}>
                    <Ionicons name="close-circle-outline" size={14} color="#EF4444" />
                    <Text style={[styles.badgeText, { color: '#EF4444' }]}>{taskPriority}</Text>
                  </View>
                  <View style={[styles.badgeRow, { marginLeft: 14 }]}>
                    <Ionicons name="checkmark-outline" size={14} color="#10B981" />
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>{taskStatus}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLeft}>
                <View style={styles.verticalGreenLine} />
                <Text style={styles.sectionTitle}>NOTES</Text>
              </View>
              <TouchableOpacity style={styles.plusBtn} onPress={() => setNoteModalVisible(true)} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Dynamic Notes List */}
            {notes.map((note, index) => (
              <View key={index} style={styles.noteCard}>
                <Text style={styles.noteText}>{note}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteAuthor}>Added by You</Text>
                  <Text style={styles.noteDate}>Feb 24, 2026</Text>
                </View>
              </View>
            ))}

            {/* Add More Notes Empty State Card */}
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>Add more notes</Text>
              <Text style={styles.emptyStateDesc}>
                Keep track of important details, ideas or reminders for this task.
              </Text>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={() => setNoteModalVisible(true)} activeOpacity={0.8}>
                <Text style={styles.emptyActionBtnText}>+ WRITE A NOTE</Text>
              </TouchableOpacity>
            </View>

            {/* Attachments Section */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLeft}>
                <View style={styles.verticalGreenLine} />
                <Text style={styles.sectionTitle}>ATTACHMENTS</Text>
              </View>
              <TouchableOpacity style={styles.plusBtn} onPress={handleAddAttachment} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Dynamic Attachments List */}
            {attachments.map((file) => (
              <View key={file.id} style={styles.attachmentCard}>
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName}>{file.name}</Text>
                  <Text style={styles.attachmentMeta}>{file.size} • Added {file.added}</Text>
                </View>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => Alert.alert('Download', `Downloading attachment file ${file.name}...`)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="download-outline" size={18} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>
            ))}

            {/* No More Attachments Empty State Card */}
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="attach-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>No more attachments</Text>
              <Text style={styles.emptyStateDesc}>
                Upload files, images or docs relevant to this task.
              </Text>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={handleAddAttachment} activeOpacity={0.8}>
                <Text style={styles.emptyActionBtnText}>+ UPLOAD FILE</Text>
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          /* ── DETAILS TAB CONTENT ───────────────── */
          <View style={styles.tabContentContainer}>

            {/* Show All Fields Toggle Switch */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show All Fields</Text>
              <Switch
                value={showAllFields}
                onValueChange={setShowAllFields}
                trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              />
            </View>

            {/* Tasks Information Section */}
            <View style={styles.detailsBlock}>
              <View style={styles.detailsBlockHeader}>
                <View style={styles.verticalGreenLine} />
                <Text style={styles.sectionTitle}>TASKS INFORMATION</Text>
              </View>

              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tasks Owner</Text>
                  <Text style={styles.infoValue}>Parth Solanki</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Subject <Text style={{ color: '#EF4444' }}>*</Text></Text>
                  <Text style={styles.infoValue}>{taskTitle}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Due Date</Text>
                  <Text style={styles.infoValue}>Yesterday</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={styles.infoValue}>{taskStatus}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Priority</Text>
                  <Text style={styles.infoValue}>{taskPriority}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created By</Text>
                  <Text style={styles.infoValue}>Parth Solanki</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Send Notification Email</Text>
                  <Ionicons name="checkmark-done" size={16} color={COLORS.textDark} />
                </View>

                {showAllFields && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Modified By</Text>
                      <Text style={styles.infoValue}>Parth Solanki</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Created Time</Text>
                      <Text style={styles.infoValue}>Today 2:29 pm</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Modified Time</Text>
                      <Text style={styles.infoValue}>Today 2:29 pm</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Last Activity Time</Text>
                      <Text style={styles.infoValue}>Today 2:29 pm</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

          </View>
        )}

      </ScrollView>

      {/* ── ADD NOTE MODAL ────────────────────────── */}
      <Modal
        visible={noteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setNoteModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            <Text style={styles.modalTitle}>Add New Note</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Type your note details here..."
              placeholderTextColor={COLORS.textMuted}
              multiline
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
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnApply]}
                onPress={() => {
                  if (newNoteText.trim()) {
                    setNotes(prev => [newNoteText.trim(), ...prev]);
                    setNewNoteText('');
                    setNoteModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalBtnApplyText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.bgWhite,
  },
  tabCapsule: {
    flexDirection: 'row',
    backgroundColor: '#F4F7F5',
    borderRadius: 10,
    padding: 4,
    height: 44,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 5,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 50,
  },
  tabContentContainer: {
    gap: 5,
  },

  // Main task card (RELATED tab)
  mainTaskCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mainCardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  mainCardMeta: {
    paddingLeft: 28,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Section titles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verticalGreenLine: {
    width: 3,
    height: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  plusBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#EAF4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Note Card
  noteCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 5,
  },
  noteText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontWeight: '600',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  noteAuthor: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  noteDate: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // Empty state cards
  emptyStateCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
    gap: 5,
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptyStateDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  emptyActionBtn: {
    height: 34,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  emptyActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },

  // Attachment Card
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  attachmentInfo: {
    gap: 5,
  },
  attachmentName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  attachmentMeta: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  downloadBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Switch Toggle Details Tab
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  detailsBlock: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 5,
  },
  detailsBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoList: {
    gap: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Modal styles for notes creation
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: COLORS.textDark,
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 5,
  },
  modalBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#EDF3F1',
  },
  modalBtnCancelText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 12.5,
  },
  modalBtnApply: {
    backgroundColor: COLORS.primary,
  },
  modalBtnApplyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12.5,
  },
});
