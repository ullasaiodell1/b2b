import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/theme';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToHsl(hex: string) {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
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
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60)        { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180){ r = 0; g = c; b = x; }
  else if (180 <= h && h < 240){ r = 0; g = x; b = c; }
  else if (240 <= h && h < 300){ r = x; g = 0; b = c; }
  else if (300 <= h && h < 360){ r = c; g = 0; b = x; }
  const rH = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gH = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bH = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  return `#${rH}${gH}${bH}`;
}

function derivePrimaryLight(hex: string) {
  const { h, s } = hexToHsl(hex);
  return hslToHex(h, s, 95);
}

function derivePrimaryDark(hex: string) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(l - 15, 15));
}

const STORAGE_KEY = '@theme_primary_color';
const DEFAULT_PRIMARY = '#346556';

// ─── Context Types ────────────────────────────────────────────────────────────

export interface ThemeContextValue {
  primaryColor: string;
  primaryLight: string;
  primaryDark: string;
  avatarBg: string;
  setPrimaryColor: (color: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextValue>({
  primaryColor: DEFAULT_PRIMARY,
  primaryLight: derivePrimaryLight(DEFAULT_PRIMARY),
  primaryDark: derivePrimaryDark(DEFAULT_PRIMARY),
  avatarBg: derivePrimaryLight(DEFAULT_PRIMARY),
  setPrimaryColor: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColorState] = useState(DEFAULT_PRIMARY);

  // Derived values (re-computed whenever primaryColor changes)
  const primaryLight = derivePrimaryLight(primaryColor);
  const primaryDark = derivePrimaryDark(primaryColor);
  const avatarBg = primaryLight;

  // Sync COLORS object so legacy StyleSheets (static usages) also get the value
  const syncColors = useCallback((color: string) => {
    (COLORS as any).primary = color;
    (COLORS as any).primaryLight = derivePrimaryLight(color);
    (COLORS as any).primaryDark = derivePrimaryDark(color);
    (COLORS as any).avatarBg = derivePrimaryLight(color);
  }, []);

  // On mount — load saved color
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          syncColors(saved);
          setPrimaryColorState(saved);
        } else {
          syncColors(DEFAULT_PRIMARY);
        }
      })
      .catch(() => {});
  }, []);

  // Update color: set state (triggers re-render), sync COLORS, persist
  const setPrimaryColor = useCallback(
    (color: string) => {
      syncColors(color);
      setPrimaryColorState(color);
      AsyncStorage.setItem(STORAGE_KEY, color).catch(() => {});
    },
    [syncColors],
  );

  return (
    <ThemeContext.Provider
      value={{ primaryColor, primaryLight, primaryDark, avatarBg, setPrimaryColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
