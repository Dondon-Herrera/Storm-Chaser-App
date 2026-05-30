import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
};

export function FilterChip({ label, selected, onPress, color }: FilterChipProps) {
  const theme = useTheme();
  const accent = color ?? theme.accentSecondary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? accent : theme.surfaceBorder,
          backgroundColor: selected ? `${accent}33` : theme.backgroundElement,
        },
      ]}>
      <ThemedText type="smallBold" style={{ color: selected ? accent : theme.textSecondary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
});
