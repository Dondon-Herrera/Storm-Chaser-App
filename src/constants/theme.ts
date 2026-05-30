/**
 * Storm Chaser design tokens — electric storm aesthetic over video background.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#F8FAFC',
    background: 'transparent',
    backgroundElement: 'rgba(10, 14, 32, 0.82)',
    backgroundSelected: 'rgba(34, 211, 238, 0.18)',
    backgroundElevated: 'rgba(18, 22, 48, 0.92)',
    textSecondary: 'rgba(226, 232, 240, 0.72)',
    textMuted: 'rgba(148, 163, 184, 0.9)',
    accent: '#FF4D6D',
    accentSecondary: '#22D3EE',
    accentMuted: 'rgba(255, 77, 109, 0.2)',
    glowCyan: 'rgba(34, 211, 238, 0.45)',
    glowRose: 'rgba(255, 77, 109, 0.4)',
    surfaceBorder: 'rgba(148, 163, 184, 0.22)',
    tabBar: 'rgba(6, 8, 20, 0.72)',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    gradientStart: '#1E1B4B',
    gradientEnd: '#0F172A',
  },
  dark: {
    text: '#F8FAFC',
    background: 'transparent',
    backgroundElement: 'rgba(8, 12, 28, 0.86)',
    backgroundSelected: 'rgba(139, 92, 246, 0.22)',
    backgroundElevated: 'rgba(12, 16, 36, 0.94)',
    textSecondary: 'rgba(226, 232, 240, 0.72)',
    textMuted: 'rgba(148, 163, 184, 0.9)',
    accent: '#FF4D6D',
    accentSecondary: '#22D3EE',
    accentMuted: 'rgba(255, 77, 109, 0.24)',
    glowCyan: 'rgba(34, 211, 238, 0.5)',
    glowRose: 'rgba(255, 77, 109, 0.45)',
    surfaceBorder: 'rgba(148, 163, 184, 0.18)',
    tabBar: 'rgba(4, 6, 16, 0.78)',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    gradientStart: '#312E81',
    gradientEnd: '#020617',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const ChaseRiskColors = {
  calm: '#34D399',
  watch: '#22D3EE',
  chase: '#FBBF24',
  extreme: '#FF4D6D',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radii = {
  small: 10,
  normal: 16,
  large: 22,
  pill: 999,
} as const;

export const Shadows = {
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 0 }) ?? 0;
export const WebTopTabInset = Platform.select({ web: 96, default: 0 }) ?? 0;
export const MaxContentWidth = 860;
