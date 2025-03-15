/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#6B54AE';
const tintColorDark = '#6B54AE';

export const getColors = (isDark: boolean) => ({
  text: isDark ? '#ECEDEE' : '#11181C',
  background: isDark ? '#151718' : '#fff',
  tint: isDark ? tintColorDark : tintColorLight,
  icon: isDark ? '#9BA1A6' : '#687076',
  tabIconDefault: isDark ? '#9BA1A6' : '#687076',
  tabIconSelected: isDark ? tintColorDark : tintColorLight,
  card: isDark ? '#1C1C1E' : '#F5F5F5',
});

export const Colors = {
  light: getColors(false),
  dark: getColors(true),
};
