import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ColorValue, type ViewProps } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GradientSurfaceProps = ViewProps & {
  variant?: 'hero' | 'accent' | 'subtle';
};

export function GradientSurface({ style, variant = 'hero', children, ...props }: GradientSurfaceProps) {
  const theme = useTheme();

  const colors: readonly [ColorValue, ColorValue, ...ColorValue[]] =
    variant === 'accent'
      ? [theme.accent, '#FF8A5C', theme.accentSecondary]
      : variant === 'subtle'
        ? ['rgba(30, 27, 75, 0.9)', 'rgba(15, 23, 42, 0.85)']
        : [theme.gradientStart, theme.gradientEnd];

  return (
    <View style={[styles.wrapper, style]} {...props}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radii.large,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
});
