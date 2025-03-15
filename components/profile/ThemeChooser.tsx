import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

type ThemeChooserProps = {
  colors: ReturnType<typeof getColors>;
};

export function ThemeChooser({ colors }: ThemeChooserProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={styles.themeChooserContent}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Theme Settings</ThemedText>
      <ThemedView style={[styles.settingsList, { backgroundColor: colors.card }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                name={isDarkMode ? 'moon.fill' : 'sun.max.fill'} 
                size={24} 
                color={colors.tint} 
              />
            </View>
            <View style={styles.settingDetails}>
              <ThemedText style={[styles.settingTitle, { color: colors.text }]}>
                Dark Mode
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: colors.text }]}>
                Switch between light and dark theme
              </ThemedText>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.tint }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  themeChooserContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingsList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 84, 174, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 