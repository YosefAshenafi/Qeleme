import { StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { sendOTP, verifyOTP } from '@/utils/otpService';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function OTPScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const params = useLocalSearchParams();
  
  console.log('OTP Screen - Received params:', params);
  
  let userData = null;
  
  try {
    // Construct userData from individual parameters
    userData = {
      phoneNumber: params.phoneNumber as string,
      fullName: params.fullName as string,
      username: params.username as string,
      password: params.password as string,
      grade: params.grade as string,
      role: params.role as string,
      numberOfChildren: parseInt(params.numberOfChildren as string) || 0,
      childrenData: params.childrenData ? JSON.parse(params.childrenData as string) : []
    };
    console.log('OTP Screen - Constructed userData:', userData);
  } catch (error) {
    console.error('Error constructing userData:', error);
    setError('Invalid user data. Please try again.');
  }

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

  // Auto-send OTP on component mount
  useEffect(() => {
    const sendInitialOTP = async () => {
      if (userData?.phoneNumber) {
        try {
          console.log('Auto-sending initial OTP to:', userData.phoneNumber);
          setIsLoading(true);
          const response = await sendOTP(userData.phoneNumber);
          if (response.success) {
            console.log('Initial OTP sent successfully');
            setError('');
          } else {
            console.error('Failed to send initial OTP:', response.message);
            setError(response.message || 'Failed to send OTP');
          }
        } catch (error) {
          console.error('Error sending initial OTP:', error);
          setError('Failed to send OTP. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    sendInitialOTP();
  }, [userData?.phoneNumber]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    if (userData?.phoneNumber && canResend && !isLoading) {
      try {
        setIsLoading(true);
        setError(''); // Clear any previous errors
        
        console.log('Resending OTP to:', userData.phoneNumber);
        const response = await sendOTP(userData.phoneNumber);
        
        if (response.success) {
          // Reset timer and disable resend
          setTimeLeft(300);
          setCanResend(false);
          console.log('OTP resent successfully');
        } else {
          setError(response.message || 'Failed to resend OTP');
          console.error('Failed to resend OTP:', response.message);
        }
      } catch (error) {
        console.error('Resend OTP error:', error);
        setError('Failed to resend OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (!enteredOtp) {
      setError('Please enter the OTP');
      return;
    }

    if (!userData) {
      setError('User data is missing. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyOTP(userData.phoneNumber, enteredOtp);
      
      if (response.success) {
        // Navigate to plan selection after successful OTP verification
        router.push({
          pathname: '/(auth)/plan-selection',
          params: {
            userData: encodeURIComponent(JSON.stringify(userData))
          }
        });
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.background]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.languageToggleContainer}>
                <LanguageToggle colors={colors} />
              </View>
              <ThemedText style={[styles.title, { color: colors.text }]}>{t('auth.otp.title')}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>
                {t('auth.otp.subtitle')}
              </ThemedText>
            </View>

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
                {t('auth.otp.timer.text')} {formatTime(timeLeft)}
              </ThemedText>
            </View>

            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}

            <TouchableOpacity 
              style={[
                styles.verifyButton,
                otp.join('').length === 6 && !isLoading && styles.verifyButtonActive
              ]}
              onPress={handleVerify}
              disabled={otp.join('').length !== 6 || isLoading}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.buttonGradient}
              >
                <ThemedText style={styles.buttonText}>
                  {isLoading ? 'Verifying...' : t('auth.otp.verify')}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <ThemedText style={[styles.resendText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>
                {t('auth.otp.resend.text')}
              </ThemedText>
              <TouchableOpacity 
                onPress={handleResend} 
                disabled={!canResend || isLoading}
                style={[
                  styles.resendButtonContainer,
                  (!canResend || isLoading) && { opacity: 0.5 }
                ]}
              >
                <ThemedText style={[
                  styles.resendButton, 
                  { color: canResend ? '#4F46E5' : (isDarkMode ? '#A0A0A5' : '#6B7280') }
                ]}>
                  {isLoading ? 'Sending...' : canResend ? t('auth.otp.resend.button') : formatTime(timeLeft)}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
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
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: 8,
    marginRight: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 0.5,
  },
  verifyButtonActive: {
    opacity: 1,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 