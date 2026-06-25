import React from 'react';
import {
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateLead } from '@/hooks/useLeads';
import LeadFormComponent from './LeadFormComponent';

export interface AddLeadComponentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddLeadComponent({ onSuccess, onCancel }: AddLeadComponentProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { primaryColor } = theme;

  const { mutateAsync: createLead, isPending: isCreating } = useCreateLead();

  const handleBack = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    navigation.goBack();
  };

  const handleSave = async (payload: any) => {
    try {
      console.log('Sending lead creation payload:', JSON.stringify(payload, null, 2));
      await createLead(payload);
      Alert.alert('Success', 'Lead created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (onSuccess) {
              onSuccess();
              return;
            }
            navigation.navigate('index' as any);
          }
        }
      ]);
    } catch (error: any) {
      console.error('Error creating lead:', error);
      Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to create lead. Please check inputs.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: primaryColor }}>ADD </Text>
            <Text style={{ color: COLORS.textDark }}>LEAD</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Fill In The Details Below</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <LeadFormComponent
        onSubmit={handleSave}
        isPending={isCreating}
        submitButtonText="Save Lead"
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
});
