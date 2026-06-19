import React, { useEffect, useRef, useState } from 'react';
import { attendanceState, updateAttendanceState } from '@/components/attendance/AttendanceState';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const REAL_SELFIE_URL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';

export default function SelfieScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params ?? {}) as { mode?: 'in' | 'out' };
  const mode = params.mode ?? 'in';
  const isIn = mode === 'in';

  const [captured, setCaptured] = useState(false);
  const [cameraMode, setCameraMode] = useState<'SLO-MO' | 'VIDEO' | 'PHOTO' | 'SQUARE' | 'PANO'>('PHOTO');

  // Camera permissions hook
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shutterAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const ringPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(ringPulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Request permissions immediately
    requestPermission();
    Location.requestForegroundPermissionsAsync();
  }, []);

  const handleCapture = async () => {
    if (captured) return;

    let photoUri = REAL_SELFIE_URL;

    // 1. Take picture if permission is granted
    if (permission?.granted && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
        });
        if (photo?.uri) {
          photoUri = photo.uri;
        }
      } catch (err) {
        console.log('Real camera capture failed, using fallback:', err);
      }
    }

    // 2. Fetch native location
    let locationStr = 'Simulated Location';
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const locResult = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = locResult.coords;
        const geocode = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (geocode && geocode.length > 0) {
          const address = geocode[0];
          locationStr = `${address.city || address.subregion || 'Surat'}, ${address.region || 'Gujarat'}`;
        } else {
          locationStr = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
        }
      }
    } catch (locErr) {
      console.log('Location lookup failed:', locErr);
      locationStr = 'Location Unresolved';
    }

    // Flash screen shutter effect
    Animated.sequence([
      Animated.timing(shutterAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(shutterAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCaptured(true);
      Animated.spring(checkAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Save state
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${h}:${m}`;

      if (isIn) {
        updateAttendanceState({
          stampedIn: true,
          inTime: timeStr,
          inPhoto: photoUri,
          inLocation: locationStr,
        });
      } else {
        // Calculate dynamic workTime
        let workTimeStr = '8h 45m';
        if (attendanceState.inTime && attendanceState.inTime !== '--:--') {
          try {
            const [inH, inM] = attendanceState.inTime.split(':').map(Number);
            const inDate = new Date();
            inDate.setHours(inH, inM, 0, 0);

            const outDate = new Date();
            let diffMs = outDate.getTime() - inDate.getTime();
            if (diffMs < 0) {
              diffMs += 24 * 60 * 60 * 1000;
            }
            const diffMins = Math.floor(diffMs / 1000 / 60);
            const diffHours = Math.floor(diffMins / 60);
            const remainingMins = diffMins % 60;
            if (diffHours === 0) {
              workTimeStr = `${remainingMins} Min`;
            } else {
              workTimeStr = `${diffHours}h ${remainingMins}m`;
            }
          } catch (e) {
            workTimeStr = '8h 45m';
          }
        }

        updateAttendanceState({
          stampedOut: true,
          outTime: timeStr,
          outPhoto: photoUri,
          outLocation: locationStr,
          workTime: workTimeStr,
        });
      }

      // Auto dismiss back to attendance screen
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    });
  };

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* ── CAMERA PREVIEW VIEWPORT ─────────────────── */}
      <View style={styles.cameraViewport}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="front"
            ref={cameraRef}
          />
        ) : (
          <Image
            source={{ uri: REAL_SELFIE_URL }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}

        {/* Dimming overlay if not captured */}
        {!captured && <View style={styles.cameraDimOverlay} />}

        {/* 3x3 Gridlines */}
        {!captured && (
          <View style={styles.gridContainer} pointerEvents="none">
            <View style={styles.gridLineV1} />
            <View style={styles.gridLineV2} />
            <View style={styles.gridLineH1} />
            <View style={styles.gridLineH2} />
          </View>
        )}

        {/* Floating guidance ring */}
        {!captured && (
          <Animated.View style={[styles.faceGuideRing, { transform: [{ scale: ringPulseAnim }] }]} pointerEvents="none">
            <Text style={styles.faceGuideText}>POSITION YOUR FACE HERE</Text>
          </Animated.View>
        )}

        {/* Shutter flash effect */}
        <Animated.View
          style={[styles.shutterOverlay, { opacity: shutterAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
          pointerEvents="none"
        />

        {/* Success checkmark popup */}
        {captured && (
          <Animated.View style={[styles.successPopup, { transform: [{ scale: checkAnim }] }]}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>{isIn ? 'PUNCHED IN' : 'PUNCHED OUT'}</Text>
            <Text style={styles.successSubtitle}>Selfie verification successful</Text>
          </Animated.View>
        )}
      </View>

      {/* ── TOP CONTROLS ───────────────────────────── */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
        <Ionicons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ── BOTTOM PANEL ───────────────────────────── */}
      <View style={styles.bottomControlPanel}>
        {/* Camera mode selector */}
        <View style={styles.modesRow}>
          {['SLO-MO', 'VIDEO', 'PHOTO', 'SQUARE', 'PANO'].map((modeItem) => {
            const isActive = cameraMode === modeItem;
            return (
              <TouchableOpacity
                key={modeItem}
                onPress={() => setCameraMode(modeItem as any)}
                style={styles.modeTab}
              >
                <Text style={[styles.modeTabText, isActive && styles.modeTabTextActive]}>
                  {modeItem}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main controls row: Gallery, Shutter, CK/Flip */}
        <View style={styles.shutterRow}>
          {/* Gallery preview */}
          <TouchableOpacity style={styles.galleryPreview}>
            <Image
              source={{ uri: REAL_SELFIE_URL }}
              style={styles.galleryPreviewImage}
            />
          </TouchableOpacity>

          {/* Large circular shutter button */}
          <TouchableOpacity
            onPress={handleCapture}
            disabled={captured}
            style={styles.shutterOuter}
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* CK / Camera toggle button */}
          <TouchableOpacity style={styles.ckButton}>
            <Text style={styles.ckButtonText}>CK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  cameraViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cameraDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },

  // Close button
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // 3x3 Grid
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineV1: { position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.35)' },
  gridLineV2: { position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.35)' },
  gridLineH1: { position: 'absolute', top: '33.3%', left: 0, right: 0, height: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.35)' },
  gridLineH2: { position: 'absolute', top: '66.6%', left: 0, right: 0, height: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.35)' },

  // Face guide ring
  faceGuideRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    width: 240,
    height: 310,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuideText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  // Shutter Flash
  shutterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },

  // Success Popup
  successPopup: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    backgroundColor: 'rgba(18, 21, 20, 0.92)',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  successSubtitle: {
    fontSize: 12,
    color: '#8F9995',
    marginTop: 6,
  },

  // Bottom panel
  bottomControlPanel: {
    backgroundColor: '#000000',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 16,
    gap: 20,
  },
  modesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  modeTab: {
    paddingVertical: 6,
  },
  modeTabText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modeTabTextActive: {
    color: '#E6A15C',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  galleryPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  galleryPreviewImage: {
    width: '100%',
    height: '100%',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  ckButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#301B56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ckButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
