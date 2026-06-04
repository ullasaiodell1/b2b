import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#346556',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
};

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function SwitchRow({ label, value, onValueChange }: SwitchRowProps) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
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
    <View style={styles.root}>
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
    </View>
  );
}

const styles: any = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
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
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },

  categoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 4,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  switchLabel: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '700',
  },
});
