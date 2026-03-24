import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function WelcomeScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/role-selection');
  };

  const handleBrowseAsGuest = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#101216' : '#F1F2F4' }]}>
      <View style={styles.container}>
        <View style={styles.languageToggleContainer}>
          <LanguageToggle colors={colors} />
        </View>

        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <ThemedText style={styles.brandIconText}>M+</ThemedText>
            </View>
            <ThemedText style={styles.brandText}>Mega+</ThemedText>
          </View>

          <View style={styles.textContainer}>
            <ThemedText style={[styles.headline, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
              {t('welcome.startYour')}
            </ThemedText>
            <ThemedText style={styles.headlineAccent}>{t('welcome.academic')}</ThemedText>
            <ThemedText style={[styles.headline, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
              {t('welcome.journey')}
            </ThemedText>
            <ThemedText style={[styles.subtitleText, { color: isDarkMode ? '#A8ADB4' : '#4B5563' }]}>
              {t('welcome.subtitleV2')}
            </ThemedText>
          </View>

          <View style={[styles.actionCard, { backgroundColor: isDarkMode ? '#191D24' : '#FAFAFA' }]}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} activeOpacity={0.9}>
              <ThemedText style={styles.primaryButtonText}>{t('welcome.createAccount')}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: isDarkMode ? '#2A313D' : '#E5E7EB' }]}
              onPress={handleSignIn}
              activeOpacity={0.9}
            >
              <ThemedText style={styles.secondaryButtonText}>{t('welcome.signIn')}</ThemedText>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#2C3340' : '#E5E7EB' }]} />
              <ThemedText style={[styles.dividerText, { color: isDarkMode ? '#8B93A3' : '#9CA3AF' }]}>
                {t('welcome.orExplore')}
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#2C3340' : '#E5E7EB' }]} />
            </View>

            <TouchableOpacity style={styles.guestAction} onPress={handleBrowseAsGuest} activeOpacity={0.8}>
              <ThemedText style={[styles.guestActionText, { color: isDarkMode ? '#E5E7EB' : '#111827' }]}>
                {t('welcome.browseAsGuest')}
              </ThemedText>
              <Ionicons name="arrow-forward" size={18} color={isDarkMode ? '#E5E7EB' : '#111827'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 12,
    right: 20,
    zIndex: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 42,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#0F4BD7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4BD7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  brandText: {
    color: '#0F4BD7',
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 48,
  },
  textContainer: {
    marginTop: 12,
    gap: 2,
  },
  headline: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
  },
  headlineAccent: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#0F4BD7',
  },
  subtitleText: {
    marginTop: 18,
    fontSize: 18,
    lineHeight: 30,
    maxWidth: '92%',
  },
  actionCard: {
    width: '100%',
    marginTop: 10,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 28,
    gap: 18,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F4BD7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4BD7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#F8FAFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    color: '#0F4BD7',
  },
  dividerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderRadius: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  guestAction: {
    marginTop: 4,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guestActionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
