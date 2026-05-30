import { useEffect, useRef } from 'react';
import { AppState, StyleSheet, View, type AppStateStatus } from 'react-native';
import { Audio, ResizeMode, Video, type AVPlaybackStatus } from 'expo-av';

const VIDEO_SOURCE = require('../../../assets/video/default.mp4');

export function BackgroundVideo() {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      const player = videoRef.current;
      if (!player) {
        return;
      }

      if (nextState === 'active') {
        player.playAsync().catch(() => undefined);
        return;
      }

      player.pauseAsync().catch(() => undefined);
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, []);

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || status.isPlaying) {
      return;
    }

    videoRef.current?.playAsync().catch(() => undefined);
  };

  return (
    <View style={styles.container} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Video
        ref={videoRef}
        source={VIDEO_SOURCE}
        style={styles.video}
        shouldPlay
        isLooping
        isMuted
        resizeMode={ResizeMode.COVER}
        useNativeControls={false}
        onPlaybackStatusUpdate={handlePlaybackStatus}
      />
      <View style={styles.overlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 6, 15, 0.55)',
  },
});
