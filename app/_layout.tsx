import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { LogBox, View, Image } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import i18n, { initI18n } from '../i18n/i18n';
import CustomSplashScreen from '@/components/SplashScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Ignore specific warnings
LogBox.ignoreLogs([
  'No route named',  // Ignore route-related warnings
  'Open debugger to view warnings'  // Ignore debugger warnings
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDarkMode } = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (loaded) {
      // Hide the native splash screen
      SplashScreen.hideAsync();
      
      // Show custom splash for a bit longer with animation
      // Sponsorship shows at 1.2s and completes at 2s, then we wait 4 more seconds
      // setTimeout(() => {
      //   setShowSplash(false);
      // }, 6000); // Show splash for 6 seconds total (2s for sponsorship + 4s delay)
      
      // Reduced timer since Zemen advertisement is commented out
      setTimeout(() => {
        setShowSplash(false);
      }, 2000); // Show splash for 2 seconds only
    }
  }, [loaded]);

  if (!loaded || showSplash) {
    return <CustomSplashScreen />;
  }

  return (
    <NavigationThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="kg-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="kg-category" options={{ headerShown: false }} />
        <Stack.Screen name="screens/PictureMCQScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/PictureMCQInstructionScreen" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  console.log('🚀 RootLayout rendering');
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    console.log('🚀 RootLayout useEffect running');
    const initializeI18n = async () => {
      try {
        console.log('🚀 Initializing i18n...');
        await initI18n();
        console.log('✅ i18n initialized');
      } catch (error) {
        console.error('❌ i18n initialization error:', error);
      } finally {
        setIsI18nReady(true);
        console.log('✅ i18n ready state set to true');
      }
    };

    initializeI18n();
  }, []);

  if (!isI18nReady) {
    console.log('⏳ Showing loading screen, i18n not ready');
    return (
      <View style={{ flex: 1, backgroundColor: '#6B54AE', justifyContent: 'center', alignItems: 'center' }}>
        <Image 
          source={require('../assets/images/logo/white-logo.png')}
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  console.log('✅ Rendering main app, i18n is ready');
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
