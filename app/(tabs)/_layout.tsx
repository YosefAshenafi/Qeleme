import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Text, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';

import { HapticTab } from '@/shared/components/HapticTab';
import { IconSymbol } from '@/shared/components/ui/IconSymbol';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { useTheme } from '@/core/providers/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_BLUE = '#0F4BD7';
const TAB_ACTIVE = '#0F4BD7';
const TAB_INACTIVE_LIGHT = '#9CA3AF';
const HEADER_BG_LIGHT = '#FFFFFF';
const HEADER_BG_DARK = '#101216';
const ICON_CIRCLE_LIGHT = '#F3F4F6';
const ICON_CIRCLE_DARK = '#2A313D';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
    return <Redirect href="/kg-dashboard" />;
  }

  const headerBg = isDarkMode ? HEADER_BG_DARK : HEADER_BG_LIGHT;
  const headerBorder = isDarkMode ? '#2C3340' : '#E5E7EB';
  const primaryText = isDarkMode ? '#F3F4F6' : '#111827';
  const iconCircle = isDarkMode ? ICON_CIRCLE_DARK : ICON_CIRCLE_LIGHT;
  const iconColor = isDarkMode ? '#E5E7EB' : '#4B5563';

  const tabBarBg = isDarkMode ? '#191D24' : '#FFFFFF';
  const tabBarBorder = isDarkMode ? '#2C3340' : '#E5E7EB';

  const megaHeaderLeft = () => (
    <View style={styles.headerLeft}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.brandMark}
        resizeMode="contain"
      />
    </View>
  );

  const megaHeaderRight = () => (
    <View style={styles.headerRight}>
      <LanguageToggle colors={{ card: iconCircle, text: iconColor }} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitle: () => null,
        headerStyle: {
          backgroundColor: headerBg,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: headerBorder,
        },
        headerLeft: megaHeaderLeft,
        headerRight: megaHeaderRight,
        headerTitleAlign: 'center',
        headerLeftContainerStyle: { paddingLeft: 16, flex: 1 },
        headerRightContainerStyle: { paddingRight: 16, flex: 0 },
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: isDarkMode ? '#8B93A3' : TAB_INACTIVE_LIGHT,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarButton: HapticTab,
        tabBarBackground: () => <View style={[StyleSheet.absoluteFill, { backgroundColor: tabBarBg }]} />,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 56 + Math.max(insets.bottom, 12),
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'house.fill' : 'house'} size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mcq"
        options={{
          title: t('navigation.tabs.subjects'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'book.fill' : 'book'} size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          href: null,
          title: t('navigation.tabs.flashcards'),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('navigation.tabs.stats'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'chart.bar.fill' : 'chart.bar'} size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'person.fill' : 'person'} size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 50,
    height: 44,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
