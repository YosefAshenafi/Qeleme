/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#6B54AE';
const tintColorDark = '#8B6BCE';

export const getColors = (isDark: boolean) => ({
  text: isDark ? '#FFFFFF' : '#000000',
  background: isDark ? '#121212' : '#FFFFFF',
  tint: isDark ? tintColorDark : tintColorLight,
  icon: isDark ? '#FFFFFF' : '#000000',
  tabIconDefault: isDark ? '#999999' : '#666666',
  tabIconSelected: isDark ? tintColorDark : tintColorLight,
  card: isDark ? '#1E1E1E' : '#FFFFFF',
});

export const Colors = {
  light: getColors(false),
  dark: getColors(true),
};
