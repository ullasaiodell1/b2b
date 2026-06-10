import { getMonth, getYear } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import WheelPicker from "react-native-wheel-picker-expo";

import { useAppTheme } from "@/hooks/use-app-theme";

interface MonthYearPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function MonthYearPicker({ visible, onClose, selectedDate, onSelect }: MonthYearPickerProps) {
  const { colors, spacing, radii, typography, shadow } = useAppTheme();

  const currentYear = getYear(new Date());
  const years = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      label: (currentYear - 5 + i).toString(),
      value: currentYear - 5 + i
    }));
  }, [currentYear]);

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 }
  ];

  const [tempMonth, setTempMonth] = useState(getMonth(selectedDate));
  const [tempYear, setTempYear] = useState(getYear(selectedDate));

  useEffect(() => {
    if (visible) {
      setTempMonth(getMonth(selectedDate));
      setTempYear(getYear(selectedDate));
    }
  }, [visible, selectedDate]);

  const handleConfirm = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(tempMonth);
    newDate.setFullYear(tempYear);
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
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xl
          }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Select Month & Year</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={{ fontSize: 16, color: colors.brand, fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 2 }}>
              <WheelPicker
                initialSelectedIndex={tempMonth}
                items={months}
                onChange={({ index }) => setTempMonth(index)}
                height={200}
                backgroundColor={colors.surface}
                renderItem={(props: any) => (
                  <Text style={{
                    color: props?.isSelected ? colors.brand : colors.textSecondary,
                    fontSize: props?.isSelected ? 19 : 16,
                    fontFamily: props?.isSelected ? typography.family.bold : typography.family.medium,
                    textAlign: 'center'
                  }}>
                    {props?.item?.label || props?.label || ''}
                  </Text>
                )}
              />
            </View>
            <View style={{ flex: 1.2 }}>
              <WheelPicker
                initialSelectedIndex={years.findIndex(y => y.value === tempYear)}
                items={years}
                onChange={({ index }) => setTempYear(years[index].value)}
                height={200}
                backgroundColor={colors.surface}
                renderItem={(props: any) => (
                  <Text style={{
                    color: props?.isSelected ? colors.brand : colors.textSecondary,
                    fontSize: props?.isSelected ? 19 : 16,
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
