import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function SwitchRow({ label, value, onValueChange }: SwitchRowProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: theme.primaryColor }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();

  // Categories Switches
  const [generalEnabled, setGeneralEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const [newLeadEnabled, setNewLeadEnabled] = useState(true);
  const [leadFollowUpEnabled, setLeadFollowUpEnabled] = useState(true);

  const [meetingEnabled, setMeetingEnabled] = useState(true);

  const [taskEnabled, setTaskEnabled] = useState(true);

  const [newOrdersEnabled, setNewOrdersEnabled] = useState(false);
  const [orderDeliveredEnabled, setOrderDeliveredEnabled] = useState(true);
  const [orderNotifEnabled, setOrderNotifEnabled] = useState(true);

  const [paymentEnabled, setPaymentEnabled] = useState(false);

  const [securityEnabled, setSecurityEnabled] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>NOTIFICATION</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* General Category */}
        <Text style={styles.categoryTitle}>General</Text>
        <View style={styles.card}>
          <SwitchRow label="Enable Notification" value={generalEnabled} onValueChange={setGeneralEnabled} />
          <SwitchRow label="Push Notifications" value={pushEnabled} onValueChange={setPushEnabled} />
          <SwitchRow label="Email Notification" value={emailEnabled} onValueChange={setEmailEnabled} />
        </View>

        {/* Leads Category */}
        <Text style={styles.categoryTitle}>Leads</Text>
        <View style={styles.card}>
          <SwitchRow label="New Lead Assigned" value={newLeadEnabled} onValueChange={setNewLeadEnabled} />
          <SwitchRow label="Follow - Up Reminder" value={leadFollowUpEnabled} onValueChange={setLeadFollowUpEnabled} />
        </View>

        {/* Meeting Category */}
        <Text style={styles.categoryTitle}>Meeting</Text>
        <View style={styles.card}>
          <SwitchRow label="Meeting Reminder" value={meetingEnabled} onValueChange={setMeetingEnabled} />
        </View>

        {/* Task Category */}
        <Text style={styles.categoryTitle}>Task</Text>
        <View style={styles.card}>
          <SwitchRow label="Task Reminder" value={taskEnabled} onValueChange={setTaskEnabled} />
        </View>

        {/* Orders Category */}
        <Text style={styles.categoryTitle}>Orders</Text>
        <View style={styles.card}>
          <SwitchRow label="New Orders" value={newOrdersEnabled} onValueChange={setNewOrdersEnabled} />
          <SwitchRow label="Order Delivered" value={orderDeliveredEnabled} onValueChange={setOrderDeliveredEnabled} />
          <SwitchRow label="Order Notification" value={orderNotifEnabled} onValueChange={setOrderNotifEnabled} />
        </View>

        {/* Payments Category */}
        <Text style={styles.categoryTitle}>Payments</Text>
        <View style={styles.card}>
          <SwitchRow label="Payment Received" value={paymentEnabled} onValueChange={setPaymentEnabled} />
        </View>

        {/* System Category */}
        <Text style={styles.categoryTitle}>System</Text>
        <View style={styles.card}>
          <SwitchRow label="Security Alerts" value={securityEnabled} onValueChange={setSecurityEnabled} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 46 : 36,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 1,
  },

  scrollContent: {
    padding: 5,
    gap: 5,
    paddingBottom: 150,
  },

  categoryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 1,
    marginBottom: 1,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  switchLabel: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '700',
  },
});
