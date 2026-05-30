import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  titleSize?: number;
  subtitleSize?: number;
};

export function ScreenHeader({ eyebrow, title, subtitle, actions, titleSize = 36, subtitleSize = 15 }: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.textBlock}>
          {eyebrow ? (
            <View style={[styles.eyebrow, { borderColor: theme.surfaceBorder, backgroundColor: theme.accentMuted }]}>
              <ThemedText type="smallBold" style={{ color: theme.accentSecondary, letterSpacing: 1.2 }}>
                {eyebrow.toUpperCase()}
              </ThemedText>
            </View>
          ) : null}
          <ThemedText type="title" style={{ fontSize: titleSize, lineHeight: titleSize + 4, fontWeight: '700' }}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: subtitleSize, lineHeight: subtitleSize + 6 }}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    gap: Spacing.two,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
