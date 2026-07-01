import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNotifications } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
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
  isLocal?: boolean;
}

function NotificationItem({
  title,
  time,
  body,
  type,
  buttonLabel,
  onPressButton,
  isLocal,
}: NotificationItemProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={{ width: 32, height: 32, borderRadius: 6, marginTop: 2 }}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Text style={styles.cardTitle}>{title}</Text>
              {isLocal && (
                <View style={{ backgroundColor: theme.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 8, fontWeight: '800', color: theme.primaryColor }}>REMINDER</Text>
                </View>
              )}
            </View>
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
              <Ionicons name="arrow-forward" size={14} color={theme.primaryColor} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}

          {type === 'app-update' && (
            <TouchableOpacity activeOpacity={0.7} onPress={onPressButton}>
              <Text style={styles.updateLinkText}>{buttonLabel || "Tap To See What's New ?"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const groupNotifications = (notifications: any[]) => {
  const todayList: any[] = [];
  const yesterdayList: any[] = [];
  const earlierList: any[] = [];

  notifications.forEach((item) => {
    const timeStr = item.created_at || item.createdAt || item.time;
    if (!timeStr) {
      earlierList.push(item);
      return;
    }
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      earlierList.push(item);
      return;
    }

    if (isToday(date)) {
      todayList.push(item);
    } else if (isYesterday(date)) {
      yesterdayList.push(item);
    } else {
      earlierList.push(item);
    }
  });

  return { todayList, yesterdayList, earlierList };
};

export default function NotificationScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading: apiLoading, isFetching: apiFetching, refetch } = useNotifications();

  const [localNotifications, setLocalNotifications] = React.useState<any[]>([]);
  const [localLoading, setLocalLoading] = React.useState(false);

  const fetchLocalNotifications = async () => {
    try {
      if (Platform.OS === 'web') return;
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const formatted = scheduled.map((notif) => {
        let triggerDateStr = new Date().toISOString();
        if (notif.trigger && typeof notif.trigger === 'object') {
          const triggerObj = notif.trigger as any;
          if (triggerObj.value) {
            triggerDateStr = new Date(triggerObj.value).toISOString();
          } else if (triggerObj.date) {
            triggerDateStr = new Date(triggerObj.date).toISOString();
          }
        }
        return {
          id: notif.identifier,
          title: notif.content.title || 'Notification',
          body: notif.content.body || '',
          created_at: triggerDateStr,
          type: notif.content.data?.type || 'app-update',
          data: notif.content.data || {},
          isLocal: true,
        };
      });
      setLocalNotifications(formatted);
    } catch (e) {
      console.warn('Failed to fetch local notifications:', e);
    }
  };

  React.useEffect(() => {
    setLocalLoading(true);
    fetchLocalNotifications().finally(() => setLocalLoading(false));
  }, []);

  const handleRefresh = async () => {
    await refetch();
    await fetchLocalNotifications();
  };

  const notificationsList = React.useMemo(() => {
    let apiList: any[] = [];
    if (Array.isArray(data)) {
      apiList = data;
    } else if (Array.isArray(data?.data)) {
      apiList = data.data;
    } else if (Array.isArray(data?.data?.data)) {
      apiList = data.data.data;
    }

    const combined = [...apiList, ...localNotifications];
    combined.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || a.time || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || b.time || 0).getTime();
      return dateB - dateA;
    });

    return combined;
  }, [data, localNotifications]);

  const { todayList, yesterdayList, earlierList } = React.useMemo(() => {
    return groupNotifications(notificationsList);
  }, [notificationsList]);

  const formatNotificationTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    try {
      if (isToday(date)) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else if (isYesterday(date)) {
        return `Yesterday • ${format(date, 'h:mm a')}`;
      } else {
        return format(date, 'MMM d • h:mm a');
      }
    } catch (e) {
      console.error('[formatNotificationTime] Error formatting date:', e);
      return dateString;
    }
  };

  const handleAction = (item: any) => {
    const type = item.type;
    const metadata = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {};

    switch (type) {
      case 'download-bill':
        Alert.alert('Download', 'Downloading E-Way Bill PDF...');
        break;
      case 'track':
        Alert.alert('Track Order', 'Safexpress Package tracker opened.');
        break;
      case 'confirm-order':
        router.navigate('/(tabs)/Order' as any);
        break;
      case 'app-update':
        Alert.alert('App Update', metadata.changelog || 'Check the app store for latest features.');
        break;
      case 'lead-assigned':
      case 'new-lead':
        router.navigate('/(tabs)/leads' as any);
        break;
      case 'meeting':
      case 'follow-ups':
      case 'follow-ups-scheduled':
        router.navigate('/(tabs)/follow-ups' as any);
        break;
      case 'quotation':
        router.navigate('/(tabs)/Quotation' as any);
        break;
      case 'task':
        router.navigate('/(tabs)/task' as any);
        break;
      case 'client':
        router.navigate('/(tabs)/company' as any);
        break;
      default:
        if (metadata.route) {
          router.navigate(metadata.route);
        } else {
          Alert.alert(item.title || 'Notification', item.body || item.message || '');
        }
        break;
    }
  };

  const getType = (type?: string): NotificationItemProps['type'] => {
    switch (type) {
      case 'download-bill':
      case 'payment-badge':
      case 'track':
      case 'confirm-order':
      case 'app-update':
        return type;
      default:
        return 'app-update'; // default fallback
    }
  };

  const isLoading = apiLoading || localLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
        {/* ── HEADER ────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>Notif</Text>
            <Text style={{ color: COLORS.textDark }}>ication</Text>
          </Text>
        </View>
        <View style={styles.loadingIndicatorContainer}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>Notif</Text>
          <Text style={{ color: COLORS.textDark }}>ication</Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={apiFetching} onRefresh={handleRefresh} colors={[theme.primaryColor]} />
        }
      >
        {notificationsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>We'll notify you when something important happens.</Text>
          </View>
        ) : (
          <>
            {/* TODAY SECTION */}
            {todayList.length > 0 && (
              <>
                <View style={styles.sectionDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>TODAY</Text>
                  <View style={styles.dividerLine} />
                </View>
                {todayList.map((item, index) => (
                  <NotificationItem
                    key={item.id || `today-${index}`}
                    title={item.title || 'Notification'}
                    time={formatNotificationTime(item.created_at || item.createdAt || item.time)}
                    body={item.body || item.message || item.description || ''}
                    type={getType(item.type)}
                    buttonLabel={item.buttonLabel || item.button_label || undefined}
                    onPressButton={() => handleAction(item)}
                    isLocal={item.isLocal}
                  />
                ))}
              </>
            )}

            {/* YESTERDAY SECTION */}
            {yesterdayList.length > 0 && (
              <>
                <View style={styles.sectionDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>YESTERDAY</Text>
                  <View style={styles.dividerLine} />
                </View>
                {yesterdayList.map((item, index) => (
                  <NotificationItem
                    key={item.id || `yesterday-${index}`}
                    title={item.title || 'Notification'}
                    time={formatNotificationTime(item.created_at || item.createdAt || item.time)}
                    body={item.body || item.message || item.description || ''}
                    type={getType(item.type)}
                    buttonLabel={item.buttonLabel || item.button_label || undefined}
                    onPressButton={() => handleAction(item)}
                    isLocal={item.isLocal}
                  />
                ))}
              </>
            )}

            {/* EARLIER SECTION */}
            {earlierList.length > 0 && (
              <>
                <View style={styles.sectionDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>EARLIER</Text>
                  <View style={styles.dividerLine} />
                </View>
                {earlierList.map((item, index) => (
                  <NotificationItem
                    key={item.id || `earlier-${index}`}
                    title={item.title || 'Notification'}
                    time={formatNotificationTime(item.created_at || item.createdAt || item.time)}
                    body={item.body || item.message || item.description || ''}
                    type={getType(item.type)}
                    buttonLabel={item.buttonLabel || item.button_label || undefined}
                    onPressButton={() => handleAction(item)}
                    isLocal={item.isLocal}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 8,
    paddingTop: 3,
    paddingBottom: 100,
  },

  // Centered section dividers
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    gap: 1,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 5,
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
    borderColor: theme.primaryColor,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: theme.primaryColor,
    fontSize: 11,
    fontWeight: '800',
  },
  paymentBadge: {
    backgroundColor: theme.primaryLight,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  paymentBadgeText: {
    color: theme.primaryColor,
    fontSize: 11,
    fontWeight: '800',
  },
  blackBtn: {
    backgroundColor: theme.primaryColor,
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
    borderColor: theme.primaryColor,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: theme.primaryColor,
    fontSize: 11,
    fontWeight: '800',
  },
  updateLinkText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  loadingIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
});
