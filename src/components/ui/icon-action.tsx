import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import type { StormIcon } from '@/components/ui/icons';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconActionProps = {
  label: string;
  icon: StormIcon;
  onPress?: () => void;
  variant?: 'primary' | 'glass';
  disabled?: boolean;
};

export function IconAction({ label, icon, onPress, variant = 'glass', disabled }: IconActionProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed, disabled && styles.disabled]}>
      {isPrimary ? (
        <LinearGradient
          colors={[theme.accent, '#FF7A59']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.primaryChip}>
          <SymbolView name={icon} size={16} tintColor="#fff" />
          <ThemedText type="smallBold" style={styles.primaryLabel}>
            {label}
          </ThemedText>
        </LinearGradient>
      ) : (
        <View style={[styles.glassChip, { borderColor: theme.surfaceBorder, backgroundColor: theme.backgroundElement }]}>
          <SymbolView name={icon} size={16} tintColor={theme.accentSecondary} />
          <ThemedText type="smallBold">{label}</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  primaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
  },
  primaryLabel: {
    color: '#fff',
  },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
});
