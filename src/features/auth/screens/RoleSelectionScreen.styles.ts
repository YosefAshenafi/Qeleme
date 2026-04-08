import { StyleSheet } from 'react-native';

export const RoleSelectionScreenStyles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 24,
    padding: 8,
  },
  titleContainer: {
    gap: 8,
  },
  title: {
    paddingVertical: 20,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  roleContainer: {
    gap: 20,
  },
  roleCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleContent: {
    flex: 1,
    gap: 12,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  roleDescription: {
    fontSize: 17,
    lineHeight: 24,
  },
  roleFeatures: {
    gap: 8,
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 15,
    lineHeight: 20,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: 8,
    marginRight: 16,
  },
});
