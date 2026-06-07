import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { getColors } from '@/features/common/constants/Colors';
import { useTheme } from '@/core/providers/ThemeProvider';
import { useAuth } from '@/core/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/config/constants';
import { AccountSettingsStyles as styles } from './AccountSettings.styles';

interface AccountSettingsProps {
  colors: ReturnType<typeof getColors>;
  profileData: {
    englishName: string;
    username: string;
    role: string;
    grade: string;
    joinDate: string;
    paymentPlan: string;
    playType?: string;
    updatedDate?: string;
    dueDate?: string;
  };
}

export function AccountSettings({ colors, profileData }: AccountSettingsProps) {
  const { isDarkMode } = useTheme();
  const { user, login } = useAuth();
  const { t } = useTranslation();
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
          'Authorization': `Bearer ${await AsyncStorage.getItem('@auth_token')}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          username: profileData.username.replace('@', ''),
          newFullName: editedName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update full name');
      }

      
      if (user) {
        const updatedUser = {
          ...user,
          fullName: editedName
        };
        await login(updatedUser);
      }

      
      profileData.englishName = editedName;
      setIsEditing(false);

      
      const profileResponse = await fetch(`${BASE_URL}/api/auth/student/profile`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('@auth_token')}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      if (profileResponse.ok) {
        const updatedProfileData = await profileResponse.json();
        await login(updatedProfileData);
      }
    } catch {
    }
  };

  return (
    <View style={[styles.accountSettingsContent, isDarkMode ? { backgroundColor: colors.card } : { backgroundColor: '#ffffff' }]}>
      <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.fullName')}</Text>
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
                <Text style={[styles.saveButtonText, { color: colors.background }]}>{t('profile.save')}</Text>
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
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.username')}</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.username}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.role')}</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.role}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.grade')}</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.grade}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.joined')}</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.joinDate}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        {profileData.playType && (
          <>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.playType')}</Text>
              <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.playType}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          </>
        )}
        {profileData.updatedDate && (
          <>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.updatedDate')}</Text>
              <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.updatedDate}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          </>
        )}
        {profileData.dueDate && (
          <>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.dueDate')}</Text>
              <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.dueDate}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          </>
        )}
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.accountSettingsLabels.paymentPlan')}</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{profileData.paymentPlan}</Text>
        </View>
      </View>
    </View>
  );
} 