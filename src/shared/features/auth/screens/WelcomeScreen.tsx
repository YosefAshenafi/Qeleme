import { TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#0F172A' : '#FAF8FF' }]}>
      <View style={styles.container}>
        <View style={styles.languageToggleContainer}>
          <LanguageToggle colors={colors} />
        </View>

        <View style={styles.content}>
          <View>
            <View style={styles.brandRow}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.brandIcon}
                resizeMode="cover"
              />
            </View>

            <View style={styles.textContainer}>
              <ThemedText style={[styles.headline, { color: isDarkMode ? '#FFFFFF' : '#131B2E' }]}>
                {t('welcome.startYour')}
              </ThemedText>
              <ThemedText style={[styles.headlineAccent, { color: isDarkMode ? '#B7C4FF' : '#003EC8' }]}>{t('welcome.academic')}</ThemedText>
              <ThemedText style={[styles.headline, { color: isDarkMode ? '#FFFFFF' : '#131B2E' }]}>
                {t('welcome.journey')}
              </ThemedText>
              <ThemedText style={[styles.subtitleText, { color: isDarkMode ? '#C3C5D9' : '#434656' }]}>
                {t('welcome.subtitleV2')}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.actionCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <TouchableOpacity style={styles.primaryButtonContainer} onPress={handleSignUp} activeOpacity={0.9}>
              <LinearGradient
                colors={isDarkMode ? ['#2356EE', '#003EC8'] : ['#003EC8', '#2356EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <ThemedText style={styles.primaryButtonText}>{t('welcome.createAccount')}</ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: isDarkMode ? '#334155' : '#F2F3FF' }]}
              onPress={handleSignIn}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.secondaryButtonText, { color: isDarkMode ? '#FFFFFF' : '#003EC8' }]}>{t('welcome.signIn')}</ThemedText>
            </TouchableOpacity>

            {/* Guest user option disabled
            <TouchableOpacity style={styles.guestAction} onPress={handleBrowseAsGuest} activeOpacity={0.7}>
              <ThemedText style={[styles.guestActionText, { color: isDarkMode ? '#E2E8F0' : '#434656' }]}>
                {t('welcome.browseAsGuest')}
              </ThemedText>
              <Ionicons name="arrow-forward" size={18} color={isDarkMode ? '#E2E8F0' : '#434656'} />
            </TouchableOpacity>
            */}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
