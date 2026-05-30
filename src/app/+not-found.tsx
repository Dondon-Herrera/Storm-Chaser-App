import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ScreenShell } from '@/components/ui/screen-shell';

export default function NotFoundScreen() {
  return (
    <ScreenShell>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Off the radar
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          This route does not exist in Storm Chaser Command.
        </ThemedText>
        <Link href="/" asChild>
          <Button title="Return to command center" size="lg" />
        </Link>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 36,
  },
  subtitle: {
    maxWidth: 320,
  },
});
