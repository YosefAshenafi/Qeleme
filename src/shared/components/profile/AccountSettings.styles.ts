import { StyleSheet } from 'react-native';

export const AccountSettingsStyles = StyleSheet.create({
  accountSettingsContent: {
    padding: 16,
  },
  settingsList: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 17,
    opacity: 0.7,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    minWidth: 100,
    maxWidth: 140,
    fontSize: 17,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
