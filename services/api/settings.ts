import { NotificationSettingsState, ThemeSettingsState } from '@/types/settings';
import axios from './httpRequest';

export const getNotificationSettings = () => {
  return axios({
    method: 'GET',
    url: `/settings/notifications`
  }) as Promise<NotificationSettingsState>;
};

export const updateNotificationSettings = (data: Partial<NotificationSettingsState>) => {
  return axios({
    method: 'PUT',
    url: `/settings/notifications`,
    data
  }) as Promise<NotificationSettingsState>;
};

export const getThemeSettings = () => {
  return axios({
    method: 'GET',
    url: `/settings/theme`
  }) as Promise<ThemeSettingsState>;
};

export const updateThemeSettings = (data: Partial<ThemeSettingsState>) => {
  return axios({
    method: 'PUT',
    url: `/settings/theme`,
    data
  }) as Promise<ThemeSettingsState>;
};
