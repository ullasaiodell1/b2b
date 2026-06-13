import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import WheelPicker from "react-native-wheel-picker-expo";

import { useAppTheme } from "@/hooks/use-app-theme";

interface CustomTimePickerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function CustomTimePicker({ visible, onClose, selectedDate, onSelect }: CustomTimePickerProps) {
  const { colors, spacing, radii, typography, shadow } = useAppTheme();

  // Generate Items
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      label: (i < 10 ? '0' : '') + i.toString(),
      value: i
    }));
  }, []);

  const minutes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      label: (i < 10 ? '0' : '') + i.toString(),
      value: i
    }));
  }, []);

  const seconds = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      label: (i < 10 ? '0' : '') + i.toString(),
      value: i
    }));
  }, []);

  // Component States
  const [tempHour, setTempHour] = useState(0);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempSecond, setTempSecond] = useState(0);

  // Sync internal state when visibility changes or selectedDate changes
  useEffect(() => {
    if (visible && selectedDate) {
      const hours24 = selectedDate.getHours();
      const mins = selectedDate.getMinutes();
      const secs = selectedDate.getSeconds();

      setTempHour(hours24);
      setTempMinute(mins);
      setTempSecond(secs);
    }
  }, [visible, selectedDate]);

  const handleConfirm = () => {
    const newDate = new Date(selectedDate);
    newDate.setHours(tempHour);
    newDate.setMinutes(tempMinute);
    newDate.setSeconds(tempSecond);
    newDate.setMilliseconds(0);
    
    onSelect(newDate);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: radii.xxl,
          borderTopRightRadius: radii.xxl,
          padding: spacing.xl,
          paddingBottom: spacing.xxl + 20,
          ...shadow.raised
        }}>
          {/* Header Actions */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xl
          }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Select Time</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={{ fontSize: 16, color: colors.brand, fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker Columns */}
          <View style={{ flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', alignItems: 'center' }}>
            {/* Hours Column */}
            <View style={{ flex: 1 }}>
              <WheelPicker
                initialSelectedIndex={hours.findIndex(h => h.value === tempHour)}
                items={hours}
                onChange={({ item }) => setTempHour(item.value)}
                height={200}
                backgroundColor={colors.surface}
                renderItem={(props: any) => (
                  <Text style={{
                    color: props?.isSelected ? colors.brand : colors.textSecondary,
                    fontSize: props?.isSelected ? 18 : 15,
                    fontFamily: props?.isSelected ? typography.family.bold : typography.family.medium,
                    textAlign: 'center'
                  }}>
                    {props?.item?.label || props?.label || ''}
                  </Text>
                )}
              />
            </View>

            {/* Separator Colon */}
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.textSecondary,
              paddingBottom: spacing.xs,
              textAlign: 'center'
            }}>:</Text>

            {/* Minutes Column */}
            <View style={{ flex: 1 }}>
              <WheelPicker
                initialSelectedIndex={minutes.findIndex(m => m.value === tempMinute)}
                items={minutes}
                onChange={({ item }) => setTempMinute(item.value)}
                height={200}
                backgroundColor={colors.surface}
                renderItem={(props: any) => (
                  <Text style={{
                    color: props?.isSelected ? colors.brand : colors.textSecondary,
                    fontSize: props?.isSelected ? 18 : 15,
                    fontFamily: props?.isSelected ? typography.family.bold : typography.family.medium,
                    textAlign: 'center'
                  }}>
                    {props?.item?.label || props?.label || ''}
                  </Text>
                )}
              />
            </View>

            {/* Separator Colon */}
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.textSecondary,
              paddingBottom: spacing.xs,
              textAlign: 'center'
            }}>:</Text>

            {/* Seconds Column */}
            <View style={{ flex: 1 }}>
              <WheelPicker
                initialSelectedIndex={seconds.findIndex(s => s.value === tempSecond)}
                items={seconds}
                onChange={({ item }) => setTempSecond(item.value)}
                height={200}
                backgroundColor={colors.surface}
                renderItem={(props: any) => (
                  <Text style={{
                    color: props?.isSelected ? colors.brand : colors.textSecondary,
                    fontSize: props?.isSelected ? 18 : 15,
                    fontFamily: props?.isSelected ? typography.family.bold : typography.family.medium,
                    textAlign: 'center'
                  }}>
                    {props?.item?.label || props?.label || ''}
                  </Text>
                )}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
