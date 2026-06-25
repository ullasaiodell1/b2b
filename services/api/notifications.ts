import { Platform } from 'react-native';
import axios from './httpRequest';

// POST /notifications/register-token — register push token
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

// DELETE /notifications/unregister-token — unregister push token
export const unregisterPushToken = (): Promise<void> => {
    const url = '/notifications/unregister-token';
    console.log(`[API unregisterPushToken] url:`, url);
    return axios({
        method: 'DELETE',
        url
    });
};

// GET /notifications — list notifications
export const getNotifications = (params?: any): Promise<any> => {
    const url = '/notifications';
    console.log(`[API getNotifications] params:`, params);
    return axios({
        method: 'GET',
        url,
        params
    });
};

export const notificationsApi = {
    registerPushToken,
    unregisterPushToken,
    getNotifications,
};

