import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Picture questions data
const pictureQuestions = [
  {
    id: 1,
    question: "What is this animal?",
    image: require('../../assets/images/lion.png'),
    options: [
      { id: 'A', text: 'Lion', isCorrect: true },
      { id: 'B', text: 'Tiger', isCorrect: false },
      { id: 'C', text: 'Leopard', isCorrect: false },
      { id: 'D', text: 'Cheetah', isCorrect: false },
    ],
    explanation: "This is a lion, known as the king of the jungle.",
  },
  // Add more picture questions here
];

export default function PictureMCQScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === pictureQuestions.length - 1;
  const currentQuestion = pictureQuestions[currentQuestionIndex];
  const percentage = Math.round((score / pictureQuestions.length) * 100);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(Array(64).fill(0).map(() => ({
    scale: new Animated.Value(0),
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    opacity: new Animated.Value(1),
    rotate: new Animated.Value(0),
  }))).current;

  // Gesture handling for drag and drop
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      // Handle drag updates
    })
    .onEnd((event) => {
      // Handle drag end
    });

  useEffect(() => {
    // Check phone number when component mounts
    const checkPhoneNumber = async () => {
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      setUserPhoneNumber(phoneNumber);
      
      // Only allow access if phone number starts with 911
      if (phoneNumber?.startsWith('+251911')) {
        setIsAuthorized(true);
      } else {
        // Redirect to regular MCQ if not authorized
        router.push('/mcq');
      }
    };
    checkPhoneNumber();
  }, []);

  // If not authorized, show loading or redirect
  if (!isAuthorized) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <Header title="Picture Questions" />
          <ThemedView style={styles.container}>
            <ThemedText style={styles.unauthorizedText}>
              You are not authorized to access picture questions.
            </ThemedText>
            <TouchableOpacity
              style={[styles.button, styles.homeButton]}
              onPress={() => router.push('/mcq')}
            >
              <ThemedText style={styles.homeButtonText}>Go to Regular Questions</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswer) return; // Prevent multiple selections
    setSelectedAnswer(answerId);
    setShowExplanation(true);
    
    // Update score if answer is correct
    const isCorrect = currentQuestion.options.find(opt => opt.id === answerId)?.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setShowCelebration(true);
      // Celebration animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setShowWrongAnswer(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < pictureQuestions.length - 1) {
      if (!selectedAnswer) return;
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCelebration(false);
      setShowWrongAnswer(false);
    } else {
      setShowResult(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCelebration(false);
      setShowWrongAnswer(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowCelebration(false);
    setShowWrongAnswer(false);
    setScore(0);
    setShowResult(false);
  };

  const getMessage = () => {
    if (percentage >= 90) return "Outstanding! You're a genius!";
    if (percentage >= 70) return "Great job! You're doing well!";
    if (percentage >= 50) return "Not bad! Keep practicing!";
    return "Keep learning! You can do better!";
  };

  if (showResult) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <Header title="Quiz Results" />
          <ThemedView style={styles.container}>
            <View style={styles.resultCard}>
              <LinearGradient
                colors={['#F3E5F5', '#E1BEE7']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              <View style={styles.trophyContainer}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }) }] }}>
                  <IconSymbol name="trophy.fill" size={80} color="#6B54AE" />
                </Animated.View>
              </View>
              
              <ThemedText style={styles.scoreText}>
                {score}/{pictureQuestions.length}
              </ThemedText>
              
              <ThemedText style={styles.percentageText}>
                {percentage}%
              </ThemedText>
              
              <ThemedText style={styles.messageText}>
                {getMessage()}
              </ThemedText>
            </View>

            <ThemedView style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={handleRetry}
              >
                <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
                <Ionicons name="refresh" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.homeButton]}
                onPress={() => router.push('/mcq')}
              >
                <ThemedText style={styles.homeButtonText}>Back to Regular Questions</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / pictureQuestions.length) * 100}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <View style={[styles.questionLabelContainer]}>
                  <ThemedText style={styles.progressText}>
                    Question {currentQuestionIndex + 1} of {pictureQuestions.length}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.questionContainer}>
              <ThemedText style={styles.questionText}>
                {currentQuestion.question}
              </ThemedText>
            </View>

            <GestureDetector gesture={pan}>
              <View style={styles.imageContainer}>
                <Image
                  source={currentQuestion.image}
                  style={styles.questionImage}
                  resizeMode="contain"
                />
              </View>
            </GestureDetector>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionContainer,
                    selectedAnswer === option.id && option.isCorrect && styles.correctOption,
                    selectedAnswer === option.id && !option.isCorrect && styles.incorrectOption,
                  ]}
                  onPress={() => handleAnswerSelect(option.id)}
                  disabled={!!selectedAnswer}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionId}>
                      <ThemedText style={styles.optionIdText}>{option.id}</ThemedText>
                    </View>
                    <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {showExplanation && (
              <View style={styles.explanationContainer}>
                <ThemedText style={styles.explanationTitle}>Explanation:</ThemedText>
                <ThemedText style={styles.explanationText}>
                  {currentQuestion.explanation}
                </ThemedText>
              </View>
            )}

            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton, isFirstQuestion && styles.navButtonDisabled]}
                onPress={handlePreviousQuestion}
                disabled={isFirstQuestion}
              >
                <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#6B54AE" />
                <ThemedText style={styles.prevButtonText}>Previous</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={isLastQuestion ? () => setShowResult(true) : handleNextQuestion}
              >
                <ThemedText style={styles.nextButtonText}>
                  {isLastQuestion ? 'Finish' : 'Next'}
                </ThemedText>
                <IconSymbol name="chevron.right" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
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
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
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
  questionLabelContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  progressText: {
    color: '#6B54AE',
    fontSize: 14,
    fontWeight: '600',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 24,
    lineHeight: 32,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionImage: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  optionId: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionIdText: {
    color: '#6B54AE',
    fontWeight: '600',
    fontSize: 14,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  correctOption: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F1F8E9',
  },
  incorrectOption: {
    borderColor: '#F44336',
    borderWidth: 2,
    backgroundColor: '#FFEBEE',
  },
  explanationContainer: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  explanationTitle: {
    color: '#6B54AE',
    marginBottom: 10,
  },
  explanationText: {
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  prevButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#6B54AE',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  prevButtonText: {
    color: '#6B54AE',
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultCard: {
    width: Dimensions.get('window').width - 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#F3E5F5',
    paddingBottom: 20,
    paddingTop: 30,
    marginBottom: 20,
  },
  trophyContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  scoreText: {
    paddingTop: 30,
    fontSize: 50,
    fontWeight: '700',
    color: '#6B54AE',
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  percentageText: {
    paddingTop: 20,
    fontSize: 30,
    fontWeight: '600',
    color: '#6B54AE',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B54AE',
    lineHeight: 24,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  actionButtons: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#6B54AE',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B54AE',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButtonText: {
    color: '#6B54AE',
    fontSize: 16,
    fontWeight: '600',
  },
  unauthorizedText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B54AE',
    marginBottom: 20,
  },
}); 