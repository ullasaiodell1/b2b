/**
 * FilterDropdown — Global reusable dropdown for filter selections.
 *
 * Usage:
 *   <FilterDropdown
 *     placeholder="All Status"
 *     options={['DRAFT', 'CONFIRMED', 'PROCESSING']}
 *     value={selectedStatus}
 *     onChange={(val) => setSelectedStatus(val)}
 *   />
 */

import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterDropdownOption {
  label: string;
  value: string;
}

export interface FilterDropdownProps {
  /** Placeholder label shown when nothing selected */
  placeholder: string;
  /** Array of option strings or {label, value} objects */
  options: string[] | FilterDropdownOption[];
  /** Currently selected value (empty string = nothing selected) */
  value: string;
  /** Called with the new value when user picks an option */
  onChange: (value: string) => void;
  /** Optional width for the trigger button. Defaults to auto. */
  width?: number | string;
  /** Disable the dropdown */
  disabled?: boolean;
  /** Optional style override for the trigger button */
  style?: any;
  /** Optional style override for the trigger label text */
  labelStyle?: any;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function normalise(options: FilterDropdownProps['options']): FilterDropdownOption[] {
  return (options as any[]).map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  placeholder,
  options,
  value,
  onChange,
  width,
  disabled = false,
  style,
  labelStyle,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const normalised = normalise(options);
  const selectedOption = normalised.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;
  const hasValue = !!value;

  const open = () => {
    if (disabled) return;
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  const handleSelect = (val: string) => {
    onChange(val === value ? '' : val); // tap same item = deselect
    close();
  };

  const sheetTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <>
      {/* ── Trigger Button ─────────────────────────────────────────── */}
      <TouchableOpacity
        style={[
          s.trigger,
          hasValue && { borderColor: theme.primaryColor, backgroundColor: theme.primaryLight },
          width ? { width } : undefined,
          disabled && s.triggerDisabled,
          style,
        ]}
        onPress={open}
        activeOpacity={0.75}
      >
        <Text
          style={[s.triggerLabel, hasValue && { color: theme.primaryColor }, labelStyle]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Ionicons
          name={visible ? 'chevron-up' : 'chevron-down'}
          size={13}
          color={hasValue ? theme.primaryColor : COLORS.textMuted}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            s.sheet,
            {
              paddingBottom: Math.max(insets.bottom + 12, 20),
              transform: [{ translateY: sheetTranslate }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={s.handleBar} />

          {/* Header */}
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: theme.primaryColor }]}>{placeholder}</Text>
            {hasValue && (
              <TouchableOpacity
                onPress={() => { onChange(''); close(); }}
                style={s.clearBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={15} color={COLORS.danger} style={{ marginRight: 4 }} />
                <Text style={s.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Options List */}
          <FlatList
            data={normalised}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            style={s.optionList}
            renderItem={({ item }) => {
              const isActive = item.value === value;
              return (
                <TouchableOpacity
                  style={[
                    s.optionRow,
                    isActive && { backgroundColor: theme.primaryLight },
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  {/* Check icon */}
                  <View style={[s.checkIcon, isActive && { borderColor: theme.primaryColor, backgroundColor: theme.primaryColor }]}>
                    {isActive && <Ionicons name="checkmark" size={11} color="#FFFFFF" />}
                  </View>

                  <Text
                    style={[
                      s.optionText,
                      isActive && { color: theme.primaryColor, fontWeight: '800' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={s.optionSep} />}
          />
        </Animated.View>
      </Modal>
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Trigger
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: COLORS.bgWhite,
    alignSelf: 'flex-start',
  },
  triggerLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
    maxWidth: 120,
  },
  triggerDisabled: {
    opacity: 0.45,
  },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },

  // Sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgWhite,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '72%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  // Sheet header
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },

  // Options
  optionList: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 10,
    gap: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
  },
  optionSep: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
  },
});
