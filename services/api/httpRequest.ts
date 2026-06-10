import axios from 'axios';
import { serverDetails } from '@/config';
import { clearAuthData, getAuthToken } from '@/utils/storage';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

const axiosInstance = axios.create({
  baseURL: serverDetails.serverProxyURL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Unauthorized',
      });
      clearAuthData();
      router.replace('/sign-in');
    }
    return Promise.reject(error.response?.data || error);
  },
);

export default axiosInstance;
