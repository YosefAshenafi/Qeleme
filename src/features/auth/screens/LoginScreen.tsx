import { TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/core/providers/AuthProvider';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/shared/constants/Colors';
import { useTranslation } from 'react-i18next';
import { storeAuthData } from '@/features/auth/utils/authStorage';

import { ThemedText } from '@/shared/components/ThemedText';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { PasswordInput } from '@/shared/components/ui/PasswordInput';
import { BASE_URL } from '@/shared/config/constants';
import { LoginScreenStyles as styles } from './LoginScreen.styles';


// Username validation regex
// Allows letters, numbers, and underscores, 3-20 characters
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      return t('login.username.error.required');
    }
    const isUsername = USERNAME_REGEX.test(username);
    const isEmail = EMAIL_REGEX.test(username);
    if (!isUsername && !isEmail) {
      return t('login.username.error.invalid');
    }
    return '';
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      password: ''
    };

    const usernameError = validateUsername(username);
    if (usernameError) {
      newErrors.username = usernameError;
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = t('login.password.error.required');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setIsLoading(true);
      setError('');
      
      // Debug: Log the payload being sent
      console.log('LOGIN PAYLOAD', { username: username.toLowerCase(), password });
      console.log('LOGIN URL:', `${BASE_URL}/api/auth/login`);
      try {
        // Make the login request with headers similar to the working curl request
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            username: username.toLowerCase(),
            password,
          }),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
          throw new Error(data.message || t('login.error.invalidCredentials'));
        }

        // Store the auth data
        await storeAuthData(data);
        
        // Update the auth context
        await login(data.user);
        
        // Navigate based on user type
        if (data.user.type === 'student' && typeof data.user.grade === 'string' && data.user.grade.toLowerCase().includes('kg')) {
          router.replace('/kg-dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {

          // Check if the error message is a translation key
          if (error.message.startsWith('login.error.')) {
            setError(t(error.message));
          } else {
            setError(t('login.error.serverError'));
          }
        } else {
          setError(t('login.error.serverError'));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#101216' : '#F1F2F4' }]}>
      <View pointerEvents="none" style={styles.bgLettersLayer}>
        <Text
          style={[
            styles.bgLetter,
            styles.bgLetterLeft,
            { color: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.26)' },
          ]}
        >
          MegaTest
        </Text>
        <Text
          style={[
            styles.bgLetter,
            styles.bgLetterRight,
            { color: isDarkMode ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.22)' },
          ]}
        >
          M
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/(auth)/welcome')}
              >
                <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#B7BDC8' : '#1F2937'} />
              </TouchableOpacity>

              <View style={styles.languageToggleContainer}>
                <LanguageToggle colors={colors} />
              </View>

              <View style={styles.brand}>
                <Image
                  source={require('../../../../assets/images/logo.png')}
                  style={styles.brandIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={[styles.formContainer, { backgroundColor: isDarkMode ? '#191D24' : '#FAFAFA' }]}>
              <ThemedText style={[styles.title, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
                {t('login.welcomeBack')}
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: isDarkMode ? '#A8ADB4' : '#6B7280' }]}>
                {t('login.subtitleV2')}
              </ThemedText>

              {error ? (
                <ThemedText style={styles.errorMessage}>{error}</ThemedText>
              ) : null}

              <ThemedText style={[styles.fieldLabel, { color: isDarkMode ? '#C5CBD6' : '#4B5563' }]}>
                {t('login.usernameOrEmail')}
              </ThemedText>
              <View style={[styles.inputContainer, errors.username ? styles.inputError : null]}>
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}
                    placeholder={t('login.usernameOrEmailPlaceholder')}
                  placeholderTextColor={isDarkMode ? '#9AA2AF' : '#A0A5AD'}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text.toLowerCase());
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: '' }));
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username ? <ThemedText style={styles.errorText}>{errors.username}</ThemedText> : null}

              <View style={styles.passwordLabelRow}>
                <ThemedText style={[styles.fieldLabel, { color: isDarkMode ? '#C5CBD6' : '#4B5563' }]}>
                  {t('login.password.label')}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <ThemedText style={styles.forgotLink}>{t('login.forgotPassword')}</ThemedText>
                </TouchableOpacity>
              </View>

              <PasswordInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                placeholder={t('login.password.placeholder')}
                error={!!errors.password}
                style={styles.passwordInputContainerOverride}
              />
              {errors.password ? <ThemedText style={styles.errorText}>{errors.password}</ThemedText> : null}

              <TouchableOpacity
                style={[styles.signInButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#0F4BD7', '#4E7CFF']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <View style={styles.signInInner}>
                      <ThemedText style={styles.buttonText}>{t('login.signIn')}</ThemedText>
                      <Ionicons name="arrow-forward" size={20} color="#0B1B46" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: isDarkMode ? '#9AA2AF' : '#6B7280' }]}>
                {t('login.noAccount')}
              </ThemedText>
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => router.push('/(auth)/signup')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.signupText}>{t('login.signUp')}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 
