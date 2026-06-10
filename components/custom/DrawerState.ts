import { Ionicons } from '@expo/vector-icons';

export interface DrawerNavigationItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string; // route name in Expo Router
  visible: boolean;
  section: 'Sales' | 'Activities' | null;
  alertMsg?: string; // optional message for unimplemented CRM screens
}

export const DEFAULT_DRAWER_ITEMS: DrawerNavigationItem[] = [
  { id: 'home',       label: 'Home',       icon: 'home-outline',      route: 'index',     visible: true, section: null },
  { id: 'calendar',   label: 'Calendar',   icon: 'calendar-outline',  route: 'calendar',  visible: true, section: null },
  { id: 'reports',    label: 'Reports',    icon: 'document-text-outline', route: 'reports', visible: true, section: null },
  { id: 'analytics',  label: 'Analytics',  icon: 'analytics-outline', visible: true, section: null, alertMsg: 'Analytics Dashboard loading...\nSyncing CRM records.' },

  // Sales section
  { id: 'leads',      label: 'Leads',      icon: 'people-outline',    route: 'leads',     visible: true, section: 'Sales' },
  { id: 'company',    label: 'Company',    icon: 'business-outline',  route: 'company',   visible: true, section: 'Sales' },
  { id: 'orders',     label: 'Orders',     icon: 'cart-outline',      route: 'Order',     visible: true, section: 'Sales' },
  { id: 'quotations', label: 'Quotations', icon: 'document-attach-outline', route: 'Quotation', visible: true, section: 'Sales' },

  // Activities section
  { id: 'calls',      label: 'Calls',      icon: 'call-outline',          route: 'call',    visible: true, section: 'Activities' },
  { id: 'meetings',   label: 'Meetings',   icon: 'videocam-outline',      route: 'meeting', visible: true, section: 'Activities' },
  { id: 'tasks',      label: 'Tasks',      icon: 'checkmark-done-circle-outline', route: 'task', visible: true, section: 'Activities' },
];

export let isDrawerOpen = false;
export let drawerItems: DrawerNavigationItem[] = [...DEFAULT_DRAWER_ITEMS];

const listeners = new Set<() => void>();

export function subscribeToDrawer(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

export function openDrawer() {
  isDrawerOpen = true;
  notify();
}

export function closeDrawer() {
  isDrawerOpen = false;
  notify();
}

export function toggleDrawer() {
  isDrawerOpen = !isDrawerOpen;
  notify();
}

export function updateDrawerItems(items: DrawerNavigationItem[]) {
  drawerItems = [...items];
  notify();
}

export function toggleItemVisibility(id: string) {
  drawerItems = drawerItems.map((item) =>
    item.id === id ? { ...item, visible: !item.visible } : item
  );
  notify();
}

export function reorderDrawerItems(fromIndex: number, toIndex: number) {
  const items = [...drawerItems];
  const [removed] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, removed);
  drawerItems = items;
  notify();
}

export function resetDrawerItems() {
  drawerItems = DEFAULT_DRAWER_ITEMS.map((item) => ({ ...item }));
  notify();
}
