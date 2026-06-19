import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  AttachmentFile,
  useCreateLeadAttachment,
  useDeleteLeadAttachment,
  useLeadAttachments,
} from '@/hooks/useAttachments';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LeadAttachmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = getStyles(theme);

  const params = useLocalSearchParams<{
    leadId?: string;
    leadName?: string;
    openUpload?: string;
  }>();
  const leadId = params.leadId || '';
  const leadName = params.leadName || 'Lead';

  // State
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // API hooks
  const {
    data: attachments = [],
    isLoading,
    isRefetching,
    refetch,
  } = useLeadAttachments(leadId);

  const createMutation = useCreateLeadAttachment(leadId);
  const deleteMutation = useDeleteLeadAttachment(leadId);

  // Auto-open upload dialog if navigated with openUpload param
  useEffect(() => {
    if (params.openUpload === 'true') {
      setUploadModalVisible(true);
    }
  }, [params.openUpload]);

  // Handle Pick File
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking file:', err);
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  // Upload attachment — two-step: upload file → link to lead
  const handleUploadFile = async () => {
    if (!selectedFile || !leadId) return;

    try {
      await createMutation.mutateAsync({
        uri: selectedFile.uri,
        type: selectedFile.mimeType,
        fileName: selectedFile.name,
        size: selectedFile.size,
      });

      setSelectedFile(null);
      setUploadModalVisible(false);
      Alert.alert('Success', 'File uploaded successfully.');
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error?.message || 'Could not upload the file. Please try again.');
    }
  };

  // Delete attachment
  const handleDeleteAttachment = (id: string, name: string) => {
    Alert.alert(
      'Delete Attachment',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await deleteMutation.mutateAsync(id);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete attachment.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // View action
  const handleViewAttachment = (item: AttachmentFile) => {
    const isImage = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(item.type.toUpperCase());
    if (isImage) {
      setPreviewImageUrl(item.url);
    } else {
      Linking.openURL(item.url).catch(() => {
        Alert.alert('Cannot Open', 'No handler found for this attachment link.');
      });
    }
  };

  const isUploading = createMutation.isPending;

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>ATTACH</Text>
            <Text style={{ color: COLORS.textDark }}>MENTS</Text>
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {leadName}
          </Text>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={styles.headerUploadBtn}
          onPress={() => {
            setUploadModalVisible(true);
            setSelectedFile(null);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={theme.primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.primaryColor]}
            tintColor={theme.primaryColor}
          />
        }
      >
        <View style={styles.cardsContainer}>
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={theme.primaryColor} />
            </View>
          ) : attachments.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: COLORS.bgWhite, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, width: '100%' }]}>
              <Ionicons name="attach-outline" size={38} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No attachments found</Text>
              <Text style={styles.emptySubText}>
                Tap the upload button in header to add documents or images
              </Text>
            </View>
          ) : (
            attachments.map((item: AttachmentFile) => {
              const isPdf = item.type.toUpperCase() === 'PDF';
              const isImage = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(
                item.type.toUpperCase()
              );
              const iconName = isPdf
                ? 'document-text'
                : isImage
                  ? 'image'
                  : 'document';
              const iconColor = isPdf ? '#EF4444' : isImage ? '#10B981' : '#6B7280';
              const dateLabel = new Date(item.uploadedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              });
              const isDeleting = deletingId === item.id;

              return (
                <View key={item.id} style={styles.attachmentCard}>
                  {/* Card Info Area */}
                  <View style={styles.cardInfoRow}>
                    {/* Thumbnail/Icon Area */}
                    <View style={styles.thumbnailContainer}>
                      {isImage ? (
                        <Image
                          source={{ uri: item.url }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.cardIconBg, { backgroundColor: iconColor + '10' }]}>
                          <Ionicons name={iconName} size={32} color={iconColor} />
                          <Text style={[styles.cardExtensionText, { color: iconColor }]}>{item.type}</Text>
                        </View>
                      )}
                    </View>

                    {/* Details Area */}
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardFileName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <Text style={styles.detailText}>
                        Size: <Text style={styles.detailTextBlue}>{item.size}</Text>
                      </Text>

                      <Text style={styles.detailText}>
                        Uploaded by: <Text style={styles.detailTextDark}>{item.uploadedBy}</Text>
                      </Text>

                      <Text style={styles.detailText}>
                        Date: <Text style={styles.detailTextDark}>{dateLabel}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Card Actions Area */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      onPress={() => handleViewAttachment(item)}
                      activeOpacity={0.7}
                      style={styles.cardActionBtn}
                    >
                      <Ionicons name="eye-outline" size={16} color={theme.primaryColor || '#1E5E48'} />
                      <Text style={[styles.cardActionText, { color: theme.primaryColor || '#1E5E48' }]}>View</Text>
                    </TouchableOpacity>

                    <View style={styles.cardActionDivider} />

                    <TouchableOpacity
                      onPress={() => handleDeleteAttachment(item.id, item.name)}
                      activeOpacity={0.7}
                      style={styles.cardActionBtn}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color={COLORS.danger || '#EF4444'} />
                      ) : (
                        <>
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={COLORS.danger || '#EF4444'}
                          />
                          <Text style={[styles.cardActionText, { color: COLORS.danger || '#EF4444' }]}>Delete</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* UPLOAD MODAL */}
      <Modal
        visible={uploadModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.fullScreenModalRoot}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) },
            ]}
          >
            <TouchableOpacity
              onPress={() => setUploadModalVisible(false)}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color={COLORS.textDark} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                <Text style={{ color: theme.primaryColor }}>UPLOAD </Text>
                <Text style={{ color: COLORS.textDark }}>ATTACHMENT</Text>
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {leadName}
              </Text>
            </View>

            {/* Empty space to balance backBtn width */}
            <View style={{ width: 36 }} />
          </View>

          {/* Modal Content container */}
          <View style={styles.fullScreenModalContent}>
            {/* Description/Instruction Info card */}
            <View style={styles.modalInfoCard}>
              <Ionicons name="information-circle-outline" size={20} color={theme.primaryColor || '#1E5E48'} />
              <Text style={styles.modalInfoText}>
                Select any document or image file to upload. Supported formats include PDF, JPEG, PNG, and more. Max size: 20 MB.
              </Text>
            </View>

            {/* Dash Picker Area */}
            <TouchableOpacity
              style={[
                styles.dashPickerBox,
                selectedFile && {
                  borderColor: theme.primaryColor,
                  backgroundColor: theme.primaryLight + '10',
                },
                { height: 180, marginTop: 12 }
              ]}
              onPress={handlePickFile}
              activeOpacity={0.8}
            >
              {selectedFile ? (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={36}
                    color={theme.primaryColor}
                    style={{ marginBottom: 10 }}
                  />
                  <Text style={styles.pickedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.pickedFileSize}>
                    {selectedFile.size
                      ? (selectedFile.size / 1024).toFixed(2) + ' KB'
                      : 'Unknown size'}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={40}
                    color={COLORS.textMuted}
                    style={{ marginBottom: 10 }}
                  />
                  <Text style={styles.dashPickerText}>Drag & drop or click to browse</Text>
                  <Text style={styles.dashPickerSub}>All types supported · Max 20 MB</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Modal Actions footer */}
          <View style={[styles.modalActionsRow, { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setUploadModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.uploadBtn,
                !selectedFile && { backgroundColor: '#CBD5E1' },
                selectedFile && { backgroundColor: theme.primaryColor },
              ]}
              disabled={!selectedFile || isUploading}
              onPress={handleUploadFile}
              activeOpacity={0.85}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={16}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.uploadBtnText}>Upload File</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FULL SCREEN IMAGE PREVIEW MODAL */}
      <Modal
        visible={!!previewImageUrl}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.previewModalOverlay}>
          <TouchableOpacity
            style={styles.previewCloseBtn}
            onPress={() => setPreviewImageUrl(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom + 24, 30) }]}
        onPress={() => {
          setUploadModalVisible(true);
          setSelectedFile(null);
        }}
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
    headerSub: {
      fontSize: 11,
      color: COLORS.textMuted,
      fontWeight: '600',
      maxWidth: 180,
    },
    headerUploadBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: '#F4F7F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: { padding: 5 },

    cardsContainer: {
      width: '100%',
    },
    attachmentCard: {
      backgroundColor: COLORS.bgWhite,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
      marginBottom: 4,
    },
    cardInfoRow: {
      flexDirection: 'row',
      padding: 14,
      alignItems: 'center',
    },
    thumbnailContainer: {
      width: 80,
      height: 80,
      borderRadius: 10,
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    cardIconBg: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    cardExtensionText: {
      fontSize: 9,
      fontWeight: '800',
      marginTop: 2,
      textTransform: 'uppercase',
    },
    cardDetails: {
      flex: 1,
      marginLeft: 14,
      justifyContent: 'center',
      gap: 4,
    },
    cardFileName: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.textDark,
      marginBottom: 2,
    },
    detailText: {
      fontSize: 11,
      color: COLORS.textMuted,
      fontWeight: '600',
    },
    detailTextBlue: {
      color: '#3B82F6',
      fontWeight: '700',
    },
    detailTextDark: {
      color: COLORS.textDark,
      fontWeight: '600',
    },
    cardActionsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
      height: 44,
    },
    cardActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    cardActionText: {
      fontSize: 12.5,
      fontWeight: '800',
    },
    cardActionDivider: {
      width: 1,
      height: '100%',
      backgroundColor: '#F1F5F9',
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
      paddingHorizontal: 28,
    },

    // Modal styling
    fullScreenModalRoot: {
      flex: 1,
      backgroundColor: COLORS.bgPage || '#F8FAFC',
    },
    fullScreenModalContent: {
      flex: 1,
      padding: 10,
      gap: 1,
    },
    modalInfoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 8,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      gap: 8,
    },
    modalInfoText: {
      flex: 1,
      fontSize: 12.5,
      color: COLORS.textDark,
      lineHeight: 18,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      paddingTop: 12,
      paddingBottom: 36,
      paddingHorizontal: 12,
      gap: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    modalTitle: {
      fontSize: 14.5,
      fontWeight: '900',
      color: COLORS.textDark,
    },
    modalSubTitle: {
      fontSize: 11,
      color: COLORS.textMuted,
      fontWeight: '600',
      marginTop: 3,
      maxWidth: '90%',
    },
    dashPickerBox: {
      height: 120,
      borderWidth: 1.5,
      borderColor: '#CBD5E1',
      borderStyle: 'dashed',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
    },
    dashPickerText: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    dashPickerSub: {
      fontSize: 10.5,
      color: COLORS.textMuted,
      fontWeight: '600',
      marginTop: 3,
    },
    pickedFileName: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.textDark,
      maxWidth: '80%',
    },
    pickedFileSize: {
      fontSize: 11,
      color: COLORS.textMuted,
      fontWeight: '700',
      marginTop: 2,
    },
    modalActionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelBtn: {
      flex: 1,
      height: 42,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    cancelBtnText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: COLORS.textDark,
    },
    uploadBtn: {
      flex: 1.2,
      height: 42,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadBtnText: {
      fontSize: 13.5,
      fontWeight: '900',
      color: '#FFFFFF',
    },

    // Image preview styles
    previewModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewCloseBtn: {
      position: 'absolute',
      top: 50,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    fullImage: {
      width: '100%',
      height: '80%',
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
  });
