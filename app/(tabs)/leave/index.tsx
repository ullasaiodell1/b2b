import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApprovals, useDeleteLeave, useLeaves } from '@/hooks/useLeave';
import { getUserData } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function LeaveScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Fetch current user details
  useEffect(() => {
    getUserData().then((user) => {
      if (user) {
        setCurrentUserId(user.id || '');
      }
    });
  }, []);

  const [myFilter, setMyFilter] = useState<StatusFilter>('ALL');

  // Query personal leaves — only enabled after user ID is resolved from storage
  const { data: myLeavesData, isLoading: myLeavesLoading, refetch: refetchMyLeaves } = useLeaves(
    currentUserId
      ? {
          status: myFilter === 'ALL' ? undefined : myFilter,
          user_id: currentUserId,
        }
      : undefined
  );

  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        refetchMyLeaves();
      }
    }, [currentUserId, refetchMyLeaves])
  );

  // Query approvals banner count — only run after user is loaded
  const { data: approvalsData } = useApprovals({
    status: 'PENDING',
  });

  const deleteLeaveMutation = useDeleteLeave();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchMyLeaves();
    setRefreshing(false);
  };

  // Handle Cancel Leave
  const handleCancelLeave = (leaveId: string) => {
    Alert.alert('Cancel Leave Request', 'Are you sure you want to cancel this leave request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLeaveMutation.mutateAsync(leaveId);
            Alert.alert('Success', 'Leave request cancelled successfully.');
            refetchMyLeaves();
          } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to cancel leave request.');
          }
        },
      },
    ]);
  };

  const getStatusBadgeConfig = (status: string) => {
    const formatted = status ? status.toUpperCase() : 'PENDING';
    switch (formatted) {
      case 'APPROVED':
        return { label: 'Approved', bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' };
      case 'REJECTED':
        return { label: 'Rejected', bg: '#FEF2F2', text: '#B91C1C', border: '#FEE2E2' };
      default:
        return { label: 'Pending', bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' };
    }
  };

  const formatDateLabel = (rawDate: string) => {
    if (!rawDate) return '--';
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const pendingApprovalsCount = approvalsData?.total || 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      <CustomHeader title="Leave Management" showSearch={false} />

      <View style={styles.container}>
        {/* --- PENDING APPROVALS NOTIFICATION BANNER (For Managers) --- */}
        {pendingApprovalsCount > 0 && (
          <TouchableOpacity
            style={styles.approvalsBanner}
            onPress={() => router.push('/(tabs)/leave/approvals')}
            activeOpacity={0.85}
          >
            <View style={styles.bannerLeft}>
              <Ionicons name="notifications" size={20} color="#EA580C" />
              <Text style={styles.bannerText}>
                You have <Text style={{ fontWeight: '800' }}>{pendingApprovalsCount}</Text> pending leave approval requests.
              </Text>
            </View>
            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Review</Text>
              <Ionicons name="chevron-forward" size={14} color="#EA580C" />
            </View>
          </TouchableOpacity>
        )}

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, myFilter === f && styles.filterPillActive]}
              onPress={() => setMyFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, myFilter === f && styles.filterPillTextActive]}>
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {myLeavesLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
          </View>
        ) : (
          <FlatList
            data={myLeavesData?.data || []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.primaryColor]}
                tintColor={theme.primaryColor}
              />
            }
            renderItem={({ item }) => {
              const badge = getStatusBadgeConfig(item.status);
              return (
                <View style={styles.leaveCard}>
                  {/* Leave Card Header */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.leaveTypeTitle}>{item.leave_type_name || 'Leave'}</Text>
                      <Text style={styles.leaveTypeSub}>{item.leave_type || 'General'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  {/* Card Details Grid */}
                  <View style={styles.cardDetailsGrid}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>
                        {formatDateLabel(item.start_date)} to {formatDateLabel(item.end_date)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.detailLabel}>Shift:</Text>
                      <Text style={styles.detailValue}>
                        {item.leave_duration === 'HALF_DAY' ? 'Half Day' : 'Full Day'}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.detailLabel}>Approver:</Text>
                      <Text style={styles.detailValue}>{item.approval_from_email || 'None'}</Text>
                    </View>

                    {item.remark && (
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailLabel}>Reason:</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>
                          {item.remark}
                        </Text>
                      </View>
                    )}

                    {item.action_remark && (
                      <View style={[styles.detailRow, styles.actionRemarkBox]}>
                        <Ionicons name="chatbox-ellipses-outline" size={14} color={badge.text} />
                        <Text style={[styles.detailLabel, { color: badge.text }]}>Manager Note:</Text>
                        <Text style={[styles.detailValue, { color: COLORS.textDark }]}>
                          {item.action_remark}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Pending Action: Cancel Request */}
                  {item.status?.toUpperCase() === 'PENDING' && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancelLeave(item.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      <Text style={styles.cancelBtnText}>Cancel Leave Request</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="calendar-clear-outline" size={48} color="#C2D3CC" />
                <Text style={styles.emptyTitle}>No leaves found</Text>
                <Text style={styles.emptySub}>You have not applied for any leave under this filter.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button '+' (Apply Leave) */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom + 120, 130) }]}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/leave/apply')}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    container: {
      flex: 1,
      paddingHorizontal: 12,
    },
    approvalsBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFF7ED',
      borderWidth: 1.5,
      borderColor: '#FED7AA',
      borderRadius: 12,
      padding: 12,
      marginTop: 10,
    },
    bannerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    bannerText: {
      fontSize: 12,
      color: '#C2410C',
      fontWeight: '600',
      flex: 1,
    },
    bannerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    bannerBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#EA580C',
    },
    filterRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      gap: 8,
    },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: COLORS.bgWhite,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    filterPillActive: {
      backgroundColor: theme.primaryColor,
      borderColor: theme.primaryColor,
    },
    filterPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.textMuted,
    },
    filterPillTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    leaveCard: {
      backgroundColor: COLORS.bgWhite,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: 10,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
    },
    leaveTypeTitle: {
      fontSize: 14.5,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    leaveTypeSub: {
      fontSize: 10.5,
      fontWeight: '600',
      color: COLORS.textMuted,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    cardDetailsGrid: {
      paddingVertical: 8,
      gap: 6,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    detailLabel: {
      fontSize: 11.5,
      fontWeight: '700',
      color: COLORS.textMuted,
      width: 70,
    },
    detailValue: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.textDark,
      flex: 1,
    },
    actionRemarkBox: {
      marginTop: 4,
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#F8FAFC',
      borderLeftWidth: 3,
      borderLeftColor: COLORS.border,
    },
    cancelBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: '#FEE2E2',
      borderRadius: 8,
      paddingVertical: 8,
      marginTop: 8,
    },
    cancelBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#EF4444',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: 14,
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
    fab: {
      position: 'absolute',
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primaryColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 10,
      zIndex: 100,
    },
  });
