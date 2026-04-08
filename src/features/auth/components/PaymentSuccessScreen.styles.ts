import { StyleSheet } from 'react-native';

export const PaymentSuccessScreenStyles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  languageToggleContainer: { position: 'absolute', top: 20, right: 20, zIndex: 1 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  successIconContainer: { marginBottom: 30 },
  successTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  successMessage: { fontSize: 16, textAlign: 'center', marginBottom: 40, opacity: 0.8, lineHeight: 24 },
  continueButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, alignItems: 'center' },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
