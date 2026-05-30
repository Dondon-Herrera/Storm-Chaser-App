import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, type PressableProps, type PressableStateCallbackType } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'md' | 'lg';
};

export function Button({ title, variant = 'primary', size = 'md', style, disabled, accessibilityLabel, ...props }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const paddingVertical = size === 'lg' ? Spacing.three : Spacing.two;
  const paddingHorizontal = size === 'lg' ? Spacing.five : Spacing.four;

  const pressableStyle = (state: PressableStateCallbackType) => [
    styles.button,
    { paddingVertical, paddingHorizontal, opacity: disabled ? 0.5 : state.pressed ? 0.85 : 1 },
    isOutline && { borderWidth: 1, borderColor: theme.surfaceBorder, backgroundColor: theme.backgroundElement },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    isSecondary && { backgroundColor: theme.backgroundSelected },
    typeof style === 'function' ? style(state) : style,
  ];

  const labelColor = isPrimary ? '#fff' : isSecondary ? theme.accentSecondary : theme.text;

  const content = (
    <ThemedText type="smallBold" style={{ textAlign: 'center', color: labelColor }}>
      {title}
    </ThemedText>
  );

  if (isPrimary) {
    return (
      <Pressable
        {...props}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: !!disabled }}
        style={pressableStyle}>
        <LinearGradient
          colors={[theme.accent, '#FF7A59']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.gradient, { paddingVertical, paddingHorizontal }]}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      style={pressableStyle}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radii.pill,
    minWidth: 110,
    alignSelf: 'flex-start',
  },
  gradient: {
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
