import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import type { ChaseReadiness } from '@/lib/storm-intelligence';

type ChaseAlertBannerProps = {
  readiness: ChaseReadiness;
};

export function ChaseAlertBanner({ readiness }: ChaseAlertBannerProps) {
  if (readiness.level !== 'chase' && readiness.level !== 'extreme') {
    return null;
  }

  const isExtreme = readiness.level === 'extreme';

  return (
    <View
      style={[
        styles.banner,
        {
          borderColor: readiness.color,
          backgroundColor: isExtreme ? 'rgba(255, 77, 109, 0.2)' : 'rgba(251, 191, 36, 0.15)',
        },
      ]}>
      <SymbolView
        name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
        size={20}
        tintColor={readiness.color}
      />
      <View style={styles.text}>
        <ThemedText type="smallBold" style={{ color: readiness.color }}>
          {isExtreme ? 'Extreme chase conditions' : 'Active chase window'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Score {readiness.score}/100 — prioritize safety, escape routes, and live radar.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radii.normal,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    gap: 4,
  },
});
