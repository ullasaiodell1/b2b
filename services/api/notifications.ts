import { Platform } from 'react-native';
import axios from './httpRequest';

export const registerPushToken = (expoPushToken: string): Promise<void> => {
    console.log(`[API registerPushToken] expoPushToken:`, expoPushToken);
    const url = '/notifications/register-token';
    const platform = Platform.OS;
    const data = { token: expoPushToken, platform };
    console.log(`[API registerPushToken] data:`, data);
    return axios({
        method: 'POST',
        url,
        data
    });
};

export const unregisterPushToken = (): Promise<void> => {
    const url = '/notifications/unregister-token';
    console.log(`[API unregisterPushToken] url:`, url);
    return axios({
        method: 'DELETE',
        url
    });
};

export const notificationsApi = {
    registerPushToken,
    unregisterPushToken,
};

