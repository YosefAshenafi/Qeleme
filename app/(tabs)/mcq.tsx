import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Sample MCQ data - replace with your actual data source
const mcqData = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: [
      { id: 'A', text: 'London', isCorrect: false },
      { id: 'B', text: 'Berlin', isCorrect: false },
      { id: 'C', text: 'Paris', isCorrect: true },
      { id: 'D', text: 'Madrid', isCorrect: false },
    ],
    explanation: "Answer: C) Paris\n\nParis is the capital of France. London is the capital of England, Berlin is the capital of Germany, and Madrid is the capital of Spain."
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: [
      { id: 'A', text: 'Venus', isCorrect: false },
      { id: 'B', text: 'Mars', isCorrect: true },
      { id: 'C', text: 'Jupiter', isCorrect: false },
      { id: 'D', text: 'Saturn', isCorrect: false },
    ],
    explanation: "Answer: B) Mars\n\nMars is known as the Red Planet due to its reddish appearance, caused by iron oxide (rust) on its surface. Venus is the hottest planet, Jupiter is the largest, and Saturn is known for its rings."
  },
  {
    id: 3,
    question: "What is the largest mammal in the world?",
    options: [
      { id: 'A', text: 'African Elephant', isCorrect: false },
      { id: 'B', text: 'Blue Whale', isCorrect: true },
      { id: 'C', text: 'Giraffe', isCorrect: false },
      { id: 'D', text: 'Polar Bear', isCorrect: false },
    ],
    explanation: "Answer: B) Blue Whale\n\nThe Blue Whale is the largest mammal ever known to have lived on Earth, reaching lengths of up to 100 feet. African Elephants are the largest land mammals, Giraffes are the tallest, and Polar Bears are the largest land carnivores."
  },
  {
    id: 4,
    question: "Who painted the Mona Lisa?",
    options: [
      { id: 'A', text: 'Vincent van Gogh', isCorrect: false },
      { id: 'B', text: 'Pablo Picasso', isCorrect: false },
      { id: 'C', text: 'Leonardo da Vinci', isCorrect: true },
      { id: 'D', text: 'Michelangelo', isCorrect: false },
    ],
    explanation: "Answer: C) Leonardo da Vinci\n\nLeonardo da Vinci painted the Mona Lisa between 1503 and 1519. Van Gogh is known for 'The Starry Night', Picasso for his cubist works, and Michelangelo for the Sistine Chapel ceiling."
  },
  {
    id: 5,
    question: "What is the chemical symbol for gold?",
    options: [
      { id: 'A', text: 'Ag', isCorrect: false },
      { id: 'B', text: 'Fe', isCorrect: false },
      { id: 'C', text: 'Au', isCorrect: true },
      { id: 'D', text: 'Cu', isCorrect: false },
    ],
    explanation: "Answer: C) Au\n\nAu is the chemical symbol for gold, derived from the Latin word 'aurum'. Ag is for silver, Fe is for iron, and Cu is for copper."
  }
];

export default function MCQScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: string }>({});
  const [showAnswerMessage, setShowAnswerMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const explanationRef = useRef<View>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // Animation refs for result screen
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = mcqData[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === mcqData.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const percentage = Math.round((score / mcqData.length) * 100);

  useEffect(() => {
    if (showResult) {
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

      if (percentage >= 90) {
        // Start confetti animation for high scores
        Animated.loop(
          Animated.sequence([
            Animated.timing(confettiAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(confettiAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [showResult]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const confettiScale = confettiAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const getMessage = () => {
    if (percentage >= 90) return "Outstanding! You're a genius!";
    if (percentage >= 70) return "Great job! You're doing well!";
    if (percentage >= 50) return "Not bad! Keep practicing!";
    return "Keep learning! You can do better!";
  };

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswer) return; // Prevent multiple selections
    setSelectedAnswer(answerId);
    setAnsweredQuestions(prev => ({ ...prev, [currentQuestionIndex]: answerId }));
    setShowExplanation(true);
    setShowAnswerMessage(false);
    
    // Update score if answer is correct
    const isCorrect = currentQuestion.options.find(opt => opt.id === answerId)?.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Scroll to explanation after a short delay to ensure it's rendered
    setTimeout(() => {
      explanationRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        scrollViewRef.current?.scrollTo({
          y: pageY - 100,
          animated: true
        });
      });
    }, 100);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mcqData.length - 1) {
      if (!selectedAnswer) {
        setShowAnswerMessage(true);
        return;
      }
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowAnswerMessage(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answeredQuestions[currentQuestionIndex - 1] || null);
      setShowExplanation(true);
    }
  };

  const handleResult = () => {
    if (!selectedAnswer) {
      setShowAnswerMessage(true);
      return;
    }
    setShowResult(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowAnswerMessage(false);
    setScore(0);
    setShowResult(false);
    setAnsweredQuestions({});
  };

  const getOptionStyle = (optionId: string) => {
    if (!showExplanation) return styles.optionContainer;
    
    const isCorrect = currentQuestion.options.find(opt => opt.id === optionId)?.isCorrect;
    const isSelected = selectedAnswer === optionId;
    
    if (isCorrect) return [styles.optionContainer, styles.correctOption];
    if (isSelected && !isCorrect) return [styles.optionContainer, styles.incorrectOption];
    return styles.optionContainer;
  };

  const progress = ((currentQuestionIndex + 1) / mcqData.length) * 100;

  if (showResult) {
    return (
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
            
            {percentage >= 90 && (
              <Animated.View style={[styles.confettiContainer, { transform: [{ scale: confettiScale }] }]}>
                <IconSymbol name="sparkles" size={24} color="#FFD700" style={styles.confettiLeft} />
                <IconSymbol name="sparkles" size={24} color="#FFD700" style={styles.confettiRight} />
              </Animated.View>
            )}
            
            <View style={styles.trophyContainer}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate: spin }] }}>
                <IconSymbol name="trophy.fill" size={80} color="#6B54AE" />
              </Animated.View>
            </View>
            
            <ThemedText style={styles.scoreText}>
              {score}/{mcqData.length}
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
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.homeButton]}
              onPress={() => router.push('/(tabs)')}
            >
              <ThemedText style={styles.homeButtonText}>Back to Home</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="MCQ Questions" />
      <ThemedView style={styles.container}>
        {/* Progress Bar */}
        <ThemedView style={styles.progressContainer}>
          <ThemedView style={styles.progressBar}>
            <ThemedView style={[styles.progressFill, { width: `${progress}%` }]} />
          </ThemedView>
          <ThemedView style={styles.progressLabels}>
            <ThemedView style={styles.questionLabelContainer}>
              <ThemedText style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {mcqData.length}
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.progressText}>
              {Math.round(progress)}%
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.content}>
            {/* Question */}
            <ThemedView style={styles.questionContainer}>
              <ThemedText type="title" style={styles.questionText}>
                {currentQuestion.question}
              </ThemedText>
            </ThemedView>

            {/* Options */}
            <ThemedView style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={getOptionStyle(option.id)}
                  onPress={() => handleAnswerSelect(option.id)}
                  disabled={showExplanation}
                >
                  <ThemedView style={styles.optionContent}>
                    <ThemedView style={styles.optionId}>
                      <ThemedText style={styles.optionIdText}>{option.id}</ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>

            {/* Navigation Buttons */}
            <ThemedView style={styles.navigationContainer}>
              <ThemedView style={styles.navButtonContainer}>
                {!isFirstQuestion && (
                  <TouchableOpacity
                    style={[styles.navButton, styles.prevButton]}
                    onPress={handlePreviousQuestion}
                  >
                    <IconSymbol name="chevron.left" size={24} color="#6B54AE" />
                    <ThemedText style={styles.prevButtonText}>Previous</ThemedText>
                  </TouchableOpacity>
                )}
              </ThemedView>
              <ThemedView style={styles.navButtonContainerRight}>
                {isLastQuestion ? (
                  <TouchableOpacity
                    style={[styles.navButton, styles.resultButton]}
                    onPress={handleResult}
                  >
                    <ThemedText style={styles.resultButtonText}>View Results</ThemedText>
                    <IconSymbol name="trophy" size={24} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.navButton, styles.nextButton]}
                    onPress={handleNextQuestion}
                  >
                    <ThemedText style={styles.nextButtonText}>Next Question</ThemedText>
                    <IconSymbol name="chevron.right" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
              </ThemedView>
            </ThemedView>

            {showAnswerMessage && (
              <ThemedView style={styles.answerMessageContainer}>
                <ThemedText style={styles.answerMessageText}>
                  Please select your answer before proceeding
                </ThemedText>
              </ThemedView>
            )}

            {/* Explanation */}
            {showExplanation && (
              <View ref={explanationRef}>
                <ThemedView style={styles.explanationContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.explanationTitle}>
                    Explanation
                  </ThemedText>
                  <ThemedText style={styles.explanationText}>
                    {currentQuestion.explanation}
                  </ThemedText>
                </ThemedView>
              </View>
            )}
          </ThemedView>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 24,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 15,
    marginBottom: 30,
  },
  optionContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  optionGradient: {
    padding: 15,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 7,
  },
  optionId: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIdText: {
    color: '#6B54AE',
    fontWeight: '600',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#6B54AE',
  },
  correctOption: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  incorrectOption: {
    borderColor: '#F44336',
    borderWidth: 2,
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
    paddingHorizontal: 0,
  },
  navButtonContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  navButtonContainerRight: {
    flex: 1,
    alignItems: 'flex-end',
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
  progressContainer: {
    marginBottom: 20,
    paddingHorizontal: 0,
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
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  progressText: {
    color: '#6B54AE',
    fontSize: 14,
    fontWeight: '600',
  },
  answerMessageContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  answerMessageText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: '500',
  },
  resultButton: {
    backgroundColor: '#FF9800',
  },
  resultButtonText: {
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
    paddingBottom: 60,
    paddingTop: 30,
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
    marginTop: 20,
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#6B54AE',
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
  confettiContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  confettiLeft: {
    transform: [{ rotate: '-45deg' }],
  },
  confettiRight: {
    transform: [{ rotate: '45deg' }],
  },
}); 