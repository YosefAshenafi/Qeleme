import { StyleSheet, TextInput, TouchableOpacity, View, Animated, Dimensions, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

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

  const handleSendCode = () => {
    // TODO: Implement send verification code logic
    setStep('verify');
  };

  const handleVerifyCode = () => {
    // TODO: Implement verify code logic
    setStep('reset');
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      // TODO: Show error message
      return;
    }
    // TODO: Implement reset password logic
    router.replace('/(auth)/login');
  };

  const renderPhoneStep = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputWrapper}>
        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }]}>
          <Ionicons name="call-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('resetPassword.phoneNumber')}
            placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={handleSendCode}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.buttonGradient}
        >
          <ThemedText style={styles.buttonText}>{t('resetPassword.sendCode')}</ThemedText>
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
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={handleVerifyCode}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.buttonGradient}
        >
          <ThemedText style={styles.buttonText}>{t('resetPassword.verifyCode')}</ThemedText>
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
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB' }]}>
          <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('resetPassword.confirmPassword')}
            placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={handleResetPassword}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.buttonGradient}
        >
          <ThemedText style={styles.buttonText}>{t('resetPassword.resetPassword')}</ThemedText>
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
}); 