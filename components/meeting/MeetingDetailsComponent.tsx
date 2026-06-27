import { MeetingRecord, meetingsState, subscribeToMeetings } from '@/components/meeting/MeetingState';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface MeetingDetailsComponentProps {
  id: string;
  onBack?: () => void;
  hideHeader?: boolean;
}

export const MeetingDetailsComponent: React.FC<MeetingDetailsComponentProps> = ({
  id,
  onBack,
  hideHeader = false,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [meeting, setMeeting] = useState<MeetingRecord | null>(null);
  const [showAllFields, setShowAllFields] = useState(false);

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }) + ' ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch {
      return String(dateStr);
    }
  };

  // Subscribe to state updates so updates reflect instantly
  useEffect(() => {
    const fetchMeeting = () => {
      const found = meetingsState.find((m) => m.id === id);
      if (found) {
        setMeeting({ ...found });
      } else if (meetingsState.length > 0) {
        setMeeting({ ...meetingsState[0] });
      }
    };

    fetchMeeting();
    return subscribeToMeetings(fetchMeeting);
  }, [id]);

  if (!meeting) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Meeting details not found...</Text>
      </View>
    );
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ROW ─────────────────────────── */}
      {!hideHeader && (
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MEETINGS</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show All Fields</Text>
            <Switch
              value={showAllFields}
              onValueChange={setShowAllFields}
              trackColor={{ false: '#D1D5DB', true: theme.primaryColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <View style={styles.verticalBar} />
              <Text style={styles.detailCardTitle}>MEETINGS INFORMATION</Text>
            </View>

            <View style={styles.fieldsList}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Title <Text style={{ color: COLORS.danger }}>*</Text></Text>
                <Text style={styles.fieldValue}>{meeting.title}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Meeting Venue <Text style={{ color: COLORS.danger }}>*</Text></Text>
                <Text style={styles.fieldValue}>{meeting.venue || 'Client Location'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Location</Text>
                <Text style={[styles.fieldValue, { color: COLORS.success, fontWeight: '700' }]}>
                  {meeting.location || 'Rajkot'}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>From <Text style={{ color: COLORS.danger }}>*</Text></Text>
                <Text style={styles.fieldValue}>Today {meeting.fromTime || '3:00 pm'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>To <Text style={{ color: COLORS.danger }}>*</Text></Text>
                <Text style={styles.fieldValue}>Today {meeting.toTime || '3:00 pm'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Host</Text>
                <Text style={styles.fieldValue}>{meeting.host || 'Parth Solanki'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Created By</Text>
                <Text style={styles.fieldValue}>{meeting.created_by_name || '---'}</Text>
              </View>

              {showAllFields && (
                <>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Modified By</Text>
                    <Text style={styles.fieldValue}>{meeting.modified_by_name || '---'}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Created Time</Text>
                    <Text style={styles.fieldValue}>{formatDateTime(meeting.createdTime)}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Modified Time</Text>
                    <Text style={styles.fieldValue}>{formatDateTime(meeting.modifiedTime)}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <View style={styles.verticalBar} />
              <Text style={styles.detailCardTitle}>MEETING ADDITIONAL INFORMATION</Text>
            </View>

            <View style={styles.fieldsList}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>checked in status <Text style={{ color: COLORS.danger }}>*</Text></Text>
                <Text style={[styles.fieldValue, { color: COLORS.textDark, textTransform: 'uppercase' }]}>PLANNED</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 5,
  },
  tabContent: {
    gap: 5,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  detailCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  verticalBar: {
    width: 3,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
  },
  detailCardTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  fieldsList: {
    gap: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'right',
    maxWidth: '65%',
  },
});
