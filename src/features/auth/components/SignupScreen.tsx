import { TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useSignupForm } from '../hooks/useSignupForm';
import { useSignupValidation } from '../hooks/useSignupValidation';
import { useRegions } from '../hooks/useRegions';
import { GradePickerModal } from './GradePickerModal';
import { RegionPickerModal } from './RegionPickerModal';
import { TermsModal } from './TermsModal';
import { ThemedText } from '@/features/common/components/ThemedText';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { PasswordInput } from '@/features/common/components/ui/PasswordInput';
import { SignupScreenStyles as styles } from './SignupScreen.styles';
import { grades } from '@/features/common/constants/Grades';

export default function SignupScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const { formState, handlers, setters } = useSignupForm();
  const { regions } = useRegions();
  const { validateAllFields } = useSignupValidation(formState.usernameValid, formState.acceptTerms);

  const handleSubmit = async () => {
    setValidationErrors({});
    const validation = validateAllFields(
      formState.fullName,
      formState.phoneNumber,
      formState.username,
      formState.password,
      formState.confirmPassword,
      formState.grade,
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setters.setError(t('signup.errors.validationFailed'));
      return;
    }

    await handlers.handleSignup();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#101216' : '#F1F2F4' }]}>
      <View pointerEvents="none" style={styles.bgLettersLayer}>
        <Text style={[styles.bgLetter, styles.bgLetterLeft, { color: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.22)' }]}>MegaTest</Text>
        <Text style={[styles.bgLetter, styles.bgLetterRight, { color: isDarkMode ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.18)' }]}>M</Text>
      </View>
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(auth)/welcome')}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A0A0A5' : '#1F2937'} />
            </TouchableOpacity>
            <View style={styles.languageToggleContainer}>
              <LanguageToggle colors={colors} />
            </View>

            <View style={styles.header}>
              <ThemedText style={styles.stepLabel}>{t('signup.step')}</ThemedText>
              <ThemedText style={[styles.welcomeText, { color: colors.text }]}>{t('signup.accountDetails')}</ThemedText>
              <ThemedText style={[styles.subtitleText, { color: isDarkMode ? '#A8ADB4' : '#4B5563' }]}>
                {t('signup.accountDetailsSubtitle')}
              </ThemedText>
            </View>

            <View style={[styles.formContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                      borderColor: validationErrors.fullName ? '#F44336' : isDarkMode ? '#3C3C3E' : '#E5E7EB',
                    },
                  ]}
                >
                  <Ionicons name="settings-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t('signup.fullName')}
                    placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                    value={formState.fullName}
                    onChangeText={formState.setFullName}
                  />
                </View>
                {validationErrors.fullName ? (
                  <ThemedText style={[styles.errorText, { color: '#F44336' }]}>{validationErrors.fullName}</ThemedText>
                ) : null}

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                      borderColor: validationErrors.username || formState.usernameError ? '#F44336' : isDarkMode ? '#3C3C3E' : '#E5E7EB',
                    },
                  ]}
                >
                  <Ionicons name="at-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t('signup.username')}
                    placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                    value={formState.username}
                    onChangeText={handlers.handleUsernameChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                    keyboardAppearance={isDarkMode ? 'dark' : 'light'}
                  />
                  {formState.usernameChecking ? (
                    <Ionicons name="time-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  ) : null}
                  {formState.usernameValid === true ? (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.inputIcon} />
                  ) : null}
                  {formState.usernameValid === false ? (
                    <Ionicons name="close-circle" size={20} color="#F44336" style={styles.inputIcon} />
                  ) : null}
                </View>
                {(validationErrors.username || formState.usernameError) && (
                  <ThemedText style={[styles.errorText, { color: '#F44336' }]}>
                    {validationErrors.username || formState.usernameError}
                  </ThemedText>
                )}

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                      borderColor: validationErrors.phoneNumber ? '#F44336' : isDarkMode ? '#3C3C3E' : '#E5E7EB',
                    },
                  ]}
                >
                  <Ionicons name="call-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  <View style={styles.phoneInputContainer}>
                    <ThemedText style={[styles.phonePrefix, { color: colors.text }]}>+251</ThemedText>
                    <TextInput
                      style={[styles.phoneInput, { color: colors.text }]}
                      placeholder={t('signup.phoneNumber')}
                      placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
                      value={formState.phoneNumber}
                      onChangeText={handlers.handlePhoneChange}
                      keyboardType="phone-pad"
                      maxLength={9}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                {validationErrors.phoneNumber ? (
                  <ThemedText style={[styles.errorText, { color: '#F44336' }]}>{validationErrors.phoneNumber}</ThemedText>
                ) : null}

                <PasswordInput
                  value={formState.password}
                  onChangeText={formState.setPassword}
                  placeholder={t('signup.password')}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  keyboardAppearance={isDarkMode ? 'dark' : 'light'}
                  error={!!validationErrors.password}
                  errorMessage={validationErrors.password}
                />
                <PasswordInput
                  value={formState.confirmPassword}
                  onChangeText={formState.setConfirmPassword}
                  placeholder={t('signup.confirmPassword')}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  error={!!validationErrors.confirmPassword}
                  errorMessage={validationErrors.confirmPassword}
                />

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                      borderColor: validationErrors.grade ? '#F44336' : isDarkMode ? '#3C3C3E' : '#E5E7EB',
                    },
                  ]}
                >
                  <Ionicons name="school-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  <TouchableOpacity style={styles.dropdownButton} onPress={() => handlers.openGradeModal()}>
                    <ThemedText
                      style={[styles.input, { color: formState.grade ? colors.text : isDarkMode ? '#A0A0A5' : '#9CA3AF' }]}
                    >
                      {formState.grade ? grades.find((g) => g.value === formState.grade)?.label || t('signup.grade.label') : t('signup.grade.label')}
                    </ThemedText>
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} />
                  </TouchableOpacity>
                </View>
                {validationErrors.grade ? (
                  <ThemedText style={[styles.errorText, { color: '#F44336' }]}>{validationErrors.grade}</ThemedText>
                ) : null}

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
                      borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
                    },
                  ]}
                >
                  <Ionicons name="location-outline" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} style={styles.inputIcon} />
                  <TouchableOpacity style={styles.dropdownButton} onPress={() => handlers.openRegionModal()}>
                    <ThemedText
                      style={[styles.input, { color: formState.region ? colors.text : isDarkMode ? '#A0A0A5' : '#9CA3AF' }]}
                    >
                      {formState.region ? regions.find((r) => r.name === formState.region)?.name || t('signup.region.label') : t('signup.region.label')}
                    </ThemedText>
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#A0A0A5' : '#6B7280'} />
                  </TouchableOpacity>
                </View>
              </View>

              {formState.error ? (
                <View style={styles.errorContainer}>
                  <ThemedText style={styles.errorText}>{formState.error}</ThemedText>
                </View>
              ) : null}

              <View style={styles.termsContainer}>
                <Checkbox
                  value={formState.acceptTerms}
                  onValueChange={formState.setAcceptTerms}
                  color={formState.acceptTerms ? '#4F46E5' : undefined}
                  style={styles.checkbox}
                />
                <View style={styles.termsTextContainer}>
                  <ThemedText style={[styles.termsText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>{t('signup.terms.prefix')}</ThemedText>
                  <TouchableOpacity onPress={() => formState.setShowTermsModal(true)}>
                    <ThemedText style={styles.termsLink}>{t('signup.terms.link')}</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              {validationErrors.acceptTerms ? (
                <ThemedText style={[styles.errorText, { color: '#F44336' }]}>{validationErrors.acceptTerms}</ThemedText>
              ) : null}

              <TouchableOpacity
                style={[styles.signupButton, (!formState.acceptTerms || formState.isSubmitting) && styles.signupButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={!formState.acceptTerms || formState.isSubmitting}
              >
                <LinearGradient colors={['#0F4BD7', '#4E7CFF']} style={styles.buttonGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
                  <View style={styles.primaryActionInner}>
                    <ThemedText style={styles.buttonText}>
                      {formState.isSubmitting ? t('common.processing') : t('signup.continueToVerification')}
                    </ThemedText>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: isDarkMode ? '#A0A0A5' : '#6B7280' }]}>{t('signup.alreadyHaveAccount')}</ThemedText>
              <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')} activeOpacity={0.8}>
                <ThemedText style={styles.loginText}>{t('signup.signIn')}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GradePickerModal
        visible={formState.showGradeModal}
        onClose={() => formState.setShowGradeModal(false)}
        onSelect={handlers.handleGradeSelect}
        selectedChildIndex={null}
        selectedGrade={formState.grade}
      />

      <RegionPickerModal
        visible={formState.showRegionModal}
        onClose={() => formState.setShowRegionModal(false)}
        onSelect={handlers.handleRegionSelect}
        selectedChildIndex={null}
        selectedRegion={formState.region}
        regions={regions}
      />

      <TermsModal visible={formState.showTermsModal} onClose={() => formState.setShowTermsModal(false)} />
    </SafeAreaView>
  );
}
