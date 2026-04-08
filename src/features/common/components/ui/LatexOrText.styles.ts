import { Platform, StyleSheet } from 'react-native';

export const latexOrTextStyles = StyleSheet.create({
  text: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'System',
  },
  math: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: Platform.OS === 'android' ? 18 : 18,
  },
  inlineMath: {
    marginHorizontal: 2,
  },
  blockMath: {
    marginVertical: 4,
    textAlign: 'center',
  },
});
