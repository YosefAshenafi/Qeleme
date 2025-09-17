import { StyleSheet, TouchableOpacity, View, Image, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/role-selection');
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000000', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.languageToggleContainer}>
            <LanguageToggle colors={colors} />
          </View>

          <Animated.View 
            style={[
              styles.content, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Image 
                source={isDarkMode 
                  ? require('@/assets/images/logo/logo-white.png')
                  : require('@/assets/images/logo/logo-dark.png')
                }
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.textContainer}>
              <ThemedText style={[styles.welcomeText, { color: colors.text }]}>
                {t('welcome.title')}
              </ThemedText>
              <ThemedText style={[styles.subtitleText, { color: colors.text + '80' }]}>
                {t('welcome.subtitle')}
              </ThemedText>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.primaryButton, {
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
                  shadowColor: isDarkMode ? '#000' : '#4F46E5',
                }]} 
                onPress={handleSignUp}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  <ThemedText style={styles.primaryButtonText}>
                    {t('welcome.signUp')}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton, {
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
                  borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                }]} 
                onPress={handleSignIn}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.secondaryButtonText, { color: colors.text }]}>
                  {t('welcome.signIn')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 8,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  logoContainer: {
    width: width,
    height: width,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -100,
  },
  logoImage: {
    width: '180%',
    height: '180%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 8,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitleText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 8,
    maxWidth: 400,
    alignSelf: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
