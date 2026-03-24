import { StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Text } from 'react-native';
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
  
  let userData = null;
  
  try {
    // Construct userData from individual parameters
    userData = {
      phoneNumber: params.phoneNumber as string,
      fullName: params.fullName as string,
      username: params.username as string,
      password: params.password as string,
      grade: params.grade as string,
      region: params.region as string,
      role: params.role as string,
      numberOfChildren: parseInt(params.numberOfChildren as string) || 0,
      childrenData: params.childrenData ? JSON.parse(params.childrenData as string) : []
    };
  } catch (error) {
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
    if (userData?.phoneNumber && (canResend || timeLeft === 300) && !isLoading) {
      try {
        setIsLoading(true);
        setError(''); // Clear any previous errors
        
        const response = await sendOTP(userData.phoneNumber);
        console.log('[OTP] resend response:', response);
        
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

  const handleVerify = async () => {
    // Check if OTP is complete
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError(t('auth.otp.errors.incomplete'));
      return;
    }

    if (!userData?.phoneNumber) {
      setError(t('auth.otp.errors.invalidData'));
      return;
    }

    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors
      
      // Verify the OTP
      const response = await verifyOTP(userData.phoneNumber, otpString);
      console.log('[OTP] verify response:', response);
      
      if (response.success) {
        // OTP is valid, proceed to plan selection
        router.push({
          pathname: '/(auth)/plan-selection',
          params: {
            userData: encodeURIComponent(JSON.stringify(userData))
          }
        });
      } else {
        // OTP is invalid
        setError(response.message || t('auth.otp.errors.invalid'));
        // Clear the OTP inputs
        setOtp(['', '', '', '', '', '']);
        // Focus on first input
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError(t('auth.otp.errors.verificationFailed'));
      // Clear the OTP inputs
      setOtp(['', '', '', '', '', '']);
      // Focus on first input
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#101216' : '#F1F2F4' }]}>
        <View pointerEvents="none" style={styles.bgLettersLayer}>
          <Text style={[styles.bgLetter, styles.bgLetterLeft, { color: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.2)' }]}>M+</Text>
          <Text style={[styles.bgLetter, styles.bgLetterRight, { color: isDarkMode ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.16)' }]}>M</Text>
        </View>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  // Navigate back to signup form with pre-filled data
                  router.replace({
                    pathname: '/(auth)/signup',
                    params: {
                      prefillData: encodeURIComponent(JSON.stringify(userData)),
                      role: userData?.role || 'student',
                      numberOfChildren: userData?.numberOfChildren?.toString() || '1'
                    }
                  });
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.languageToggleContainer}>
                <LanguageToggle colors={colors} />
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: isDarkMode ? '#191D24' : '#FAFAFA' }]}>
              <ThemedText style={[styles.title, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>Check your device</ThemedText>
              <ThemedText style={[styles.subtitle, { color: isDarkMode ? '#A8ADB4' : '#6B7280' }]}>
                We've sent a 6-digit verification code. Enter the code below to continue.
              </ThemedText>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.otpInput,
                      {
                        backgroundColor: '#E9EAED',
                        borderColor: error ? '#EF4444' : '#E5E7EB',
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

              {error ? (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              ) : null}

              <TouchableOpacity 
                style={[
                  styles.verifyButton,
                  !isLoading && otp.join('').length === 6 && styles.verifyButtonActive
                ]}
                onPress={handleVerify}
                disabled={isLoading || otp.join('').length !== 6}
              >
                <LinearGradient
                  colors={['#0F4BD7', '#4E7CFF']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                >
                  <ThemedText style={styles.buttonText}>
                    {isLoading ? 'Verifying...' : 'Verify Identity'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <ThemedText style={[styles.resendText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>
                  Didn’t receive the code?
                </ThemedText>
                <TouchableOpacity 
                  onPress={handleResend} 
                  disabled={(!canResend && timeLeft !== 300) || isLoading}
                  style={[
                    styles.resendButtonContainer,
                    ((!canResend && timeLeft !== 300) || isLoading) && { opacity: 0.5 }
                  ]}
                >
                  <ThemedText style={styles.resendButton}>
                    {isLoading ? 'Sending...' : canResend ? 'Resend code' : `Resend in ${formatTime(timeLeft)}`}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 1,
  },
  header: {
    marginBottom: 16,
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
  card: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 26,
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 18,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    gap: 8,
  },
  otpInput: {
    width: 46,
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
    borderRadius: 30,
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
    color: '#F8FAFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'System',
  },
  resendContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    color: '#0F4BD7',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
  },
  resendButtonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
}); 