import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from '@/utils/storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkNavigationFlow = async () => {
      // Show brand splash logo for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('@has_seen_onboarding');
        const token = await getAuthToken();

        if (hasSeenOnboarding !== 'true') {
          // First time opening the app, show onboarding slides
          router.replace('/slides');
        } else if (token) {
          // Already logged in, direct to dashboard
          router.replace('/(tabs)');
        } else {
          // Not logged in, show sign-in screen
          router.replace('/sign-in');
        }
      } catch (error) {
        console.error('Error checking onboarding or auth status:', error);
        router.replace('/sign-in');
      }
    };

    checkNavigationFlow();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logoIcon}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>BASALT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoIcon: {
    width: 72,
    height: 72,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0D0F0E',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
});
