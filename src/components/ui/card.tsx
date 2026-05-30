import { ThemedView } from '@/components/themed-view';
import { Radii, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type ViewProps, StyleSheet } from 'react-native';

export function Card({ style, children, ...props }: ViewProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.surfaceBorder }, style]}
      {...props}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: Radii.normal,
    gap: Spacing.two,
    borderWidth: 1,
    ...Shadows.elevated,
  },
});
