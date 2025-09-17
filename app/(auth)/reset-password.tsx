import { StyleSheet, TextInput, TouchableOpacity, View, Animated, Dimensions, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');

// Phone number validation regex for Ethiopian numbers
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
      // Here you would typically make an API call to send the reset link
      // For now, we'll simulate a successful reset
      setIsSuccess(true);
    } catch (error) {
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
                source={isDarkMode 
                  ? require('@/assets/images/logo/logo-white.png')
                  : require('@/assets/images/logo/logo-dark.png')
                }
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

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginBottom: -40,
    marginTop: -60,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    gap: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
    marginLeft: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1F2937',
  },
  resetButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#4F46E5',
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 16,
    color: '#1F2937',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
  },
  successContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    gap: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
}); 