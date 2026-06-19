import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  useAddLeadInterestedProduct,
  useLeadInterestedProducts,
  useRemoveLeadInterestedProduct,
} from '@/hooks/useInterestedProducts';
import { useProducts } from '@/hooks/useProducts';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InterestedProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = getStyles(theme);

  const params = useLocalSearchParams<{ leadId?: string; leadName?: string }>();
  const leadId = params.leadId || '';
  const leadName = params.leadName || 'Lead';

  // UI state
  const [productFilterQuery, setProductFilterQuery] = useState('');
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [productModalSearchQuery, setProductModalSearchQuery] = useState('');

  // ── API hooks ──────────────────────────────────────────────────
  const {
    data: interestedProducts = [],
    isLoading,
    isRefetching,
    refetch,
  } = useLeadInterestedProducts(leadId);

  const addMutation = useAddLeadInterestedProduct(leadId);
  const removeMutation = useRemoveLeadInterestedProduct(leadId);

  // All products for the selection modal
  const { data: allProductsList = [], isLoading: isAllProductsLoading } = useProducts();

  // ── Handlers ───────────────────────────────────────────────────
  const handleAddProduct = (product: any) => {
    if (!product || !leadId) return;
    const productId = String(product.id);
    if (interestedProducts.some((p: any) => String(p.id) === productId)) {
      Alert.alert('Duplicate Product', 'This product is already added.');
      return;
    }
    addMutation.mutate(productId, {
      onSuccess: () => {
        setProductModalVisible(false);
        setProductModalSearchQuery('');
      },
      onError: (err: any) => {
        const msg =
          err?.message ||
          err?.error ||
          err?.details ||
          (typeof err === 'string' ? err : null) ||
          'Failed to add product.';
        Alert.alert('Error', msg);
      },
    });
  };

  const handleRemoveProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Remove Product',
      `Are you sure you want to remove "${productName}" from the interested list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeMutation.mutate(productId, {
              onError: (err: any) => {
                Alert.alert('Error', err?.message || 'Failed to remove product.');
              },
            });
          },
        },
      ]
    );
  };

  // ── Formatting ─────────────────────────────────────────────────
  const formatAmount = (amount?: number | null) => {
    if (amount == null) return '₹ 0.00';
    return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  // ── Filtered lists ─────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const query = productFilterQuery.toLowerCase().trim();
    if (!query) return interestedProducts;
    return interestedProducts.filter((p: any) => {
      const name = p.product_name || p.name || '';
      const code = p.code || p.sku || '';
      return name.toLowerCase().includes(query) || code.toLowerCase().includes(query);
    });
  }, [interestedProducts, productFilterQuery]);

  const addedIds = useMemo(
    () => new Set(interestedProducts.map((p: any) => String(p.id))),
    [interestedProducts]
  );

  const filteredModalProducts = useMemo(() => {
    const query = productModalSearchQuery.toLowerCase().trim();
    return (allProductsList as any[]).filter((prod: any) => {
      const name = prod.product_name || prod.name || '';
      const code = prod.code || prod.sku || '';
      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        code.toLowerCase().includes(query);
      return matchesSearch && !addedIds.has(String(prod.id));
    });
  }, [allProductsList, productModalSearchQuery, addedIds]);

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
            <Text style={{ color: theme.primaryColor }}>INTERESTED </Text>
            <Text style={{ color: COLORS.textDark }}>PRODUCTS</Text>
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {leadName}
          </Text>
        </View>

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
        <View style={styles.contentCard}>
          {/* Inputs Row */}
          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>ADD PRODUCT</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => {
                  setProductModalVisible(true);
                  setProductModalSearchQuery('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownSelectorText} numberOfLines={1}>
                  Find products to add...
                </Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>SEARCH LIST</Text>
              <View style={styles.searchBarContainer}>
                <Ionicons
                  name="search-outline"
                  size={14}
                  color={COLORS.textMuted}
                  style={{ marginRight: 6 }}
                />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Filter current products..."
                  placeholderTextColor="#9CA3AF"
                  value={productFilterQuery}
                  onChangeText={setProductFilterQuery}
                  autoCorrect={false}
                  autoComplete="off"
                />
                {productFilterQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setProductFilterQuery('')}
                    style={{ padding: 2 }}
                  >
                    <Ionicons name="close-circle" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* TABLE HEADER */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Product</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Price</Text>
            <Text style={[styles.tableHeaderCell, { width: 50, textAlign: 'right' }]}>
              Actions
            </Text>
          </View>

          {/* TABLE DATA */}
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={theme.primaryColor} />
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No interested products found</Text>
              <Text style={styles.emptySubText}>
                {productFilterQuery.trim()
                  ? 'Try clearing search filter'
                  : 'Tap Find products to add... to associate items'}
              </Text>
            </View>
          ) : (
            filteredProducts.map((prod: any, idx: number) => {
              const pName = prod.product_name || prod.name || 'Product';
              const pCode = prod.code || prod.sku;
              const pPrice = prod.selling_price ?? prod.price;
              const isRemoving =
                removeMutation.isPending && removeMutation.variables === prod.id;

              return (
                <View key={prod.id || idx} style={styles.tableDataRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.productNameText}>{pName}</Text>
                    {pCode ? (
                      <Text style={styles.productCodeText}>#{pCode}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.productPriceText, { flex: 1, textAlign: 'center' }]}>
                    {formatAmount(pPrice)}
                  </Text>
                  <View style={{ width: 50, alignItems: 'flex-end' }}>
                    <TouchableOpacity
                      onPress={() => handleRemoveProduct(prod.id, pName)}
                      activeOpacity={0.7}
                      style={{ padding: 4 }}
                      disabled={isRemoving}
                    >
                      {isRemoving ? (
                        <ActivityIndicator size="small" color={COLORS.danger || '#EF4444'} />
                      ) : (
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={COLORS.danger || '#EF4444'}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* SELECTION MODAL */}
      <Modal
        visible={productModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16),
              },
            ]}
          >
            {/* MODAL HEADER */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackBtn}
                onPress={() => setProductModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
              <View style={styles.modalHeaderTitleContainer}>
                <Text style={styles.modalHeaderTitle}>Select Product</Text>
                <Text style={styles.modalHeaderSub}>Find and add interested product</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            {/* MODAL SEARCH BOX */}
            <View style={styles.modalSearchContainer}>
              <Ionicons
                name="search-outline"
                size={18}
                color={COLORS.textMuted}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search products..."
                placeholderTextColor="#9CA3AF"
                value={productModalSearchQuery}
                onChangeText={setProductModalSearchQuery}
                autoCorrect={false}
                autoComplete="off"
              />
              {productModalSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setProductModalSearchQuery('')}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* MODAL PRODUCTS LIST */}
            {isAllProductsLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="small" color={theme.primaryColor} />
              </View>
            ) : (
              <ScrollView
                style={styles.modalListScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {filteredModalProducts.map((prod: any) => {
                  const isAdding =
                    addMutation.isPending && addMutation.variables === String(prod.id);
                  return (
                    <TouchableOpacity
                      key={prod.id}
                      style={styles.modalProductRowItem}
                      onPress={() => handleAddProduct(prod)}
                      activeOpacity={0.7}
                      disabled={isAdding}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.modalProductRowText}>
                          {prod.product_name || prod.name}
                        </Text>
                        {(prod.code || prod.sku || prod.category_name) && (
                          <Text style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: '600' }}>
                            {prod.code || prod.sku ? `Code: ${prod.code || prod.sku}` : ''}
                            {(prod.code || prod.sku) && prod.category_name ? ' • ' : ''}
                            {prod.category_name ? `Category: ${prod.category_name}` : ''}
                          </Text>
                        )}
                      </View>
                      {isAdding ? (
                        <ActivityIndicator size="small" color={theme.primaryColor} />
                      ) : (
                        <Text style={styles.modalProductPriceText}>
                          {formatAmount(prod.selling_price ?? prod.price)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {filteredModalProducts.length === 0 && (
                  <View style={styles.modalEmptyContainer}>
                    <Text style={styles.modalEmptyText}>No matching products found</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      gap: 1
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: 0.4
    },
    headerSub: {
      fontSize: 11,
      color: COLORS.textMuted,
      fontWeight: '600',
      maxWidth: 180
    },
    scrollContent: {
      paddingHorizontal: 8,
      paddingTop: 5,
      paddingBottom: 5,
    },

    contentCard: {
      backgroundColor: COLORS.bgWhite,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    inputsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 5,
      paddingHorizontal: 10,
      paddingTop: 5,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: COLORS.textMuted,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    dropdownSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      height: 38,
    },
    dropdownSelectorText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.textMuted,
      flex: 1,
    },
    searchBarContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      height: 38,
    },
    searchBarInput: {
      flex: 1,
      fontSize: 12,
      color: COLORS.textDark,
      fontWeight: '600',
      height: '100%',
      paddingVertical: 0,
    },

    tableHeaderRow: {
      flexDirection: 'row',
      backgroundColor: '#F8FAFC',
      borderBottomWidth: 1.5,
      borderBottomColor: '#E2E8F0',
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginTop: 5,
    },
    tableHeaderCell: {
      fontSize: 11,
      fontWeight: '800',
      color: COLORS.textMuted,
      textTransform: 'uppercase',
    },
    tableDataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      backgroundColor: '#FFFFFF',
    },
    productNameText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    productCodeText: {
      fontSize: 11,
      fontWeight: '700',
      color: COLORS.textMuted,
      marginTop: 2,
    },
    productPriceText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: '#059669',
    },

    emptyContainer: {
      paddingVertical: 40,
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

    // Modal styling
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: COLORS.bgPage,
      height: '80%',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 19,
      backgroundColor: COLORS.bgWhite,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    modalBackBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalHeaderTitleContainer: {
      alignItems: 'center',
    },
    modalHeaderTitle: {
      fontSize: 14.5,
      fontWeight: '900',
      color: COLORS.textDark,
    },
    modalHeaderSub: {
      fontSize: 10.5,
      color: COLORS.textMuted,
      fontWeight: '600',
      marginTop: 2,
    },
    modalSearchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      height: 40,
      marginHorizontal: 6,
      marginTop: 5,
      marginBottom: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    modalSearchInput: {
      flex: 1,
      height: '100%',
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textDark,
    },
    modalListScroll: {
      paddingHorizontal: 6,
    },
    modalLoadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalProductRowItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      paddingHorizontal: 8,
      marginVertical: 2,
    },
    modalProductRowText: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    modalProductPriceText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#059669',
    },
    modalEmptyContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    modalEmptyText: {
      color: COLORS.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
  });
