import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    value: Date;
    maximumDate: Date;
    minimumDate?: Date;
    title?: string;
    onChange: (event: DateTimePickerEvent, date?: Date) => void;
    onClose: () => void;
};

export function DatePickerModal({ visible, value, maximumDate, minimumDate, title = 'Pick a Date', onChange, onClose }: Props) {
    const { colors, radii } = useAppTheme();

    return (
        <>
            {/* Android native picker */}
            {visible && process.env.EXPO_OS === 'android' ? (
                <DateTimePicker
                    value={value}
                    mode="date"
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                    onChange={onChange}
                />
            ) : null}

            {/* iOS bottom sheet picker */}
            <Modal
                visible={visible && process.env.EXPO_OS !== 'android'}
                transparent
                animationType="slide"
                onRequestClose={onClose}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
                    <View
                        style={{
                            borderTopLeftRadius: radii.xl,
                            borderTopRightRadius: radii.xl,
                            borderCurve: 'continuous',
                            backgroundColor: colors.surface,
                            padding: 16,
                            gap: 10,
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text selectable style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800' }}>
                                {title}
                            </Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: radii.pill,
                                    borderCurve: 'continuous',
                                    backgroundColor: colors.surfaceMuted,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons name="checkmark" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <DateTimePicker
                            value={value}
                            mode="date"
                            display="inline"
                            maximumDate={maximumDate}
                            minimumDate={minimumDate}
                            onChange={onChange}
                            style={{ alignSelf: 'stretch' }}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}
