import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}


export default function QuickBall() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { primaryColor } = useTheme();

  // Built inside render so New Lead color is always reactive
  const MENU_ITEMS: MenuItem[] = [
    { label: 'New Lead', icon: 'person-add-outline', route: '/(tabs)/leads/add-lead', color: primaryColor },
    { label: 'New Order', icon: 'cart-outline', route: '/(tabs)/Order/add-order', color: '#39241E' },
    { label: 'New Quotation', icon: 'document-attach-outline', route: '/(tabs)/Quotation/add-quotation', color: '#E2C0B1' },
    { label: 'New Task', icon: 'checkmark-done-circle-outline', route: '/(tabs)/task/add-task', color: COLORS.blue || '#3B82F6' },
    { label: 'New Meeting', icon: 'videocam-outline', route: '/(tabs)/meeting/add-meeting', color: COLORS.success || '#10B981' },
    { label: 'New Visit', icon: 'location-outline', route: '/(tabs)/visit/add-visit', color: COLORS.danger || '#EF4444' },
  ];


  // Dimensions for calculation
  const { height } = Dimensions.get('window');
  const sidebarHeight = 360;
  const topPosition = (height - sidebarHeight) / 2;

  const handleHeight = 68;
  const handleTopPosition = (height - handleHeight) / 2;

  // Opacity for the collapsed handle
  const handleOpacity = useRef(new Animated.Value(1)).current;
  // Position translation for the collapsed handle when sliding/showing
  const handleTranslateX = useRef(new Animated.Value(0)).current;

  // Backdrop overlay animation (0 to 1)
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Sidebar container slide-in animation from right (180 to 0)
  const sidebarTranslateX = useRef(new Animated.Value(180)).current;

  // Menu items list animations for staggered entrance
  const itemAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;

  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startFadeTimer = () => {
    if (fadeTimer.current) {
      clearTimeout(fadeTimer.current);
    }
    fadeTimer.current = setTimeout(() => {
      Animated.timing(handleOpacity, {
        toValue: 0.35,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  const resetFade = () => {
    if (fadeTimer.current) {
      clearTimeout(fadeTimer.current);
    }
    Animated.timing(handleOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      startFadeTimer();
    });
  };

  useEffect(() => {
    startFadeTimer();
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, []);

  const openMenu = () => {
    // Stop handle fading
    if (fadeTimer.current) {
      clearTimeout(fadeTimer.current);
    }

    // First make handle fully visible then slide it off screen
    Animated.parallel([
      Animated.timing(handleOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(handleTranslateX, {
        toValue: 40, // slide off-screen to the right
        duration: 180,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsOpen(true);
      // Run the opening transitions
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sidebarTranslateX, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.stagger(35,
          itemAnims.map((anim) =>
            Animated.spring(anim, {
              toValue: 1,
              tension: 55,
              friction: 7,
              useNativeDriver: true,
            })
          )
        )
      ]).start();
    });
  };

  const closeMenu = () => {
    // Run closing transitions
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sidebarTranslateX, {
        toValue: 180, // slide off-screen
        duration: 200,
        useNativeDriver: true,
      }),
      ...itemAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        })
      )
    ]).start((finished) => {
      if (finished) {
        setIsOpen(false);
        // Bring back the handle and start its fade timer
        Animated.timing(handleTranslateX, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => {
          resetFade();
        });
      }
    });
  };

  useEffect(() => {
    const handleBackPress = () => {
      if (isOpen) {
        closeMenu();
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
  }, [isOpen]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Semi-transparent backdrop overlay */}
      {isOpen && (
        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </Animated.View>
      )}

      {/* Expanded Sidebar Panel */}
      <Animated.View
        style={[
          styles.sidebarContainer,
          {
            top: topPosition,
            transform: [{ translateX: sidebarTranslateX }],
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, index) => {
            const anim = itemAnims[index];
            const translateX = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [25, 0],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });
            const isLast = index === MENU_ITEMS.length - 1;

            return (
              <React.Fragment key={item.label}>
                <Animated.View
                  style={{
                    opacity,
                    transform: [{ translateX }],
                  }}
                >
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={() => {
                      closeMenu();
                      router.push(item.route as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBadge, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon} size={15} color={item.color} />
                    </View>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
                {!isLast && <View style={styles.separator} />}
              </React.Fragment>
            );
          })}
        </View>
      </Animated.View>

      {/* Collapsed Handle */}
      <Animated.View
        style={[
          styles.handle,
          {
            top: handleTopPosition,
            opacity: handleOpacity,
            transform: [{ translateX: handleTranslateX }],
            backgroundColor: primaryColor,
            shadowColor: primaryColor,
          },
        ]}
        pointerEvents={isOpen ? 'none' : 'auto'}
      >
        <TouchableOpacity
          style={styles.handleTouchable}
          onPress={openMenu}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop || 'rgba(0, 0, 0, 0.4)', // Semi-transparent backdrop overlay
  },
  handle: {
    position: 'absolute',
    right: -10, // slightly offset offscreen to create a curved sliver sticking out
    width: 24,
    height: 68,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: theme.primaryColor,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRightWidth: 0,
    shadowColor: theme.primaryColor,
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  handleTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  sidebarContainer: {
    position: 'absolute',
    right: 0,
    width: 170,
    backgroundColor: COLORS.bgWhite,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRightWidth: 0,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  sidebarTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    marginTop: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
});
