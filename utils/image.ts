import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compresses and resizes an image to reduce file size.
 *
 * @param uri The URI of the image to compress.
 * @param compress The compression level (0 - 1). Default is 0.5.
 * @returns The URI of the compressed image.
 */
export const compressImage = async (uri: string, compress = 0.5): Promise<string> => {
    try {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipResult.uri;
    } catch (error) {
        console.error('Image compression failed:', error);
        return uri; // Return original URI if compression fails
    }
};
