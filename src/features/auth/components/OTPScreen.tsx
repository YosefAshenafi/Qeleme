import { TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { sendOTP, verifyOTP } from '@/features/common/utils/otpService';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/features/common/components/ThemedText';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { OTPScreenStyles as styles } from './OTPScreen.styles';

export default function OTPScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); 
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const params = useLocalSearchParams();
  
  let userData = null;
  
  try {
    userData = {
      phoneNumber: params.phoneNumber as string,
      fullName: params.fullName as string,
      username: params.username as string,
      password: params.password as string,
      grade: params.grade as string,
      region: params.region as string,
    };
  } catch {
    setError(t('auth.otp.error.invalidData'));
  }

  
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

  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError(''); 

    
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (userData?.phoneNumber && (canResend || timeLeft === 300) && !isLoading) {
      try {
        setIsLoading(true);
        setError(''); 
        
        const response = await sendOTP(userData.phoneNumber);
        
        if (response.success) {
          
          setTimeLeft(300);
          setCanResend(false);
        } else {
          setError(response.message || t('auth.otp.error.sendFailed'));
        }
      } catch {
        setError(t('auth.otp.error.sendFailedRetry'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    
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
      setError(''); 
      
      
      const response = await verifyOTP(userData.phoneNumber, otpString);
      
      if (response.success) {
        
        router.push({
          pathname: '/(auth)/plan-selection',
          params: {
            userData: encodeURIComponent(JSON.stringify(userData))
          }
        });
      } else {
        
        setError(response.message || t('auth.otp.errors.invalid'));
        
        setOtp(['', '', '', '', '', '']);
        
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(t('auth.otp.errors.verificationFailed'));
      
      setOtp(['', '', '', '', '', '']);
      
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#101216' : '#F1F2F4' }]}>
        <View pointerEvents="none" style={styles.bgLettersLayer}>
          <Text style={[styles.bgLetter, styles.bgLetterLeft, { color: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.2)' }]}>MegaTest</Text>
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
                  
                  router.replace({
                    pathname: '/(auth)/signup',
                    params: {
                      prefillData: encodeURIComponent(JSON.stringify(userData)),
                    },
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
              <ThemedText style={[styles.title, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>{t('auth.otp.checkDevice')}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: isDarkMode ? '#A8ADB4' : '#6B7280' }]}>
                {t('auth.otp.otpSent')}
              </ThemedText>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
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
                    {isLoading ? t('auth.otp.verifying') : t('auth.otp.verifyIdentity')}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <ThemedText style={[styles.resendText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>
                  {t('auth.otp.resend.text')}
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
                    {isLoading ? t('auth.otp.resend.sending') : canResend ? t('auth.otp.resend.resendCode') : `${t('auth.otp.resend.resendIn')} ${formatTime(timeLeft)}`}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
} 
