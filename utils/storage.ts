import AsyncStorage from "@react-native-async-storage/async-storage";
import { queryClient } from "@/config/reactQuery";
import { resetProfileData } from "@/components/ProfileState";
import { resetAttendanceState } from "@/components/attendance/AttendanceState";
import { resetCallsState } from "@/components/call/CallState";
import { resetLeadsState } from "@/components/lead/LeadState";
import { resetMeetingsState } from "@/components/meeting/MeetingState";
import { resetVisitsState } from "@/components/visit/VisitState";
import { resetOrdersState } from "@/components/order&quotations/OrderState";
import { setCameraResult } from "@/components/custom/CameraState";

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@auth_token",
  USER_DATA: "@user_data",
  LANGUAGE: "@app_language",
};

// Save auth token
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error("Error saving auth token:", error);
    throw error;
  }
};

// Get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Remove auth token
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error("Error removing auth token:", error);
    throw error;
  }
};

// Save user data
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

// Get user data
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Remove user data
export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error("Error removing user data:", error);
    throw error;
  }
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
  try {
    // 1. Clear physical AsyncStorage
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);

    // 2. Clear TanStack React Query client cache
    queryClient.clear();

    // 3. Reset all in-memory global state stores to prevent data leakage
    resetProfileData();
    resetAttendanceState();
    resetCallsState();
    resetLeadsState();
    resetMeetingsState();
    resetVisitsState();
    resetOrdersState();
    setCameraResult(null);

  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw error;
  }
};

