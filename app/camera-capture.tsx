import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { updateAttendanceState, attendanceState } from "@/components/AttendanceState";
import { setCameraResult } from "@/components/CameraState";

export default function CameraCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sourceScreen?: string;
    target?: string;
    attendanceAction?: "in" | "out";
    extra?: string; // serialized JSON or raw string
  }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const sourceScreen = params.sourceScreen ?? "ExpenseAdd";
  const attendanceAction = params.attendanceAction;
  const target = params.target;

  const [cameraFacing, setCameraFacing] = useState<"front" | "back">(
    sourceScreen === "Attendance" ? "front" : "back"
  );

  const requestCameraAccess = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert("Camera Permission Required", "Please allow camera access to capture a photo.");
    }
  };

  const onCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
      });
      if (photo?.uri) {
        const compressed = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );

        setPhotoUri(compressed.uri);
      }
    } catch (error) {
      Alert.alert("Capture Failed", "Could not capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const onConfirm = async () => {
    if (!photoUri) return;

    if (sourceScreen === "Attendance") {
      setIsCapturing(true);
      // 1. Fetch location
      let locationStr = "Simulated Location";
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const locResult = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords = locResult.coords;
          const geocode = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          if (geocode && geocode.length > 0) {
            const address = geocode[0];
            locationStr = `${address.city || address.subregion || "Surat"}, ${address.region || "Gujarat"}`;
          } else {
            locationStr = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
          }
        }
      } catch (locErr) {
        console.log("Location lookup failed in camera-capture:", locErr);
        locationStr = "Location Unresolved";
      }

      // 2. Set times
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const timeStr = `${h}:${m}`;

      if (attendanceAction === "in") {
        updateAttendanceState({
          stampedIn: true,
          inTime: timeStr,
          inPhoto: photoUri,
          inLocation: locationStr,
        });
      } else {
        // Calculate workTime
        let workTimeStr = "8h 45m";
        if (attendanceState.inTime && attendanceState.inTime !== "--:--") {
          try {
            const [inH, inM] = attendanceState.inTime.split(":").map(Number);
            const inDate = new Date();
            inDate.setHours(inH, inM, 0, 0);

            const outDate = new Date();
            let diffMs = outDate.getTime() - inDate.getTime();
            if (diffMs < 0) {
              diffMs += 24 * 60 * 60 * 1000;
            }
            const diffMins = Math.floor(diffMs / 1000 / 60);
            const diffHours = Math.floor(diffMins / 60);
            const remainingMins = diffMins % 60;
            if (diffHours === 0) {
              workTimeStr = `${remainingMins} Min`;
            } else {
              workTimeStr = `${diffHours}h ${remainingMins}m`;
            }
          } catch (e) {
            workTimeStr = "8h 45m";
          }
        }

        updateAttendanceState({
          stampedOut: true,
          outTime: timeStr,
          outPhoto: photoUri,
          outLocation: locationStr,
          workTime: workTimeStr,
        });
      }

      setIsCapturing(false);
      Alert.alert("Success", `Punched ${attendanceAction === "in" ? "In" : "Out"} Successfully!`, [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    // Set standard camera result for other forms
    let parsedExtra = undefined;
    if (params.extra) {
      try {
        parsedExtra = JSON.parse(params.extra);
      } catch {
        parsedExtra = params.extra;
      }
    }

    setCameraResult({
      uri: photoUri,
      target: target,
      extra: parsedExtra,
    });
    router.back();
  };

  const previewActionLabel = useMemo(() => (isCapturing ? "Capturing..." : "Capture"), [isCapturing]);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
        <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
        <Ionicons name="camera-outline" size={48} color={colors.icon} />
        <Text style={[styles.permissionTitle, { color: colors.text, fontWeight: "700" }]}>
          Camera access is required
        </Text>
        <Text style={[styles.permissionText, { color: colors.tabIconDefault }]}>
          Allow camera permission to continue capturing photos.
        </Text>
        <TouchableOpacity
          onPress={requestCameraAccess}
          style={[styles.permissionButton, { backgroundColor: "#346556", borderRadius: 12 }]}
        >
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {photoUri ? (
        <Image source={photoUri} style={styles.camera} contentFit="cover" />
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing} />
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 8, backgroundColor: "rgba(0,0,0,0.35)" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: "#FFFFFF", fontWeight: "700" }]}>
          {sourceScreen === "Attendance" ? "Punch-In / Punch-Out Selfie" : "Capture Photo"}
        </Text>
        {!photoUri ? (
          <TouchableOpacity
            onPress={() => setCameraFacing((prev) => (prev === "back" ? "front" : "back"))}
            style={styles.iconButton}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 14),
            backgroundColor: "rgba(0,0,0,0.45)",
          },
        ]}
      >
        {photoUri ? (
          <View style={styles.previewActions}>
            <TouchableOpacity onPress={() => setPhotoUri(null)} style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.actionButton, styles.primaryButton]}>
              <Text style={styles.actionButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity disabled={isCapturing} onPress={onCapture} style={styles.captureButton}>
            <View style={styles.captureInnerCircle}>
              <Text style={styles.captureText}>{previewActionLabel}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  camera: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  topBarTitle: { fontSize: 16 },
  iconButton: { width: 36, alignItems: "center", justifyContent: "center" },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
    zIndex: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInnerCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  captureText: { color: "#1A1A1A", fontSize: 11, fontWeight: "700", textAlign: "center" },
  previewActions: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: { backgroundColor: "#346556" },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  actionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  permissionContainer: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  permissionTitle: { fontSize: 20, textAlign: "center" },
  permissionText: { fontSize: 14, textAlign: "center" },
  permissionButton: {
    marginTop: 6,
    minHeight: 46,
    minWidth: 170,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  permissionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
