import { NotificationSettingsState, ThemeSettingsState } from '@/types/settings';
import axios from './httpRequest';

// GET /settings/notifications — get notification settings
export const getNotificationSettings = () => {
  return axios({
    method: 'GET',
    url: `/settings/notifications`
  }) as Promise<NotificationSettingsState>;
};

// PUT /settings/notifications — update notification settings
export const updateNotificationSettings = (data: Partial<NotificationSettingsState>) => {
  return axios({
    method: 'PUT',
    url: `/settings/notifications`,
    data
  }) as Promise<NotificationSettingsState>;
};

// GET /settings/theme — get theme settings
export const getThemeSettings = () => {
  return axios({
    method: 'GET',
    url: `/settings/theme`
  }) as Promise<ThemeSettingsState>;
};

// PUT /settings/theme — update theme settings
export const updateThemeSettings = (data: Partial<ThemeSettingsState>) => {
  return axios({
    method: 'PUT',
    url: `/settings/theme`,
    data
  }) as Promise<ThemeSettingsState>;
};

