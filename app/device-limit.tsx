import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useDeleteSession, useLogout, useLogin } from '@/hooks/useAuth';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/hooks/use-theme';

export default function DeviceLimitScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams();
  
  const token = (params.token as string) || '';
  const phoneNumber = (params.phoneNumber as string) || '';
  const password = (params.password as string) || '';
  
  let sessions: any[] = [];
  try {
    if (params.sessions) {
      sessions = JSON.parse(params.sessions as string);
    }
  } catch (e) {
    console.error('Failed to parse sessions in device limit screen:', e);
  }

  const deleteSessionMutation = useDeleteSession();
  const logoutMutation = useLogout();
  const loginMutation = useLogin();

  // Helper to parse user agent
  const getDeviceFriendlyName = (userAgent: string) => {
    if (!userAgent) return 'Unknown Device';
    const ua = userAgent.toLowerCase();
    
    let os = 'Unknown OS';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      os = 'iPhone/iPad';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
      os = 'macOS';
    } else if (ua.includes('windows')) {
      os = 'Windows';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    }
    
    let client = '';
    if (ua.includes('okhttp')) {
      client = 'Mobile App';
    } else if (ua.includes('chrome') || ua.includes('crios')) {
      client = 'Chrome';
    } else if (ua.includes('firefox')) {
      client = 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      client = 'Safari';
    }
    
    if (client) {
      return `${os} (${client})`;
    }
    return os;
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Handle auto login after a successful logout
  const handleAutoLogin = () => {
    if (!phoneNumber || !password) {
      Toast.show({
        type: 'info',
        text1: 'Logged out successfully',
        text2: 'Please sign in again.',
      });
      router.replace('/sign-in');
      return;
    }

    loginMutation.mutate(
      { identifier: phoneNumber, password },
      {
        onSuccess: async (data: any) => {
          if (data?.token) {
            const { saveAuthToken, saveUserData } = require('@/utils/storage');
            await saveAuthToken(data.token);
            if (data.user) {
              await saveUserData(data.user);
            }
            router.replace('/(tabs)');
          } else {
            router.replace('/sign-in');
          }
        },
        onError: (err: any) => {
          Toast.show({
            type: 'error',
            text1: 'Automatic login failed',
            text2: err.message || 'Please sign in manually.',
          });
          router.replace('/sign-in');
        }
      }
    );
  };

  // Log out a specific session
  const handleLogOutSession = (sessionId: string) => {
    if (!token) return;
    deleteSessionMutation.mutate(
      { sessionId, token },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Device logged out',
            text2: 'Logging you in...',
          });
          handleAutoLogin();
        },
        onError: (err: any) => {
          Toast.show({
            type: 'error',
            text1: 'Failed to logout device',
            text2: err.message || 'Please try again.',
          });
        }
      }
    );
  };

  // Log out all sessions
  const handleLogOutAll = () => {
    if (!token) return;
    logoutMutation.mutate(token, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'All devices logged out',
          text2: 'Logging you in...',
        });
        handleAutoLogin();
      },
      onError: (err: any) => {
        Toast.show({
          type: 'error',
          text1: 'Failed to logout all devices',
          text2: err.message || 'Please try again.',
        });
      }
    });
  };

  const isPending = deleteSessionMutation.isPending || logoutMutation.isPending || loginMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121514" />
      
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          disabled={isPending}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Central Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('@/assets/images/device_limit_illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <View style={styles.headingContainer}>
          <Text style={styles.title}>Login Pending, Device Limit Reached</Text>
          <Text style={styles.subtitle}>Your current plan supports 1 Device only</Text>
        </View>

        {/* Section: Log Out Device to Continue */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Log Out 1 Device to Continue</Text>
          
          {sessions.map((session, index) => (
            <View key={session.id || index} style={styles.deviceCard}>
              <View style={styles.deviceIconContainer}>
                <Ionicons
                  name={session.user_agent?.toLowerCase().includes('okhttp') ? "phone-portrait" : "desktop-outline"}
                  size={22}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.deviceDetails}>
                <Text style={styles.deviceName}>{getDeviceFriendlyName(session.user_agent)}</Text>
                <Text style={styles.deviceLastUsed}>Last used : Today</Text>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => handleLogOutSession(session.id)}
                disabled={isPending}
              >
                {deleteSessionMutation.isPending && deleteSessionMutation.variables?.sessionId === session.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.logoutButtonText}>Log Out</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Log out all devices */}
        <TouchableOpacity
          style={styles.logoutAllContainer}
          onPress={handleLogOutAll}
          disabled={isPending}
        >
          {logoutMutation.isPending ? (
            <ActivityIndicator size="small" color="#8F9995" />
          ) : (
            <Text style={styles.logoutAllText}>Log out from all devices</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Global Loader Backdrop */}
      {isPending && (
        <View style={styles.loaderBackdrop}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={styles.loaderText}>Processing...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121514',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    height: 56,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  illustration: {
    width: 240,
    height: 240,
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#8F9995',
    textAlign: 'center',
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E6A15C', // Gold/Amber/Peach accent
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2422',
    borderWidth: 1,
    borderColor: '#2D3532',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  deviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2D3532',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deviceLastUsed: {
    fontSize: 12,
    color: '#8F9995',
  },
  logoutButton: {
    backgroundColor: '#2D3532',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutAllContainer: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutAllText: {
    fontSize: 14,
    color: '#8F9995',
    textDecorationLine: 'underline',
  },
  loaderBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
