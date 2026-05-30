import * as ImagePicker from 'expo-image-picker';

import { captureStormPhotoAsync, chooseStormPhotoAsync } from '@/lib/camera';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file:///storm-photo.jpg' }],
  })),
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file:///library-storm.jpg' }],
  })),
  CameraType: { back: 'back' },
}));

describe('camera capture', () => {
  it('returns URI from camera when permitted', async () => {
    const result = await captureStormPhotoAsync();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.uri).toContain('storm-photo');
      expect(result.source).toBe('camera');
    }
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
  });

  it('returns URI from library picker', async () => {
    const result = await chooseStormPhotoAsync();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.uri).toContain('library-storm');
      expect(result.source).toBe('library');
    }
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });
});
