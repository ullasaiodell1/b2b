import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { queryClient } from '@/config/reactQuery';
import { ThemeProvider as AppThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { requestNotificationPermission } from '@/utils/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    requestNotificationPermission().catch((err) => {
      console.warn('Failed to request notifications permission on startup:', err);
    });
  }, []);

  return (
    <AppThemeProvider>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="slides" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen
                name="reset-password"
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="otp"
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                  animation: 'fade',
                }}
              />
              <Stack.Screen name="device-limit" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="camera-capture" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </AppThemeProvider>
  );
}
