import { Dimensions, TouchableOpacity, View, Image, FlatList } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';

import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { OnboardingScreenStyles as styles } from './OnboardingScreen.styles';

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
