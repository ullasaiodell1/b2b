import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks/useProducts';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

export default function SelectCategoryScreen() {
  const theme = useTheme();
  const styles = getStyles(theme) as any;

  const router = useRouter();
  const params = useLocalSearchParams<{ currentCategory?: string }>();
  const insets = useSafeAreaInsets();

  const { products, isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.currentCategory || '');

  const categoriesList = React.useMemo(() => {
    const rawCats = products.map((p: any) => p.category_name).filter(Boolean);
    const uniqueCats = Array.from(new Set(rawCats));
    return uniqueCats.length > 0 ? uniqueCats : ['AYURVEDA', 'BASALT ELECTRONIC AMENITIES', 'BASALT ROOM AMENITIES', 'TOILETRIES'];
  }, [products]);

  const filteredCategories = React.useMemo(() => {
    return categoriesList.filter((cat: string) =>
      cat.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoriesList, searchQuery]);

  const handleSelect = () => {
    if (!selectedCategory) {
      Alert.alert('Selection Required', 'Please select a category to proceed.');
      return;
    }
    // Save selection to global object and go back
    (global as any).leadSelection = {
      ...(global as any).leadSelection,
      interestedCategory: selectedCategory,
    };
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
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
            <Text style={{ color: theme.primaryColor }}>INTERESTED </Text>
            <Text style={{ color: COLORS.textDark }}>CATEGORY</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Select category of interest</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Interested Category..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 110, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && categoriesList.length === 0 ? (
            <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginVertical: 20 }} />
          ) : null}

          {filteredCategories.map((category: string, idx: number) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category + '_' + idx}
                style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.9}
              >
                {/* Icon Badge */}
                <View style={[styles.iconBadge, isSelected && { backgroundColor: theme.primaryLight }]}>
                  <Ionicons
                    name="pricetag-outline"
                    size={20}
                    color={isSelected ? theme.primaryColor : COLORS.textMuted}
                  />
                </View>

                <View style={styles.categoryInfoCol}>
                  <Text style={[styles.categoryNameText, isSelected && { color: theme.primaryColor }]}>
                    {category}
                  </Text>
                </View>

                {/* Custom Radio Button */}
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredCategories.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Ionicons name="pricetags-outline" size={48} color="#C2D3CC" />
              <Text style={styles.emptyTitle}>No categories found</Text>
              <Text style={styles.emptySub}>Try searching another keyword</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Sticky Select Button */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 12, 18) }]}>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={handleSelect}
          activeOpacity={0.85}
        >
          <Text style={styles.selectBtnText}>Select Category</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  clearSearchBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryCardSelected: {
    borderColor: theme.primaryColor,
    borderWidth: 1.5,
    shadowColor: theme.primaryColor,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfoCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  categoryNameText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: theme.primaryColor,
    borderWidth: 1.5,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primaryColor,
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
  selectBtn: {
    backgroundColor: COLORS.saveBtnBg,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  selectBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
});
