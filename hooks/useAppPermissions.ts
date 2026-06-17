import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

// ── READ ───────────────────────────────────────────────────────────
export function useAppPermissions() {
    const [permissionStatus, setPermissionStatus] = useState<{
        locationForeground: Location.PermissionStatus | null;
        locationBackground: Location.PermissionStatus | null;
        camera: ImagePicker.PermissionStatus | null;
        mediaLibrary: ImagePicker.PermissionStatus | null;
    }>({
        locationForeground: null,
        locationBackground: null,
        camera: null,
        mediaLibrary: null,
    });

    const requestAllPermissions = useCallback(async () => {
        if (Platform.OS === 'web') return;

        // 1. Location (Foreground)
        let locFg = await Location.requestForegroundPermissionsAsync();
        
        // 2. Location (Background) - Only requested if foreground granted
        let locBg = null;
        if (locFg.status === Location.PermissionStatus.GRANTED) {
            locBg = await Location.requestBackgroundPermissionsAsync();
        }

        // 3. Camera
        let cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

        // 4. Media Library
        let libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

        setPermissionStatus({
            locationForeground: locFg.status,
            locationBackground: locBg?.status || null,
            camera: cameraStatus.status,
            mediaLibrary: libraryStatus.status,
        });

        return {
            foregroundGranted: locFg.status === Location.PermissionStatus.GRANTED,
            backgroundGranted: locBg?.status === Location.PermissionStatus.GRANTED,
            cameraGranted: cameraStatus.status === ImagePicker.PermissionStatus.GRANTED,
            mediaLibraryGranted: libraryStatus.status === ImagePicker.PermissionStatus.GRANTED,
        };
    }, []);

    const checkCameraPermission = useCallback(async () => {
        let { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
        
        if (status === 'granted') return true;

        if (canAskAgain) {
            const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
            return newStatus === 'granted';
        }
        
        return false;
    }, []);

    return {
        permissionStatus,
        requestAllPermissions,
        checkCameraPermission,
        checkLocationPermission: async () => {
            const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') return true;
            if (canAskAgain) {
                const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                return newStatus === 'granted';
            }
            return false;
        },
        checkLocationServices: async () => {
            return await Location.hasServicesEnabledAsync();
        }
    };
}
