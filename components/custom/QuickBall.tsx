import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'New Lead',
    icon: 'person-add-outline',
    route: '/(tabs)/leads/add-lead',
    color: COLORS.primary,
  },
  {
    label: 'New Order',
    icon: 'cart-outline',
    route: '/(tabs)/Order/add-order',
    color: '#39241E', // Dark brown order style
  },
  {
    label: 'New Quotation',
    icon: 'document-attach-outline',
    route: '/(tabs)/Quotation/add-quotation',
    color: '#E2C0B1', // Peach quotation style
  },
  {
    label: 'New Task',
    icon: 'checkmark-done-circle-outline',
    route: '/(tabs)/task/add-task',
    color: COLORS.blue || '#3B82F6',
  },
  {
    label: 'New Meeting',
    icon: 'videocam-outline',
    route: '/(tabs)/meeting/add-meeting',
    color: COLORS.success || '#10B981',
  },
  {
    label: 'New Visit',
    icon: 'location-outline',
    route: '/(tabs)/visit/add-visit',
    color: COLORS.danger || '#EF4444',
  },
];

export default function QuickBall() {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  // Animation values
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;

  // Toggle open/close state
  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const openMenu = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(40, [
        ...itemAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          })
        ),
      ]),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.stagger(30, [
        ...[...itemAnims].reverse().map((anim) =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          })
        ),
      ]),
    ]).start((finished) => {
      if (finished) {
        setIsOpen(false);
      }
    });
  };

  // Main button rotation & opacity mapping for cross-fade transition
  const appsOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const appsRotate = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const closeOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const closeRotate = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg'],
  });

  const bottomPosition = insets.bottom + 95;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Semi-transparent backdrop overlay */}
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

      {/* Menu Stack */}
      {isOpen && (
        <View
          style={[styles.menuContainer, { bottom: bottomPosition + 70 }]}
          pointerEvents="box-none"
        >
          {MENU_ITEMS.map((item, index) => {
            const anim = itemAnims[index];

            // Map animation state to individual item offsets & scales
            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            });
            const scale = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            return (
              <Animated.View
                key={item.label}
                style={[
                  styles.itemRow,
                  {
                    opacity,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                {/* Floating label on the left */}
                <View style={styles.labelWrapper}>
                  <Text style={styles.labelText}>{item.label}</Text>
                </View>

                {/* Circular action button */}
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: item.color }]}
                  onPress={() => {
                    closeMenu();
                    router.push(item.route as any);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Primary Floating Trigger Button */}
      <TouchableOpacity
        style={[styles.triggerButton, { bottom: bottomPosition }]}
        onPress={toggleMenu}
        activeOpacity={0.9}
      >
        {/* Apps Icon (rotates out on open) */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: appsOpacity,
              transform: [{ rotate: appsRotate }],
            },
          ]}
        >
          <Ionicons name="apps-outline" size={26} color={COLORS.textLight} />
        </Animated.View>

        {/* Close Icon (rotates in on open) */}
        <Animated.View
          style={[
            styles.iconContainer,
            StyleSheet.absoluteFillObject,
            {
              opacity: closeOpacity,
              transform: [{ rotate: closeRotate }],
            },
          ]}
        >
          <Ionicons name="close-outline" size={28} color={COLORS.textLight} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 21, 20, 0.45)', // Sleep dark-brand tinted backdrop
  },
  menuContainer: {
    position: 'absolute',
    right: 18,
    alignItems: 'flex-end',
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  labelWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5ECE9', // COLORS.border
    // Premium soft drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D0F0E', // COLORS.textDark
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    // Premium soft drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  triggerButton: {
    position: 'absolute',
    right: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // Outstanding drop shadow matching brand color
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
