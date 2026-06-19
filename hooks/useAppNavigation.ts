/**
 * useAppNavigation - a compatibility hook that wraps React Navigation's
 * useNavigation to provide an expo-router-like `router` API surface.
 *
 * This lets screen files use:
 *   const router = useAppNavigation();
 *   router.push('SignIn');
 *   router.replace('Tabs');
 *   router.back();
 *
 * instead of expo-router's useRouter().
 */
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigator';

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useAppNavigation() {
  return useNavigation<AppNavigation>();
}
