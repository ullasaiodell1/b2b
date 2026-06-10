import { Platform } from 'react-native';
import axios from './httpRequest';

export const registerPushToken = (expoPushToken: string): Promise<void> => {
    const url = '/notifications/register-token';
    const platform = Platform.OS;
    const data = { token: expoPushToken, platform };
    return axios({
        method: 'POST',
        url,
        data
    });
};

export const unregisterPushToken = (): Promise<void> => {
    const url = '/notifications/unregister-token';
    return axios({
        method: 'DELETE',
        url
    });
};

export const notificationsApi = {
    registerPushToken,
    unregisterPushToken,
};

