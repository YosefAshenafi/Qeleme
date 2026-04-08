import { StyleSheet } from 'react-native';

export const EarlyDashboardScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingLeft: 0,
    paddingRight: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 75, 226, 0.2)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  logoImage: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  bentoGrid: {
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  loader: {
    marginTop: 40,
  },
  errorBox: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryBtn: {
    padding: 10,
    backgroundColor: '#004be2',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
  },
  watermarkBg: {
    position: 'absolute',
    top: '20%',
    right: '-10%',
    zIndex: -1,
    opacity: 0.03,
  },
  watermarkText: {
    fontSize: 500,
    fontWeight: '900',
    fontFamily: 'System',
  },
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  settingsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingsModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#374151',
  },
  settingsToggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  settingsToggleActive: {
    backgroundColor: '#004be2',
  },
  settingsToggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  settingsToggleKnobActive: {
    alignSelf: 'flex-end',
  },
  delayOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 24,
  },
  delayOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  delayOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#004be2',
  },
  delayOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  delayOptionTextActive: {
    color: '#004be2',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  settingsDoneButton: {
    backgroundColor: '#004be2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
