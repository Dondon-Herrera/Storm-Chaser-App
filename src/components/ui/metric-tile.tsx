import { SymbolView } from 'expo-symbols';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import type { StormIcon } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MetricTileProps = {
  label: string;
  value: string;
  icon: StormIcon;
  minWidth?: DimensionValue;
  accentColor?: string;
};

export function MetricTile({ label, value, icon, minWidth, accentColor }: MetricTileProps) {
  const theme = useTheme();
  const tint = accentColor ?? theme.accentSecondary;

  return (
    <Card
      style={[styles.tile, minWidth != null && { minWidth }]}
      accessible
      accessibilityLabel={`${label}: ${value}`}>
      <View style={[styles.iconWrap, { backgroundColor: `${tint}22` }]}>
        <SymbolView name={icon} size={18} tintColor={tint} />
      </View>
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.value}>
        {value}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 18,
  },
});
