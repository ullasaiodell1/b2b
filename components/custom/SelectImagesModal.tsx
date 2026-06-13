import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SelectImagesModalProps {
  visible: boolean;
  onClose: () => void;
  originalImages: string[];
  selectedImages: string[];
  onSave: (selectedImages: string[]) => void;
}

export default function SelectImagesModal({
  visible,
  onClose,
  originalImages = [],
  selectedImages = [],
  onSave,
}: SelectImagesModalProps) {
  const theme = useTheme();
  const primaryColor = theme.primaryColor;
  const primaryLight = theme.primaryLight || '#FEF2F2';
  const insets = useSafeAreaInsets();

  const [selectedList, setSelectedList] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedList(selectedImages);
    }
  }, [visible, selectedImages]);

  const toggleImage = (url: string) => {
    setSelectedList((prev) => {
      const exists = prev.includes(url);
      if (exists) {
        return prev.filter((x) => x !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = () => {
    onSave(selectedList);
  };

  return (
    <>
      <Modal
        transparent
        animationType="slide"
        visible={visible}
        onRequestClose={handleCancel}
      >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={handleCancel} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Select Product Image</Text>
              <Text style={styles.headerSub}>Select or unselect images for this item</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.instructionText}>
              Closing without saving keeps the current row details.
            </Text>

            <View style={styles.gridContainer}>
              {originalImages.map((imgUrl, idx) => {
                const isSelected = selectedList.includes(imgUrl);
                return (
                  <TouchableOpacity
                    key={`${imgUrl}-${idx}`}
                    style={[
                      styles.imageCard,
                      isSelected && { borderColor: primaryColor },
                    ]}
                    onPress={() => toggleImage(imgUrl)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.imageWrapper}>
                      <Image source={{ uri: imgUrl }} style={styles.image} resizeMode="cover" />
                      
                      {/* Full-screen expand preview button */}
                      <TouchableOpacity 
                        style={styles.zoomIconContainer} 
                        onPress={() => setPreviewImage(imgUrl)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="expand" size={14} color="#FFF" />
                      </TouchableOpacity>

                      {isSelected && (
                        <View style={styles.overlay}>
                          <View style={[styles.checkBadge, { backgroundColor: primaryColor }]}>
                            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                          </View>
                        </View>
                      )}
                    </View>
                    <View style={[styles.cardFooter, isSelected && { backgroundColor: primaryLight }]}>
                      <Text style={[styles.footerText, isSelected && { color: primaryColor }]}>
                        {isSelected ? 'Selected Item' : 'Tap To Select'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {originalImages.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No images found for this product</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* FOOTER */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
            <Text style={styles.selectedCountText}>{selectedList.length} image(s) selected</Text>
            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: primaryColor }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>Use Selected Images</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>

    {/* Full Screen Image Preview Modal */}
    <Modal
      visible={!!previewImage}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setPreviewImage(null)}
    >
      <View style={styles.previewModalContainer}>
        <TouchableOpacity 
          style={styles.previewModalCloseBtn} 
          onPress={() => setPreviewImage(null)}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        {previewImage && (
          <Image 
            source={{ uri: previewImage || undefined }} 
            style={styles.fullImage} 
            resizeMode="contain" 
          />
        )}
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgPage,
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgWhite,
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
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 14.5, fontWeight: '900', color: COLORS.textDark },
  headerSub: { fontSize: 10.5, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  scrollContent: { padding: 16 },
  instructionText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  imageCard: {
    width: '48%',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  imageWrapper: {
    aspectRatio: 1,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F9FAFB',
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    borderRadius: 14,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFooter: {
    paddingVertical: 6,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  footerText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  emptyText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FFF',
  },
  selectedCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  zoomIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});
