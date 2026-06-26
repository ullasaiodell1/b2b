import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDrawer } from '@/hooks/useDrawer';
import { useTabs } from '@/hooks/useTabs';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const pathname = usePathname();
  const pathnameParts = pathname.split('/');
  const lastPathSegment = pathnameParts[pathnameParts.length - 1];

  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const { openDrawer } = useDrawer();
  const { tabs: currentConfiguredTabs, activeDynamicTab: currentDynamicTabId, setDynamicTab, allModules: ALL_TAB_MODULES } = useTabs();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  const getActiveRouteName = (route: any): string => {
    if (!route.state) {
      return route.name;
    }
    const index = route.state.index;
    const activeRoute = route.state.routes[index];
    return getActiveRouteName(activeRoute);
  };

  const currentRoute = state.routes ? state.routes[state.index] : null;
  const activeLeafRouteName = currentRoute ? getActiveRouteName(currentRoute) : '';
  const activeRouteName = state.routes[state.index]?.name;

  // Hide the tab bar on specific sub-screens/nested stack screens
  const hiddenTabBarScreens = [
    'add-meeting', 'meeting-details',
    'add-lead', 'lead-details', 'leads-filter', 'select-company', 'select-owner', 'edit-lead', 'select-category',
    'lead-activity', 'interested-products', 'lead-attachments', 'lead-contacts', 'add-reminder',
    'add-order', 'order-details', 'order-filter', 'edit-order',
    'add-quotation', 'quotation-details', 'quotation-filter',
    'add-task', 'edit-task', 'task-details', 'task-filter',
    'add-visit', 'visit-details', 'visit-filter',
    'call-filter', 'call-history',
    'edit-profile', 'change-password',
    'theme-settings', 'notification-settings', 'help-support',
    'ledger-filter', 'lead-ledger',
    'lead-task', 'lead-add-task', 'lead-edit-task', 'lead-task-details', 'lead-task-filter',
    'lead-quotation', 'lead-add-quotation', 'lead-quotation-details', 'lead-quotation-filter',
    'lead-order', 'lead-add-order', 'lead-order-details', 'lead-order-filter',
    'lead-visit', 'lead-add-visit', 'lead-visit-details', 'lead-visit-filter',
    'lead-meeting', 'lead-add-meeting', 'lead-meeting-details', 'lead-meeting-filter',
    'apply', 'approvals'
  ];

  if (
    hiddenTabBarScreens.includes(activeLeafRouteName) ||
    hiddenTabBarScreens.includes(lastPathSegment)
  ) {
    return null;
  }

  // Max 4 regular tabs
  let displayTabs = [...currentConfiguredTabs];
  if (currentDynamicTabId && !currentConfiguredTabs.includes(currentDynamicTabId)) {
    if (displayTabs.length >= 4) {
      displayTabs[3] = currentDynamicTabId;
    } else {
      displayTabs.push(currentDynamicTabId);
    }
  }
  const visibleTabs = displayTabs.slice(0, 4);

  return (
    <Animated.View
      style={[
        styles.bottomBarContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.outerRow}>
        {/* ── LEFT DARK PILL (4 tabs) ── */}
        <View style={styles.pill}>
          {visibleTabs.map((tabId) => {
            const mod = ALL_TAB_MODULES.find((m) => m.id === tabId);
            if (!mod) return null;

            const route = state.routes.find((r) => r.name === tabId);
            if (!route) return null;

            const isFocused = activeRouteName === tabId;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                {isFocused ? (
                  /* ── Active icon (white, not raised) ── */
                  <Ionicons
                    name={mod.icon}
                    size={24}
                    color="#FFFFFF"
                  />
                ) : (
                  /* ── Regular inactive icon ── */
                  <Ionicons
                    name={mod.iconOutline}
                    size={22}
                    color={COLORS.inactiveIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── GAP ── */}
        <View style={styles.gap} />

        {/* ── RIGHT MORE BUTTON (separate pill) ── */}
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.moreBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="reorder-three-outline" size={24} color={COLORS.moreIcon} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  bottomBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bgPage,
    paddingTop: 1,
    borderTopWidth: 0,
    borderTopColor: COLORS.border,
  },
  // Outer row — positions the two elements side by side
  outerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  // ── LEFT PILL ───────────────────────────────────────
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.barBg,
    borderRadius: 40,
    height: 62,
    paddingHorizontal: 6,
    // overflow visible so raised circle can pop above
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 16,
  },

  // Each tab slot inside the pill
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
    // allow raised circle to overflow upward
    overflow: 'visible',
  },

  // White circle that pops UP above the pill for the active tab
  raisedCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.activeCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    // Raise above pill top edge
    marginTop: -28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
  },

  // ── GAP between pill and More ────────────────────────
  gap: {
    width: 10,
  },

  // ── MORE BUTTON (separate small pill) ───────────────
  moreBtn: {
    width: 68,
    height: 62,
    borderRadius: 32,
    backgroundColor: COLORS.barBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 16,
  },
  moreLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.moreLabel,
    letterSpacing: 0.2,
  },
});
