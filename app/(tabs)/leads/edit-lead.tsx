import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadDetails, useUpdateLead } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeadFormComponent from '@/components/lead/LeadFormComponent';

export default function EditLeadScreen() {
  const theme = useTheme();
  const styles = getStyles(theme) as any;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { primaryColor } = useTheme();

  const { data: rawLead, isLoading: isDetailsLoading } = useLeadDetails(id || '');
  const { mutateAsync: updateLead, isPending: isUpdating } = useUpdateLead();

  const handleUpdate = async (payload: any) => {
    try {
      console.log('Sending lead update payload:', JSON.stringify(payload, null, 2));
      await updateLead({ id: id!, data: payload });
      Alert.alert('Success', 'Lead updated successfully!', [
        {
          text: 'OK', onPress: () => {
            (global as any).leadSelection = {};
            navigation.goBack();
          }
        }
      ]);
    } catch (error: any) {
      console.error('Error updating lead:', error);
      Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to update lead.');
    }
  };

  if (isDetailsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13, fontWeight: '600' }}>Loading Details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: primaryColor }}>EDIT </Text>
            <Text style={{ color: COLORS.textDark }}>LEAD PROFILE</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Modify lead information and click update to save.</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <LeadFormComponent
        initialData={rawLead}
        onSubmit={handleUpdate}
        isPending={isUpdating}
        submitButtonText="Update Lead"
        defaultShowAllFields={true}
      />
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
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
