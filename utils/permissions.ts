import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { AudioModule } from 'expo-audio';

export type PermissionType = 'camera' | 'location' | 'microphone' | 'gallery';
export type PermissionStatusState = {
  cameraPermissionGranted: boolean;
  locationServicesEnabled: boolean;
};

interface PermissionHandlers {
  request: () => Promise<any>;
  get: () => Promise<any>;
  title: string;
  message: string;
}

const Handlers: Record<PermissionType, PermissionHandlers> = {
  camera: {
    request: ImagePicker.requestCameraPermissionsAsync,
    get: ImagePicker.getCameraPermissionsAsync,
    title: 'Camera Permission Required',
    message: 'Please allow camera access in settings to take photos.',
  },
  location: {
    request: Location.requestForegroundPermissionsAsync,
    get: Location.getForegroundPermissionsAsync,
    title: 'Location Permission Required',
    message: 'Please allow location access in settings to use location features.',
  },
  microphone: {
    request: () => AudioModule.requestRecordingPermissionsAsync(),
    get: () => AudioModule.getRecordingPermissionsAsync(),
    title: 'Microphone Permission Required',
    message: 'Please allow microphone access in settings to record audio.',
  },
  gallery: {
    request: ImagePicker.requestMediaLibraryPermissionsAsync,
    get: ImagePicker.getMediaLibraryPermissionsAsync,
    title: 'Gallery Permission Required',
    message: 'Please allow gallery access in settings to select photos.',
  },
};

/**
 * Checks if location services (GPS) are enabled on the device.
 * @returns boolean indicating if services are enabled
 */
export const checkLocationServices = async (): Promise<boolean> => {
  const isEnabled = await Location.hasServicesEnabledAsync();
  if (!isEnabled) {
    Alert.alert(
      'Location Services Disabled',
      'Please enable location services (GPS) to use this feature.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Settings', 
          onPress: () => {
            if (Platform.OS === 'android') {
              Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
            } else {
              Linking.openSettings();
            }
          }
        },
      ]
    );
    return false;
  }
  return true;
};

/**
 * Robust permission requester that handles "canAskAgain" logic and directs to settings.
 * @param type The type of permission to request
 * @param customMessage Optional custom message for the alert
 * @returns boolean indicating if permission is granted
 */
export const ensurePermission = async (type: PermissionType, customMessage?: string): Promise<boolean> => {
  const handler = Handlers[type];
  if (!handler) return false;

  let permission = await handler.get();
  
  if (permission.status !== 'granted') {
    if (permission.canAskAgain) {
      permission = await handler.request();
    }
    
    if (permission.status !== 'granted') {
      if (!permission.canAskAgain) {
        Alert.alert(
          handler.title,
          customMessage || handler.message,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      return false;
    }
  }

  // If location, also check if services are enabled
  if (type === 'location') {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      // We don't call Alert here if we want to handle it separately, 
      // but usually if ensurePermission('location') is called, we want both.
      // However, checkLocationServices already has an Alert.
      // To avoid double alerts, let's just return false and let the caller decide,
      // or handle it here.
      return await checkLocationServices();
    }
  }

  return true;
};

export const getPermissionStatus = async (): Promise<PermissionStatusState> => {
  const [{ status }, locationServicesEnabled] = await Promise.all([
    ImagePicker.getCameraPermissionsAsync(),
    Location.hasServicesEnabledAsync(),
  ]);

  return {
    cameraPermissionGranted: status === 'granted',
    locationServicesEnabled,
  };
};

export const ensureAttendanceCapturePermissions = async (): Promise<boolean> => {
  const hasLocation = await ensurePermission(
    'location',
    'To validate your attendance, please allow location access in settings.',
  );
  if (!hasLocation) return false;

  return ensurePermission(
    'camera',
    'A selfie is required for attendance. Please allow camera access in settings.',
  );
};
