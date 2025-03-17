import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Modal, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Sample data - replace with your actual data
const pictureQuestions = [
  {
    id: 1,
    question: "Which one is a cat?",
    image: require('@/assets/images/cat.png'),
    options: [
      { id: 'a', text: 'Cat', isCorrect: true },
      { id: 'b', text: 'Dog', isCorrect: false }
    ]
  },
  {
    id: 2,
    question: "Which one is a dog?",
    image: require('@/assets/images/dog.png'),
    options: [
      { id: 'a', text: 'Cat', isCorrect: false },
      { id: 'b', text: 'Dog', isCorrect: true }
    ]
  },
  // Add more questions as needed
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OPTION_WIDTH = (SCREEN_WIDTH - 60) / 2;

export default function PictureQuestionsScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [score, setScore] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  const currentQuestion = pictureQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / pictureQuestions.length) * 100;

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const handleDragStart = () => {
    setIsDragging(true);
    scale.value = withSpring(1.1);
  };

  const handleDragEnd = (optionId: string) => {
    setIsDragging(false);
    scale.value = withSpring(1);
    
    const isCorrect = optionId === currentQuestion.options.find(opt => opt.isCorrect)?.id;
    
    if (isCorrect) {
      // Correct animation
      setShowCelebration(true);
      setScore(prev => prev + 1);
      
      // Celebration animation
      rotation.value = withSequence(
        withSpring(360, { damping: 10 }),
        withSpring(0, { damping: 10 })
      );
      
      // Move to next question after delay
      setTimeout(() => {
        setShowCelebration(false);
        moveToNextQuestion();
      }, 2000);
    } else {
      // Wrong animation
      setShowWrong(true);
      rotation.value = withSequence(
        withSpring(-10, { damping: 10 }),
        withSpring(10, { damping: 10 }),
        withSpring(-10, { damping: 10 }),
        withSpring(0, { damping: 10 })
      );
      
      // Move to next question after delay
      setTimeout(() => {
        setShowWrong(false);
        moveToNextQuestion();
      }, 2000);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < pictureQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      rotation.value = withSpring(0);
      opacity.value = withSpring(1);
    } else {
      // Show final score
      router.push('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Picture Questions" />
      <ThemedView style={styles.container}>
        {/* Progress Bar */}
        <ThemedView style={styles.progressContainer}>
          <ThemedView style={styles.progressBar}>
            <ThemedView style={[styles.progressFill, { width: `${progress}%` }]} />
          </ThemedView>
          <ThemedView style={styles.progressLabels}>
            <ThemedText style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {pictureQuestions.length}
            </ThemedText>
            <ThemedText style={styles.progressText}>
              Score: {score}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Question */}
        <ThemedText style={styles.questionText}>
          {currentQuestion.question}
        </ThemedText>

        {/* Draggable Image */}
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Image
            source={currentQuestion.image}
            style={styles.questionImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Options */}
        <ThemedView style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                showCelebration && option.isCorrect && styles.correctOption,
                showWrong && !option.isCorrect && option.id === currentQuestion.options.find(opt => opt.isCorrect)?.id && styles.correctOption,
              ]}
              onPress={() => handleDragEnd(option.id)}
              disabled={showCelebration || showWrong}
            >
              <ThemedText style={styles.optionText}>
                {option.text}
              </ThemedText>
              {showCelebration && option.isCorrect && (
                <IconSymbol name="sun.max.fill" size={40} color="#4CAF50" />
              )}
              {showWrong && !option.isCorrect && option.id === currentQuestion.options.find(opt => opt.isCorrect)?.id && (
                <IconSymbol name="sun.max.fill" size={40} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* Celebration Animation */}
        {showCelebration && (
          <View style={styles.celebrationContainer}>
            <IconSymbol name="sun.max.fill" size={60} color="#FFD700" />
            <ThemedText style={styles.celebrationText}>Correct!</ThemedText>
          </View>
        )}

        {/* Wrong Animation */}
        {showWrong && (
          <View style={styles.wrongContainer}>
            <IconSymbol name="moon.fill" size={60} color="#F44336" />
            <ThemedText style={styles.wrongText}>Try Again!</ThemedText>
          </View>
        )}
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
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B54AE',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#6B54AE',
    fontSize: 18,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 40,
  },
  imageContainer: {
    width: SCREEN_WIDTH - 40,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  questionImage: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    marginTop: 20,
  },
  optionButton: {
    width: OPTION_WIDTH,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  celebrationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  celebrationText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 10,
  },
  wrongContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  wrongText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#F44336',
    marginTop: 10,
  },
}); 