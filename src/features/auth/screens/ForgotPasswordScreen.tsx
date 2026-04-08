import {
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/constants/Colors';
import { BASE_URL } from '@/config/constants';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ForgotPasswordScreenStyles as styles } from './ForgotPasswordScreen.styles';

/** Design primary blue for this screen */
const PRIMARY_BLUE = '#2451DE';
const PRIMARY_BLUE_END = '#3D6EF0';

const PHONE_REGEX = /^(?:\+251|0|251)?([9][0-9]{8})$/;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetLink = async () => {
    const digits = phoneNumber.replace(/[^0-9]/g, '');
    if (!digits.length) {
      setError(t('recoverAccess.errors.phoneRequired'));
      return;
    }
    const fullPhone = `+251${digits}`;
    if (!PHONE_REGEX.test(fullPhone)) {
      setError(t('recoverAccess.errors.phoneInvalid'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok && response.status !== 404) {
        const msg = data?.message || t('recoverAccess.errors.requestFailed');
        setError(typeof msg === 'string' ? msg : t('recoverAccess.errors.requestFailed'));
        return;
      }

      Alert.alert(t('recoverAccess.successTitlePhone'), t('recoverAccess.successMessagePhone'), [
        { text: t('common.ok'), onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch {
      setError(t('recoverAccess.errors.network'));
    } finally {
      setIsLoading(false);
    }
  };

  const pageBg = isDarkMode ? '#101216' : '#F1F2F4';
  const watermarkColor = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(36, 81, 222, 0.06)';
  const headingColor = isDarkMode ? '#F3F4F6' : '#2D2D2D';
  const subtitleColor = isDarkMode ? '#A8ADB4' : '#6B7280';
  const labelColor = isDarkMode ? '#9CA3AF' : '#9CA3AF';
  const inputBg = isDarkMode ? '#1A1F28' : '#FFFFFF';
  const inputBorder = isDarkMode ? '#2D3544' : '#E5E7EB';
  const shieldCardBg = isDarkMode ? '#191D24' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
      <View pointerEvents="none" style={styles.bgLettersLayer}>
        <Text style={[styles.bgLetter, styles.bgLetterCenter, { color: watermarkColor }]}>MegaTest</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <View style={styles.languageToggleContainer}>
              <LanguageToggle colors={colors} />
            </View>
          </View>

          <View style={styles.brandRow}>
            <ThemedText style={styles.brandText}>MegaTest</ThemedText>
          </View>

          <View style={[styles.shieldCard, { backgroundColor: shieldCardBg }]}>
            <View style={styles.shieldInner}>
              <Ionicons name="checkmark" size={30} color="#FFFFFF" />
            </View>
          </View>

          <ThemedText style={[styles.headline, { color: headingColor }]}>
            {t('recoverAccess.title')}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
            {t('recoverAccess.subtitlePhone')}
          </ThemedText>

          <ThemedText style={[styles.phoneFieldLabel, styles.formStart, { color: labelColor }]}>
            {t('recoverAccess.phoneLabel')}
          </ThemedText>

          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: inputBg,
                borderColor: error ? '#EF4444' : inputBorder,
              },
            ]}
          >
            <Ionicons name="call-outline" size={22} color={isDarkMode ? '#6B7280' : '#9CA3AF'} style={styles.inputIcon} />
            <View style={styles.phoneInputContainer}>
              <ThemedText style={[styles.phonePrefix, { color: colors.text }]} selectable>
                +251
              </ThemedText>
              <TextInput
                style={[styles.phoneInput, { color: colors.text }]}
                placeholder={t('signup.phoneNumber')}
                placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
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

          {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleSendResetLink}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[PRIMARY_BLUE, PRIMARY_BLUE_END]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? t('common.loading') : t('recoverAccess.sendCode')}
              </ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <ThemedText style={[styles.footerPrefix, { color: headingColor }]}>
              {t('recoverAccess.footerPrefix')}{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
              <Text style={styles.footerLink}>{t('recoverAccess.returnToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
