import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { serverDetails } from '@/config';

export interface VisitCardProps {
  visit: any;
  onPress?: () => void;
  isCompact?: boolean;
}

export const VisitCard: React.FC<VisitCardProps> = ({ visit, onPress, isCompact = false }) => {
  const theme = useTheme();

  const getDisplayStatus = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'COMPLETE') return 'Complete';
    if (s === 'DRAFT') return 'Draft';
    if (s === 'BOUNCE') return 'Bounce';
    return 'Pending';
  };

  const displayStatus = getDisplayStatus(visit.status);
  const isPending = displayStatus === 'Pending';
  const isComplete = displayStatus === 'Complete';
  const statusColor = isPending ? COLORS.orange : isComplete ? COLORS.green : COLORS.red;

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

  const imgUri = getImageUri(visit.image_url);

  if (isCompact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.compactMain}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {visit.title || 'Site Visit'}
          </Text>
          <Text style={styles.compactSub} numberOfLines={1}>
            Type: {visit.visit_type || 'Site Visit'}
          </Text>
        </View>
        <Text style={[styles.compactStatus, { color: statusColor }]}>
          {displayStatus}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
    >
      {imgUri ? (
        <Image
          source={{ uri: imgUri }}
          style={styles.cardAvatar}
        />
      ) : null}

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{visit.title || ''}</Text>

        <View style={styles.cardRow}>
          <Ionicons name="business-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.cardText, { flex: 1 }]} numberOfLines={1}>
            {visit.company || visit.lead_company_name || visit.visit_type || 'Site Visit'}
          </Text>
        </View>

        {visit.contact_person_name ? (
          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.cardText, { flex: 1 }]} numberOfLines={1}>
              {visit.contact_person_name}
            </Text>
          </View>
        ) : null}

        {visit.location_address && visit.location_address !== 'Address Not Provided' ? (
          <TouchableOpacity
            style={[styles.cardRow, { alignItems: 'flex-start' }]}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              const query = encodeURIComponent(visit.location_address);
              const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
              Linking.openURL(url);
            }}
          >
            <Ionicons name="location-outline" size={14} color={theme.primaryColor} style={{ marginRight: 6, marginTop: 1 }} />
            <Text style={[styles.cardText, { color: theme.primaryColor, textDecorationLine: 'underline', flex: 1 }]} numberOfLines={1}>
              {visit.location_address}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.cardRow, { alignItems: 'flex-start' }]}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6, marginTop: 1 }} />
            <Text style={[styles.cardText, { flex: 1 }]} numberOfLines={1}>
              Address Not Provided
            </Text>
          </View>
        )}

        {/* Status Row with outline circle */}
        <View style={styles.cardRow}>
          <View style={[styles.statusCircleOutline, { borderColor: statusColor }]}>
            <View style={[styles.statusCircleDot, { backgroundColor: statusColor }]} />
          </View>
          <Text style={[styles.statusText, { color: statusColor }]}>{displayStatus}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  cardAvatar: {
    width: 90,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 10,
    gap: 2.5,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  statusCircleOutline: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusCircleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  // Compact Styles
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  compactMain: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  compactSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  compactStatus: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
  },
});
