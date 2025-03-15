import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Sample flashcard data - replace with your actual data
const flashcards = [
  {
    id: 1,
    question: "What is React Native?",
    answer: "React Native is a framework for building native mobile applications using React and JavaScript."
  },
  {
    id: 2,
    question: "What is Expo?",
    answer: "Expo is a framework and platform built around React Native that helps you develop, build, deploy, and quickly iterate on iOS, Android, and web apps."
  },
  {
    id: 3,
    question: "What is TypeScript?",
    answer: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript, adding optional static types to the language."
  }
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function FlashcardsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const revealAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  useEffect(() => {
    // Initialize progress animation when component mounts
    progressAnimation.value = withTiming((1 / flashcards.length) * 100);
  }, []);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [0, 180]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);
    const shadowOffset = interpolate(revealAnimation.value, [0, 0.5, 1], [2, 20, 2]);
    
    return {
      transform: [
        { perspective: 2000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      shadowOpacity,
      shadowOffset: { width: 0, height: shadowOffset },
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [180, 360]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);
    const shadowOffset = interpolate(revealAnimation.value, [0, 0.5, 1], [2, 20, 2]);
    
    return {
      transform: [
        { perspective: 2000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      shadowOpacity,
      shadowOffset: { width: 0, height: shadowOffset },
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value}%`,
    };
  });

  const handleReveal = () => {
    setIsRevealed(!isRevealed);
    revealAnimation.value = withSpring(isRevealed ? 0 : 1, {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    });
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
      progressAnimation.value = withTiming(((currentIndex + 2) / flashcards.length) * 100);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
      progressAnimation.value = withTiming((currentIndex / flashcards.length) * 100);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Flash Cards" />
      <ThemedView style={styles.container}>
        {/* Progress Bar */}
        <ThemedView style={styles.progressContainer}>
          <ThemedView style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </ThemedView>
          <ThemedView style={styles.progressLabels}>
            <ThemedText style={styles.progressText}>
              Card {currentIndex + 1} of {flashcards.length}
            </ThemedText>
            <ThemedText style={styles.progressText}>
              {Math.round(progress)}% completed
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Flashcard */}
        <ThemedView style={styles.cardContainer}>
          <TouchableOpacity onPress={handleReveal} activeOpacity={0.9}>
            <View style={styles.card}>
              <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.questionText}>{currentCard.question}</ThemedText>
                  <ThemedText style={styles.revealHint}>Tap to reveal answer</ThemedText>
                </View>
              </Animated.View>
              <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.answerText}>{currentCard.answer}</ThemedText>
                  <ThemedText style={styles.revealHint}>Tap to see question</ThemedText>
                </View>
              </Animated.View>
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* Navigation Buttons */}
        <ThemedView style={styles.navigationContainer}>
          <ThemedView style={styles.navButtonContainer}>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={handlePrevious}
              >
                <IconSymbol name="chevron.left" size={24} color="#6B54AE" />
                <ThemedText style={styles.prevButtonText}>Previous Card</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
          <ThemedView style={styles.navButtonContainer}>
            {currentIndex < flashcards.length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNext}
              >
                <ThemedText style={styles.nextButtonText}>Next Card</ThemedText>
                <IconSymbol name="chevron.right" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.finishButton]}
                onPress={() => {
                  setCurrentIndex(0);
                  progressAnimation.value = withTiming((1 / flashcards.length) * 100);
                }}
              >
                <IconSymbol name="arrow.clockwise" size={24} color="#fff" />
                <ThemedText style={styles.finishButtonText}>Go to First</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
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
    backgroundColor: '#fff',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B54AE',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#6B54AE',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 280,
    position: 'relative',
    marginVertical: 20,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(107, 84, 174, 0.1)',
    boxShadow: '10px 10px 5px 0px rgba(170, 170, 170, 0.75)',
  },
  cardFront: {
    borderWidth: 0.5,
    borderColor: '#6B54AE',
    backgroundColor: '#fff',
  },
  cardBack: {
    borderWidth: 0.5,
    borderColor: '#6B54AE',
    backgroundColor: '#fff',
    transform: [{ rotateY: '180deg' }],
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  revealHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    width: CARD_WIDTH,
  },
  navButtonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#6B54AE',
  },
  prevButtonText: {
    color: '#6B54AE',
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#6B54AE',
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 