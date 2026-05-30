import { useWindowDimensions, type DimensionValue } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';

const COMPACT_BREAKPOINT = 380;
const TABLET_BREAKPOINT = 768;

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isCompact = width < COMPACT_BREAKPOINT;
  const isTablet = width >= TABLET_BREAKPOINT;
  const contentWidth = Math.min(width, MaxContentWidth);
  const horizontalPadding = isCompact ? Spacing.three : Spacing.four;
  const metricMinWidth: DimensionValue = isCompact ? '100%' : isTablet ? '22%' : '45%';
  const forecastDayWidth: DimensionValue = isCompact ? '100%' : '48%';

  return {
    width,
    height,
    isCompact,
    isTablet,
    contentWidth,
    horizontalPadding,
    metricMinWidth,
    forecastDayWidth,
    titleFontSize: isCompact ? 32 : isTablet ? 52 : 42,
    subtitleFontSize: isCompact ? 22 : 28,
  };
}
