import * as ImagePicker from 'expo-image-picker';

export async function requestCameraPermissions() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return permission.granted;
}

export async function capturePhotoAsync() {
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
    });

    if (result.canceled || result.assets.length === 0) {
        return null;
    }

    return result.assets[0].uri ?? null;
}
