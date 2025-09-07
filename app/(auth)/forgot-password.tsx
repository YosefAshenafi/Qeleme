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
import { PasswordInput } from '@/components/ui/PasswordInput';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'verify' | 'reset'>('phone');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inputRefs = useRef<Array<TextInput | null>>([]);

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

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setCanResend(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        setTimeLeft(300);
        setCanResend(false);
      } else {
        setError(response.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError(''); // Clear any previous error

    // Move to next input if value is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (phoneNumber && (canResend || timeLeft === 300) && !isLoading) {
      try {
        setIsLoading(true);
        setError(''); // Clear any previous errors
        
        const response = await sendOTP(phoneNumber);
        
        if (response.success) {
          // Start timer and disable resend
          setTimeLeft(300);
          setCanResend(false);
        } else {
          setError(response.message || 'Failed to send OTP');
        }
      } catch (error) {
        setError('Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = otp.join('');
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
      
      // TODO: Replace with actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT_HERE/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          verificationCode: otp.join(''),
          newPassword: newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Password reset successful
        router.replace('/(auth)/login');
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
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
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              {
                backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                borderColor: error ? '#EF4444' : (isDarkMode ? '#3C3C3E' : '#E5E7EB'),
                color: colors.text
              }
            ]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoFocus={index === 0}
            placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
            editable={!isLoading}
          />
        ))}
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <ThemedText style={[styles.timerText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>
          {t('resetPassword.timer.text')} {formatTime(timeLeft)}
        </ThemedText>
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

      <View style={styles.resendContainer}>
        <ThemedText style={[styles.resendText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>
          {timeLeft === 300 ? t('resetPassword.send.text') : t('resetPassword.resend.text')}
        </ThemedText>
        <TouchableOpacity 
          onPress={handleResend} 
          disabled={(!canResend && timeLeft !== 300) || isLoading}
          style={[
            styles.resendButtonContainer,
            ((!canResend && timeLeft !== 300) || isLoading) && { opacity: 0.5 }
          ]}
        >
          <ThemedText style={[
            styles.resendButton, 
            { color: (canResend || timeLeft === 300) ? '#4F46E5' : (isDarkMode ? '#A0A0A5' : '#6B7280') }
          ]}>
            {isLoading ? t('common.loading') : 
             timeLeft === 300 ? t('resetPassword.send.button') : 
             canResend ? t('resetPassword.resend.button') : 
             formatTime(timeLeft)}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResetStep = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputWrapper}>
        <PasswordInput
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (error) setError('');
          }}
          placeholder={t('resetPassword.newPassword')}
          editable={!isLoading}
          textContentType="newPassword"
        />

        <PasswordInput
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (error) setError('');
          }}
          placeholder={t('resetPassword.confirmPassword')}
          editable={!isLoading}
          textContentType="newPassword"
        />
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
}); 