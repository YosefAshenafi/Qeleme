import { Tabs, Redirect, usePathname } from 'expo-router';
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

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();

  // Redirect KG students to KG dashboard
  if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
    return <Redirect href="/kg-dashboard" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.background,
        tabBarInactiveTintColor: colors.background + 'CC',
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
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
            <Text style={[styles.logoText, { color: colors.background }]}>
              Qelem
            </Text>
          </View>
        ),
        headerRight: () => (
          <View style={[styles.headerRight, { paddingTop: 10, paddingBottom: 10 }]}>
            {pathname !== '/homework' && <LanguageToggle colors={{ card: 'transparent', text: colors.background }} />}
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
            >
              <View style={[styles.profileIconContainer, { backgroundColor: colors.background + '20' }]}>
                <IconSymbol 
                  name="person.fill" 
                  size={24} 
                  color={colors.background} 
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
                color={focused ? colors.background : colors.background + 'CC'} 
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
                color={focused ? colors.background : colors.background + 'CC'} 
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
                color={focused ? colors.background : colors.background + 'CC'} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="homework"
        options={{
          title: t('navigation.tabs.homework'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && { backgroundColor: colors.background + '20' }]}>
              <IconSymbol 
                size={focused ? 30 : 26} 
                name={focused ? "message.fill" : "message"} 
                color={focused ? colors.background : colors.background + 'CC'} 
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
                color={focused ? colors.background : colors.background + 'CC'} 
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
    marginTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35,
    height: 35,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingBottom: 20,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
});
