export interface NotificationSettingsState {
  pushNotifications: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  marketingEmails: boolean;
}

export interface ThemeSettingsState {
  mode: 'Light' | 'Dark' | 'System';
  accentColor: string;
}

export interface SettingsItem {
  id: string;
  title: string;
  icon: string;
  description?: string;
  route?: string;
}
