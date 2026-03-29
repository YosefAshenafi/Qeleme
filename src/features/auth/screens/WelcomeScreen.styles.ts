import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const WelcomeScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: '15%',
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  textContainer: {
    gap: 8,
    marginBottom: 'auto',
  },
  headline: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  headlineAccent: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '800',
    color: '#0047E1',
  },
  subtitleText: {
    marginTop: 24,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: '85%',
    fontWeight: '500',
  },
  actionCard: {
    width: '100%',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 40,
    gap: 16,
  },
  primaryButtonContainer: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  guestAction: {
    marginTop: 24,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guestActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
