import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import mcqData from '@/data/mcqData.json';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
  explanation: string;
}

interface Chapter {
  id: string;
  name: string;
  questions: Question[];
}

interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

interface MCQData {
  subjects: Subject[];
}

const typedMcqData = mcqData as MCQData;

export default function MCQScreen() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: string }>({});
  const [showAnswerMessage, setShowAnswerMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const explanationRef = useRef<View>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  
  // Timer states
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation refs for result screen
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

  const selectedSubjectData = typedMcqData.subjects.find((subject: Subject) => subject.id === selectedSubject);
  const selectedChapterData = selectedSubjectData?.chapters.find((chapter: Chapter) => chapter.id === selectedChapter);
  const currentQuestion = selectedChapterData?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (selectedChapterData?.questions.length || 0) - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const percentage = Math.round((score / (selectedChapterData?.questions.length || 0)) * 100);

  // Timer functions
  const startTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Add focus effect to reset screen when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      // Reset all states when tab is focused
      setSelectedSubject('');
      setSelectedChapter('');
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnsweredQuestions({});
      setShowAnswerMessage(false);
      setScore(0);
      setShowResult(false);
      setShowTest(false);
      setShowSubjectDropdown(false);
      setShowChapterDropdown(false);
      setTime(0);
      setIsTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, [])
  );

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

        // Get screen dimensions
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;
        const maxDistance = Math.sqrt(Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)) / 2;

        // Start firework animation
        const createParticleAnimation = (anim: any, index: number) => {
          const angle = (index * 5.625) * (Math.PI / 180); // Distribute particles in a circle (64 particles)
          const distance = maxDistance; // Travel to screen edges
          const burstDuration = 3000; // Slower movement (3 seconds)
          const rotationDuration = 2000 + Math.random() * 1000; // Random rotation duration

          return Animated.parallel([
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: burstDuration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: burstDuration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: burstDuration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 100, // Very quick fade out
              delay: burstDuration - 100, // Start fading just before reaching the edge
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: 1,
              duration: rotationDuration,
              useNativeDriver: true,
            }),
          ]);
        };

        // Create a single explosion with all particles
        const explosion = particleAnims.map((anim, index) => 
          createParticleAnimation(anim, index)
        );

        // Start all particles simultaneously
        Animated.parallel(explosion).start();

        // Create a second explosion after a longer delay
        setTimeout(() => {
          const secondExplosion = particleAnims.map((anim, index) => 
            createParticleAnimation(anim, index)
          );
          Animated.parallel(secondExplosion).start();
        }, 3500); // Start second explosion after 3.5 seconds
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

  const explosionScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.5],
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
    const isCorrect = currentQuestion?.options.find((opt: Option) => opt.id === answerId)?.isCorrect;
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
    if (currentQuestionIndex < (selectedChapterData?.questions.length || 0) - 1) {
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
    stopTimer();
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
    setTime(0);
    startTimer();
  };

  const handleStartTest = () => {
    if (!selectedSubject || !selectedChapter) return;
    setShowTest(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowAnswerMessage(false);
    setScore(0);
    setShowResult(false);
    setAnsweredQuestions({});
    setTime(0);
    startTimer();
  };

  const getOptionStyle = (optionId: string) => {
    if (!showExplanation) return styles.optionContainer;
    
    const isCorrect = currentQuestion?.options.find((opt: Option) => opt.id === optionId)?.isCorrect;
    const isSelected = selectedAnswer === optionId;
    
    if (isCorrect) return [styles.optionContainer, styles.correctOption];
    if (isSelected && !isCorrect) return [styles.optionContainer, styles.incorrectOption];
    return styles.optionContainer;
  };

  const progress = ((currentQuestionIndex + 1) / (selectedChapterData?.questions.length || 0)) * 100;

  if (showResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Quiz Results" />
        <ThemedView style={styles.container}>
          <View style={styles.timerContainer}>
            <ThemedText style={styles.timerText}>Time Taken: {formatTime(time)}</ThemedText>
          </View>
          {percentage >= 90 && (
            <View style={styles.fireworkContainer}>
              {particleAnims.map((anim, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.particle,
                    {
                      transform: [
                        { scale: anim.scale },
                        { translateX: anim.translateX },
                        { translateY: anim.translateY },
                        { rotate: anim.rotate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })},
                      ],
                      opacity: anim.opacity,
                    },
                  ]}
                >
                  <IconSymbol 
                    name="trophy.fill" 
                    size={36} 
                    color={index % 4 === 0 ? '#FFD700' : 
                           index % 4 === 1 ? '#FFA500' : 
                           index % 4 === 2 ? '#FF69B4' : '#FF1493'} 
                  />
                </Animated.View>
              ))}
            </View>
          )}
          <View style={styles.resultCard}>
            <LinearGradient
              colors={['#F3E5F5', '#E1BEE7']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.trophyContainer}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate: spin }] }}>
                <IconSymbol name="trophy.fill" size={80} color="#6B54AE" />
              </Animated.View>
            </View>
            
            <ThemedText style={styles.scoreText}>
              {score}/{selectedChapterData?.questions.length}
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
              <IconSymbol name="arrow.clockwise" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.homeButton]}
              onPress={() => {
                setShowResult(false);
                setShowTest(false);
                setSelectedSubject('');
                setSelectedChapter('');
              }}
            >
              <ThemedText style={styles.homeButtonText}>Choose Another Subject</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!showTest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="MCQ Questions" />
        <ThemedView style={styles.container}>
          <ThemedView style={styles.formContainer}>
            <ThemedText style={styles.formTitle}>Select Subject and Chapter</ThemedText>
            
            <ThemedView style={styles.formContent}>
              {/* Subject Selection */}
              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Subject</ThemedText>
                <TouchableOpacity
                  style={styles.formInput}
                  onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                >
                  <ThemedText style={styles.formInputText}>
                    {selectedSubject ? typedMcqData.subjects.find((s: Subject) => s.id === selectedSubject)?.name : 'Select a subject'}
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={20} color="#6B54AE" />
                </TouchableOpacity>
                {showSubjectDropdown && (
                  <Modal
                    visible={showSubjectDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowSubjectDropdown(false)}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      activeOpacity={1}
                      onPress={() => setShowSubjectDropdown(false)}
                    >
                      <ThemedView style={styles.modalContent}>
                        <ScrollView>
                          {typedMcqData.subjects.map((subject: Subject) => (
                            <TouchableOpacity
                              key={subject.id}
                              style={styles.modalItem}
                              onPress={() => {
                                setSelectedSubject(subject.id);
                                setSelectedChapter('');
                                setShowSubjectDropdown(false);
                              }}
                            >
                              <ThemedText style={styles.modalItemText}>{subject.name}</ThemedText>
                              <IconSymbol name="chevron.right" size={20} color="#6B54AE" />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </ThemedView>
                    </TouchableOpacity>
                  </Modal>
                )}
              </ThemedView>

              {/* Chapter Selection */}
              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Chapter</ThemedText>
                <TouchableOpacity
                  style={[styles.formInput, !selectedSubject && styles.formInputDisabled]}
                  onPress={() => selectedSubject && setShowChapterDropdown(!showChapterDropdown)}
                  disabled={!selectedSubject}
                >
                  <ThemedText style={[styles.formInputText, !selectedSubject && styles.formInputTextDisabled]}>
                    {selectedChapter ? selectedSubjectData?.chapters.find((c: Chapter) => c.id === selectedChapter)?.name : 'Select a chapter'}
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={20} color="#6B54AE" />
                </TouchableOpacity>
                {showChapterDropdown && selectedSubject && (
                  <Modal
                    visible={showChapterDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowChapterDropdown(false)}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      activeOpacity={1}
                      onPress={() => setShowChapterDropdown(false)}
                    >
                      <ThemedView style={styles.modalContent}>
                        <ScrollView>
                          {selectedSubjectData?.chapters.map((chapter: Chapter) => (
                            <TouchableOpacity
                              key={chapter.id}
                              style={styles.modalItem}
                              onPress={() => {
                                setSelectedChapter(chapter.id);
                                setShowChapterDropdown(false);
                              }}
                            >
                              <ThemedText style={styles.modalItemText}>{chapter.name}</ThemedText>
                              <IconSymbol name="chevron.right" size={20} color="#6B54AE" />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </ThemedView>
                    </TouchableOpacity>
                  </Modal>
                )}
              </ThemedView>

              {/* Start Test Button */}
              <TouchableOpacity
                style={[styles.startButton, (!selectedSubject || !selectedChapter) && styles.startButtonDisabled]}
                onPress={handleStartTest}
                disabled={!selectedSubject || !selectedChapter}
              >
                <ThemedText style={styles.startButtonText}>Start Test</ThemedText>
                <IconSymbol name="chevron.right" size={24} color="#fff" />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="MCQ Questions" />
      <ThemedView style={styles.container}>
        <View style={styles.timerContainer}>
          <ThemedText style={styles.timerText}>{formatTime(time)}</ThemedText>
        </View>
        {/* Progress Bar */}
        <ThemedView style={styles.progressContainer}>
          <ThemedView style={styles.progressBar}>
            <ThemedView style={[styles.progressFill, { width: `${progress}%` }]} />
          </ThemedView>
          <ThemedView style={styles.progressLabels}>
            <ThemedView style={styles.questionLabelContainer}>
              <ThemedText style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {selectedChapterData?.questions.length}
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
                {currentQuestion?.question}
              </ThemedText>
            </ThemedView>

            {/* Options */}
            <ThemedView style={styles.optionsContainer}>
              {currentQuestion?.options.map((option) => (
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
                    <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#6B54AE" />
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
                    <IconSymbol name="trophy.fill" size={24} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.navButton, styles.nextButton]}
                    onPress={handleNextQuestion}
                  >
                    <ThemedText style={styles.nextButtonText}>Next Question</ThemedText>
                    <IconSymbol name="chevron.right" size={24} color="#6B54AE" />
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
                    {currentQuestion?.explanation}
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
    gap: 8,
    marginBottom: 30,
  },
  optionContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginVertical: 2,
  },
  optionGradient: {
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 8,
  },
  optionId: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionIdText: {
    color: '#6B54AE',
    fontWeight: '700',
    fontSize: 16,
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
  fireworkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B54AE',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContent: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B54AE',
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formInputDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  formInputText: {
    fontSize: 16,
    color: '#333333',
  },
  formInputTextDisabled: {
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333333',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6B54AE',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  timerContainer: {
    position: 'absolute',
    top: -25,
    right: 15,
    backgroundColor: '#6B54AE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 