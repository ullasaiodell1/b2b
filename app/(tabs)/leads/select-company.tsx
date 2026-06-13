import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCompanies } from '@/services/api/company';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
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

interface CompanyRecord {
  id: string;
  name: string;
  category: string;
  initials: string;
}

const COMPANIES: CompanyRecord[] = [];

export default function SelectCompanyScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams<any>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(params.currentCompany || '');

  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies', searchQuery],
    queryFn: async () => {
      const res = await getCompanies({ search: searchQuery });
      return res;
    },
  });

  // Extract companies list
  let companiesList: any[] = [];
  if (Array.isArray(companiesData)) {
    companiesList = companiesData;
  } else if (Array.isArray(companiesData?.data)) {
    companiesList = companiesData.data;
  } else if (Array.isArray(companiesData?.data?.data)) {
    companiesList = companiesData.data.data;
  }

  // Format companies list to format of CompanyRecord
  const formattedCompanies = companiesList.map((item: any) => {
    const name = item.display_name || item.name || 'N/A';
    const initials = name.slice(0, 2).toUpperCase();
    return {
      id: String(item.id),
      name,
      category: item.industry || item.gstin || 'Company',
      initials,
    };
  });

  const companiesToDisplay = formattedCompanies.length > 0 ? formattedCompanies : COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = () => {
    if (!selectedCompany) {
      Alert.alert('Selection Required', 'Please select a company to proceed.');
      return;
    }
    // Save selection to global object and go back
    (global as any).leadSelection = {
      ...(global as any).leadSelection,
      company: selectedCompany,
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
            <Text style={{ color: theme.primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>COMPANY</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Company Name..."
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

        {/* Companies List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 110, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && companiesList.length === 0 ? (
            <ActivityIndicator size="small" color={theme.primaryColor} style={{ marginVertical: 20 }} />
          ) : null}

          {companiesToDisplay.map((company, idx) => {
            const isSelected = selectedCompany === company.name;
            return (
              <TouchableOpacity
                key={company.id + '_' + idx}
                style={[styles.companyCard, isSelected && styles.companyCardSelected]}
                onPress={() => setSelectedCompany(company.name)}
                activeOpacity={0.9}
              >
                {/* Initials Badge */}
                <View style={styles.initialsBadge}>
                  <Text style={styles.initialsText}>{company.initials}</Text>
                </View>

                <View style={styles.companyInfoCol}>
                  <Text style={styles.companyNameText}>{company.name}</Text>
                  <Text style={styles.companyCategoryText}>{company.category}</Text>
                </View>

                {/* Custom Radio Button */}
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {companiesToDisplay.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color="#C2D3CC" />
              <Text style={styles.emptyTitle}>No companies found</Text>
              <Text style={styles.emptySub}>Try searching another name or category keyword</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Select Company Button */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 12, 18) }]}>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={handleSelect}
          activeOpacity={0.85}
        >
          <Text style={styles.selectBtnText}>Select Company</Text>
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
    paddingHorizontal: 8,
    paddingTop: 5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 5,
    marginBottom: 1,
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
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  companyCardSelected: {
    borderColor: theme.primaryColor,
    borderWidth: 1.5,
    shadowColor: theme.primaryColor,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  initialsBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#BDC3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  companyInfoCol: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  companyNameText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  companyCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
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
