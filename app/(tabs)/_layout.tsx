import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useTheme } from '../../contexts/ThemeContext';
import { getColors } from '../../constants/Colors';
import { LanguageToggle } from '../../components/ui/LanguageToggle';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const { user } = useAuth();

  // Redirect KG students to KG dashboard
  if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
    return <Redirect href="/kg-dashboard" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerRight: () => (
          <View style={[styles.headerRight, { marginTop: 10 }]}>
            <LanguageToggle colors={colors} />
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
            >
              <View style={[styles.profileIconContainer, { backgroundColor: colors.tint + '20' }]}>
                <IconSymbol 
                  name="person.fill" 
                  size={24} 
                  color={colors.tint} 
                />
              </View>
            </TouchableOpacity>
          </View>
        ),
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <BlurView
            tint={isDarkMode ? 'dark' : 'light'}
            intensity={100}
            style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }]}
          />
        ),
        tabBarStyle: {
          backgroundColor: isDarkMode ? colors.background : colors.background,
          borderTopColor: isDarkMode ? colors.card : colors.card,
          borderTopWidth: 1,
          position: 'absolute',
          elevation: 0,
          height: 85,
          paddingBottom: 20,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? "house.fill" : "house"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mcq"
        options={{
          title: t('navigation.tabs.mcq'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? "questionmark.circle.fill" : "questionmark.circle"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: t('navigation.tabs.flashcards'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? "rectangle.stack.fill" : "rectangle.stack"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="homework"
        options={{
          title: t('navigation.tabs.homework'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? "message.fill" : "message"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('navigation.tabs.reports'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? "chart.bar.fill" : "chart.bar"} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
