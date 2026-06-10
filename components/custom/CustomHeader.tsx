import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

const LogoImage = require('@/assets/images/icon.png');

interface CustomHeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearchPress?: () => void;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
}

export default function CustomHeader({
  title = 'Home',
  showSearch = true,
  onSearchPress,
  onAvatarPress,
  onNotificationPress,
  showBack = false,
  onBackPress,
}: CustomHeaderProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/(tabs)/notification' as any);
    }
  };
  return (
    <Animated.View
      style={[
        styles.headerWrapper,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 52 : 24),
        },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        {/* Left: Back button or Spacer */}
        {showBack ? (
          <TouchableOpacity
            onPress={onBackPress || (() => router.back())}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}

        {/* Center Logo */}
        <View style={styles.centerLogoSection}>
          <Image
            source={LogoImage}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>BASALT</Text>
        </View>

        {/* Right: Actions (Notification bell only) */}
        <View style={styles.rightSection}>
          {/* Notification bell */}
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.iconBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.textDark} />
            {/* Notification badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  headerWrapper: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  centerLogoSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0D0F0E',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  logoIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBtn: {
    marginRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.primaryColor,
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.primaryColor,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F4F7F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E8EFEC',
  },
  searchPlaceholder: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
