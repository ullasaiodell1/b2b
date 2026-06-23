import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LeadMeetingFilterScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams<{ leadId?: string }>();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEETING FILTER</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Meeting filters are managed directly on the meetings calendar screen.</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  closeBtn: {
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
