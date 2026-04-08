import { StyleSheet } from 'react-native';

export const BentoCardStyles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 0,
    position: 'relative',
  },
  large: {
    width: '100%',
    height: 220,
  },
  small: {
    width: '100%',
    height: 220,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  topRightIcon: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  iconText: {
    fontSize: 24,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  titleLarge: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitleLarge: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    transform: [{ rotate: '3deg' }],
  },
  largeIconText: {
    fontSize: 32,
  },
  titleSmall: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitleSmall: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  bottomIconOverlay: {
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  patternText: {
    fontSize: 64,
    fontWeight: '900',
  },
});
