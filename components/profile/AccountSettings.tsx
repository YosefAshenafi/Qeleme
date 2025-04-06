import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/config/constants';

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
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profileData.englishName);

  const handleNameChange = (text: string) => {
    setEditedName(text);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/student/update-fullname`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('@auth_token')}`
        },
        body: JSON.stringify({
          username: profileData.username.replace('@', ''),
          newFullName: editedName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update full name');
      }

      // Update the user data in auth context
      if (user) {
        const updatedUser = {
          ...user,
          fullName: editedName
        };
        await login(updatedUser);
      }

      // Update the profile data with the new name
      profileData.englishName = editedName;
      setIsEditing(false);

      // Force a refresh of the profile data
      const profileResponse = await fetch('http://172.20.10.3:5001/api/auth/student/profile', {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('@auth_token')}`
        }
      });
      
      if (profileResponse.ok) {
        const updatedProfileData = await profileResponse.json();
        await login(updatedProfileData);
      }
    } catch (error) {
      console.error('Error updating full name:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <View style={[styles.accountSettingsContent, isDarkMode ? { backgroundColor: colors.card } : { backgroundColor: '#ffffff' }]}>
      <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Full Name</Text>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.tint }]}
                value={editedName}
                onChangeText={handleNameChange}
                autoFocus
              />
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={handleSave}
              >
                <Text style={[styles.saveButtonText, { color: colors.background }]}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.englishName}</Text>
            </TouchableOpacity>
          )}
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