import { StyleSheet, TextInput, TouchableOpacity, View, Animated, Dimensions, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');

// Phone number validation regex for Ethiopian numbers
// Matches formats: +251912345678, 0912345678, 251912345678
const PHONE_REGEX = /^(?:\+251|0|251)?([9][0-9]{8})$/;

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    phoneNumber: '',
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

  const validatePhoneNumber = (phone: string) => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    if (!PHONE_REGEX.test(phone)) {
      return 'Please enter a valid Ethiopian phone number';
    }
    return '';
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      phoneNumber: '',
      password: ''
    };

    // Validate phone number
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const formatPhoneNumber = (text: string) => {
    // Remove any non-digit characters except plus sign
    const cleaned = text.replace(/[^\d+]/g, '');
    
    // Ensure only one plus sign at the start
    if (cleaned.startsWith('+')) {
      return '+' + cleaned.substring(1).replace(/\+/g, '');
    }
    return cleaned;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      // Store the phone number
      await AsyncStorage.setItem('userPhoneNumber', phoneNumber);
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient
      colors={['#F8F9FA', '#FFFFFF']}
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
              <ThemedText style={styles.welcomeText}>Welcome to Qelem</ThemedText>
              <ThemedText style={styles.subtitleText}>Empowering minds, one lesson at a time</ThemedText>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <View style={[styles.inputContainer, errors.phoneNumber ? styles.inputError : null]}>
                  <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number (e.g., +251912345678)"
                    placeholderTextColor="#9CA3AF"
                    value={phoneNumber}
                    onChangeText={(text) => {
                      const formatted = formatPhoneNumber(text);
                      setPhoneNumber(formatted);
                      if (errors.phoneNumber) {
                        setErrors(prev => ({ ...prev, phoneNumber: '' }));
                      }
                    }}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    maxLength={13}
                  />
                </View>
                {errors.phoneNumber ? (
                  <ThemedText style={styles.errorText}>{errors.phoneNumber}</ThemedText>
                ) : null}

                <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
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
                style={styles.loginButton} 
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  <ThemedText style={styles.buttonText}>Sign In</ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.forgotButton} 
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <ThemedText style={styles.forgotPassword}>Forgot password?</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Don't have an account?</ThemedText>
              <TouchableOpacity 
                style={styles.signupButton} 
                onPress={() => router.push('/(auth)/signup')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.signupText}>Sign Up</ThemedText>
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
}); 