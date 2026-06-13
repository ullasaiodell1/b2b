import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUsers } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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

interface OwnerRecord {
  id: string;
  name: string;
  email: string;
  avatar: any;
}

const OWNERS: OwnerRecord[] = [];

export default function SelectOwnerScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams<any>();
  const insets = useSafeAreaInsets();

  const { data: usersData } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState(params.currentOwnerId || '');
  const [selectedOwnerName, setSelectedOwnerName] = useState(params.currentOwner || '');

  const dynamicOwners = usersData && usersData.length > 0
    ? usersData.map((u: any) => ({
      id: String(u.id),
      name: u.name,
      email: u.email,
      avatar: require('@/assets/images/lead_avatar.png'),
    }))
    : OWNERS;

  const filteredOwners = dynamicOwners.filter((owner: OwnerRecord) =>
    owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = () => {
    if (!selectedOwnerName) {
      Alert.alert('Selection Required', 'Please select a lead owner to proceed.');
      return;
    }
    // Save selection to global object and go back
    (global as any).leadSelection = {
      ...(global as any).leadSelection,
      owner: selectedOwnerName,
      ownerId: selectedOwnerId,
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
            <Text style={{ color: theme.primaryColor }}>ADD LEAD </Text>
            <Text style={{ color: COLORS.textDark }}>OWNER</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        {/* Right Plus Action */}
        <TouchableOpacity
          style={styles.plusBtn}
          onPress={() => Alert.alert('Create Owner', 'Create new owner profile details...')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={theme.primaryColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Lead Owner Name..."
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

        {/* Owners List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 110, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredOwners.map((owner: OwnerRecord, idx: number) => {
            const isSelected = selectedOwnerId ? selectedOwnerId === owner.id : selectedOwnerName === owner.name;
            return (
              <TouchableOpacity
                key={owner.name + '_' + idx}
                style={[styles.ownerCard, isSelected && styles.ownerCardSelected]}
                onPress={() => {
                  setSelectedOwnerId(owner.id);
                  setSelectedOwnerName(owner.name);
                }}
                activeOpacity={0.9}
              >
                <Image source={owner.avatar} style={styles.avatarImage} />

                <View style={styles.ownerInfoCol}>
                  <Text style={styles.ownerNameText}>{owner.name}</Text>
                  <Text style={styles.ownerEmailText}>{owner.email}</Text>
                </View>

                {/* Custom Radio Button */}
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredOwners.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#C2D3CC" />
              <Text style={styles.emptyTitle}>No owners found</Text>
              <Text style={styles.emptySub}>Try searching another name or email keyword</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Select Owner Button */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom + 12, 18) }]}>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={handleSelect}
          activeOpacity={0.85}
        >
          <Text style={styles.selectBtnText}>Select Lead Owner</Text>
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
  plusBtn: {
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
    paddingHorizontal: 14,
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
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  ownerCardSelected: {
    borderColor: theme.primaryColor,
    borderWidth: 1.5,
    shadowColor: theme.primaryColor,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  ownerInfoCol: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  ownerNameText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  ownerEmailText: {
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
