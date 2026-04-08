import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';

import { HapticTab } from '@/features/common/components/HapticTab';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { useTheme } from '@/core/providers/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_LAYOUT } from '@/features/common/constants/tabLayout';
import { tabLayoutStyles } from '@/features/common/appStyles/tabLayout.styles';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
    return <Redirect href="/kg-dashboard" />;
  }

  const headerBg = isDarkMode ? TAB_LAYOUT.headerBgDark : TAB_LAYOUT.headerBgLight;
  const headerBorder = isDarkMode ? TAB_LAYOUT.headerBorderDark : TAB_LAYOUT.headerBorderLight;
  const iconCircle = isDarkMode ? TAB_LAYOUT.iconCircleDark : TAB_LAYOUT.iconCircleLight;
  const iconColor = isDarkMode ? TAB_LAYOUT.iconColorDark : TAB_LAYOUT.iconColorLight;

  const tabBarBg = isDarkMode ? TAB_LAYOUT.tabBarBgDark : TAB_LAYOUT.tabBarBgLight;
  const tabBarBorder = isDarkMode ? TAB_LAYOUT.tabBarBorderDark : TAB_LAYOUT.tabBarBorderLight;

  const megaHeaderLeft = () => (
    <View style={tabLayoutStyles.headerLeft}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={tabLayoutStyles.brandMark}
        resizeMode="contain"
      />
    </View>
  );

  const megaHeaderRight = () => (
    <View style={tabLayoutStyles.headerRight}>
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
        headerLeftContainerStyle: { paddingLeft: TAB_LAYOUT.headerPaddingHorizontal, flex: 1 },
        headerRightContainerStyle: { paddingRight: TAB_LAYOUT.headerPaddingHorizontal, flex: 0 },
        tabBarActiveTintColor: TAB_LAYOUT.tabActive,
        tabBarInactiveTintColor: isDarkMode ? TAB_LAYOUT.tabInactiveDark : TAB_LAYOUT.tabInactiveLight,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: TAB_LAYOUT.tabBarLabelFontSize,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarButton: HapticTab,
        tabBarBackground: () => <View style={[StyleSheet.absoluteFill, { backgroundColor: tabBarBg }]} />,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: TAB_LAYOUT.tabBarBaseHeight + Math.max(insets.bottom, 12),
          paddingBottom: Math.max(insets.bottom, TAB_LAYOUT.tabBarPaddingBottomMin),
          paddingTop: TAB_LAYOUT.tabBarPaddingTop,
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
        name="practice"
        options={{
          title: t('navigation.tabs.practice'),
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
