import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.8,
  exif: true,
};

export type PhotoCaptureResult =
  | { ok: true; uri: string; source: 'camera' | 'library' }
  | { ok: false; reason: 'permission_denied' | 'canceled' | 'unavailable' | 'error'; message: string };

export async function requestCameraPermissions(): Promise<boolean> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  return permission.granted;
}

export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.granted;
}

async function pickFromLibrary(): Promise<PhotoCaptureResult> {
  const hasLibrary = await requestMediaLibraryPermissions();
  if (!hasLibrary) {
    return {
      ok: false,
      reason: 'permission_denied',
      message: 'Photo library permission is required to attach storm photos.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets?.length) {
    return { ok: false, reason: 'canceled', message: 'Photo selection canceled.' };
  }

  const uri = result.assets[0]?.uri;
  if (!uri) {
    return { ok: false, reason: 'error', message: 'No image URI returned from the library.' };
  }

  return { ok: true, uri, source: 'library' };
}

async function pickFromCamera(): Promise<PhotoCaptureResult> {
  const hasCamera = await requestCameraPermissions();
  if (!hasCamera) {
    return {
      ok: false,
      reason: 'permission_denied',
      message: 'Camera permission is required to capture storm photos.',
    };
  }

  const result = await ImagePicker.launchCameraAsync({
    ...PICKER_OPTIONS,
    cameraType: ImagePicker.CameraType.back,
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, reason: 'canceled', message: 'Camera capture canceled.' };
  }

  const uri = result.assets[0]?.uri;
  if (!uri) {
    return { ok: false, reason: 'error', message: 'No image URI returned from the camera.' };
  }

  return { ok: true, uri, source: 'camera' };
}

/**
 * Opens the device camera on iOS/Android. On web, uses a file input with `capture`
 * (device camera when the browser supports it, otherwise photo upload).
 */
export async function captureStormPhotoAsync(): Promise<PhotoCaptureResult> {
  try {
    if (Platform.OS === 'web') {
      return await pickFromCamera();
    }

    return await pickFromCamera();
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    if (detail.toLowerCase().includes('unavailable') || detail.toLowerCase().includes('simulator')) {
      return {
        ok: false,
        reason: 'unavailable',
        message: 'Camera not available on this device. Use “Choose photo” to pick from your library.',
      };
    }
    return { ok: false, reason: 'error', message: `Could not open camera: ${detail}` };
  }
}

/** Pick an existing photo (recommended on simulators and when camera fails). */
export async function chooseStormPhotoAsync(): Promise<PhotoCaptureResult> {
  try {
    return await pickFromLibrary();
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, reason: 'error', message: `Could not open photo library: ${detail}` };
  }
}

/** @deprecated Use captureStormPhotoAsync — kept for tests and simple imports */
export async function capturePhotoAsync(): Promise<string | null> {
  const result = await captureStormPhotoAsync();
  return result.ok ? result.uri : null;
}
