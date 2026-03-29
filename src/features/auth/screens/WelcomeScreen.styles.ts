import { StyleSheet } from 'react-native';

export const WelcomeScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 12,
    right: 20,
    zIndex: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 42,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    width: 140,
    height: 140,
    borderRadius: 20,
  },

  textContainer: {
    marginTop: 12,
    gap: 2,
  },
  headline: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
  },
  headlineAccent: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#0F4BD7',
  },
  subtitleText: {
    marginTop: 18,
    fontSize: 18,
    lineHeight: 30,
    maxWidth: '92%',
  },
  actionCard: {
    width: '100%',
    marginTop: 10,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 28,
    gap: 18,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F4BD7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4BD7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#F8FAFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    color: '#0F4BD7',
  },
  dividerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderRadius: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  guestAction: {
    marginTop: 4,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guestActionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
