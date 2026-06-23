import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApprovals, useUpdateLeaveStatus } from '@/hooks/useLeave';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LeaveApprovalsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: approvalsData, isLoading: approvalsLoading, refetch: refetchApprovals } = useApprovals();
  const updateStatusMutation = useUpdateLeaveStatus();

  const [actionRemarkModalVisible, setActionRemarkModalVisible] = useState(false);
  const [selectedActionLeave, setSelectedActionLeave] = useState<any>(null);
  const [selectedActionType, setSelectedActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [actionRemark, setActionRemark] = useState('');

  const openActionRemarkModal = (leave: any, type: 'APPROVED' | 'REJECTED') => {
    setSelectedActionLeave(leave);
    setSelectedActionType(type);
    setActionRemark('');
    setActionRemarkModalVisible(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedActionLeave || !selectedActionType) return;
    try {
      await updateStatusMutation.mutateAsync({
        leaveId: selectedActionLeave.id,
        status: selectedActionType,
        action_remark: actionRemark.trim() || undefined,
      });

      Alert.alert('Success', `Leave request ${selectedActionType.toLowerCase()} successfully.`);
      setActionRemarkModalVisible(false);
      setSelectedActionLeave(null);
      setSelectedActionType(null);
      refetchApprovals();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to update leave status.');
    }
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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>LEAVE </Text>
            <Text style={{ color: COLORS.textDark }}>APPROVALS</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Review Subordinate Leave Requests</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <View style={styles.container}>
        {approvalsLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
          </View>
        ) : (
          <FlatList
            data={approvalsData?.data || []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: 14 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const badge = getStatusBadgeConfig(item.status);
              const isPending = item.status?.toUpperCase() === 'PENDING';
              return (
                <View style={styles.leaveCard}>
                  {/* Leave Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.employeeName}>{item.user_name || 'Subordinate'}</Text>
                      <Text style={styles.employeeEmail}>{item.user_email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  {/* Card Details Grid */}
                  <View style={styles.cardDetailsGrid}>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>
                        {item.leave_type_name} ({item.leave_type})
                      </Text>
                    </View>

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

                    {item.remark && (
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailLabel}>Reason:</Text>
                        <Text style={styles.detailValue}>{item.remark}</Text>
                      </View>
                    )}

                    {item.action_remark && (
                      <View style={[styles.detailRow, styles.actionRemarkBox]}>
                        <Ionicons name="chatbox-ellipses-outline" size={14} color={badge.text} />
                        <Text style={[styles.detailLabel, { color: badge.text }]}>Action Note:</Text>
                        <Text style={[styles.detailValue, { color: COLORS.textDark }]}>
                          {item.action_remark}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Approval Actions */}
                  {isPending && (
                    <View style={styles.approvalActionsRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => openActionRemarkModal(item, 'APPROVED')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => openActionRemarkModal(item, 'REJECTED')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color="#C2D3CC" />
                <Text style={styles.emptyTitle}>No approvals found</Text>
                <Text style={styles.emptySub}>There are no employee leave requests for you to approve.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* --- MODAL: ACTION REMARK FOR APPROVE/REJECT --- */}
      <Modal visible={actionRemarkModalVisible} animationType="fade" transparent>
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>
              Confirm {selectedActionType === 'APPROVED' ? 'Approval' : 'Rejection'}
            </Text>
            <Text style={styles.dialogDesc}>
              Do you want to {selectedActionType === 'APPROVED' ? 'approve' : 'reject'} the leave request for{' '}
              <Text style={{ fontWeight: 'bold' }}>{selectedActionLeave?.user_name}</Text>?
            </Text>

            <TextInput
              style={styles.dialogInput}
              placeholder="Add optional notes/remarks for employee..."
              placeholderTextColor={COLORS.textMuted}
              value={actionRemark}
              onChangeText={setActionRemark}
              multiline
            />

            <View style={styles.dialogButtonsRow}>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnCancel]}
                onPress={() => {
                  setActionRemarkModalVisible(false);
                  setSelectedActionLeave(null);
                  setSelectedActionType(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dialogBtnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dialogBtn,
                  selectedActionType === 'APPROVED' ? styles.dialogBtnApprove : styles.dialogBtnReject,
                ]}
                onPress={handleActionSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.dialogBtnSubmitText}>
                  {selectedActionType === 'APPROVED' ? 'Approve' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
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
    container: {
      flex: 1,
      paddingHorizontal: 12,
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
    employeeName: {
      fontSize: 14,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    employeeEmail: {
      fontSize: 11,
      color: COLORS.textMuted,
      fontWeight: '600',
    },
    approvalActionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
      paddingTop: 10,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 8,
      paddingVertical: 8,
    },
    approveBtn: {
      backgroundColor: '#22C55E',
    },
    rejectBtn: {
      backgroundColor: '#EF4444',
    },
    actionBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
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
    dialogOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    dialogBox: {
      backgroundColor: COLORS.bgWhite,
      borderRadius: 16,
      width: '100%',
      maxWidth: 320,
      padding: 18,
      gap: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
    },
    dialogTitle: {
      fontSize: 15.5,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    dialogDesc: {
      fontSize: 12,
      color: COLORS.textMid,
      lineHeight: 18,
    },
    dialogInput: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      padding: 10,
      fontSize: 12.5,
      fontWeight: '600',
      color: COLORS.textDark,
      height: 60,
      textAlignVertical: 'top',
    },
    dialogButtonsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 6,
    },
    dialogBtn: {
      flex: 1,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialogBtnCancel: {
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: '#FFFFFF',
    },
    dialogBtnCancelText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: COLORS.textDark,
    },
    dialogBtnApprove: {
      backgroundColor: '#22C55E',
    },
    dialogBtnReject: {
      backgroundColor: '#EF4444',
    },
    dialogBtnSubmitText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });
