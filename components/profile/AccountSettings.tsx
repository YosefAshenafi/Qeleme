import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

interface AccountSettingsProps {
  colors: ReturnType<typeof getColors>;
  profileData: {
    englishName: string;
    username: string;
    role: string;
    grade: string;
    joinDate: string;
    paymentPlan: string;
  };
}

export function AccountSettings({ colors, profileData }: AccountSettingsProps) {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.accountSettingsContent, isDarkMode ? { backgroundColor: colors.card } : { backgroundColor: '#ffffff' }]}>
      <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Full Name</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.englishName}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Username</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.username}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Role</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.role}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Grade</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.grade}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Joined</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.joinDate}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Payment Plan</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.paymentPlan}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.tint }]}>
        <Text style={[styles.editButtonText, { color: colors.background }]}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  editButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 