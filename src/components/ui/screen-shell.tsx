import { Platform, ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, WebTopTabInset } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

type ScreenShellProps = ScrollViewProps & {
  children: React.ReactNode;
  refreshControl?: ScrollViewProps['refreshControl'];
};

export function ScreenShell({ children, refreshControl, contentContainerStyle, ...props }: ScreenShellProps) {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsiveLayout();
  const top = insets.top + (Platform.OS === 'web' ? WebTopTabInset : 0);
  const bottom = insets.bottom + BottomTabInset + Spacing.three;

  return (
    <ScrollView
      style={styles.scroll}
      contentInset={{ top: insets.top, bottom }}
      refreshControl={refreshControl}
      accessibilityLabel="Storm Chaser screen"
      contentContainerStyle={[styles.content, { paddingTop: top }, contentContainerStyle]}
      {...props}>
      <ThemedView style={[styles.wrapper, { paddingHorizontal: horizontalPadding }]}>{children}</ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: Spacing.five,
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
    backgroundColor: 'transparent',
  },
});
