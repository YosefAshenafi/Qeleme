import { StyleSheet } from 'react-native';

export const OTPScreenStyles = StyleSheet.create({
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
    fontSize: 360,
    fontWeight: '800',
    lineHeight: 360,
  },
  bgLetterLeft: {
    left: -52,
    top: 44,
    transform: [{ rotate: '-7deg' }],
  },
  bgLetterRight: {
    right: -78,
    bottom: -74,
    transform: [{ rotate: '7deg' }],
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 1,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: 8,
    marginRight: 16,
    zIndex: 1,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 26,
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 18,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    gap: 8,
  },
  otpInput: {
    width: 46,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    opacity: 0.5,
  },
  verifyButtonActive: {
    opacity: 1,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#F8FAFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'System',
  },
  resendContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    color: '#0F4BD7',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
  },
  resendButtonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
