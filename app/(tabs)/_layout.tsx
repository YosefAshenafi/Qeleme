import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Image, Text } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useTheme } from '../../contexts/ThemeContext';
import { getColors } from '../../constants/Colors';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { GradeBadge } from '../../components/ui/GradeBadge';

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
        tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : colors.background,
        tabBarInactiveTintColor: isDarkMode ? '#FFFFFFCC' : colors.background + 'CC',
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.tint,
        },
        headerLeft: () => (
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/images/logo/white-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.logoText, { color: isDarkMode ? '#FFFFFF' : colors.background }]}>
              Qelem
            </Text>
          </View>
        ),
        headerTitle: () => (
          <View style={[styles.gradeContainer, { backgroundColor: colors.background + '20', borderColor: isDarkMode ? '#FFFFFF' : colors.background }]}>
            <Text style={styles.gradeIcon}>🎓</Text>
            <Text style={[styles.gradeText, { color: isDarkMode ? '#FFFFFF' : colors.background }]}>
              {t('common.grade')}: {user?.grade?.replace(/\D/g, '')}
            </Text>
          </View>
        ),
        headerRight: () => (
          <View style={styles.headerRight}>
            <LanguageToggle 
              colors={{ 
                card: 'transparent', 
                text: isDarkMode ? '#FFFFFF' : colors.background,
                tint: isDarkMode ? '#FFFFFF' : colors.background 
              }} 
            />
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              style={styles.profileButton}
            >
              <View style={[styles.profileIconContainer, { backgroundColor: colors.background + '20' }]}>
                <IconSymbol 
                  name="person.fill" 
                  size={20} 
                  color={isDarkMode ? '#FFFFFF' : colors.background} 
                />
              </View>
            </TouchableOpacity>
          </View>
        ),
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tint }]} />
        ),
        tabBarStyle: {
          backgroundColor: colors.tint,
          borderTopColor: colors.background,
          borderTopWidth: 2,
          position: 'absolute',
          elevation: 0,
          height: 90,
          paddingBottom: 20,
          paddingTop: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && { backgroundColor: colors.background + '20' }]}>
              <IconSymbol 
                size={focused ? 30 : 26} 
                name={focused ? "house.fill" : "house"} 
                color={focused ? (isDarkMode ? '#FFFFFF' : colors.background) : (isDarkMode ? '#FFFFFFCC' : colors.background + 'CC')} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mcq"
        options={{
          title: t('navigation.tabs.mcq'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && { backgroundColor: colors.background + '20' }]}>
              <IconSymbol 
                size={focused ? 30 : 26} 
                name={focused ? "questionmark.circle.fill" : "questionmark.circle"} 
                color={focused ? (isDarkMode ? '#FFFFFF' : colors.background) : (isDarkMode ? '#FFFFFFCC' : colors.background + 'CC')} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: t('navigation.tabs.flashcards'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && { backgroundColor: colors.background + '20' }]}>
              <IconSymbol 
                size={focused ? 30 : 26} 
                name={focused ? "rectangle.stack.fill" : "rectangle.stack"} 
                color={focused ? (isDarkMode ? '#FFFFFF' : colors.background) : (isDarkMode ? '#FFFFFFCC' : colors.background + 'CC')} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('navigation.tabs.reports'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && { backgroundColor: colors.background + '20' }]}>
              <IconSymbol 
                size={focused ? 30 : 26} 
                name={focused ? "chart.bar.fill" : "chart.bar"} 
                color={focused ? (isDarkMode ? '#FFFFFF' : colors.background) : (isDarkMode ? '#FFFFFFCC' : colors.background + 'CC')} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    gap: 8,
  },
  profileButton: {
    padding: 4,
  },
  profileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 2,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradeIcon: {
    fontSize: 16,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
