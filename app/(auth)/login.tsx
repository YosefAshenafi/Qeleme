import { StyleSheet, TextInput, TouchableOpacity, View, Animated, Dimensions, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { storeAuthData } from '@/utils/authStorage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { BASE_URL } from '@/config/constants';


const { width, height } = Dimensions.get('window');

// Username validation regex
// Allows letters, numbers, and underscores, 3-20 characters
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

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

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      return t('login.username.error.required');
    }
    if (!USERNAME_REGEX.test(username)) {
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
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.push('/(auth)/welcome')}
              >
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A0A0A5' : '#1F2937'} />
              </TouchableOpacity>
              <View style={styles.languageToggleContainer}>
                <LanguageToggle colors={colors} />
              </View>
              <Image 
                source={require('@/assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <ThemedText style={[styles.welcomeText, { color: colors.text }]}>{t('login.welcome')}</ThemedText>
              <ThemedText style={[styles.subtitleText, { color: colors.text + '80' }]}>{t('login.subtitle')}</ThemedText>
            </View>

            <View style={[styles.formContainer, {
              backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            }]}>
              {error ? (
                <ThemedText style={styles.errorMessage}>{error}</ThemedText>
              ) : null}

              <View style={styles.inputWrapper}>
                <View style={[
                  styles.inputContainer, 
                  errors.username ? styles.inputError : null,
                  { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }
                ]}>
                  <Ionicons name="at-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t('login.username.placeholder')}
                    placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
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
                {errors.username ? (
                  <ThemedText style={styles.errorText}>{errors.username}</ThemedText>
                ) : null}

                <View style={[
                  styles.inputContainer, 
                  errors.password ? styles.inputError : null,
                  { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }
                ]}>
                  <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t('login.password.placeholder')}
                    placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    secureTextEntry
                  />
                </View>
                {errors.password ? (
                  <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
                ) : null}
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.buttonText}>{t('login.signIn')}</ThemedText>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.forgotButton} 
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <ThemedText style={[styles.forgotPassword, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>{t('login.forgotPassword')}</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>{t('login.noAccount')}</ThemedText>
              <TouchableOpacity 
                style={styles.signupButton} 
                onPress={() => router.push('/(auth)/role-selection')}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.signupText, { color: '#4F46E5' }]}>{t('login.signUp')}</ThemedText>
              </TouchableOpacity>
            </View>
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
    width: 300,
    height: 300,
    marginBottom: -80,
    marginTop: -120,
  },
  welcomeText: {
    paddingTop: 10,
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
  inputWrapper: {
    gap: 16,
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
  loginButton: {
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
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPassword: {
    color: '#6B7280',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupButton: {
    paddingVertical: 4,
  },
  signupText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  backButton: {
    position: 'absolute',
    top: -20,
    left: -20,
    padding: 8,
    zIndex: 1,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    zIndex: 1,
  },
}); 