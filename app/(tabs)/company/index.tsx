import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCompanies } from '@/services/api/company';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView, Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CompanyListScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['companies', search],
    queryFn: async () => {
      const res = await getCompanies({ search });
      console.log('[Companies] Raw response:', JSON.stringify(res)?.slice(0, 200));
      return res;
    },
  });

  // Backend returns { total, data: [...] } — axios interceptor already unwraps response.data
  // So `data` from useQuery = { total: N, data: [...companies] }
  let companies: any[] = [];
  if (Array.isArray(data)) {
    companies = data;
  } else if (Array.isArray(data?.data)) {
    companies = data.data;
  } else if (Array.isArray(data?.data?.data)) {
    companies = data.data.data;
  }

  const renderCompanyItem = ({ item }: { item: any }) => {
    const initial = item.display_name ? item.display_name.charAt(0).toUpperCase() : 'C';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/company/company-info',
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.displayName}>{item.display_name || 'N/A'}</Text>
            {item.legal_name && item.legal_name !== item.display_name && (
              <Text style={styles.legalName}>{item.legal_name}</Text>
            )}
          </View>
          {item.gstin && (
            <View style={styles.gstBadge}>
              <Text style={styles.gstText}>GST: {item.gstin}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color={theme.primaryColor} />
            <Text style={styles.infoText}>{item.phone || 'No phone number'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color={theme.primaryColor} />
            <Text style={styles.infoText}>{item.email || 'No email address'}</Text>
          </View>

          {(item.city || item.state) && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={theme.primaryColor} />
              <Text style={styles.infoText}>
                {[item.address, item.city, item.state, item.pincode].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader title="Companies" showSearch={false} />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search companies..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={styles.loaderText}>Loading companies...</Text>
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCompanyItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          onRefresh={refetch}
          refreshing={isFetching}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No companies found</Text>
            </View>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 5,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primaryColor,
  },
  headerTextContainer: {
    flex: 1,
    gap: 1,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  legalName: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  gstBadge: {
    backgroundColor: '#E6F4EA',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  gstText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: theme.primaryColor,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  cardBody: {
    gap: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
