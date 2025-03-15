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

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2; // 20% of screen width

const onboardingSteps = [
  {
    title: 'Welcome to Qelem',
    subtitle: 'Your personal learning companion',
    icon: 'house.fill',
    image: require('@/assets/images/logo/logo-icon-white.png'),
    description: 'Start your learning journey with personalized study materials and interactive exercises.',
  },
  {
    title: 'Practice with MCQs',
    subtitle: 'Test your knowledge',
    icon: 'questionmark.circle.fill',
    image: require('@/assets/images/onboarding/mcq.png'),
    description: 'Challenge yourself with multiple-choice questions and track your progress.',
  },
  {
    title: 'Master with Flashcards',
    subtitle: 'Review key concepts',
    icon: 'rectangle.stack.fill',
    image: require('@/assets/images/onboarding/flashcard.png'),
    description: 'Flip and study with interactive flashcards to reinforce your learning.',
  },
  {
    title: 'Get Homework Help',
    subtitle: 'Expert assistance',
    icon: 'message.fill',
    image: require('@/assets/images/onboarding/homework.png'),
    description: 'Connect with tutors and get help with your homework questions.',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const progress = useSharedValue(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const translateX = useSharedValue(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setDirection('right');
      setCurrentStep(prev => prev + 1);
      progress.value = withSpring((currentStep + 2) / onboardingSteps.length);
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
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
        setDirection('left');
        setCurrentStep(prev => prev - 1);
        progress.value = withSpring(currentStep / onboardingSteps.length);
      } else if (translationX < 0 && currentStep < onboardingSteps.length - 1) {
        // Swipe left - go to next
        setDirection('right');
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
                  style={ currentStep === 0 ? styles.logoImage : styles.image}
                  resizeMode="contain"
                />
              </View>
              
              <ThemedText style={styles.title}>{currentStepData.title}</ThemedText>
              <ThemedText style={styles.subtitle}>{currentStepData.subtitle}</ThemedText>
              <ThemedText style={styles.description}>{currentStepData.description}</ThemedText>
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
                <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={handleNext}
              >
                <ThemedText style={styles.nextButtonText}>
                  {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
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
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    marginBottom: 20,
    gap: 20,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#6B54AE',
    width: 24,
    borderRadius: 4,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    color: '#6B54AE',
    fontSize: 16,
    opacity: 0.8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B54AE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 