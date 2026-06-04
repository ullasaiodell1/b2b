/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const COLORS = {
  // Brand Colors
  primary: '#346556',
  primaryLight: '#EAF4EE',
  primaryDark: '#204036',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMid: '#3A4844',
  textMuted: '#707A76',
  border: '#E5ECE9',
  peach: '#E2C0B1',
  darkBrown: '#39241E',
  danger: '#EF4444',
  cancelBorder: '#E5E7EB',

  // Additional Common Colors
  dangerLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  success: '#10B981',
  info: '#3B82F6',
  bgDark: '#121514',
  textLight: '#FFFFFF',
  textMutedDark: '#8F9995',
  blueBadge: '#E0F2FE',
  blueText: '#0369A1',

  // Status Colors
  complete: '#15803D',
  completeBg: '#DCFCE7',
  pending: '#B91C1C',
  pendingBg: '#FEE2E2',
  inprogress: '#1D4ED8',
  inprogressBg: '#DBEAFE',

  // Call Colors
  incoming: '#15803D',
  incomingBg: '#DCFCE7',
  outgoing: '#1D4ED8',
  outgoingBg: '#DBEAFE',
  missed: '#B91C1C',
  missedBg: '#FEE2E2',

  // Tag Colors
  tagBg: '#ECFDF5',
  tagText: '#047857',

  // Tab Bar specific
  barBg: '#1C1C1E',
  activeCircleBg: '#FFFFFF',
  activeIcon: '#1C1C1E',
  inactiveIcon: '#8E8E93',
  moreIcon: '#FFFFFF',
  moreLabel: '#9A9A9E',

  // Other UI Colors
  cardBg: '#FFFFFF',
  saveBtnBg: '#000000',
  blue: '#3B82F6',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
  bgGray: '#F3F4F6',
  white: '#FFFFFF',
  blueSoft: '#4F83F6',
  accent: '#E6A15C',
  lightGray: '#F9FAFB',
  avatarBg: '#C9E4D4',
  backdrop: 'rgba(0, 0, 0, 0.4)',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
