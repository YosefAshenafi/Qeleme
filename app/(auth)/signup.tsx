import { StyleSheet, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView, Modal, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const grades = [
    { label: 'Kindergarten', value: 'KG' },
    { label: 'Grade 1', value: '1' },
    { label: 'Grade 2', value: '2' },
    { label: 'Grade 3', value: '3' },
    { label: 'Grade 4', value: '4' },
    { label: 'Grade 5', value: '5' },
    { label: 'Grade 6', value: '6' },
    { label: 'Grade 7', value: '7' },
    { label: 'Grade 8', value: '8' },
    { label: 'Grade 9', value: '9' },
    { label: 'Grade 10', value: '10' },
    { label: 'Grade 11', value: '11' },
    { label: 'Grade 12', value: '12' },
    { label: 'University Student', value: 'UNI1' },
  ];

  const handleGradeSelect = (value: string) => {
    setGrade(value);
    setShowGradeModal(false);
  };

  const handleSignup = () => {
    // if (!acceptTerms) {
    //   return;
    // }
    // if (password !== confirmPassword) {
    //   return;
    // }
    // if (!fullName || !phoneNumber || !grade) {
    //   return;
    // }
    router.push('/(auth)/otp');
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
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Image 
                  source={require('@/assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <ThemedText style={styles.welcomeText}>Create Account</ThemedText>
                <ThemedText style={styles.subtitleText}>Join our community</ThemedText>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#9CA3AF"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      placeholderTextColor="#9CA3AF"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="school-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TouchableOpacity 
                      style={styles.dropdownButton}
                      onPress={() => setShowGradeModal(true)}
                    >
                      <ThemedText style={[styles.input, grade ? { color: '#1F2937' } : { color: '#9CA3AF' }]}>
                        {grade ? grades.find(g => g.value === grade)?.label || 'Select your grade' : 'Select your grade'}
                      </ThemedText>
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </TouchableOpacity>
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
                      <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                          <ThemedText style={styles.modalTitle}>Select Grade</ThemedText>
                          <TouchableOpacity onPress={() => setShowGradeModal(false)}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.gradeScrollView}>
                          {grades.map((item) => (
                            <TouchableOpacity
                              key={item.value}
                              style={[
                                styles.gradeOption,
                                grade === item.value && styles.gradeOptionSelected
                              ]}
                              onPress={() => handleGradeSelect(item.value)}
                            >
                              <ThemedText style={[
                                styles.gradeOptionText,
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
                </View>

                <View style={styles.termsContainer}>
                  <Checkbox
                    value={acceptTerms}
                    onValueChange={setAcceptTerms}
                    color={acceptTerms ? '#4F46E5' : undefined}
                    style={styles.checkbox}
                  />
                  <View style={styles.termsTextContainer}>
                    <ThemedText style={styles.termsText}>I accept the </ThemedText>
                    <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                      <ThemedText style={styles.termsLink}>Terms and Conditions</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms Modal */}
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
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <ThemedText style={styles.modalTitle}>Terms and Conditions</ThemedText>
                        <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                          <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      <ScrollView style={styles.termsModalContent}>
                        <ThemedText style={styles.termsModalText}>
                          {`1. Acceptance of Terms\n\nBy accessing and using the Qelem app, you agree to be bound by these Terms and Conditions.\n\n2. User Registration\n\nUsers must provide accurate and complete information during registration. Users are responsible for maintaining the confidentiality of their account credentials.\n\n3. Privacy Policy\n\nYour use of the app is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information.\n\n4. User Conduct\n\nUsers agree to:\n- Use the app for lawful purposes only\n- Respect other users' privacy and rights\n- Not share inappropriate or harmful content\n- Not attempt to disrupt the app's functionality\n\n5. Content\n\nUsers retain ownership of their content but grant us license to use it for app functionality.\n\n6. Termination\n\nWe reserve the right to terminate or suspend accounts that violate these terms.\n\n7. Changes to Terms\n\nWe may update these terms periodically. Continued use of the app constitutes acceptance of new terms.`}
                        </ThemedText>
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>

                <TouchableOpacity 
                  style={styles.signupButton} 
                  onPress={handleSignup}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={styles.buttonGradient}
                  >
                    <ThemedText style={styles.buttonText}>Create Account</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <ThemedText style={styles.footerText}>Already have an account?</ThemedText>
                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={() => router.push('/(auth)/login')}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.loginText}>Sign In</ThemedText>
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
}); 