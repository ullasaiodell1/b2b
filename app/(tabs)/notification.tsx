import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationItemProps {
  title: string;
  time: string;
  body: string;
  type: 'download-bill' | 'payment-badge' | 'track' | 'confirm-order' | 'app-update';
  buttonLabel?: string;
  onPressButton?: () => void;
}

function NotificationItem({
  title,
  time,
  body,
  type,
  buttonLabel,
  onPressButton,
}: NotificationItemProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.timeText}>• {time}</Text>
      </View>

      {/* Body */}
      <Text style={styles.cardBody}>{body}</Text>

      {/* Action Element based on Type */}
      {type === 'download-bill' && (
        <TouchableOpacity
          style={styles.outlineBtn}
          activeOpacity={0.8}
          onPress={onPressButton}
        >
          <Text style={styles.outlineBtnText}>{buttonLabel || 'Download E-Way Bill'}</Text>
        </TouchableOpacity>
      )}

      {type === 'payment-badge' && (
        <View style={styles.paymentBadge}>
          <Text style={styles.paymentBadgeText}>{buttonLabel || 'Paid - HDFC-4521'}</Text>
        </View>
      )}

      {type === 'track' && (
        <TouchableOpacity
          style={styles.blackBtn}
          activeOpacity={0.8}
          onPress={onPressButton}
        >
          <Text style={styles.blackBtnText}>{buttonLabel || 'Track'}</Text>
        </TouchableOpacity>
      )}

      {type === 'confirm-order' && (
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.8}
          onPress={onPressButton}
        >
          <Text style={styles.confirmBtnText}>{buttonLabel || 'Confirm Order'}</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      )}

      {type === 'app-update' && (
        <TouchableOpacity activeOpacity={0.7} onPress={onPressButton}>
          <Text style={styles.updateLinkText}>{"Tap To See What's New ?"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();

  const handleDownload = () => {
    Alert.alert('Download', 'Downloading E-Way Bill PDF...');
  };

  const handleTrack = () => {
    Alert.alert('Track Order', 'Flipkart package tracker opened.');
  };

  const handleConfirm = () => {
    Alert.alert('Confirm Order', 'Order confirmed successfully!');
  };

  const handleUpdateNotes = () => {
    Alert.alert('App Update v3.2.1', 'Changelog:\n- Bulk Invoice Download\n- E-Way Bill Integration\n- Offline Order Entry Mode');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <Text style={styles.headerTitle}>
          <Text style={{ color: COLORS.primary }}>Notif</Text>
          <Text style={{ color: COLORS.textDark }}>ication</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* TODAY SECTION */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>TODAY</Text>
          <View style={styles.dividerLine} />
        </View>

        <NotificationItem
          title="Order Dispatched Successfully"
          time="30 Minute"
          body="Order #ORD-2026-00908 for Mehta Industries has been dispatched via Safexpress. LR No: SFX884421."
          type="download-bill"
          buttonLabel="Download E-Way Bill"
          onPressButton={handleDownload}
        />

        <NotificationItem
          title="Payment Successful"
          time="30 Minute"
          body="₹4,299 paid to Netflix India. Subscription renewed for 12 months."
          type="payment-badge"
          buttonLabel="Paid - HDFC-4521"
        />

        <NotificationItem
          title="Your package is nearby"
          time="2 Hour ago"
          body="Order #52841 from Flipkart — out for delivery. Arriving by 6:00 PM."
          type="track"
          buttonLabel="Track"
          onPressButton={handleTrack}
        />

        {/* YESTERDAY SECTION */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>YESTERDAY — MAR 8</Text>
          <View style={styles.dividerLine} />
        </View>

        <NotificationItem
          title="Urgent — New Order Received"
          time="30 Minute"
          body="Ambica Steels Pvt. Ltd. placed a new order #ORD-2026-01042 worth ₹3,24,800."
          type="confirm-order"
          buttonLabel="Confirm Order"
          onPressButton={handleConfirm}
        />

        <NotificationItem
          title="Payment Successful"
          time="30 Minute"
          body="₹4,299 paid to Netflix India. Subscription renewed for 12 months."
          type="payment-badge"
          buttonLabel="Paid - HDFC-4521"
        />

        {/* SATURDAY SECTION */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>SATURDAY — MAR 7</Text>
          <View style={styles.dividerLine} />
        </View>

        <NotificationItem
          title="App Updated to v3.2.1"
          time="30 Minute"
          body="New features: Bulk invoice download, Improved E-Way Bill integration, offline mode for order entry."
          type="app-update"
          onPressButton={handleUpdateNotes}
        />

        <NotificationItem
          title="Payment Successful"
          time="30 Minute"
          body="₹4,299 paid to Netflix India. Subscription renewed for 12 months."
          type="payment-badge"
          buttonLabel="Paid - HDFC-4521"
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 40,
  },

  // Centered section dividers
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // Cards
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
    paddingRight: 8,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#10B981',
  },
  cardBody: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 6,
    marginBottom: 10,
  },

  // Buttons
  outlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  paymentBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  paymentBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  blackBtn: {
    backgroundColor: '#000000',
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  blackBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  confirmBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  updateLinkText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
});
