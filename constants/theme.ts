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
  saveBtnBg: '#346556',
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

import { StyleSheet } from 'react-native';

const originalCreate = StyleSheet.create;

function makeThemeDynamic(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const newObj: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        newObj[key] = makeThemeDynamic(val);
      } else if (typeof val === 'string') {
        const lowerVal = val.toLowerCase();
        if (lowerVal === '#346556') {
          Object.defineProperty(newObj, key, {
            get: () => COLORS.primary,
            enumerable: true,
            configurable: true
          });
        } else if (lowerVal === '#eaf4ee') {
          Object.defineProperty(newObj, key, {
            get: () => COLORS.primaryLight,
            enumerable: true,
            configurable: true
          });
        } else if (lowerVal === '#204036') {
          Object.defineProperty(newObj, key, {
            get: () => COLORS.primaryDark,
            enumerable: true,
            configurable: true
          });
        } else if (lowerVal === '#c9e4d4') {
          Object.defineProperty(newObj, key, {
            get: () => COLORS.avatarBg,
            enumerable: true,
            configurable: true
          });
        } else {
          newObj[key] = val;
        }
      } else {
        newObj[key] = val;
      }
    }
  }
  return newObj;
}

(StyleSheet as any).create = function(styles: any) {
  const dynamicStyles = makeThemeDynamic(styles);
  return originalCreate(dynamicStyles);
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

// Helper functions for theme customization
function hexToHsl(hex: string) {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`;
}

function getPrimaryLight(hex: string) {
  const { h, s } = hexToHsl(hex);
  return hslToHex(h, s, 95);
}

function getPrimaryDark(hex: string) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(l - 15, 15));
}

// ---------------------------------------------------------------------------
// setThemeColor — kept for backward compat with static StyleSheets.
// ThemeContext is the source of truth for reactive updates.
// ---------------------------------------------------------------------------
export function setThemeColor(color: string) {
  (COLORS as any).primary = color;
  (COLORS as any).primaryLight = getPrimaryLight(color);
  (COLORS as any).primaryDark = getPrimaryDark(color);
  (COLORS as any).avatarBg = COLORS.primaryLight;
}

export function getColorName(hex: string): string {
  const hexLower = hex.toLowerCase();
  if (hexLower === '#346556') return 'Green (Default)';
  if (['#2e7d32', '#1b5e20', '#4caf50', '#81c784', '#c8e6c9'].includes(hexLower)) return 'Green';
  if (['#ff3d00', '#ff6d00', '#ff9100', '#ffab00', '#ffe082', '#fff9c4', '#e65100', '#f57c00', '#ffb74d', '#ffe0b2', '#fff3e0'].includes(hexLower)) return 'Orange';
  if (['#d84315', '#f4511e', '#ff8a65', '#ffccbc', '#fbe9e7', '#fff5f5', '#c62828', '#e53935', '#ef5350', '#ef9a9a', '#ffcdd2', '#ffebee'].includes(hexLower)) return 'Red';
  if (['#8e24aa', '#ab47bc', '#ba68c8', '#ce93d8', '#e1bee7', '#f3e5f5'].includes(hexLower)) return 'Purple';
  if (['#1565c0', '#1e88e5', '#42a5f5', '#90caf9', '#bbdefb', '#e3f2fd'].includes(hexLower)) return 'Blue';
  if (['#006064', '#00838f', '#00acc1', '#4dd0e1', '#b2ebf2', '#e0f7fa', '#004d40', '#00695c', '#00897b', '#4db6ac', '#b2dfdb', '#e0f2f1'].includes(hexLower)) return 'Teal';
  if (['#37474f', '#455a64', '#546e7a', '#78909c', '#90a4ae', '#cfd8dc', '#212121', '#424242', '#616161', '#757575', '#9e9e9e', '#bdbdbd', '#faf9f6'].includes(hexLower)) return 'Gray';
  return 'Custom';
}


