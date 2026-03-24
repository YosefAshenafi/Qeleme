import { StyleSheet, Dimensions, TouchableOpacity, View, Image, FlatList } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const listRef = useRef<FlatList<any>>(null);
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const onboardingSteps = useMemo(
    () => [
      {
        title: t('onboarding.welcome.title'),
        subtitle: t('onboarding.welcome.subtitle'),
        image: require('@/assets/images/onboarding/homework-blue.png'),
        description: t('onboarding.welcome.description'),
        cardColor: isDarkMode ? '#171A21' : '#FFFFFF',
      },
      {
        title: t('onboarding.mcq.title'),
        subtitle: t('onboarding.mcq.subtitle'),
        image: require('@/assets/images/onboarding/mcq-blue.png'),
        description: t('onboarding.mcq.description'),
        cardColor: isDarkMode ? '#171A21' : '#FFFFFF',
      },
      {
        title: t('onboarding.flashcards.title'),
        subtitle: t('onboarding.flashcards.subtitle'),
        image: require('@/assets/images/onboarding/flashcard-blue.png'),
        description: t('onboarding.flashcards.description'),
        cardColor: isDarkMode ? '#171A21' : '#FFFFFF',
      },
    ],
    [isDarkMode, t]
  );

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextIndex = currentStep + 1;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentStep(nextIndex);
    } else {
      router.push('/(auth)/welcome');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/welcome');
  };

  const handleDotPress = (index: number) => {
    if (index === currentStep || index < 0 || index > onboardingSteps.length - 1) return;
    listRef.current?.scrollToIndex({ index, animated: true });
    setCurrentStep(index);
  };

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentStep(index);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#0F1115' : '#F7F8FB' }]}>
      <View style={styles.container}>
        <View style={styles.languageToggleContainer}>
          <LanguageToggle colors={colors} />
        </View>

        <FlatList
          ref={listRef}
          data={onboardingSteps}
          keyExtractor={(_, index) => `onboarding-${index}`}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View style={styles.slide}>
              <View
                style={[
                  styles.imageCard,
                  { backgroundColor: item.cardColor },
                ]}
              >
                <Image
                  source={item.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textBlock}>
                <ThemedText style={styles.title}>{item.title}</ThemedText>
                <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
                <ThemedText style={[styles.description, { color: colors.text + 'B3' }]}>
                  {item.description}
                </ThemedText>
              </View>
            </View>
          )}
        />

        <View style={styles.bottomContainer}>
          <View style={styles.progressDots}>
            {onboardingSteps.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                style={[
                  styles.progressDot,
                  { backgroundColor: isDarkMode ? '#2A2F3A' : '#E5E7EB' },
                  index === currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.navigation}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <ThemedText style={styles.skipButtonText}>{t('onboarding.skip')}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <ThemedText style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1
                  ? t('onboarding.getStarted')
                  : t('onboarding.next')}
              </ThemedText>
              <IconSymbol name="chevron.right" size={20} color="#fff" />
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
    paddingVertical: 16,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 12,
    right: 20,
    zIndex: 4,
  },
  listContent: {
    flexGrow: 1,
  },
  slide: {
    width: SCREEN_WIDTH - 40,
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: 54,
    paddingBottom: 18,
  },
  imageCard: {
    width: '100%',
    height: '52%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    marginTop: 8,
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 22,
    color: '#0F4BD7',
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  bottomContainer: {
    paddingTop: 14,
    paddingBottom: 10,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingLeft: 4,
  },
  progressDot: {
    width: 9,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#0F4BD7',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F4BD7',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 22,
    minWidth: 170,
  },
  nextButtonText: {
    fontSize: 15,
    color: '#fff',
    marginRight: 6,
    fontWeight: '700',
  },
}); 