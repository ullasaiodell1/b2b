import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');


// Slide 1 Illustration — Leads Management
function Slide1Illustration({ floatAnim, theme }: { floatAnim: Animated.Value; theme: any }) {
  const styles = getStyles(theme);
  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const floatOpp = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  return (
    <View style={styles.illustrationContainer}>
      <View style={[styles.blob, { backgroundColor: '#E8F2EE' }]} />

      {/* Left character */}
      <Animated.View style={[styles.char, { left: 20, top: 50, transform: [{ translateY: floatOpp }] }]}>
        <View style={[styles.charHead, { backgroundColor: '#FFD2A5' }]} />
        <View style={[styles.charBody, { backgroundColor: theme.primaryDark }]}>
          <View style={styles.charFolderTag} />
        </View>
      </Animated.View>

      {/* Phone mockup */}
      <Animated.View style={[styles.phoneMock, { transform: [{ translateY: floatY }] }]}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneScreen}>
          <View style={styles.phoneSearchBar} />
          {[theme.primaryColor, '#CBD5E1', '#CBD5E1', '#CBD5E1'].map((color, i) => (
            <View key={i} style={styles.leadRow}>
              <View style={[styles.leadDot, { backgroundColor: color }]} />
              <View style={{ flex: 1, gap: 3 }}>
                <View style={styles.leadLineL} />
                <View style={styles.leadLineS} />
              </View>
              {i === 0 && <View style={styles.activeIndicator} />}
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Right character */}
      <Animated.View style={[styles.char, { right: 20, top: 70, transform: [{ translateY: floatOpp }] }]}>
        <View style={[styles.charHead, { backgroundColor: '#ECC9A8' }]} />
        <View style={[styles.charBody, { backgroundColor: '#E65C5C' }]}>
          <View style={styles.charPhoneTag} />
        </View>
      </Animated.View>

      {/* Floating icons */}
      <Animated.View style={[styles.floatBubble, { left: 42, bottom: 24, transform: [{ translateY: floatY }] }]}>
        <Ionicons name="call" size={14} color={theme.primaryColor} />
      </Animated.View>
      <Animated.View style={[styles.floatBubble, { right: 42, top: 22, transform: [{ translateY: floatOpp }] }]}>
        <Ionicons name="mail" size={14} color={theme.primaryColor} />
      </Animated.View>
    </View>
  );
}

// Slide 2 Illustration — Deal Pipeline
function Slide2Illustration({ floatAnim, theme }: { floatAnim: Animated.Value; theme: any }) {
  const styles = getStyles(theme);
  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const floatOpp = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  return (
    <View style={styles.illustrationContainer}>
      <View style={[styles.blob, { backgroundColor: '#FEF6ED' }]} />

      <Animated.View style={[styles.char, { left: 15, bottom: 28, transform: [{ translateY: floatY }] }]}>
        <View style={[styles.charHead, { backgroundColor: '#ECC9A8' }]} />
        <View style={[styles.charBody, { backgroundColor: theme.primaryDark }]} />
      </Animated.View>

      <Animated.View style={[styles.phoneMock, { transform: [{ translateY: floatY }] }]}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneScreen}>
          <View style={[styles.boardRow, { backgroundColor: '#E0F2FE' }]}>
            <Text style={[styles.boardLabel, { color: '#0369A1' }]}>Contacted</Text>
          </View>
          <View style={[styles.boardRow, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.boardLabel, { color: '#B45309' }]}>Qualified</Text>
          </View>
          <View style={[styles.boardRow, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.boardLabel, { color: '#B91C1C' }]}>Proposal</Text>
          </View>
          <View style={[styles.boardRow, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.boardLabel, { color: '#15803D' }]}>Won ✓</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.char, { right: 15, bottom: 18, transform: [{ translateY: floatY }] }]}>
        <View style={[styles.charHead, { backgroundColor: '#F9D0C4' }]} />
        <View style={[styles.charBody, { backgroundColor: '#F59E0B' }]} />
      </Animated.View>

      {/* Floating coins */}
      <Animated.View style={[styles.coin, { right: 32, top: 42, transform: [{ translateY: floatOpp }] }]}>
        <Text style={styles.coinText}>$</Text>
      </Animated.View>
      <Animated.View style={[styles.coin, { left: 42, top: 84, transform: [{ translateY: floatY }] }]}>
        <Text style={styles.coinText}>$</Text>
      </Animated.View>
    </View>
  );
}

// Slide 3 Illustration — Follow-Up Reminders
function Slide3Illustration({ floatAnim, theme }: { floatAnim: Animated.Value; theme: any }) {
  const styles = getStyles(theme);
  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const floatOpp = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  return (
    <View style={styles.illustrationContainer}>
      <View style={[styles.blob, { backgroundColor: '#EEF2F6' }]} />

      <Animated.View style={[styles.char, { left: 18, top: 58, transform: [{ translateY: floatOpp }] }]}>
        <View style={[styles.charHead, { backgroundColor: '#ECC9A8' }]} />
        <View style={[styles.charBody, { backgroundColor: '#3B82F6' }]}>
          <View style={styles.charPhoneCalling} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.phoneMock, { transform: [{ translateY: floatY }] }]}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneScreen}>
          <View style={styles.reminderTitleBar} />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.reminderItem}>
              <View style={styles.checkCircle} />
              <View style={styles.reminderLineItem} />
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Calendar widget */}
      <Animated.View style={[styles.calendarBubble, { transform: [{ translateY: floatOpp }] }]}>
        <View style={styles.calendarTop} />
        <Text style={styles.calDay}>TUE</Text>
        <Text style={styles.calDate}>2</Text>
      </Animated.View>

      {/* Clock widget */}
      <Animated.View style={[styles.clockBubble, { transform: [{ translateY: floatY }] }]}>
        <Ionicons name="alarm-outline" size={16} color="#FFFFFF" />
      </Animated.View>

      <Animated.View style={[styles.char, { right: 18, top: 78, transform: [{ translateY: floatOpp }] }]}>
        <View style={[styles.charHead, { backgroundColor: '#FFD2A5' }]} />
        <View style={[styles.charBody, { backgroundColor: theme.primaryColor }]} />
      </Animated.View>
    </View>
  );
}

// Slide 4 Illustration — Customer Profile
function Slide4Illustration({ floatAnim, theme }: { floatAnim: Animated.Value; theme: any }) {
  const styles = getStyles(theme);
  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const floatOpp = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  return (
    <View style={styles.illustrationContainer}>
      <View style={[styles.blob, { backgroundColor: '#EAF5FF' }]} />

      <Animated.View style={[styles.char, { left: 22, bottom: 28, transform: [{ translateY: floatY }] }]}>
        <View style={[styles.charHead, { backgroundColor: '#ECC9A8' }]} />
        <View style={[styles.charBody, { backgroundColor: '#EF4444' }]} />
      </Animated.View>

      <Animated.View style={[styles.phoneMock, { transform: [{ translateY: floatY }] }]}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneScreen}>
          <View style={styles.profileAva} />
          <View style={styles.profileNameBar} />
          <View style={styles.profileSubBar} />
          <View style={styles.profileActions}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.profileActionDot} />
            ))}
          </View>
          <View style={styles.profileDataLine} />
          <View style={styles.profileDataLine} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.char, { right: 22, bottom: 22, transform: [{ translateY: floatY }] }]}>
        <View style={[styles.charHead, { backgroundColor: '#F9D0C4' }]} />
        <View style={[styles.charBody, { backgroundColor: theme.primaryColor }]} />
      </Animated.View>

      <Animated.View style={{ position: 'absolute', left: 38, top: 44, transform: [{ translateY: floatOpp }] }}>
        <Ionicons name="location" size={18} color="#EF4444" />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', right: 44, top: 54, transform: [{ translateY: floatY }] }}>
        <Ionicons name="chatbubble-ellipses" size={16} color={theme.primaryColor} />
      </Animated.View>
    </View>
  );
}

const illustrations = [Slide1Illustration, Slide2Illustration, Slide3Illustration, Slide4Illustration];

export default function SlidesScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const SLIDES = [
    {
      id: 1,
      title: 'Manage Your Leads Easily',
      desc: 'Capture, organize, and track all your leads in one place—never miss an opportunity.',
      blobColor: '#E8F2EE',
      accentColor: theme.primaryColor,
    },
    {
      id: 2,
      title: 'Track Deals in Real Time',
      desc: 'Move deals through stages and know exactly where each opportunity stands.',
      blobColor: '#FEF6ED',
      accentColor: '#F59E0B',
    },
    {
      id: 3,
      title: 'Never Miss a Follow-Up',
      desc: 'Get smart reminders for calls, follow-upss, and important customer actions.',
      blobColor: '#EEF2F6',
      accentColor: '#3B82F6',
    },
    {
      id: 4,
      title: 'All Customer Data, Anywhere',
      desc: 'Access contacts, conversations, deals, and support history—anytime, anywhere.',
      blobColor: '#EAF5FF',
      accentColor: '#EF4444',
    },
  ];


  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);  // lock to prevent out-of-bounds during transition
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Clamp index so SLIDES[safeIndex] is ALWAYS defined
  const safeIndex = Math.min(Math.max(currentIndex, 0), SLIDES ? SLIDES.length - 1 : 0);
  const slide = SLIDES && SLIDES[safeIndex] ? SLIDES[safeIndex] : { title: '', desc: '' };
  const IllustrationComponent = illustrations[safeIndex] || Slide1Illustration;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const transition = (callback: () => void) => {
    // Prevent rapid double-taps during animation
    if (isAnimating.current) return;
    isAnimating.current = true;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start(() => {
        isAnimating.current = false;
      });
    });
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      transition(() => setCurrentIndex((prev) =>
        Math.min(prev + 1, SLIDES.length - 1)
      ));
    } else {
      try {
        await AsyncStorage.setItem('@has_seen_onboarding', 'true');
      } catch (e) {
        console.error(e);
      }
      router.replace('/sign-in');
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('@has_seen_onboarding', 'true');
    } catch (e) {
      console.error(e);
    }
    router.replace('/sign-in');
  };

  // Guard: never render with undefined slide (safety net)
  if (!slide || !IllustrationComponent) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.illustrationArea}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          <IllustrationComponent floatAnim={floatAnim} theme={theme} />
        </Animated.View>
      </View>

      {/* Text content */}
      <Animated.View style={[styles.textArea, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </Animated.View>

      {/* Bottom controls */}
      <View style={styles.bottomArea}>
        {/* Progress Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => transition(() => setCurrentIndex(i))}>
              <View
                style={[
                  styles.dot,
                  i === currentIndex && styles.dotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={handleSkip} style={styles.btnSkip}>
            <Text style={styles.btnSkipText}>SKIP</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.btnNext}>
            <Text style={styles.btnNextText}>
              {currentIndex === SLIDES.length - 1 ? 'GET STARTED' : 'NEXT'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 44,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },

  // Illustration wrapper
  illustrationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  illustrationContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 999,
  },

  // Phone mockup inside illustrations
  phoneMock: {
    width: 100,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#0D0F0E',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 3,
  },
  phoneNotch: {
    width: 38,
    height: 6,
    backgroundColor: '#0D0F0E',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 4,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 4,
  },
  phoneSearchBar: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },

  // Lead rows
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 4,
    borderRadius: 5,
    marginBottom: 5,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  leadDot: { width: 14, height: 14, borderRadius: 7 },
  leadLineL: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, width: '80%' },
  leadLineS: { height: 3, backgroundColor: '#E2E8F0', borderRadius: 1.5, width: '50%' },
  activeIndicator: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#22C55E' },

  // Pipeline board rows
  boardRow: { paddingVertical: 5, paddingHorizontal: 5, borderRadius: 4, marginBottom: 5 },
  boardLabel: { fontSize: 8, fontWeight: '700' },

  // Characters
  char: {
    position: 'absolute',
    width: 44,
    height: 68,
    alignItems: 'center',
    zIndex: 4,
  },
  charHead: { width: 20, height: 20, borderRadius: 10, marginBottom: 2 },
  charBody: { width: 32, height: 44, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  charFolderTag: {
    position: 'absolute',
    bottom: 4,
    right: -2,
    width: 14,
    height: 10,
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  charPhoneTag: {
    position: 'absolute',
    bottom: 8,
    left: -2,
    width: 10,
    height: 14,
    backgroundColor: '#E6A15C',
    borderRadius: 2,
  },
  charPhoneCalling: {
    position: 'absolute',
    top: 6,
    left: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6A15C',
  },

  // Floating bubbles
  floatBubble: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 5,
  },
  coin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  coinText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  // Slide 3 widgets
  reminderTitleBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 2, width: '60%', marginBottom: 10 },
  reminderItem: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  checkCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  reminderLineItem: { flex: 1, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 },
  calendarBubble: {
    position: 'absolute',
    top: 52,
    left: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 44,
    height: 48,
    alignItems: 'center',
    zIndex: 5,
  },
  calendarTop: { width: '100%', height: 8, backgroundColor: '#EF4444', borderTopLeftRadius: 9, borderTopRightRadius: 9 },
  calDay: { fontSize: 8, fontWeight: '800', color: '#94A3B8', marginTop: 3 },
  calDate: { fontSize: 16, fontWeight: '800', color: '#1E293B', lineHeight: 18 },
  clockBubble: {
    position: 'absolute',
    right: 28,
    top: 42,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },

  // Slide 4 profile
  profileAva: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 4, marginBottom: 4 },
  profileNameBar: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 2, width: '50%', alignSelf: 'center', marginBottom: 3 },
  profileSubBar: { height: 4, backgroundColor: '#CBD5E1', borderRadius: 1.5, width: '30%', alignSelf: 'center', marginBottom: 8 },
  profileActions: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  profileActionDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#346556' },
  profileDataLine: { height: 5, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 6 },

  // Text & Buttons
  textArea: { alignItems: 'center', paddingHorizontal: 12, marginVertical: 24 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    color: '#707A76',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomArea: { gap: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E2E8F0' },
  dotActive: { width: 22, backgroundColor: theme.primaryColor },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnSkip: { paddingVertical: 14, paddingHorizontal: 16 },
  btnSkipText: { fontSize: 14, fontWeight: '700', color: '#707A76', letterSpacing: 1 },
  btnNext: {
    backgroundColor: theme.primaryColor,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: theme.primaryColor,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnNextText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
});
