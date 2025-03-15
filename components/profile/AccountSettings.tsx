import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AccountSettingsProps {
  colors: any;
  profileData: {
    englishName: string;
    email: string;
    role: string;
    grade: string;
    school: string;
  };
}

export function AccountSettings({ colors, profileData }: AccountSettingsProps) {
  return (
    <View style={styles.accountSettingsContent}>
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Full Name</Text>
        <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.englishName}</Text>
      </View>
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Email</Text>
        <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.email}</Text>
      </View>
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Role</Text>
        <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.role}</Text>
      </View>
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Grade</Text>
        <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.grade}</Text>
      </View>
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>School</Text>
        <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.school}</Text>
      </View>
      <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.tint }]}>
        <Text style={[styles.editButtonText, { color: colors.background }]}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  accountSettingsContent: {
    gap: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    opacity: 0.7,
  },
  editButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 