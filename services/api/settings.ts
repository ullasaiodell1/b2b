import { NotificationSettingsState, ThemeSettingsState } from '@/types/settings';
import axios from './httpRequest';

export const getNotificationSettings = () => {
  console.log(`[API getNotificationSettings]`);
  return axios({
    method: 'GET',
    url: `/settings/notifications`
  }) as Promise<NotificationSettingsState>;
};

export const updateNotificationSettings = (data: Partial<NotificationSettingsState>) => {
  console.log(`[API updateNotificationSettings] data:`, data);
  return axios({
    method: 'PUT',
    url: `/settings/notifications`,
    data
  }) as Promise<NotificationSettingsState>;
};

export const getThemeSettings = () => {
  console.log(`[API getThemeSettings]`);
  return axios({
    method: 'GET',
    url: `/settings/theme`
  }) as Promise<ThemeSettingsState>;
};

export const updateThemeSettings = (data: Partial<ThemeSettingsState>) => {
  console.log(`[API updateThemeSettings] data:`, data);
  return axios({
    method: 'PUT',
    url: `/settings/theme`,
    data
  }) as Promise<ThemeSettingsState>;
};
