import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteReminder, useReminders } from '@/hooks/useReminders';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
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

// ─── Helpers ────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

const formatDisplayDate = (isoDate: string) => {
  if (!isoDate) return '—';
  try {
    const d = new Date(isoDate);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return isoDate;
  }
};

const formatDisplayTime = (time: string) => {
  if (!time) return '';
  // time is HH:MM:SS — convert to 12h format e.g. "02:30 PM"
  try {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return time.substring(0, 5);
  }
};

const normalizeList = (data: any): any[] =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.results)
        ? data.results
        : [];

// ─── Main Screen ────────────────────────────────────────────────────
export default function ReminderScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { primaryColor, primaryLight } = useTheme();
  const router = useRouter();

  // ── Route params (when navigated from a lead) ──────────────────
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; referrer?: string }>();
  const filterLeadId = params.leadId || '';
  const filterLeadName = params.leadName || '';
  const isLeadFiltered = !!filterLeadId;

  const handleBack = () => {
    if (params.referrer === 'lead-details' && filterLeadId) {
      router.navigate({
        pathname: '/(tabs)/leads/lead-details',
        params: { id: filterLeadId, activeTab: 'Overview', expandSection: 'reminder' }
      });
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (params.referrer === 'lead-details' && filterLeadId) {
          router.navigate({
            pathname: '/(tabs)/leads/lead-details',
            params: { id: filterLeadId, activeTab: 'Overview', expandSection: 'reminder' }
          });
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [params.referrer, filterLeadId])
  );

  // ── Data sources ────────────────────────────────────────────────
  const reminderParams = isLeadFiltered ? { leadId: filterLeadId } : undefined;
  const { data: reminderData, isLoading, isFetching, refetch } = useReminders(reminderParams);
  const deleteReminderMutation = useDeleteReminder();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmLeadId, setDeleteConfirmLeadId] = useState<string>('');
  const [deleteConfirmLeadName, setDeleteConfirmLeadName] = useState('');

  // ── Normalize reminders ─────────────────────────────────────────
  const reminders = useMemo(() => {
    const list = normalizeList(reminderData).map((item: any) => {
      // remind_at is the source of truth (ISO datetime from API)
      let rDate = '';
      let rTime = item.remind_time || ''; // API also returns remind_time as HH:MM:SS
      if (item.remind_at) {
        try {
          const d = new Date(item.remind_at);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const dy = String(d.getDate()).padStart(2, '0');
            rDate = `${y}-${mo}-${dy}`;
            if (!rTime) {
              const h = String(d.getHours()).padStart(2, '0');
              const mn = String(d.getMinutes()).padStart(2, '0');
              const s = String(d.getSeconds()).padStart(2, '0');
              rTime = `${h}:${mn}:${s}`;
            }
          }
        } catch (_) { }
      }
      return {
        id: String(item.id || ''),
        title: item.title || '',
        description: item.description || item.notes || '',
        reminder_date: rDate || item.reminder_date || item.date || '',
        reminder_time: rTime,
        lead_id: item.lead_id ? String(item.lead_id) : '',
        lead_name: item.lead_name || item.lead?.name || '',
        // API returns lead_company_name (not lead_company)
        lead_company: item.lead_company_name || item.lead_company || item.lead?.company_name || '',
        remind_at: item.remind_at || '',
      };
    });

    // Client-side guard: if API doesn't filter, we do it here
    if (isLeadFiltered) {
      return list.filter((r) => r.lead_id === filterLeadId);
    }
    return list;
  }, [reminderData, isLeadFiltered, filterLeadId]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleAdd = () => {
    navigation.navigate('add-reminder', isLeadFiltered
      ? { leadId: filterLeadId, leadName: filterLeadName }
      : {}
    );
  };

  const handleEdit = (item: (typeof reminders)[0]) => {
    navigation.navigate('add-reminder', {
      reminderId: item.id,
      title: item.title,
      description: item.description,
      reminderDate: item.reminder_date,
      reminderTime: item.reminder_time,
      leadId: item.lead_id,
      leadName: item.lead_name,
      leadCompany: item.lead_company,
    });
  };

  const openDeleteConfirm = (id: string, leadId: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmLeadId(leadId);
    setDeleteConfirmLeadName(name);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteReminderMutation.mutateAsync({ id: deleteConfirmId, leadId: deleteConfirmLeadId });
      setDeleteConfirmId(null);
    } catch (err: any) {
      setDeleteConfirmId(null);
      Alert.alert('Error', err?.message || 'Failed to delete reminder.');
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ──────────────────────────────────── */}
      <View style={[s.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity onPress={handleBack} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          {isLeadFiltered ? (
            <View style={s.leadHeaderInfo}>
              <Text style={s.headerTitle}>
                <Text style={{ color: primaryColor }}>REMINDERS</Text>
              </Text>
              <Text style={s.headerLeadName} numberOfLines={1}>{filterLeadName}</Text>
            </View>
          ) : (
            <>
              <Image source={require('@/assets/images/icon.png')} style={{ width: 20, height: 20, marginRight: 6 }} resizeMode="contain" />
              <Text style={s.logoText}>BASALT</Text>
            </>
          )}
        </View>

        <View style={[s.countBadge, { backgroundColor: primaryLight }]}>
          <Text style={[s.countBadgeText, { color: primaryColor }]}>{reminders.length}</Text>
        </View>
      </View>



      {/* ── REMINDER CARDS LIST ─────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[primaryColor]} />}
      >
        {isLoading && reminders.length === 0 ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={s.loadingText}>Loading reminders...</Text>
          </View>
        ) : reminders.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="alarm-outline" size={52} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={s.emptyTitle}>No Reminders Yet</Text>
            <Text style={s.emptySubtitle}>
              {isLeadFiltered
                ? `No reminders set for ${filterLeadName}. Tap "Add Reminder" to create one.`
                : 'Tap "Add Reminder" to create your first one.'}
            </Text>
          </View>
        ) : (
          reminders.map((item) => (
            <View key={item.id} style={s.card}>

              {/* ── Date/Time badge + action icons ──── */}
              <View style={s.cardTopRow}>
                <View style={[s.alarmBadge, { backgroundColor: primaryLight }]}>
                  <Ionicons name="alarm-outline" size={14} color={primaryColor} />
                  <Text style={[s.alarmBadgeText, { color: primaryColor }]}>
                    {formatDisplayDate(item.reminder_date)}
                  </Text>
                  {!!item.reminder_time && (
                    <Text style={[s.alarmBadgeText, { color: primaryColor }]}>
                      {'  at  ' + formatDisplayTime(item.reminder_time)}
                    </Text>
                  )}
                </View>
                <View style={s.cardActions}>
                  <TouchableOpacity style={s.actionIcon} onPress={() => handleEdit(item)} activeOpacity={0.7}>
                    <Ionicons name="create-outline" size={16} color={primaryColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.actionIcon, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
                    onPress={() => openDeleteConfirm(item.id, item.lead_id, item.lead_name || item.title)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Lead name (only when not already shown in banner) ── */}
              {!!item.lead_name && !isLeadFiltered && (
                <View style={s.leadRow}>
                  <Ionicons name="person-circle-outline" size={16} color={primaryColor} />
                  <Text style={[s.leadName, { color: primaryColor }]}>{item.lead_name}</Text>
                  {!!item.lead_company && (
                    <Text style={s.leadCompany}> · {item.lead_company}</Text>
                  )}
                </View>
              )}

              {/* ── Company in lead-filtered mode ─── */}
              {isLeadFiltered && !!item.lead_company && (
                <View style={s.leadRow}>
                  <Ionicons name="business-outline" size={14} color={COLORS.textMuted} />
                  <Text style={s.leadCompany}>{item.lead_company}</Text>
                </View>
              )}

              {/* ── Title ─────────────────────────── */}
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>

              {/* ── Description ───────────────────── */}
              {!!item.description && (
                <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.fab, { bottom: Math.max(insets.bottom + 90, 100), backgroundColor: primaryColor, shadowColor: primaryColor }]}
        activeOpacity={0.85}
        onPress={handleAdd}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ── DELETE CONFIRM MODAL ─────────────────────── */}
      <Modal visible={!!deleteConfirmId} transparent animationType="fade" onRequestClose={() => setDeleteConfirmId(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalIconWrap}>
              <Ionicons name="trash-outline" size={28} color={COLORS.danger} />
            </View>
            <Text style={s.modalTitle}>Delete Reminder</Text>
            {!!deleteConfirmLeadName && (
              <Text style={s.modalLeadName}>{deleteConfirmLeadName}</Text>
            )}
            <Text style={s.modalMessage}>Are you sure? This action cannot be undone.</Text>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setDeleteConfirmId(null)} activeOpacity={0.8}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.deleteBtn}
                onPress={handleDelete}
                activeOpacity={0.8}
                disabled={deleteReminderMutation.isPending}
              >
                {deleteReminderMutation.isPending
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={s.deleteBtnText}>Delete</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#F4F7F5',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 16, fontWeight: '900', color: COLORS.textDark, letterSpacing: 2 },
  leadHeaderInfo: { alignItems: 'center', gap: 1 },
  headerTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 0.4 },
  headerLeadName: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', maxWidth: 180 },

  // Count badge
  countBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20 },
  countBadgeText: { fontSize: 12, fontWeight: '900' },



  // Scroll
  scrollContent: { padding: 5, gap: 5 },

  // Card
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: COLORS.border,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alarmBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  alarmBadgeText: { fontSize: 12, fontWeight: '800' },
  cardActions: { flexDirection: 'row', gap: 6 },
  actionIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F4F7F5',
    borderWidth: 1, borderColor: COLORS.border,
  },

  // Lead info in card
  leadRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  leadName: { fontSize: 13, fontWeight: '800' },
  leadCompany: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', flex: 1 },

  cardTitle: { fontSize: 15, fontWeight: '900', color: COLORS.textDark },
  cardDesc: { fontSize: 12.5, color: COLORS.textMuted, fontWeight: '600', lineHeight: 18 },

  // States
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  emptySubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 6, textAlign: 'center', fontWeight: '600' },

  // FAB
  fab: {
    position: 'absolute', right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 10, zIndex: 100,
  },

  // Delete modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalBox: {
    backgroundColor: COLORS.bgWhite, borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 340, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  modalIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textDark },
  modalLeadName: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  modalMessage: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4, width: '100%' },
  cancelBtn: {
    flex: 1, height: 46, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.cancelBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  deleteBtn: {
    flex: 1, height: 46, borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});
