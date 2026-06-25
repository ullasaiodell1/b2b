import { attendanceState, updateAttendanceState } from "@/components/attendance/AttendanceState";
import { setCameraResult } from "@/components/custom/CameraState";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePunchIn, usePunchOut } from "@/hooks/useAttendance";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from "expo-location";
import { uploadFile } from "@/services/api/file";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CameraCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sourceScreen?: string;
    target?: string;
    attendanceAction?: "in" | "out";
    extra?: string;
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

  // Attendance API mutations
  const punchIn = usePunchIn();
  const punchOut = usePunchOut();

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
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.75 });
      if (photo?.uri) {
        const compressed = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );
        setPhotoUri(compressed.uri);
      }
    } catch {
      Alert.alert("Capture Failed", "Could not capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const onConfirm = async () => {
    if (!photoUri) return;

    if (sourceScreen === "Attendance") {
      setIsCapturing(true);

      // ── Compute local time string immediately ─────────────────────
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      try {
        // ── Run location fetch + image upload IN PARALLEL ─────────────
        const [locationResult, uploadResult] = await Promise.all([
          // Location task
          (async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== "granted") return { lat: 0, lng: 0, locationStr: undefined as string | undefined };
              const locResult = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low, // faster fix
              });
              const lat = locResult.coords.latitude;
              const lng = locResult.coords.longitude;
              try {
                const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
                const addr = geocode?.[0];
                const locationStr = addr
                  ? `${addr.city || addr.subregion || "Surat"}, ${addr.region || "Gujarat"}`
                  : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                return { lat, lng, locationStr };
              } catch {
                return { lat, lng, locationStr: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
              }
            } catch {
              return { lat: 0, lng: 0, locationStr: undefined as string | undefined };
            }
          })(),

          // Image upload task
          uploadFile(photoUri),
        ]);

        const { lat, lng, locationStr } = locationResult;

        // Resolve the uploaded URL from whatever shape the response has
        const uploadedUrl =
          (typeof uploadResult === 'string' ? uploadResult : null) ||
          uploadResult?.url ||
          uploadResult?.file_url ||
          uploadResult?.location ||
          uploadResult?.path ||
          uploadResult?.key ||
          uploadResult?.data?.url ||
          uploadResult?.data?.file_url ||
          uploadResult?.data?.location ||
          uploadResult?.data?.path ||
          uploadResult?.data?.key ||
          null;

        if (!uploadedUrl) {
          throw new Error('Failed to retrieve upload URL from server');
        }

        if (attendanceAction === "in") {
          await punchIn.mutateAsync({
            checkin_image: uploadedUrl,
            latitude: lat,
            longitude: lng,
            location: locationStr,
          });
          updateAttendanceState({
            stampedIn: true,
            inTime: timeStr,
            inPhoto: uploadedUrl,
            inLocation: locationStr ?? null,
          });
        } else {
          await punchOut.mutateAsync({
            checkout_image: uploadedUrl,
            latitude: lat,
            longitude: lng,
            location: locationStr,
          });

          // Calculate work duration
          let workTimeStr = "--";
          if (attendanceState.inTime && attendanceState.inTime !== "--:--") {
            try {
              const [inH, inM] = attendanceState.inTime.split(":").map(Number);
              const inDate = new Date();
              inDate.setHours(inH, inM, 0, 0);
              let diffMs = now.getTime() - inDate.getTime();
              if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              const remainingMins = diffMins % 60;
              workTimeStr = diffHours === 0 ? `${remainingMins}m` : `${diffHours}h ${remainingMins}m`;
            } catch {
              workTimeStr = "--";
            }
          }

          updateAttendanceState({
            stampedOut: true,
            outTime: timeStr,
            outPhoto: uploadedUrl,
            outLocation: locationStr ?? null,
            workTime: workTimeStr,
          });
        }

        Toast.show({
          type: "success",
          text1: attendanceAction === "in" ? "Punched In!" : "Punched Out!",
          text2: "Attendance recorded successfully.",
        });
        router.back();
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: attendanceAction === "in" ? "Punch In Failed" : "Punch Out Failed",
          text2: error?.message ?? "Please try again.",
        });
      } finally {
        setIsCapturing(false);
      }
      return;
    }

    // ── Standard result for other screens (e.g. expense forms) ──────
    let parsedExtra = undefined;
    if (params.extra) {
      try {
        parsedExtra = JSON.parse(params.extra);
      } catch {
        parsedExtra = params.extra;
      }
    }
    setCameraResult({ uri: photoUri, target, extra: parsedExtra });
    router.back();
  };

  const captureLabel = useMemo(() => (isCapturing ? "Capturing..." : "Capture"), [isCapturing]);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
        <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
        <Ionicons name="camera-outline" size={48} color={colors.icon} />
        <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera access is required</Text>
        <Text style={[styles.permissionText, { color: colors.tabIconDefault }]}>
          Allow camera permission to continue capturing photos.
        </Text>
        <TouchableOpacity
          onPress={requestCameraAccess}
          style={[styles.permissionButton, { backgroundColor: "#346556" }]}
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

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {sourceScreen === "Attendance"
            ? attendanceAction === "in" ? "Punch In Selfie" : "Punch Out Selfie"
            : "Capture Photo"}
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

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        {photoUri ? (
          <View style={styles.previewActions}>
            <TouchableOpacity
              onPress={() => setPhotoUri(null)}
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isCapturing}
              style={[styles.actionButton, styles.primaryButton, isCapturing && { opacity: 0.6 }]}
            >
              <Text style={styles.actionButtonText}>{isCapturing ? "Saving..." : "Use Photo"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity disabled={isCapturing} onPress={onCapture} style={styles.captureButton}>
            <View style={styles.captureInnerCircle}>
              <Text style={styles.captureText}>{captureLabel}</Text>
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
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 10,
  },
  topBarTitle: { fontSize: 16, color: "#FFFFFF", fontWeight: "700", flex: 1, textAlign: "center" },
  iconButton: { width: 36, alignItems: "center", justifyContent: "center" },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
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
  previewActions: { width: "100%", flexDirection: "row", gap: 12 },
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
  permissionTitle: { fontSize: 20, textAlign: "center", fontWeight: "700" },
  permissionText: { fontSize: 14, textAlign: "center" },
  permissionButton: {
    marginTop: 6,
    minHeight: 46,
    minWidth: 170,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  permissionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
