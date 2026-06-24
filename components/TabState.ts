import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TabModule {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
}

export const ALL_TAB_MODULES: TabModule[] = [
  { id: 'index', title: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { id: 'calendar', title: 'Calendar', icon: 'calendar', iconOutline: 'calendar-outline' },
  { id: 'leads', title: 'Leads', icon: 'people', iconOutline: 'people-outline' },
  { id: 'company', title: 'Company', icon: 'business', iconOutline: 'business-outline' },
  { id: 'Order', title: 'Orders', icon: 'cart', iconOutline: 'cart-outline' },
  { id: 'Quotation', title: 'Quotations', icon: 'document-attach', iconOutline: 'document-attach-outline' },
  { id: 'call', title: 'Calls', icon: 'call', iconOutline: 'call-outline' },
  { id: 'meeting', title: 'Meetings', icon: 'videocam', iconOutline: 'videocam-outline' },
  { id: 'task', title: 'Tasks', icon: 'checkmark-done-circle', iconOutline: 'checkmark-done-circle-outline' },
  { id: 'attendance', title: 'Attendance', icon: 'finger-print', iconOutline: 'finger-print-outline' },
  { id: 'leave', title: 'Leave', icon: 'calendar-clear', iconOutline: 'calendar-clear-outline' },
  { id: 'profile', title: 'Profile', icon: 'person', iconOutline: 'person-outline' },
  { id: 'settings', title: 'Settings', icon: 'settings', iconOutline: 'settings-outline' },
  { id: 'visit', title: 'Visits', icon: 'location', iconOutline: 'location-outline' },
  { id: 'email', title: 'Emails', icon: 'mail', iconOutline: 'mail-outline' },
];

export let configuredTabs = ['index', 'leads', 'meeting'];
export let dynamicTabId: string | null = null;

const TABS_STORAGE_KEY = '@configured_tabs';
const DYNAMIC_TAB_STORAGE_KEY = '@dynamic_tab_id';

const tabListeners = new Set<() => void>();

export function subscribeToTabs(listener: () => void) {
  tabListeners.add(listener);
  return () => {
    tabListeners.delete(listener);
  };
}

function notifyTabs() {
  tabListeners.forEach((l) => l());
}

// Load persisted state asynchronously
AsyncStorage.getItem(TABS_STORAGE_KEY).then(val => {
  if (val) {
    try {
      configuredTabs = JSON.parse(val);
      notifyTabs();
    } catch (e) {
      console.error('Error parsing stored configured tabs:', e);
    }
  }
}).catch(() => {});

AsyncStorage.getItem(DYNAMIC_TAB_STORAGE_KEY).then(val => {
  if (val !== null) {
    dynamicTabId = val;
    notifyTabs();
  }
}).catch(() => {});

export function updateConfiguredTabs(newTabs: string[]) {
  configuredTabs = [...newTabs];
  dynamicTabId = null; // reset dynamic tab on reconfiguration
  AsyncStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(configuredTabs)).catch(() => {});
  AsyncStorage.removeItem(DYNAMIC_TAB_STORAGE_KEY).catch(() => {});
  notifyTabs();
}

export function setDynamicTab(tabId: string | null) {
  if (tabId === null) {
    dynamicTabId = null;
    AsyncStorage.removeItem(DYNAMIC_TAB_STORAGE_KEY).catch(() => {});
    notifyTabs();
  } else if (!configuredTabs.includes(tabId)) {
    dynamicTabId = tabId;
    AsyncStorage.setItem(DYNAMIC_TAB_STORAGE_KEY, tabId).catch(() => {});
    notifyTabs();
  }
}

export function resetTabs() {
  configuredTabs = ['index', 'leads', 'meeting', 'email'];
  dynamicTabId = null;
  AsyncStorage.removeItem(TABS_STORAGE_KEY).catch(() => {});
  AsyncStorage.removeItem(DYNAMIC_TAB_STORAGE_KEY).catch(() => {});
  notifyTabs();
}
