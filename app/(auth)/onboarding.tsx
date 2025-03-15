import { StyleSheet, Dimensions, TouchableOpacity, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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
    gradient: ['#2C3E50', '#3498DB'] as const,
    description: 'Start your learning journey with personalized study materials and interactive exercises.',
  },
  {
    title: 'Practice with MCQs',
    subtitle: 'Test your knowledge',
    icon: 'questionmark.circle.fill',
    gradient: ['#8E44AD', '#9B59B6'] as const,
    description: 'Challenge yourself with multiple-choice questions and track your progress.',
  },
  {
    title: 'Master with Flashcards',
    subtitle: 'Review key concepts',
    icon: 'rectangle.stack.fill',
    gradient: ['#27AE60', '#2ECC71'] as const,
    description: 'Create and study with interactive flashcards to reinforce your learning.',
  },
  {
    title: 'Get Homework Help',
    subtitle: 'Expert assistance',
    icon: 'message.fill',
    gradient: ['#E67E22', '#F39C12'] as const,
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
      <LinearGradient
        colors={currentStepData.gradient}
        style={styles.gradient}
      >
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
                <View style={styles.iconContainer}>
                  <IconSymbol 
                    name={currentStepData.icon as any} 
                    size={80} 
                    color="#fff" 
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
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#fff',
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
}); 