import { StyleSheet, Dimensions, TouchableOpacity, View, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
  useAnimatedRef,
  useScrollViewOffset,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2; // 20% of screen width

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const progress = useSharedValue(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const translateX = useSharedValue(0);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const onboardingSteps = [
    {
      title: t('onboarding.welcome.title'),
      subtitle: t('onboarding.welcome.subtitle'),
      icon: 'house.fill',
      image: require('@/assets/images/logo/logo-icon-white.png'),
      description: t('onboarding.welcome.description'),
    },
    {
      title: t('onboarding.mcq.title'),
      subtitle: t('onboarding.mcq.subtitle'),
      icon: 'questionmark.circle.fill',
      image: require('@/assets/images/onboarding/mcq.png'),
      description: t('onboarding.mcq.description'),
    },
    {
      title: t('onboarding.flashcards.title'),
      subtitle: t('onboarding.flashcards.subtitle'),
      icon: 'rectangle.stack.fill',
      image: require('@/assets/images/onboarding/flashcard.png'),
      description: t('onboarding.flashcards.description'),
    },
    {
      title: t('onboarding.homework.title'),
      subtitle: t('onboarding.homework.subtitle'),
      icon: 'message.fill',
      image: require('@/assets/images/onboarding/homework.png'),
      description: t('onboarding.homework.description'),
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setDirection('right');
      setCurrentStep(prev => prev + 1);
      progress.value = withSpring((currentStep + 2) / onboardingSteps.length);
    } else {
      router.push('/(auth)/welcome');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/welcome');
  };

  const handleDotPress = (index: number) => {
    if (index === currentStep) return;
    setDirection(index > currentStep ? 'right' : 'left');
    setCurrentStep(index);
    progress.value = withSpring((index + 1) / onboardingSteps.length);
  };

  const handleGestureEvent = (event: any) => {
    if (event.nativeEvent && typeof event.nativeEvent.translationX === 'number') {
      translateX.value = event.nativeEvent.translationX;
    }
  };

  const handleGestureEnd = () => {
    const translationX = translateX.value;
    if (Math.abs(translationX) > SWIPE_THRESHOLD) {
      if (translationX > 0 && currentStep > 0) {
        // Swipe right - go to previous
        setDirection('right');
        setCurrentStep(prev => prev - 1);
        progress.value = withSpring(currentStep / onboardingSteps.length);
      } else if (translationX < 0 && currentStep < onboardingSteps.length - 1) {
        // Swipe left - go to next
        setDirection('left');
        setCurrentStep(prev => prev + 1);
        progress.value = withSpring((currentStep + 2) / onboardingSteps.length);
      }
    }
    translateX.value = withSpring(0);
  };

  const currentStepData = onboardingSteps[currentStep];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.languageToggleContainer}>
            <LanguageToggle colors={colors} />
          </View>
          {/* Content */}
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onEnded={handleGestureEnd}
            activeOffsetX={[-20, 20]}
            enabled={true}
          >
            <Animated.View 
              style={[styles.content, animatedStyle]}
              entering={direction === 'right' ? SlideInRight : SlideInLeft}
              exiting={direction === 'right' ? SlideOutLeft : SlideOutRight}
            >
              <View style={currentStep === 0 ? styles.logoContainer : styles.imageContainer}>
                <Image 
                  source={currentStepData.image}
                  style={currentStep === 0 ? styles.logoImage : styles.image}
                  resizeMode="contain"
                />
              </View>
              
              <ThemedText style={styles.title}>{currentStepData.title}</ThemedText>
              <ThemedText style={styles.subtitle}>{currentStepData.subtitle}</ThemedText>
              {currentStepData.description && (
                <ThemedText style={styles.description}>{currentStepData.description}</ThemedText>
              )}
            </Animated.View>
          </PanGestureHandler>

          {/* Navigation and Progress */}
          <View style={styles.bottomContainer}>
            <View style={styles.progressDots}>
              {onboardingSteps.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDotPress(index)}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.navigation}>
              <TouchableOpacity 
                style={styles.skipButton} 
                onPress={handleSkip}
              >
                <ThemedText style={styles.skipButtonText}>{t('onboarding.skip')}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={handleNext}
              >
                <ThemedText style={styles.nextButtonText}>
                  {currentStep === onboardingSteps.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
                </ThemedText>
                <IconSymbol 
                  name="chevron.right" 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -50,
    borderRadius: 20,
    padding: 20,
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderRadius: 20,
    padding: 20,
  },
  logoImage: {
    width: '180%',
    height: '180%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B54AE',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: -20,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    color: '#6B54AE',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    color: '#6B54AE',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
    lineHeight: 24,
  },
  bottomContainer: {
    paddingVertical: 20,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#6B54AE',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B54AE',
    opacity: 0.8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B54AE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
}); 