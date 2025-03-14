import { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
  withSpring,
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
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateY: `${interpolate(flipAnimation.value, [0, 1], [0, 180])}deg`,
        },
      ],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateY: `${interpolate(flipAnimation.value, [0, 1], [180, 360])}deg`,
        },
      ],
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value}%`,
    };
  });

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    flipAnimation.value = withSpring(isFlipped ? 0 : 1, {
      damping: 15,
      stiffness: 100,
    });
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      flipAnimation.value = withTiming(0);
      progressAnimation.value = withTiming(((currentIndex + 2) / flashcards.length) * 100);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      flipAnimation.value = withTiming(0);
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
          <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
            <ThemedView style={styles.card}>
              <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
                <View style={styles.cardGradient}>
                  <ThemedText style={styles.questionText}>{currentCard.question}</ThemedText>
                  <ThemedText style={styles.flipHint}>Tap to reveal answer</ThemedText>
                </View>
              </Animated.View>
              <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                <View style={styles.cardGradient}>
                  <ThemedText style={styles.answerText}>{currentCard.answer}</ThemedText>
                  <ThemedText style={styles.flipHint}>Tap to see question</ThemedText>
                </View>
              </Animated.View>
            </ThemedView>
          </TouchableOpacity>
        </ThemedView>

        {/* Navigation Buttons */}
        <ThemedView style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <IconSymbol name="chevron.left" size={24} color="#6B54AE" />
            <ThemedText style={styles.prevButtonText}>Previous</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            <ThemedText style={styles.nextButtonText}>Next</ThemedText>
            <IconSymbol name="chevron.right" size={24} color="#fff" />
          </TouchableOpacity>
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
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: 280,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardFront: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardBack: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    transform: [{ rotateY: '180deg' }],
  },
  cardGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  flipHint: {
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
    marginTop: 'auto',
    paddingVertical: 16,
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
}); 