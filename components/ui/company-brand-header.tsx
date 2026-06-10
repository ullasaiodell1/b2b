import { useAppTheme } from '@/hooks/use-app-theme';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

export function CompanyBrandHeader() {
  const { colors, typography } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          borderCurve: 'continuous',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceMuted,
        }}
      >
        <Image
          source={require('@/assets/images/ems-logo.png')}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </View>

      <View style={{ gap: 1 }}>
        <Text
          selectable
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '800',
            fontFamily: typography.family.bold,
            letterSpacing: 0.3,
          }}
        >
          EMS
        </Text>
      </View>
    </View>
  );
}
