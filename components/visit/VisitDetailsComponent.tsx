import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRouter, useFocusEffect } from 'expo-router';

import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteVisit, useVisitDetails } from '@/hooks/useVisits';
import { serverDetails } from '@/config';

interface DetailRowProps {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPressValue?: () => void;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, icon, onPressValue }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueContainer}>
        {icon && (
          <Ionicons name={icon} size={15} color={theme.primaryColor} style={{ marginRight: 6 }} />
        )}
        {onPressValue ? (
          <TouchableOpacity onPress={onPressValue} activeOpacity={0.7}>
            <Text style={[styles.detailValue, { color: theme.primaryColor, textDecorationLine: 'underline' }]}>
              {value}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.detailValue} numberOfLines={2}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );
};

export interface VisitDetailsComponentProps {
  id: string;
  leadId?: string;
  isEmbedded?: boolean;
}

export function VisitDetailsComponent({
  id: propId,
  leadId: propLeadId,
  isEmbedded = false,
}: VisitDetailsComponentProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params as { id: string; leadId?: string; lead_id?: string; referrer?: string }) || {};
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const id = propId !== undefined ? propId : params.id;
  const effectiveLeadId = propLeadId !== undefined ? propLeadId : (params.leadId || params.lead_id || '');

  const { data: rawVisit, isLoading, refetch } = useVisitDetails(effectiveLeadId, id);
  const { mutateAsync: deleteVisit } = useDeleteVisit();

  const visit = rawVisit || {} as any;

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

  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const getDisplayStatus = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'COMPLETE') return 'Complete';
    if (s === 'DRAFT') return 'Draft';
    if (s === 'BOUNCE') return 'Bounce';
    return 'Pending';
  };

  const getStatusColor = (status: string) => {
    const s = getDisplayStatus(status);
    if (s === 'Complete') return COLORS.green;
    if (s === 'Bounce') return COLORS.red;
    if (s === 'Pending') return COLORS.orange;
    return COLORS.textMuted;
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const formatCoordinate = (val: any, isLatitude: boolean) => {
    const num = Number(val);
    if (isNaN(num) || num === 0) return isLatitude ? '18.4729° N' : '73.8567° E';
    const direction = isLatitude ? (num >= 0 ? 'N' : 'S') : (num >= 0 ? 'E' : 'W');
    return `${Math.abs(num).toFixed(4)}° ${direction}`;
  };

  const getImageUri = (imageUrl: any) => {
    if (!imageUrl) return '';
    const getFullUrl = (candidate: string) => {
      if (candidate.startsWith('http')) return candidate;
      const cleaned = candidate.startsWith('/') ? candidate.slice(1) : candidate;
      return `${serverDetails.s3BucketURL}/${cleaned}`;
    };

    if (typeof imageUrl === 'object' && imageUrl !== null) {
      const candidate = imageUrl.url || imageUrl.thumb || imageUrl.src || imageUrl.key || imageUrl.path;
      if (typeof candidate === 'string' && candidate.length > 0) {
        return getFullUrl(candidate);
      }
    }

    if (typeof imageUrl === 'string' && imageUrl.length > 0) {
      try {
        const parsed = JSON.parse(imageUrl);
        if (parsed && typeof parsed === 'object') {
          const candidate = parsed.url || parsed.thumb || parsed.src || parsed.key || parsed.path;
          if (typeof candidate === 'string' && candidate.length > 0) {
            return getFullUrl(candidate);
          }
        } else if (typeof parsed === 'string' && parsed.length > 0) {
          return getFullUrl(parsed);
        }
      } catch {
        return getFullUrl(imageUrl);
      }
    }
    return '';
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Visit',
      'Are you sure you want to delete this visit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const resolvedLeadId = effectiveLeadId || visit.lead_id || visit.leadId || '';
              if (!resolvedLeadId) {
                Alert.alert('Error', 'Lead ID is required to delete this visit.');
                setIsDeleting(false);
                return;
              }
              await deleteVisit({ leadId: resolvedLeadId, id });
              Alert.alert('Success', 'Visit deleted successfully.', [
                { text: 'OK', onPress: () => handleBack() }
              ]);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete visit.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const imageUri = getImageUri(visit.image_url);
  const statusColor = getStatusColor(visit.status);
  const displayStatus = getDisplayStatus(visit.status);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={styles.loadingText}>Loading visit details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      {!isEmbedded && <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />}

      {/* HEADER */}
      {!isEmbedded && (
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16) }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            <Text style={{ color: theme.primaryColor }}>VISIT </Text>
            <Text style={{ color: COLORS.textDark }}>DETAILS</Text>
          </Text>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            )}
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isEmbedded ? 20 : insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[theme.primaryColor]} />
        }
      >
        {/* IMAGE SECTION */}
        {imageUri ? (
          <TouchableOpacity
            style={styles.imageCard}
            onPress={() => setShowPreviewModal(true)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: imageUri }} style={styles.visitImage} resizeMode="cover" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.imageCard, styles.imagePlaceholder]}>
            <Ionicons name="map-outline" size={60} color="#CBD5E1" />
            <Text style={styles.imagePlaceholderText}>No Visit Photo Provided</Text>
          </View>
        )}

        {/* VISIT DETAILS PANEL */}
        <View style={styles.sectionCard}>
          {/* HERO TITLE & STATUS */}
          <View style={styles.heroCardContent}>
            <Text style={styles.visitTitle}>{visit.title || 'Untitled Visit'}</Text>
            <Text style={styles.visitCompany}>{visit.company || visit.lead_company_name || 'No Associated Company'}</Text>

            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: statusColor + '15' }]}>
                <View style={[styles.badgeDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.badgeText, { color: statusColor }]}>{displayStatus}</Text>
              </View>

              <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="briefcase-outline" size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: COLORS.textMuted }]}>{visit.visit_type || 'Site Visit'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* VISIT INFORMATION */}
          <View style={styles.sectionHeader}>
            <View style={styles.indicatorBar} />
            <Text style={styles.sectionTitleText}>VISIT INFORMATION</Text>
          </View>
          <View style={styles.sectionContent}>
            <DetailRow label="Visit Type" value={visit.visit_type || 'Site Visit'} />
            <DetailRow label="Scheduled Time" value={formatDateTime(visit.scheduled_time)} icon="calendar-outline" />
            <DetailRow label="Status" value={displayStatus} />
            <DetailRow label="Associated Lead" value={visit.company || visit.lead_company_name || '—'} />
          </View>

          <View style={styles.divider} />

          {/* CONTACT PERSON */}
          <View style={styles.sectionHeader}>
            <View style={styles.indicatorBar} />
            <Text style={styles.sectionTitleText}>CONTACT PERSON</Text>
          </View>
          <View style={styles.sectionContent}>
            <DetailRow label="Name" value={visit.contact_person_name || '—'} />
            <DetailRow
              label="Phone"
              value={visit.contact_person_phone || '—'}
              icon="call-outline"
              onPressValue={visit.contact_person_phone ? () => handleCall(visit.contact_person_phone) : undefined}
            />
            <DetailRow label="Designation" value={visit.contact_person_designation || '—'} />
          </View>

          <View style={styles.divider} />

          {/* LOCATION DETAILS */}
          <View style={styles.sectionHeader}>
            <View style={styles.indicatorBar} />
            <Text style={styles.sectionTitleText}>LOCATION DETAILS</Text>
          </View>
          <View style={styles.sectionContent}>
            <DetailRow
              label="Address"
              value={visit.location_address || 'Not Provided'}
              icon="location-outline"
              onPressValue={visit.location_address && visit.location_address !== 'Not Provided' ? () => {
                const query = encodeURIComponent(visit.location_address || '');
                const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                Linking.openURL(url);
              } : undefined}
            />
            <DetailRow label="Latitude" value={formatCoordinate(visit.location_latitude, true)} icon="globe-outline" />
            <DetailRow label="Longitude" value={formatCoordinate(visit.location_longitude, false)} icon="globe-outline" />
          </View>

          <View style={styles.divider} />

          {/* OUTCOME & DESCRIPTION */}
          <View style={styles.sectionHeader}>
            <View style={styles.indicatorBar} />
            <Text style={styles.sectionTitleText}>OUTCOME & DESCRIPTION</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.blockTextContainer}>
              <Text style={styles.blockLabel}>Description</Text>
              <Text style={styles.blockValue}>{visit.description || '—'}</Text>
            </View>
            <View style={[styles.blockTextContainer, { marginTop: 12 }]}>
              <Text style={styles.blockLabel}>Outcome Summary</Text>
              <Text style={styles.blockValue}>{visit.outcome_summary || '—'}</Text>
            </View>
            <View style={[styles.blockTextContainer, { marginTop: 12 }]}>
              <Text style={styles.blockLabel}>Next Steps</Text>
              <Text style={styles.blockValue}>{visit.next_steps || '—'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Image Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.previewModalContainer}>
          <TouchableOpacity
            style={styles.previewModalCloseBtn}
            onPress={() => setShowPreviewModal(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgPage,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 8,
    gap: 6,
  },
  imageCard: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  visitImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  heroCardContent: {
    padding: 14,
  },
  visitTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  visitCompany: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FAFBFC',
  },
  indicatorBar: {
    width: 3,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
    marginRight: 8,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'capitalize',
    width: '40%',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '700',
    textAlign: 'right',
  },
  blockTextContainer: {
    gap: 4,
  },
  blockLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  blockValue: {
    fontSize: 13.5,
    color: COLORS.textDark,
    fontWeight: '600',
    lineHeight: 20,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});
