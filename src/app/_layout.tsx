import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ensureNotificationPermissions } from '@/lib/notifications';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { BackgroundVideo } from '@/components/ui/background-video';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void ensureNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.root}>
          <View style={styles.backgroundLayer} pointerEvents="none">
            <BackgroundVideo />
          </View>
          <View style={styles.contentLayer}>
            <AnimatedSplashOverlay />
            <AppTabs />
          </View>
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080a16',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFill,
  },
  contentLayer: {
    flex: 1,
  },
});
