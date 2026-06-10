import { useColorScheme } from '@/hooks/use-color-scheme';

const lightColors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F7',
  card: '#FFFFFF',
  border: '#D8E0EA',
  textPrimary: '#111827',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  brand: '#1D4E89',
  brandSoft: '#E5ECF7',
  success: '#0F766E',
  warning: '#B45309',
  danger: '#DC2626',
  tabBar: '#FDFDFD',
  tabBorder: '#D8E0EA',
  overlay: 'rgba(11, 15, 25, 0.55)',
};

const darkColors = {
  background: '#0B1017',
  surface: '#111827',
  surfaceMuted: '#1B2638',
  card: '#111827',
  border: '#2B3A52',
  textPrimary: '#F9FAFB',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  brand: '#7FB3F0',
  brandSoft: '#23344A',
  success: '#34D399',
  warning: '#F59E0B',
  danger: '#FF6B6B',
  tabBar: '#0F1724',
  tabBorder: '#263549',
  overlay: 'rgba(4, 7, 14, 0.68)',
};

export type ThemeColors = typeof lightColors;
export type AppColorPalette = ThemeColors;

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isAndroid = process.env.EXPO_OS === 'android';

  return {
    isDark,
    typography: {
      family: {
        regular: isAndroid ? 'sans-serif' : 'System',
        medium: isAndroid ? 'sans-serif-medium' : 'System',
        semibold: isAndroid ? 'sans-serif-medium' : 'System',
        bold: isAndroid ? 'sans-serif-medium' : 'System',
        mono: isAndroid ? 'monospace' : 'Menlo',
      },
      size: {
        caption: 11,
        body: 14,
        bodyLarge: 16,
        title: 20,
        heading: 26,
      },
    },
    colors: isDark ? darkColors : lightColors,
    radii: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 32,
      pill: 999,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 28,
    },
    shadow: {
      card: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
      },
      raised: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
      },
      glow: {
        shadowColor: '#1D4E89',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.24,
        shadowRadius: 10,
        elevation: 3,
      },
    },
  };
};
