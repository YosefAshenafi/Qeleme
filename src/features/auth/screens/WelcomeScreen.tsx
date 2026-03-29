import { TouchableOpacity, View, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/shared/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/shared/components/ThemedText';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { WelcomeScreenStyles as styles } from './WelcomeScreen.styles';

export default function WelcomeScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
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
            <Image
              source={require('../../../../assets/images/logo.png')}
              style={styles.brandIcon}
              resizeMode="contain"
            />
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
