import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks/useProducts';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SelectProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProduct: (product: any) => void;
  companyId?: string;
}

export default function SelectProductModal({
  visible,
  onClose,
  onSelectProduct,
  companyId,
}: SelectProductModalProps) {
  const theme = useTheme();
  const primaryColor = theme.primaryColor;
  const insets = useSafeAreaInsets();

  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({ search: productSearchQuery, company_id: companyId });

  const handleSelectProduct = (product: any) => {
    onSelectProduct(product);
    setProductSearchQuery('');
  };

  const handleCancel = () => {
    onClose();
    setProductSearchQuery('');
  };

  const filteredProducts = products.filter((prod: any) => {
    const query = productSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      prod.product_name?.toLowerCase().includes(query) ||
      (prod.code || '').toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Modal
        transparent
        animationType="slide"
        visible={visible}
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <View
            style={[
              styles.modalContent,
              {
                height: '80%',
                paddingBottom: Math.max(insets.bottom + 12, 16),
              },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Select Product / Kit</Text>
                <Text style={styles.modalSubtitle}>Select product or create custom item</Text>
              </View>
              <TouchableOpacity onPress={handleCancel} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* SEARCH BOX */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products or kits..."
                placeholderTextColor="#9CA3AF"
                value={productSearchQuery}
                onChangeText={setProductSearchQuery}
                autoCorrect={false}
                autoComplete="off"
              />
              {productSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setProductSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* PRODUCTS LIST */}
            {isLoadingProducts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={primaryColor} />
              </View>
            ) : (
              <ScrollView style={styles.listScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {/* Custom Fallback Row */}
                {productSearchQuery.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.productRowItem}
                    onPress={() => {
                      handleSelectProduct({
                        id: null,
                        product_name: productSearchQuery.trim(),
                        code: '',
                        selling_price: 0,
                        tax_rate: 18,
                        description: '',
                        images: [],
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.productRowText, { color: primaryColor }]}>
                        + Use Custom Item: "{productSearchQuery.trim()}"
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Catalog Products */}
                {filteredProducts.map((prod: any) => (
                  <TouchableOpacity
                    key={prod.id}
                    style={styles.productRowItem}
                    onPress={() => handleSelectProduct(prod)}
                    activeOpacity={0.7}
                  >
                    {prod.images && prod.images.length > 0 ? (
                      <TouchableOpacity
                        onPress={() => setPreviewImage(prod.images[0])}
                        activeOpacity={0.8}
                        style={{ marginRight: 12, position: 'relative' }}
                      >
                        <Image source={{ uri: prod.images[0] }} style={styles.productThumbnail} />
                        <View style={styles.thumbnailZoomBadge}>
                          <Ionicons name="expand" size={10} color="#FFF" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.productThumbnail, styles.productThumbnailPlaceholder, { borderColor: primaryColor }]}>
                        <Ionicons name="image-outline" size={18} color={primaryColor} />
                      </View>
                    )}
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.productRowText}>
                        {prod.code ? `[${prod.code}] ` : ''}{prod.product_name}
                      </Text>
                      {(prod.fragrance_name || prod.category_name) && (
                        <Text style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: '600' }}>
                          {prod.fragrance_name ? `Fragrance: ${prod.fragrance_name}` : ''}
                          {prod.fragrance_name && prod.category_name ? ' • ' : ''}
                          {prod.category_name ? `Category: ${prod.category_name}` : ''}
                        </Text>
                      )}
                    </View>
                    {prod.product_type && (
                      <View style={styles.productTypeBadge}>
                        <Text style={styles.productTypeBadgeText}>{prod.product_type}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}

                {/* No Match Fallback */}
                {filteredProducts.length === 0 && !productSearchQuery.trim() && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No products found</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalSubtitle: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: 40,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  listScroll: { paddingHorizontal: 16 },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  productTypeBadge: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F9FAFB',
    alignSelf: 'center',
  },
  productTypeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  productThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  productThumbnailPlaceholder: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnailZoomBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
