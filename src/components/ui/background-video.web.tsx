import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

const VIDEO_SOURCE = require('../../../assets/video/default.mp4');

function resolveVideoUri(source: unknown): string {
  if (typeof source === 'string') {
    return source;
  }

  if (source && typeof source === 'object' && 'default' in source) {
    const value = (source as { default: unknown }).default;
    if (typeof value === 'string') {
      return value;
    }
  }

  return String(source);
}

export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uri = resolveVideoUri(VIDEO_SOURCE);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(() => undefined);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none" accessibilityElementsHidden>
      <video
        ref={videoRef}
        src={uri}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        style={styles.video}
      />
      <View style={styles.overlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as const,
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 6, 15, 0.55)',
  },
});
