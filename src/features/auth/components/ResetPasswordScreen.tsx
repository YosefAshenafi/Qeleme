import { TextInput, TouchableOpacity, View, Animated, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/features/common/components/ThemedText';
import { ResetPasswordScreenStyles as styles } from './ResetPasswordScreen.styles';

const PHONE_REGEX = /^(?:\+251|0|251)?([9][0-9]{8})$/;

export default function ResetPasswordScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
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

  const validatePhoneNumber = (phone: string) => {
    if (!phone.trim()) {
      return t('resetPassword.phoneNumber.error.required');
    }
    const fullNumber = `+251${phone}`;
    if (!PHONE_REGEX.test(fullNumber)) {
      return t('resetPassword.phoneNumber.error.invalid');
    }
    return '';
  };

  const handleResetPassword = async () => {
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    try {
      
      
      setIsSuccess(true);
    } catch {
      setError(t('resetPassword.error.message'));
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000000', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View 
            style={[
              styles.container, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.header}>
              <Image 
                source={require('@/assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <ThemedText style={[styles.titleText, { color: colors.text }]}>{t('resetPassword.title')}</ThemedText>
              <ThemedText style={[styles.subtitleText, { color: colors.text + '80' }]}>{t('resetPassword.subtitle')}</ThemedText>
            </View>

            {!isSuccess ? (
              <View style={[styles.formContainer, {
                backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
              }]}>
                <View style={[
                  styles.inputContainer, 
                  error ? styles.inputError : null,
                  { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }
                ]}>
                  <Ionicons name="call-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  <View style={styles.phoneInputContainer}>
                    <ThemedText style={[styles.countryCode, { color: colors.text }]}>+251</ThemedText>
                    <TextInput
                      style={[styles.input, styles.phoneInput, { color: colors.text }]}
                      placeholder={t('resetPassword.phoneNumber.placeholder')}
                      placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                      value={phoneNumber}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^\d]/g, '').slice(0, 9);
                        setPhoneNumber(cleaned);
                        if (error) {
                          setError('');
                        }
                      }}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      maxLength={9}
                    />
                  </View>
                </View>
                {error ? (
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                ) : null}

                <TouchableOpacity 
                  style={styles.resetButton} 
                  onPress={handleResetPassword}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={styles.buttonGradient}
                  >
                    <ThemedText style={styles.buttonText}>{t('resetPassword.resetButton')}</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.successContainer, {
                backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
              }]}>
                <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
                <ThemedText style={styles.successTitle}>{t('resetPassword.success.title')}</ThemedText>
                <ThemedText style={styles.successMessage}>{t('resetPassword.success.message')}</ThemedText>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => router.back()}
                >
                  <ThemedText style={styles.backButtonText}>{t('resetPassword.backToLogin')}</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
} 
