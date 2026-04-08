/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#6B54AE';
const tintColorDark = '#8B6BCE';

export const getColors = (isDark: boolean) => ({
  text: isDark ? '#FFFFFF' : '#000000',
  background: isDark ? '#2A2A2A' : '#FFFFFF',
  tint: isDark ? tintColorDark : tintColorLight,
  icon: isDark ? '#FFFFFF' : '#000000',
  tabIconDefault: isDark ? '#999999' : '#666666',
  tabIconSelected: isDark ? tintColorDark : tintColorLight,
  card: isDark ? '#1E1E1E' : '#FFFFFF',
  cardAlt: isDark ? '#2A2A2A' : '#F5F5F5',
  border: isDark ? '#333333' : '#E0E0E0',
  cardGradientStart: isDark ? '#2A2A2A' : '#F3E5F5',
  cardGradientEnd: isDark ? '#333333' : '#E1BEE7',
  warning: isDark ? '#FFB74D' : '#F57C00',
  success: isDark ? '#81C784' : '#4CAF50',
  error: isDark ? '#E57373' : '#F44336',
  info: isDark ? '#64B5F6' : '#2196F3',
});

export const Colors = {
  light: getColors(false),
  dark: getColors(true),
};
