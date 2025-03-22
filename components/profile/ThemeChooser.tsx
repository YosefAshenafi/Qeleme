import React from 'react';
import { View, StyleSheet, Switch, Animated } from 'react-native';
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
  const [scaleAnim] = React.useState(new Animated.Value(1));

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    toggleTheme();
  };

  return (
    <View style={[styles.themeChooserContent, isDarkMode ? { backgroundColor: colors.card } : { backgroundColor: '#ffffff' }]}>
      <ThemedView style={[styles.settingsList, { backgroundColor: colors.card }]}>
        <Animated.View style={[styles.settingItem, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { 
              backgroundColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(107, 84, 174, 0.1)' 
            }]}>
              <IconSymbol 
                name={isDarkMode ? 'moon.fill' : 'sun.max.fill'} 
                size={24} 
                color={colors.tint} 
              />
            </View>
            <View style={styles.settingDetails}>
              <ThemedText style={[styles.settingTitle, { color: colors.text }]}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: colors.text }]}>
                {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleToggle}
            trackColor={{ false: '#767577', true: colors.tint }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#767577"
          />
        </Animated.View>
      </ThemedView>
      <ThemedText style={[styles.themeInfo, { color: colors.text }]}>
        {isDarkMode 
          ? 'Dark mode reduces eye strain in low-light conditions' 
          : 'Light mode provides better readability in bright environments'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  themeChooserContent: {
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
  themeInfo: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 