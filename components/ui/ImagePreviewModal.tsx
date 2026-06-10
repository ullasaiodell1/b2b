import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    uri: string | null;
    onClose: () => void;
};

export function ImagePreviewModal({ uri, onClose }: Props) {
    const { radii } = useAppTheme();
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={Boolean(uri)}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.94)' }}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1 }}
                />

                <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                        position: 'absolute',
                        top: 12 + insets.top,
                        right: 12,
                        width: 36,
                        height: 36,
                        borderRadius: radii.pill,
                        borderCurve: 'continuous',
                        backgroundColor: 'rgba(255, 255, 255, 0.14)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 20,
                    }}
                >
                    <Ionicons name="close" size={19} color="#FFFFFF" />
                </TouchableOpacity>

                <View
                    pointerEvents="box-none"
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingTop: 56,
                        paddingBottom: 24,
                        zIndex: 10,
                    }}
                >
                    {uri ? (
                        <Image source={uri} style={{ width: '100%', height: '100%' }} contentFit="contain" />
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}
