import { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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

  const currentQuestion = mcqData[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === mcqData.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswer) return; // Prevent multiple selections
    setSelectedAnswer(answerId);
    setAnsweredQuestions(prev => ({ ...prev, [currentQuestionIndex]: answerId }));
    setShowExplanation(true);
    setShowAnswerMessage(false);
    
    // Scroll to explanation after a short delay to ensure it's rendered
    setTimeout(() => {
      explanationRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        scrollViewRef.current?.scrollTo({
          y: pageY - 100, // Scroll to slightly above the explanation
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

  const getOptionStyle = (optionId: string) => {
    if (!showExplanation) return styles.optionContainer;
    
    const isCorrect = currentQuestion.options.find(opt => opt.id === optionId)?.isCorrect;
    const isSelected = selectedAnswer === optionId;
    
    if (isCorrect) return [styles.optionContainer, styles.correctOption];
    if (isSelected && !isCorrect) return [styles.optionContainer, styles.incorrectOption];
    return styles.optionContainer;
  };

  const progress = ((currentQuestionIndex + 1) / mcqData.length) * 100;

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
              <ThemedView style={styles.navButtonContainer}>
                {!isLastQuestion && (
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
}); 