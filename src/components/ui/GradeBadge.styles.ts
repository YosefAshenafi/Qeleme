import { StyleSheet } from 'react-native';

export const gradeBadgeStyles = StyleSheet.create({
  gradientContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  smallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  smallText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  smallIcon: {
    fontSize: 12,
  },
  mediumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  mediumText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mediumIcon: {
    fontSize: 14,
  },
  largeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  largeText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  largeIcon: {
    fontSize: 16,
  },
});
