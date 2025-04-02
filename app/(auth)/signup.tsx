import { StyleSheet, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView, Modal, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { sendOTP } from '@/utils/otpService';
import { grades, Grade } from '@/constants/Grades';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';

export default function SignupScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState<Grade | ''>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleGradeSelect = (value: string) => {
    setGrade(value as Grade);
    setShowGradeModal(false);
  };

  const handleSignup = async () => {
    if (!acceptTerms) {
      return;
    }
    if (password !== confirmPassword) {
      return;
    }
    if (!fullName || !phoneNumber || !grade) {
      return;
    }

    const formattedPhoneNumber = `+251${phoneNumber}`;

    try {
      const response = await sendOTP(formattedPhoneNumber);
      
      if (response.success && response.otp) {
        // Pass user data and OTP to the verification screen
        router.push({
          pathname: '/(auth)/otp',
          params: {
            otp: response.otp,
            userData: JSON.stringify({
              fullName,
              phoneNumber: formattedPhoneNumber,
              password,
              grade
            })
          }
        });
      } else {
        // For testing: Use a default OTP if server fails
        console.warn('Using default OTP for testing as server response failed');
        router.push({
          pathname: '/(auth)/otp',
          params: {
            otp: '102132',
            userData: JSON.stringify({
              fullName,
              phoneNumber: formattedPhoneNumber,
              password,
              grade
            })
          }
        });
      }
    } catch (error) {
      // For testing: Use the same default OTP if server is unreachable
      console.warn('Using default OTP for testing as server is unreachable');
      router.push({
        pathname: '/(auth)/otp',
        params: {
          otp: '102132',
          userData: JSON.stringify({
            fullName,
            phoneNumber: formattedPhoneNumber,
            password,
            grade
          })
        }
      });
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? -64 : 0}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Image 
                  source={require('@/assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <ThemedText style={[styles.welcomeText, { color: colors.text }]}>{t('signup.title')}</ThemedText>
                <ThemedText style={[styles.subtitleText, { color: colors.text + '80' }]}>{t('signup.subtitle')}</ThemedText>
              </View>

              <View style={[styles.formContainer, {
                backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
              }]}>
                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, {
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                    borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                  }]}>
                    <Ionicons name="person-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={t('signup.fullName')}
                      placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={[styles.inputContainer, {
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                    borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                  }]}>
                    <Ionicons name="call-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                    <View style={styles.phoneInputContainer}>
                      <ThemedText style={[styles.phonePrefix, { color: colors.text }]}>+251</ThemedText>
                      <TextInput
                        style={[styles.phoneInput, { color: colors.text }]}
                        placeholder={t('signup.phoneNumber')}
                        placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                        value={phoneNumber}
                        onChangeText={(text) => {
                          const numericValue = text.replace(/[^0-9]/g, '').slice(0, 9);
                          setPhoneNumber(numericValue);
                        }}
                        keyboardType="phone-pad"
                        maxLength={9}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputContainer, {
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                    borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                  }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={t('signup.password')}
                      placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      textContentType="oneTimeCode"
                      keyboardType="default"
                      keyboardAppearance={isDarkMode ? 'dark' : 'light'}
                    />
                  </View>

                  <View style={[styles.inputContainer, {
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                    borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                  }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={t('signup.confirmPassword')}
                      placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>

                  <View style={[styles.inputContainer, {
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                    borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                  }]}>
                    <Ionicons name="school-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                    <TouchableOpacity 
                      style={styles.dropdownButton}
                      onPress={() => setShowGradeModal(true)}
                    >
                      <ThemedText style={[styles.input, { color: grade ? colors.text : (isDarkMode ? '#A0A0A5' : '#9CA3AF') }]}>
                        {grade ? grades.find(g => g.value === grade)?.label || t('signup.grade.label') : t('signup.grade.label')}
                      </ThemedText>
                      <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.termsContainer}>
                  <Checkbox
                    value={acceptTerms}
                    onValueChange={setAcceptTerms}
                    color={acceptTerms ? '#4F46E5' : undefined}
                    style={styles.checkbox}
                  />
                  <View style={styles.termsTextContainer}>
                    <ThemedText style={[styles.termsText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>{t('signup.terms.prefix')}</ThemedText>
                    <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                      <ThemedText style={styles.termsLink}>{t('signup.terms.link')}</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <Modal
                  visible={showGradeModal}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowGradeModal(false)}
                >
                  <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setShowGradeModal(false)}
                  >
                    <View style={[styles.modalContent, {
                      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
                    }]}>
                      <View style={[styles.modalHeader, {
                        borderBottomColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                      }]}>
                        <ThemedText style={[styles.modalTitle, { color: colors.text }]}>{t('signup.grade.title')}</ThemedText>
                        <TouchableOpacity onPress={() => setShowGradeModal(false)}>
                          <Ionicons name="close" size={24} color={isDarkMode ? '#A0A0A5' : '#6B7280'} />
                        </TouchableOpacity>
                      </View>
                      <ScrollView style={styles.gradeScrollView}>
                        {grades.map((item) => (
                          <TouchableOpacity
                            key={item.value}
                            style={[
                              styles.gradeOption,
                              grade === item.value && [styles.gradeOptionSelected, {
                                backgroundColor: isDarkMode ? '#2C2C2E' : '#EEF2FF'
                              }]
                            ]}
                            onPress={() => handleGradeSelect(item.value)}
                          >
                            <ThemedText style={[
                              styles.gradeOptionText,
                              { color: isDarkMode ? colors.text : '#1F2937' },
                              grade === item.value && styles.gradeOptionTextSelected
                            ]}>
                              {item.label}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>

                <Modal
                  visible={showTermsModal}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowTermsModal(false)}
                >
                  <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setShowTermsModal(false)}
                  >
                    <View style={[styles.modalContent, {
                      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
                    }]}>
                      <View style={[styles.modalHeader, {
                        borderBottomColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                      }]}>
                        <ThemedText style={[styles.modalTitle, { color: colors.text }]}>{t('signup.terms.title')}</ThemedText>
                        <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                          <Ionicons name="close" size={24} color={isDarkMode ? '#A0A0A5' : '#6B7280'} />
                        </TouchableOpacity>
                      </View>
                      <ScrollView style={styles.termsModalContent}>
                        <ThemedText style={[styles.termsModalText, { color: colors.text }]}>
                          {t('signup.terms.content')}
                        </ThemedText>
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>

                <TouchableOpacity 
                  style={[styles.signupButton, !acceptTerms && styles.signupButtonDisabled]} 
                  onPress={handleSignup}
                  activeOpacity={0.8}
                  disabled={!acceptTerms}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={styles.buttonGradient}
                  >
                    <ThemedText style={styles.buttonText}>{t('signup.createAccount')}</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <ThemedText style={[styles.footerText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>{t('signup.alreadyHaveAccount')}</ThemedText>
                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={() => router.push('/(auth)/login')}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.loginText}>{t('signup.signIn')}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 120 : 80,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoImage: {
    width: 350,
    height: 350,
    marginBottom: -100,
    marginTop: -130,
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
    marginBottom: 20,
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
  picker: {
    marginLeft: -12,
    marginRight: Platform.OS === 'ios' ? -40 : -20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  termsTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  termsLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
    textDecorationLine: 'none',
  },
  signupButton: {
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
  signupButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
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
    marginTop: 20,
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
  loginButton: {
    paddingVertical: 4,
  },
  loginText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 24,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  gradeScrollView: {
    maxHeight: 400,
  },
  gradeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  gradeOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  gradeOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  gradeOptionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  termsModalContent: {
    marginTop: 16,
    paddingRight: 8,
  },
  termsModalText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phonePrefix: {
    fontSize: 16,
    color: '#1F2937',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1F2937',
  },
}); 