import { ensurePermission } from '@/utils/permissions';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Keyboard } from 'react-native';

interface UseImagePickerOptions {
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsEditing?: boolean;
  quality?: number;
  onImagePicked?: (uri: string) => void | Promise<void>;
}

export const useImagePicker = (options: UseImagePickerOptions = {}) => {
  const {
    mediaTypes = ['images'] as any, // fallback for older Expo versions, typically ['images']
    allowsEditing = false,
    quality = 0.7,
    onImagePicked,
  } = options;

  const pickImage = async () => {
    Keyboard.dismiss();
    const hasPermission = await ensurePermission('gallery', 'Gallery access is required to attach images.');
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing,
        quality,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const Uri = result.assets[0].uri;

        const compressed = await ImageManipulator.manipulateAsync(
          Uri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );

        const uri = compressed.uri;

        if (onImagePicked) await onImagePicked(uri);
        return uri;
      }
    } catch (err: any) {
      console.error('Gallery error:', err);
      Alert.alert('Gallery Error', 'Could not open gallery. Please try again.');
    }
    return null;
  };

  const takePhoto = async () => {
    Keyboard.dismiss();
    const hasPermission = await ensurePermission('camera', 'Camera access is required to take photos.');
    if (!hasPermission) return null;

    try {
      // Small delay for smooth camera transition
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes,
        allowsEditing,
        quality,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const Uri = result.assets[0].uri;

        const compressed = await ImageManipulator.manipulateAsync(
          Uri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );

        const uri = compressed.uri;

        if (onImagePicked) await onImagePicked(uri);
        return uri;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      Alert.alert('Camera Error', 'Could not open camera. Please try again.');
    }
    return null;
  };

  const showAttachmentOptions = (title: string = "Attach Photo", message: string = "Choose a source for your photo") => {
    Keyboard.dismiss();
    Alert.alert(
      title,
      message,
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return {
    pickImage,
    takePhoto,
    showAttachmentOptions,
  };
};
