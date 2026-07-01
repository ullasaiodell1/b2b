import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LeadProformaFilterScreen() {
  const route = useRoute<any>();
  const params = (route.params ?? {}) as {
    referrer?: string;
    leadId?: string;
    pStartDate?: string;
    pEndDate?: string;
  };
  const navigation = useNavigation<any>();
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    navigation.goBack();
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (params.pStartDate) {
      const parsed = new Date(params.pStartDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (params.pEndDate) {
      const parsed = new Date(params.pEndDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDateShort = (date: Date | null) => {
    if (!date) return 'Select Date';
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).substring(2);
    return `${day} ${month} ${year}`;
  };

  const handleResetAll = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleApplyFilter = () => {
    const startStr = startDate ? startDate.toISOString() : '';
    const endStr = endDate ? endDate.toISOString() : '';
    const isApplied = !!(startDate || endDate);

    if (params.referrer === 'lead-details') {
      navigation.dispatch((state: any) => {
        const prevRoutes = state.routes.slice(0, -1);
        const updatedRoutes = prevRoutes.map((route: any, index: number) => {
          if (index === prevRoutes.length - 1) {
            return {
              ...route,
              params: {
                ...route.params,
                id: params.leadId,
                activeTab: 'Proforma',
                pStartDate: startStr,
                pEndDate: endStr,
                pFilterApplied: isApplied ? 'true' : '',
              },
            };
          }
          return route;
        });
        return CommonActions.reset({
          ...state,
          routes: updatedRoutes,
          index: updatedRoutes.length - 1,
        });
      });
    } else {
      navigation.navigate('lead-proforma' as never, {
        leadId: params.leadId,
        pStartDate: startStr,
        pEndDate: endStr,
        pFilterApplied: isApplied ? 'true' : '',
      } as never);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={{ color: theme.primaryColor }}>PROFORMA </Text>
          <Text style={{ color: COLORS.textDark }}>FILTER</Text>
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* BODY CONTROLS */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.panelTitleRow}>
            <View style={styles.verticalIndicator} />
            <Text style={styles.panelTitleText}>Filters</Text>
          </View>
          <TouchableOpacity onPress={handleResetAll} activeOpacity={0.7}>
            <Text style={styles.resetAllText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.primaryColor} style={{ marginRight: 2 }} />
            <Text style={styles.sectionLabel}>Date Range</Text>
          </View>

          <View style={styles.datePickerRow}>
            <TouchableOpacity
              style={styles.dateDropdown}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.dateLabelText}>From Date</Text>
                <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                  {formatDateShort(startDate)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateDropdown}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.dateLabelText}>To Date</Text>
                <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                  {formatDateShort(endDate)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApplyFilter}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>

      {/* SYSTEM DATE PICKERS */}
      {showStartPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showStartPicker}>
            <TouchableOpacity
              style={styles.calendarOverlay}
              activeOpacity={1}
              onPress={() => setShowStartPicker(false)}
            >
              <View style={styles.calendarContent}>
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="inline"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (selectedDate) setStartDate(selectedDate);
                  }}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { marginTop: 10 }]}
                  onPress={() => setShowStartPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(event: any, selectedDate?: Date) => {
              setShowStartPicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )
      )}

      {showEndPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={showEndPicker}>
            <TouchableOpacity
              style={styles.calendarOverlay}
              activeOpacity={1}
              onPress={() => setShowEndPicker(false)}
            >
              <View style={styles.calendarContent}>
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="inline"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { marginTop: 10 }]}
                  onPress={() => setShowEndPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event: any, selectedDate?: Date) => {
              setShowEndPicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 14.5, fontWeight: '800', color: COLORS.textDark },
  scrollContent: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 150, gap: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verticalIndicator: { width: 3.5, height: 16, backgroundColor: theme.primaryColor, borderRadius: 2 },
  panelTitleText: { fontSize: 14.5, fontWeight: '800', color: COLORS.textDark },
  resetAllText: { fontSize: 12.5, fontWeight: '700', color: COLORS.danger },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textDark },
  datePickerRow: { flexDirection: 'row', gap: 10 },
  dateDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  dateLabelText: { fontSize: 9.5, fontWeight: '700', color: COLORS.textMuted, marginBottom: 2 },
  dateText: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  datePlaceholder: { color: '#9CA3AF' },
  filterCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.textDark },
  applyBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContent: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
});
