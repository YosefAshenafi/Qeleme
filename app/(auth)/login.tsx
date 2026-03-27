import { StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { storeAuthData } from '@/utils/authStorage';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { BASE_URL } from '@/config/constants';


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
                  source={require('@/assets/images/logo.png')}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    justifyContent: 'flex-start',
  },
  bgLettersLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  bgLetter: {
    position: 'absolute',
    fontSize: 360,
    fontWeight: '800',
    lineHeight: 360,
  },
  bgLetterLeft: {
    left: -52,
    top: 44,
    transform: [{ rotate: '-7deg' }],
  },
  bgLetterRight: {
    right: -78,
    bottom: -74,
    transform: [{ rotate: '7deg' }],
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 22,
    paddingTop: 34,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 6,
    left: 4,
    padding: 8,
    zIndex: 2,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 6,
    right: 4,
    zIndex: 2,
  },
  brand: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 100,
    height: 100,
    borderRadius: 18,
  },
  formContainer: {
    width: '100%',
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 30,
    marginBottom: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 30,
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    borderRadius: 14,
    backgroundColor: '#E9EAED',
    height: 60,
    paddingHorizontal: 18,
    justifyContent: 'center',
    marginBottom: 8,
  },
  input: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  passwordLabelRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotLink: {
    color: '#0F4BD7',
    fontSize: 14,
    fontWeight: '700',
  },
  passwordInputContainerOverride: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: '#E9EAED',
    borderWidth: 0,
    height: 60,
  },
  signInButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -2,
    marginBottom: 6,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
    zIndex: 1,
  },
  footerText: {
    fontSize: 16,
  },
  signupButton: {
    paddingVertical: 4,
  },
  signupText: {
    color: '#0F4BD7',
    fontSize: 16,
    fontWeight: '700',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
}); 
