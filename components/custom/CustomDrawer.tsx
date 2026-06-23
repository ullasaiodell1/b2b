import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDrawer } from '@/hooks/useDrawer';
import { useTabs } from '@/hooks/useTabs';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CustomDrawer() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const pathname = usePathname();
  const { isOpen: open, closeDrawer } = useDrawer();
  const { tabs: configuredTabs, updateConfiguredTabs, setDynamicTab, allModules: ALL_TAB_MODULES } = useTabs();
  const [rendered, setRendered] = useState(open);
  const [searchQuery, setSearchQuery] = useState('');
  const { primaryColor } = useTheme();

  // Accordion Expand/Collapse States
  const [salesExpanded, setSalesExpanded] = useState(true);
  const [activitiesExpanded, setActivitiesExpanded] = useState(true);

  const insets = useSafeAreaInsets();

  // Edit Navigation Modal States
  const [editNavigationVisible, setEditNavigationVisible] = useState(false);
  const [editSearchQuery, setEditSearchQuery] = useState('');
  const [editNavTabs, setEditNavTabs] = useState<string[]>([]);

  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setRendered(true);
      // Animate In (Slide Up)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate Out (Slide Down)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start((finished) => {
        if (finished) {
          setRendered(false);
        }
      });
    }
  }, [open]);

  useEffect(() => {
    const handleBackPress = () => {
      if (open) {
        closeDrawer();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => {
      subscription.remove();
    };
  }, [open, closeDrawer]);

  useEffect(() => {
    if (editNavigationVisible) {
      setEditNavTabs(configuredTabs.slice(0, 4));
      setEditSearchQuery('');
    }
  }, [editNavigationVisible, configuredTabs]);

  const handleToggleEditNavTab = (tabId: string) => {
    if (editNavTabs.includes(tabId)) {
      if (editNavTabs.length <= 1) {
        Alert.alert('Info', 'You must have at least one module selected.');
        return;
      }
      setEditNavTabs(editNavTabs.filter(id => id !== tabId));
    } else {
      if (editNavTabs.length >= 4) {
        Alert.alert('Selection Limit', 'Maximum 4 modules can be selected.');
        return;
      }
      setEditNavTabs([...editNavTabs, tabId]);
    }
  };

  const handleRowPress = (route: string) => {
    setDynamicTab(route);
    closeDrawer();
    if (route === 'index') {
      router.push('/(tabs)' as any);
    } else {
      router.push(`/(tabs)/${route}` as any);
    }
  };

  const getActiveTabId = () => {
    if (pathname === '/' || pathname === '/(tabs)') return 'index';
    const parts = pathname.split('/');
    let candidate = parts[1];
    if (candidate === '(tabs)') {
      candidate = parts[2];
    }
    if (candidate && candidate.includes('?')) {
      candidate = candidate.split('?')[0];
    }
    return candidate || 'index';
  };

  const handleSaveNavigation = () => {
    const newConfigured = [...editNavTabs];
    updateConfiguredTabs(newConfigured);

    // Auto-navigate if active screen no longer configured
    const activeTabId = getActiveTabId();
    if (!newConfigured.includes(activeTabId)) {
      const targetTab = newConfigured[0] || 'index';
      if (targetTab === 'index') {
        router.push('/(tabs)' as any);
      } else {
        router.push(`/(tabs)/${targetTab}` as any);
      }
    }

    setEditNavigationVisible(false);
  };

  const matchesSearch = (title: string) => {
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Auto-expand accordions if searching
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setSalesExpanded(true);
      setActivitiesExpanded(true);
    }
  }, [searchQuery]);

  if (!rendered) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop overlay */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
            pointerEvents: open ? 'auto' : 'none',
          },
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={closeDrawer} />
      </Animated.View>

      {/* Slide up Container */}
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            transform: [{ translateY: slideAnim }],
            paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 44 : 16),
            paddingBottom: Math.max(insets.bottom + 8, 16),
          },
        ]}
      >
        {/* Header Title with X button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: primaryColor, fontWeight: '800' }}>More </Text>
            <Text style={{ color: COLORS.textDark, fontWeight: '800' }}>Option</Text>
          </Text>
          <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Search bar row with 3 dots */}
        <View style={styles.searchRow}>
          <View style={styles.searchSection}>
            <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => setEditNavigationVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Quick Action Boxes */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionBox}
            onPress={() => handleRowPress('profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={20} color={primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBox}
            onPress={() => handleRowPress('settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBox}
            onPress={() => handleRowPress('company')}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={20} color={primaryColor} />
          </TouchableOpacity>
        </View>

        {/* Scrollable menu content */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.listContainer}>
            {/* Calender Row */}
            {matchesSearch('Calendar') && (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleRowPress('calendar')}
                activeOpacity={0.75}
              >
                <View style={styles.listItemLeft}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.textDark} style={styles.rowIcon} />
                  <Text style={styles.rowLabel}>Calender</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={primaryColor} />
              </TouchableOpacity>
            )}

            {/* Home Row */}
            {matchesSearch('Home') && (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleRowPress('index')}
                activeOpacity={0.75}
              >
                <View style={styles.listItemLeft}>
                  <Ionicons name="home-outline" size={20} color={COLORS.textDark} style={styles.rowIcon} />
                  <Text style={styles.rowLabel}>Home</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={primaryColor} />
              </TouchableOpacity>
            )}

            {/* Sales Accordion */}
            <View style={styles.accordionContainer}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setSalesExpanded(!salesExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.accordionTitle}>Sales</Text>
                <Ionicons name={salesExpanded ? 'chevron-down' : 'chevron-forward'} size={18} color={primaryColor} />
              </TouchableOpacity>

              {salesExpanded && (
                <View style={styles.accordionContent}>
                  {/* Leads */}
                  {matchesSearch('Leads') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('leads')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="people-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Leads</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Company */}
                  {matchesSearch('Company') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('company')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="business-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Company</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Orders */}
                  {matchesSearch('Orders') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('Order')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="cart-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Orders</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Quotations */}
                  {matchesSearch('Quotations') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('Quotation')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="document-attach-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Quotations</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Activities Accordion */}
            <View style={styles.accordionContainer}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setActivitiesExpanded(!activitiesExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.accordionTitle}>Activities</Text>
                <Ionicons name={activitiesExpanded ? 'chevron-down' : 'chevron-forward'} size={18} color={primaryColor} />
              </TouchableOpacity>

              {activitiesExpanded && (
                <View style={styles.accordionContent}>
                  {/* Calls */}
                  {matchesSearch('Calls') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('call')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="call-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Calls</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Meetings */}
                  {matchesSearch('Meetings') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('meeting')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="videocam-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Meetings</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Tasks */}
                  {matchesSearch('Tasks') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('task')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="checkmark-done-circle-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Tasks</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Visits */}
                  {matchesSearch('Visits') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('visit')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="location-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Visits</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Emails */}
                  {/*matchesSearch('Emails') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('email')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Emails</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={theme.primaryColor} />
                    </TouchableOpacity>
                  )*/}

                  {/* Attendance */}
                  {matchesSearch('Attendance') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('attendance')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="finger-print-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Attendance</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Leave */}
                  {matchesSearch('Leave') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('leave')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="calendar-clear-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Leave</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Profile */}
                  {matchesSearch('Profile') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('profile')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Profile</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}

                  {/* Settings */}
                  {matchesSearch('Settings') && (
                    <TouchableOpacity
                      style={styles.listItemNested}
                      onPress={() => handleRowPress('settings')}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemLeft}>
                        <Ionicons name="settings-outline" size={18} color={COLORS.textMuted} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Settings</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Settings Row */}
            {matchesSearch('Settings') && (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleRowPress('settings')}
                activeOpacity={0.7}
              >
                <View style={styles.listItemLeft}>
                  <Ionicons name="settings-outline" size={20} color={COLORS.textDark} style={styles.rowIcon} />
                  <Text style={styles.rowLabel}>Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={primaryColor} />
              </TouchableOpacity>
            )}

            {/* Company Information Row */}
            {matchesSearch('Company Information') && (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleRowPress('company')}
                activeOpacity={0.7}
              >
                <View style={styles.listItemLeft}>
                  <Ionicons name="information-circle-outline" size={20} color={COLORS.textDark} style={styles.rowIcon} />
                  <Text style={styles.rowLabel}>Company Information</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={primaryColor} />
              </TouchableOpacity>
            )}

            {/* Search Fallback */}
            {searchQuery.trim().length > 0 &&
              !matchesSearch('Calendar') &&
              !matchesSearch('Home') &&
              !matchesSearch('Leads') &&
              !matchesSearch('Company') &&
              !matchesSearch('Orders') &&
              !matchesSearch('Quotations') &&
              !matchesSearch('Calls') &&
              !matchesSearch('Meetings') &&
              !matchesSearch('Tasks') &&
              !matchesSearch('Visits') &&
              !matchesSearch('Attendance') &&
              !matchesSearch('Leave') &&
              !matchesSearch('Profile') &&
              !matchesSearch('Settings') &&
              !matchesSearch('Company Information') && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={32} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No modules match search</Text>
                </View>
              )
            }
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>

      {/* Edit Navigation Modal */}
      <Modal
        visible={editNavigationVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditNavigationVisible(false)}
      >
        <View style={[styles.editNavContainer, { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16) }]}>
          {/* Header */}
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={() => setEditNavigationVisible(false)} style={styles.editHeaderBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={26} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.editHeaderTitle}>Edit Navigation</Text>
            <TouchableOpacity onPress={handleSaveNavigation} style={styles.editHeaderBtn} activeOpacity={0.7}>
              <Ionicons name="checkmark" size={26} color={primaryColor} />
            </TouchableOpacity>
          </View>

          {/* Preview Box */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewBox}>
              {editNavTabs.map((tabId) => {
                const mod = ALL_TAB_MODULES.find(m => m.id === tabId);
                if (!mod) return null;
                return (
                  <View key={`edit-preview-${tabId}`} style={styles.previewItem}>
                    <Ionicons name={mod.icon} size={22} color="#000000" />
                    <Text style={styles.previewItemText}>{mod.title === 'index' ? 'Home' : mod.title === 'calendar' ? 'Calendar' : mod.title}</Text>
                  </View>
                );
              })}
              {/* More Tab */}
              <View style={styles.previewItem}>
                <Ionicons name="menu-outline" size={22} color="#A0ADA9" />
                <Text style={[styles.previewItemText, { color: '#A0ADA9' }]}>More</Text>
              </View>
            </View>
          </View>

          <Text style={styles.selectInfoText}>Select between 1 - 4 modules</Text>

          {/* Search bar inside Modal */}
          <View style={styles.editSearchSection}>
            <Ionicons name="search-outline" size={20} color="#A0ADA9" style={styles.searchIcon} />
            <TextInput
              style={styles.editSearchInput}
              placeholder="Search"
              placeholderTextColor="#A0ADA9"
              value={editSearchQuery}
              onChangeText={setEditSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Scrollable list of modules */}
          <ScrollView style={styles.editListScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.editListContainer}>
              {ALL_TAB_MODULES.map((mod) => {
                const isSelected = editNavTabs.includes(mod.id);
                const isLimitReached = !isSelected && editNavTabs.length >= 4;
                const matches = mod.title.toLowerCase().includes(editSearchQuery.toLowerCase()) ||
                  (mod.id === 'index' && 'home'.includes(editSearchQuery.toLowerCase()));

                if (!matches) return null;

                return (
                  <TouchableOpacity
                    key={`edit-list-row-${mod.id}`}
                    style={[
                      styles.editListRow,
                      !isSelected && styles.editListRowUnselected,
                      isLimitReached && styles.editListRowDisabled
                    ]}
                    onPress={() => handleToggleEditNavTab(mod.id)}
                    disabled={isLimitReached}
                    activeOpacity={0.75}
                  >
                    <View style={styles.editListRowLeft}>
                      {/* Checkmark circle */}
                      {isSelected ? (
                        <View style={styles.checkedCircle}>
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View style={styles.uncheckedCircle} />
                      )}

                      {/* Icon */}
                      <Ionicons
                        name={isSelected ? mod.icon : mod.iconOutline}
                        size={20}
                        color={isSelected ? '#000000' : '#A0ADA9'}
                        style={styles.editRowIcon}
                      />

                      {/* Title */}
                      <Text style={[styles.editRowLabel, isSelected ? styles.editRowLabelSelected : styles.editRowLabelUnselected]}>
                        {mod.title === 'index' ? 'Home' : mod.title === 'calendar' ? 'Calendar' : mod.title}
                      </Text>
                    </View>

                    {/* Drag lines (only for selected) */}
                    {isSelected && (
                      <Ionicons name="reorder-two-outline" size={24} color={primaryColor} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop,
    zIndex: 998,
  },
  backdropPressable: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: COLORS.bgWhite,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 1,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C2D1CB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C2D1CB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
    height: '100%',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 5,
  },
  quickActionBox: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  listContainer: {
    marginTop: 1,
    gap: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  listItemNested: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAF8',
  },
  listItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 14,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  accordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  accordionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  accordionContent: {
    paddingBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Edit Navigation styles
  editNavContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  editHeaderBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 10,
  },
  previewBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  previewItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  previewItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    marginTop: 2,
  },
  selectInfoText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 1,
    fontWeight: '600',
  },
  editSearchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal: 16,
    marginVertical: 1,
  },
  editSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    height: '100%',
  },
  editListScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  editListContainer: {
    marginTop: 1,
    gap: 2,
  },
  editListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  editListRowUnselected: {
    opacity: 0.65,
  },
  editListRowDisabled: {
    opacity: 0.35,
  },
  editListRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editRowIcon: {
    marginLeft: 12,
    marginRight: 14,
  },
  editRowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  editRowLabelSelected: {
    color: '#000000',
  },
  editRowLabelUnselected: {
    color: '#8E8E93',
  },
  checkedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7C7CC',
  },
});
