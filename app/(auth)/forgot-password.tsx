import { StyleSheet, TextInput, TouchableOpacity, View, Animated, Dimensions, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { sendOTP, verifyOTP } from '@/utils/otpService';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'verify' | 'reset'>('phone');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await sendOTP(phoneNumber);
      
      if (response.success) {
        setStep('verify');
      } else {
        setError(response.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await verifyOTP(phoneNumber, verificationCode);
      
      if (response.success) {
        setStep('reset');
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // TODO: Implement actual password reset API call
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.replace('/(auth)/login');
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputWrapper}>
        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }]}>
          <Ionicons name="call-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
          <View style={styles.phoneInputContainer}>
            <ThemedText style={[styles.phonePrefix, { color: colors.text }]}>+251</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('resetPassword.phoneNumber')}
              placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
              value={phoneNumber}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '').slice(0, 9);
                setPhoneNumber(numericValue);
                if (error) setError('');
              }}
              keyboardType="phone-pad"
              maxLength={9}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>
      </View>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      <TouchableOpacity 
        style={[styles.resetButton, isLoading && styles.buttonDisabled]} 
        onPress={handleSendCode}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.buttonGradient}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Sending...' : t('resetPassword.sendCode')}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputWrapper}>
        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }]}>
          <Ionicons name="key-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('resetPassword.verificationCode')}
            placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
            value={verificationCode}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '').slice(0, 6);
              setVerificationCode(numericValue);
              if (error) setError('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
          />
        </View>
      </View>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      <TouchableOpacity 
        style={[styles.resetButton, isLoading && styles.buttonDisabled]} 
        onPress={handleVerifyCode}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.buttonGradient}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Verifying...' : t('resetPassword.verifyCode')}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderResetStep = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputWrapper}>
        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }]}>
          <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('resetPassword.newPassword')}
            placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (error) setError('');
            }}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }]}>
          <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('resetPassword.confirmPassword')}
            placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (error) setError('');
            }}
            secureTextEntry
            editable={!isLoading}
          />
        </View>
      </View>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      <TouchableOpacity 
        style={[styles.resetButton, isLoading && styles.buttonDisabled]} 
        onPress={handleResetPassword}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.buttonGradient}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Resetting...' : t('resetPassword.resetPassword')}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000000', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.languageToggleContainer}>
          <LanguageToggle colors={colors} />
        </View>
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
              <ThemedText style={[styles.welcomeText, { color: colors.text }]}>{t('resetPassword.title')}</ThemedText>
              <ThemedText style={[styles.subtitleText, { color: colors.text + '80' }]}>
                {step === 'phone' && t('resetPassword.phoneSubtitle')}
                {step === 'verify' && t('resetPassword.verifySubtitle')}
                {step === 'reset' && t('resetPassword.resetSubtitle')}
              </ThemedText>
            </View>

            {step === 'phone' && renderPhoneStep()}
            {step === 'verify' && renderVerifyStep()}
            {step === 'reset' && renderResetStep()}

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.backButtonText, { color: colors.text + '80' }]}>{t('resetPassword.backToLogin')}</ThemedText>
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
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 80,
    right: 0,
    padding: 16,
    zIndex: 1,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    marginRight: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
}); 