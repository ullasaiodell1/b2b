import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadStatuses, useUpdateLead } from '@/hooks/useLeads';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
  Animated
} from 'react-native';
import confetti from 'canvas-confetti';

const STATUS_COLORS: Record<string, string> = {
  HOT: '#EF4444',
  WARM: '#F97316',
  COLD: '#0EA5E9',
  HOLD: '#64748B',
  'ON HOLD': '#64748B',
  ON_HOLD: '#64748B',
  IN_PROGRESS: '#3B82F6',
  'IN PROGRESS': '#3B82F6',
  INPROGRESS: '#3B82F6',
  CONTACTED_AGAIN: '#F59E0B',
  REVISIT: '#8B5CF6',
  DEMO: '#06B6D4',
  TRIAL: '#10B981',
  URGENT: '#DC2626',
  VIP: '#D97706',
  PREMIUM: '#C026D3',
  PROSPECT: '#0284C7',
  DEAD: '#374151',
  DEFERRED: '#78716C',
  ESCALATED: '#DC2626',
  RESOLVED: '#16A34A',
  DRAFT: '#6B7280',
  SENT: '#F59E0B',
  VIEWED: '#3B82F6',
  ACCEPTED: '#10B981',
  REJECTED: '#EF4444',
  EXPIRED: '#9CA3AF',
  REVISED: '#8B5CF6',
  CANCELLED: '#EF4444',
  APPROVED: '#10B981',
  ORDER_CREATED: '#0EA5E9',
  PROFORMA_CREATED: '#6366F1',
};

const CONFETTI_COLORS = [
  '#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'
];

interface ParticleProps {
  type: 'falling' | 'burst';
  delay: number;
  containerWidth: number;
  containerHeight: number;
  centerX?: number;
  centerY?: number;
}

const FirecrackerParticle: React.FC<ParticleProps> = ({
  type,
  delay,
  containerWidth,
  containerHeight,
  centerX = 0,
  centerY = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: type === 'falling'
          ? 2000 + Math.random() * 1500
          : 1200 + Math.random() * 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [animatedValue, delay, type]);

  const size = useRef(6 + Math.random() * 6).current;
  const aspectRatio = useRef(1 + Math.random() * 0.8).current;
  const width = size;
  const height = size * aspectRatio;
  const color = useRef(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]).current;
  const isCircle = useRef(Math.random() > 0.4).current;

  const rotateXSpeed = useRef(Math.random() * 1080 - 540).current;
  const rotateYSpeed = useRef(Math.random() * 1080 - 540).current;
  const rotateZSpeed = useRef(Math.random() * 720 - 360).current;

  const startX = useRef(Math.random() * containerWidth).current;
  const startY = useRef(-80 - Math.random() * 80).current;
  const endY = containerHeight + 50;
  const swayAmount = useRef(Math.random() * 80 - 40).current;

  const angle = useRef(Math.random() * 2 * Math.PI).current;
  const speed = useRef(80 + Math.random() * 140).current;
  const gravity = useRef(40 + Math.random() * 40).current;

  let translateX;
  let translateY;
  let scale;
  let opacity;

  if (type === 'falling') {
    translateX = animatedValue.interpolate({
      inputRange: [0, 0.3, 0.6, 1],
      outputRange: [startX, startX + swayAmount * 0.3, startX - swayAmount * 0.3, startX + swayAmount],
    });
    translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [startY, endY],
    });
    scale = new Animated.Value(1);
    opacity = animatedValue.interpolate({
      inputRange: [0, 0.15, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    });
  } else {
    translateX = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [centerX, centerX + Math.cos(angle) * speed],
    });
    translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [centerY, centerY + Math.sin(angle) * speed + gravity],
    });
    scale = animatedValue.interpolate({
      inputRange: [0, 0.1, 0.8, 1],
      outputRange: [0, 1.2, 0.8, 0],
    });
    opacity = animatedValue.interpolate({
      inputRange: [0, 0.1, 0.7, 1],
      outputRange: [0, 1, 0.9, 0],
    });
  }

  const rotateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', rotateXSpeed + 'deg'],
  });

  const rotateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', rotateYSpeed + 'deg'],
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', rotateZSpeed + 'deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: type === 'falling' ? 0 : -width / 2,
        top: type === 'falling' ? 0 : -height / 2,
        width,
        height,
        backgroundColor: color,
        borderRadius: isCircle ? size : 0,
        transform: [
          { translateX },
          { translateY },
          { rotateX },
          { rotateY },
          { rotate },
          { scale }
        ],
        opacity,
      }}
    />
  );
};

const FirecrackerOverlay: React.FC = () => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const particles = useMemo(() => {
    if (layout.width === 0) return [];

    const list: Array<{
      key: string;
      type: 'falling' | 'burst';
      delay: number;
      centerX?: number;
      centerY?: number;
    }> = [];

    for (let i = 0; i < 250; i++) {
      list.push({
        key: `falling-${i}`,
        type: 'falling',
        delay: Math.random() * 1500,
      });
    }

    const burstConfig = [
      { x: layout.width * 0.5, y: layout.height * 0.45, delay: 800 },
      { x: layout.width * 0.25, y: layout.height * 0.3, delay: 1000 },
      { x: layout.width * 0.75, y: layout.height * 0.35, delay: 1600 },
      { x: layout.width * 0.35, y: layout.height * 0.6, delay: 2000 },
      { x: layout.width * 0.65, y: layout.height * 0.55, delay: 2800 },
    ];

    burstConfig.forEach((config, bIdx) => {
      for (let p = 0; p < 35; p++) {
        list.push({
          key: `burst-${bIdx}-${p}`,
          type: 'burst',
          delay: config.delay + Math.random() * 100,
          centerX: config.x,
          centerY: config.y,
        });
      }
    });

    return list;
  }, [layout]);

  return (
    <View
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ width, height });
      }}
      style={[
        StyleSheet.absoluteFillObject,
        {
          zIndex: 99999,
          overflow: 'hidden',
        },
      ]}
    >
      {layout.width > 0 && particles.map((p) => (
        <FirecrackerParticle
          key={p.key}
          type={p.type}
          delay={p.delay}
          containerWidth={layout.width}
          containerHeight={layout.height}
          centerX={p.centerX}
          centerY={p.centerY}
        />
      ))}
    </View>
  );
};

const triggerConfetti = () => {
  if (Platform.OS !== 'web') {
    return;
  }
  try {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const bursts = [
      { x: 0.5, y: 0.45, delay: 800 },
      { x: 0.25, y: 0.3, delay: 1000 },
      { x: 0.75, y: 0.35, delay: 1600 },
      { x: 0.35, y: 0.6, delay: 2000 },
      { x: 0.65, y: 0.55, delay: 2800 },
    ];

    bursts.forEach((burst) => {
      setTimeout(() => {
        if (Date.now() < animationEnd) {
          confetti({
            ...defaults,
            particleCount: 50,
            origin: { x: burst.x, y: burst.y },
          });
        }
      }, burst.delay);
    });

    for (let i = 0; i < 250; i++) {
      setTimeout(() => {
        if (Date.now() < animationEnd) {
          confetti({
            ...defaults,
            startVelocity: 0,
            gravity: 0.8,
            spread: 0,
            ticks: 200,
            particleCount: 1,
            origin: {
              x: Math.random(),
              y: -0.1,
            },
          });
        }
      }, Math.random() * 1500);
    }
  } catch (err) {
    console.error('[Confetti] Error running confetti:', err);
  }
};

interface LeadInfoCardProps {
  rawLead: any;
  dbLead: any;
  onStatusUpdated: () => void;
}

export default function LeadInfoCard({ rawLead, dbLead, onStatusUpdated }: LeadInfoCardProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: leadStatuses = [] } = useLeadStatuses();
  const { mutateAsync: updateLead } = useUpdateLead();

  const leadName = dbLead?.name || '----';
  const leadCompany = dbLead?.company || '----';
  const leadEmail = dbLead?.email || '----';
  const leadPhone = dbLead?.phone || '----';

  const rawStatus = dbLead?.status_name || dbLead?.status || '';
  const matchedStatus = (Array.isArray(leadStatuses) ? leadStatuses : []).find(
    (s: any) => (s.name || '').toLowerCase() === rawStatus.toLowerCase()
  );
  const sk = rawStatus.toUpperCase();
  const skU = sk.replace(/\s+/g, '_');
  const badgeColor = matchedStatus?.color || STATUS_COLORS[sk] || STATUS_COLORS[skU] || '#9CA3AF';

  const locationStr = [dbLead?.city_name || dbLead?.city, dbLead?.state_name || dbLead?.state].filter(Boolean).join(', ');

  return (
    <View style={styles.profileCard}>
      {showConfetti && <FirecrackerOverlay />}
      <View style={styles.profileTopRow}>
        <View style={styles.profileInfoCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
            <Text style={styles.profileName}>{leadName}</Text>
            
            <TouchableOpacity
              onPress={() => setStatusModalVisible(true)}
              activeOpacity={0.75}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: badgeColor + '22',
                borderWidth: 1.5,
                borderColor: badgeColor,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                gap: 5,
              }}
            >
              <View style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: badgeColor,
              }} />
              <Text style={{
                fontSize: 11,
                fontWeight: '800',
                color: badgeColor,
                letterSpacing: 0.2,
              }}>
                {rawStatus || 'Set Status'}
              </Text>
              <Ionicons name="chevron-down" size={11} color={badgeColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileDetailLine}>
            <Ionicons name="business-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.profileDetailText}>{leadCompany}</Text>
          </View>

          {leadEmail !== '----' && (
            <TouchableOpacity
              style={styles.profileDetailLine}
              onPress={() => Linking.openURL(`mailto:${leadEmail}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.profileDetailText, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                {leadEmail}
              </Text>
            </TouchableOpacity>
          )}

          {leadPhone !== '----' && (
            <TouchableOpacity
              style={styles.profileDetailLine}
              onPress={() => Linking.openURL(`tel:${leadPhone}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.profileDetailText, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                {leadPhone}
              </Text>
            </TouchableOpacity>
          )}

          {locationStr ? (
            <TouchableOpacity
              style={styles.profileDetailLine}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(locationStr)}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.profileDetailText, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                {locationStr}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setStatusModalVisible(false)}
        >
          <View style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 12,
            paddingBottom: 32,
            maxHeight: '70%',
          }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: COLORS.textDark }}>Change Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {statusUpdating ? (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <ActivityIndicator size="large" color={theme.primaryColor} />
                <Text style={{ marginTop: 10, fontSize: 13, color: COLORS.textMuted, fontWeight: '600' }}>Updating status...</Text>
              </View>
            ) : (
              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {(Array.isArray(leadStatuses) ? leadStatuses : []).map((s: any) => {
                  const statusLabel = s.name || s.label || s.status_name || String(s);
                  const statusId = s.id || s.value || s.status_id;
                  const statusKeyUnderscore = statusLabel.toUpperCase().replace(/\s+/g, '_');
                  const statusKeyExact = statusLabel.toUpperCase();
                  const color = s.color || STATUS_COLORS[statusKeyExact] || STATUS_COLORS[statusKeyUnderscore] || '#6B7280';
                  const currentStatus = dbLead?.status_name || dbLead?.status || '';
                  const isActive = currentStatus.toLowerCase() === statusLabel.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={String(statusId || statusLabel)}
                      onPress={async () => {
                        if (isActive) { setStatusModalVisible(false); return; }
                        try {
                          setStatusUpdating(true);
                          const r = rawLead as any;
                          const priorityMap: Record<string, string> = { HOT: 'HOT', WARM: 'WARM', COLD: 'COLD' };
                          const fullPayload = {
                            name: r?.name || '',
                            phone: r?.phone || '',
                            email: r?.email || null,
                            status_id: statusId,
                            source_id: r?.source_id || null,
                            alternate_phone: r?.alternate_phone || null,
                            address_line1: r?.address_line1 || null,
                            address_line2: r?.address_line2 || null,
                            city_id: r?.city_id || null,
                            state_id: r?.state_id || null,
                            country_id: r?.country_id || null,
                            assigned_to: r?.assigned_to || null,
                            priority: priorityMap[r?.priority] || r?.priority || 'WARM',
                            company_name: r?.company_name || null,
                            designation: r?.designation || null,
                            website: r?.website || null,
                            gst_number: r?.gst_number || null,
                            pan_number: r?.pan_number || null,
                            tags: Array.isArray(r?.tags) ? r.tags.map((t: any) => t.name || t) : [],
                            expected_revenue: r?.expected_revenue ? parseFloat(r.expected_revenue) : null,
                            property_type: r?.property_type || null,
                            business_type: r?.business_type || null,
                            remarks: r?.remarks || null,
                            interested_category_id: Array.isArray(r?.interested_category_id) ? r.interested_category_id : [],
                          };
                          await updateLead({
                            id: dbLead.id,
                            data: fullPayload,
                          });
                          onStatusUpdated();
                          setStatusModalVisible(false);
                          if (statusLabel.toLowerCase().includes('won')) {
                            if (Platform.OS === 'web') {
                              triggerConfetti();
                            } else {
                              setShowConfetti(true);
                              setTimeout(() => {
                                setShowConfetti(false);
                              }, 5000);
                            }
                          }
                        } catch (err: any) {
                          Alert.alert('Error', err?.message || 'Failed to update status.');
                        } finally {
                          setStatusUpdating(false);
                        }
                      }}
                      activeOpacity={0.75}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        backgroundColor: isActive ? color + '15' : '#FFFFFF',
                        borderBottomWidth: 1,
                        borderBottomColor: '#F3F4F6',
                      }}
                    >
                      <View style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: color,
                        marginRight: 12,
                      }} />
                      <Text style={{
                        flex: 1,
                        fontSize: 13.5,
                        fontWeight: isActive ? '900' : '600',
                        color: isActive ? color : COLORS.textDark,
                      }}>
                        {statusLabel}
                      </Text>
                      {isActive && (
                        <Ionicons name="checkmark-circle" size={20} color={color} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  profileCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  profileTopRow: {
    flexDirection: 'row',
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 0,
    justifyContent: 'center',
    gap: 5,
  },
  profileName: {
    fontSize: 15.5,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  profileDetailLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetailText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
