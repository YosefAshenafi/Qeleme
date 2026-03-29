import { StyleSheet } from 'react-native';

const PRIMARY_BLUE = '#2451DE';

export const ForgotPasswordScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgLettersLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  bgLetter: {
    position: 'absolute',
    fontSize: 280,
    fontWeight: '800',
    lineHeight: 280,
  },
  bgLetterCenter: {
    alignSelf: 'center',
    top: '12%',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  formStart: {
    marginTop: 24,
  },
  phoneFieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  languageToggleContainer: {
    marginRight: -4,
  },
  brandRow: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY_BLUE,
    letterSpacing: -0.5,
  },
  shieldCard: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  shieldInner: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 56,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phonePrefix: {
    fontSize: 16,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
  },
  footerPrefix: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY_BLUE,
    textDecorationLine: 'underline',
  },
});
