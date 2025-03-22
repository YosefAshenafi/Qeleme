import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

type NotificationsProps = {
  colors: ReturnType<typeof getColors>;
};

export function Notifications({ colors }: NotificationsProps) {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    studyReminders: true,
    achievementAlerts: true,
    quizResults: true,
    newContent: true,
    marketingEmails: false,
    pushNotifications: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationSettings = [
    { 
      title: 'Study Reminders', 
      description: 'Get reminded to study at your preferred times',
      icon: 'bell.fill',
      key: 'studyReminders' as const
    },
    { 
      title: 'Achievement Alerts', 
      description: 'Get notified when you earn new achievements',
      icon: 'trophy.fill',
      key: 'achievementAlerts' as const
    },
    { 
      title: 'Quiz Results', 
      description: 'Receive immediate feedback on your quiz performance',
      icon: 'checkmark.circle.fill',
      key: 'quizResults' as const
    },
    { 
      title: 'New Content', 
      description: 'Get notified about new study materials and updates',
      icon: 'sparkles',
      key: 'newContent' as const
    },
    { 
      title: 'Marketing Emails', 
      description: 'Receive updates about new features and promotions',
      icon: 'envelope.fill',
      key: 'marketingEmails' as const
    },
    { 
      title: 'Push Notifications', 
      description: 'Enable or disable all push notifications',
      icon: 'bell.badge.fill',
      key: 'pushNotifications' as const
    },
  ];

  return (
    <View style={[styles.notificationsContent, isDarkMode ? { backgroundColor: colors.card } : { backgroundColor: '#ffffff' }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Settings</Text>
      <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
        {notificationSettings.map((setting, index) => (
          <React.Fragment key={index}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { 
                  backgroundColor: isDarkMode 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(107, 84, 174, 0.1)' 
                }]}>
                  <IconSymbol name={setting.icon as any} size={24} color={colors.tint} />
                </View>
                <View style={styles.settingDetails}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{setting.title}</Text>
                  <Text style={[styles.settingDescription, { color: colors.text }]}>{setting.description}</Text>
                </View>
              </View>
              <Switch
                value={settings[setting.key]}
                onValueChange={() => toggleSetting(setting.key)}
                trackColor={{ false: '#767577', true: colors.tint }}
                thumbColor={settings[setting.key] ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#767577"
              />
            </View>
            {index < notificationSettings.length - 1 && (
              <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationsContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.5,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
}); 