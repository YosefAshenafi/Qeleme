

// Brand blue — matches the home page accent (#0F4BD7). Dark mode uses a
// slightly lighter blue so accents/loaders stay legible on dark surfaces.
const tintColorLight = '#0F4BD7';
const tintColorDark = '#4F86F7';

export const getColors = (isDark: boolean) => ({
  text: isDark ? '#FFFFFF' : '#000000',
  background: isDark ? '#2A2A2A' : '#FFFFFF',
  tint: isDark ? tintColorDark : tintColorLight,
  icon: isDark ? '#FFFFFF' : '#000000',
  tabIconDefault: isDark ? '#FFFFFF' : '#666666',
  tabIconSelected: isDark ? '#FFFFFF' : tintColorLight,
  card: isDark ? '#1E1E1E' : '#FFFFFF',
  cardAlt: isDark ? '#2A2A2A' : '#F5F5F5',
  border: isDark ? '#333333' : '#E0E0E0',
  cardGradientStart: isDark ? '#2A2A2A' : '#E8F0FE',
  cardGradientEnd: isDark ? '#333333' : '#CBDDFB',
  warning: isDark ? '#FFB74D' : '#F57C00',
  success: isDark ? '#81C784' : '#4CAF50',
  error: isDark ? '#E57373' : '#F44336',
  info: isDark ? '#64B5F6' : '#2196F3',
});

export const Colors = {
  light: getColors(false),
  dark: getColors(true),
};
