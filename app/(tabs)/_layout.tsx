import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

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
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            style={{ marginRight: 15, marginTop: 35 }}
          >
            <View style={[styles.profileIconContainer, { backgroundColor: colors.tint + '20' }]}>
              <IconSymbol 
                name="person.fill" 
                size={24} 
                color={colors.tint} 
              />
            </View>
          </TouchableOpacity>
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
          title: 'Dashboard',
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
          title: 'MCQ',
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
          title: 'Flash Cards',
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
          title: 'Homework Help',
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
          title: 'Reports',
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
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
