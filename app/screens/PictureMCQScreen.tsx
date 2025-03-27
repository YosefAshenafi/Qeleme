import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import pictureQuestionsData from '@/data/pictureMCQData.json';

// Image mapping object
const imageMapping: { [key: string]: any } = {
  'lion.png': require('../../assets/images/questions/lion.png'),
  'dolphin.png': require('../../assets/images/questions/dolphin.png'),
  'penguin.png': require('../../assets/images/questions/penguin.png'),
  'panda.png': require('../../assets/images/questions/panda.png'),
  'cheetah.png': require('../../assets/images/questions/cheetah.png'),
  // Add more image mappings here as needed
};

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  image: string;
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

interface Grade {
  id: string;
  name: string;
  subjects: Subject[];
}

interface PictureMCQData {
  grades: Grade[];
}

const typedPictureQuestionsData = pictureQuestionsData as PictureMCQData;

export default function PictureMCQScreen() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropZones, setDropZones] = useState<{ [key: string]: { x: number, y: number, width: number, height: number } }>({});
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [droppedOption, setDroppedOption] = useState<string | null>(null);

  // Get the first grade's first subject's first chapter's questions
  const questions = typedPictureQuestionsData.grades[0]?.subjects[0]?.chapters[0]?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const percentage = Math.round((score / questions.length) * 100);

  // Animation refs
  const scaleAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const imagePosition = useSharedValue({ x: 0, y: 0 });
  const imageScale = useSharedValue(1);
  const isDraggingShared = useSharedValue(false);
  
  // New animation values for celebration and incorrect
  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);
  const incorrectScale = useSharedValue(0);
  const incorrectOpacity = useSharedValue(0);
  const incorrectRotation = useSharedValue(0);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: imagePosition.value.x },
        { translateY: imagePosition.value.y },
        { scale: imageScale.value },
      ],
    };
  });

  const celebrationAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: celebrationScale.value },
      ],
      opacity: celebrationOpacity.value,
    };
  });

  const incorrectAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: incorrectScale.value },
        { rotate: `${incorrectRotation.value * 10}deg` },
      ],
      opacity: incorrectOpacity.value,
    };
  });

  useAnimatedReaction(
    () => isDraggingShared.value,
    (value) => {
      runOnJS(setIsDragging)(value);
    }
  );

  const imagePan = Gesture.Pan()
    .onStart(() => {
      'worklet';
      // Prevent dragging if an option has already been dropped
      if (droppedOption) return;
      
      isDraggingShared.value = true;
      imageScale.value = withSpring(0.5);
    })
    .onUpdate((event) => {
      'worklet';
      // Don't update position if an option has been dropped
      if (droppedOption) return;
      
      imagePosition.value = {
        x: event.translationX,
        y: event.translationY,
      };

      // Calculate distances to each option
      const imageCenterX = event.absoluteX;
      const imageCenterY = event.absoluteY;
      let closestOption: string | null = null;
      let minDistance = Infinity;

      Object.entries(dropZones).forEach(([optionId, zone]) => {
        const zoneCenterX = zone.x + zone.width / 2;
        const zoneCenterY = zone.y + zone.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(imageCenterX - zoneCenterX, 2) + 
          Math.pow(imageCenterY - zoneCenterY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestOption = optionId;
        }
      });

      runOnJS(setHoveredOption)(closestOption);
    })
    .onEnd(() => {
      'worklet';
      // Don't process drop if an option has already been dropped
      if (droppedOption) return;
      
      isDraggingShared.value = false;
      imageScale.value = withSpring(1);
      imagePosition.value = withSpring({ x: 0, y: 0 });
      runOnJS(setHoveredOption)(null);

      if (hoveredOption && currentQuestion) {
        const selectedOption = currentQuestion.options.find(opt => opt.id === hoveredOption);
        if (selectedOption) {
          runOnJS(setDroppedOption)(hoveredOption);
          runOnJS(setSelectedAnswer)(hoveredOption);
          
          if (selectedOption.isCorrect) {
            // Simplified score update
            runOnJS(setScore)(score + 1);
            
            // Celebration animation
            celebrationScale.value = withSequence(
              withSpring(1, { damping: 8 }),
              withTiming(0, { duration: 1000 })
            );
            celebrationOpacity.value = withSequence(
              withTiming(1, { duration: 300 }),
              withTiming(0, { duration: 700 })
            );
          } else {
            // Incorrect animation
            incorrectScale.value = withSequence(
              withSpring(1, { damping: 8 }),
              withTiming(0, { duration: 1000 })
            );
            incorrectOpacity.value = withSequence(
              withTiming(1, { duration: 300 }),
              withTiming(0, { duration: 700 })
            );
            incorrectRotation.value = withSequence(
              withSpring(1, { damping: 8 }),
              withTiming(0, { duration: 1000 })
            );
          }
        }
      }
    });

  useEffect(() => {
    // Check phone number when component mounts
    const checkPhoneNumber = async () => {
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      setUserPhoneNumber(phoneNumber);
      
      // Only allow access if phone number starts with 911
      if (phoneNumber?.startsWith('+251911')) {
        setIsAuthorized(true);
        
        // Check if we need to reset the state
        if (params?.reset === 'true') {
          handleRetry();
        }
      } else {
        // Redirect to regular MCQ if not authorized
        router.push('/mcq');
      }
    };
    checkPhoneNumber();
  }, [params]);

  const handleNextQuestion = () => {
    if (!currentQuestion) return;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCelebration(false);
      setShowWrongAnswer(false);
      setDroppedOption(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (!currentQuestion) return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCelebration(false);
      setShowWrongAnswer(false);
      setDroppedOption(null);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowCelebration(false);
    setShowWrongAnswer(false);
    setScore(0);
  };

  const getMessage = () => {
    if (percentage >= 90) return "Outstanding! You're a genius!";
    if (percentage >= 70) return "Great job! You're doing well!";
    if (percentage >= 50) return "Not bad! Keep practicing!";
    return "Keep learning! You can do better!";
  };

  const handleNavigation = () => {
    if (!currentQuestion) return;
    const currentScore = Number(score) || 0; // Ensure score is a number
    if (isLastQuestion) {
      router.push({
        pathname: '/picture-mcq-result',
        params: { 
          score: currentScore,
          totalQuestions: questions.length 
        }
      });
    } else {
      handleNextQuestion();
    }
  };

  if (!isAuthorized) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <Header title="Picture Questions" />
          <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
            <ThemedText style={[styles.unauthorizedText, { color: isDarkMode ? '#A0A0A5' : '#6B54AE' }]}>
              You are not authorized to access picture questions.
            </ThemedText>
            <TouchableOpacity
              style={[styles.pictureButton, styles.pictureHomeButton]}
              onPress={() => router.push('/mcq')}
            >
              <ThemedText style={styles.pictureHomeButtonText}>Go to Regular Questions</ThemedText>
              <IconSymbol name="house.fill" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </ThemedView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (!currentQuestion) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <Header title="Picture Questions" />
          <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
            <ThemedView style={[styles.formContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
              <ThemedText style={[styles.formTitle, { color: colors.tint }]}>No Questions Available</ThemedText>
              <TouchableOpacity
                style={[styles.pictureButton, styles.pictureHomeButton]}
                onPress={() => router.push('/mcq')}
              >
                <ThemedText style={styles.pictureHomeButtonText}>Go to Regular Questions</ThemedText>
                <IconSymbol name="house.fill" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
        <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]}>
                <View style={[styles.progressFill, { backgroundColor: '#6B54AE' }]} />
              </View>
              <View style={styles.progressLabels}>
                <View style={styles.questionLabelContainer}>
                  <ThemedText style={[styles.progressText, { color: '#6B54AE' }]}>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </ThemedText>
                </View>
              </View>
            </View>

            {currentQuestion && (
              <>
                <View style={styles.questionContainer}>
                  <ThemedText style={[styles.questionText, { color: colors.text }]}>
                    {currentQuestion.question}
                  </ThemedText>
                </View>

                <GestureDetector gesture={imagePan}>
                  <Animated.View 
                    style={[
                      styles.imageContainer,
                      imageAnimatedStyle,
                      { backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5' }
                    ]}
                  >
                    <Image
                      source={imageMapping[currentQuestion.image]}
                      style={styles.questionImage}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </GestureDetector>

                {/* Celebration Animation */}
                <Animated.View style={[styles.celebrationContainer, celebrationAnimatedStyle]}>
                  <View style={[styles.celebrationContent, { backgroundColor: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)' }]}>
                    <IconSymbol name="trophy.fill" size={80} color="#4CAF50" />
                    <ThemedText style={styles.celebrationText}>Correct!</ThemedText>
                  </View>
                </Animated.View>

                {/* Incorrect Animation */}
                <Animated.View style={[styles.incorrectContainer, incorrectAnimatedStyle]}>
                  <View style={[styles.incorrectContent, { backgroundColor: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)' }]}>
                    <IconSymbol name="xmark.circle.fill" size={80} color="#F44336" />
                    <ThemedText style={styles.incorrectText}>Incorrect!</ThemedText>
                  </View>
                </Animated.View>

                <View style={styles.optionsContainer}>
                  {currentQuestion.options.map((option) => (
                    <View
                      key={option.id}
                      style={[
                        styles.optionWrapper,
                        {
                          backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
                          borderColor: isDarkMode ? '#3C3C3E' : '#E0E0E0',
                        },
                        selectedAnswer === option.id && option.isCorrect && styles.correctOption,
                        selectedAnswer === option.id && !option.isCorrect && styles.incorrectOption,
                        hoveredOption === option.id && !selectedAnswer && [
                          styles.dropZone,
                          { borderColor: '#6B54AE', backgroundColor: isDarkMode ? 'rgba(107, 84, 174, 0.2)' : 'rgba(107, 84, 174, 0.1)' }
                        ],
                        droppedOption === option.id && option.isCorrect && styles.correctOption,
                        droppedOption === option.id && !option.isCorrect && styles.incorrectOption,
                      ]}
                      onLayout={(event) => {
                        const { x, y, width, height } = event.nativeEvent.layout;
                        setDropZones(prev => ({
                          ...prev,
                          [option.id]: { x, y, width, height }
                        }));
                      }}
                    >
                      <View style={styles.optionContent}>
                        <ThemedText style={[
                          styles.optionText,
                          { color: isDarkMode ? colors.text : '#333333' },
                          selectedAnswer === option.id && option.isCorrect && styles.correctText,
                          selectedAnswer === option.id && !option.isCorrect && styles.incorrectText,
                        ]}>
                          {option.text}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>

                {showExplanation && (
                  <View style={[styles.explanationContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5' }]}>
                    <ThemedText style={[styles.explanationTitle, { color: '#6B54AE' }]}>Explanation:</ThemedText>
                    <ThemedText style={[styles.explanationText, { color: colors.text }]}>
                      {currentQuestion.explanation}
                    </ThemedText>
                  </View>
                )}
              </>
            )}

            <View style={[styles.navigationContainer, {
              borderTopColor: isDarkMode ? '#3C3C3E' : '#E0E0E0',
              borderBottomColor: isDarkMode ? '#3C3C3E' : '#E0E0E0',
            }]}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.prevButton,
                  { borderColor: isDarkMode ? '#3C3C3E' : '#E0E0E0' },
                  isFirstQuestion && styles.navButtonDisabled
                ]}
                onPress={handlePreviousQuestion}
                disabled={isFirstQuestion}
              >
                <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#6B54AE" />
                <ThemedText style={styles.prevButtonText}>Previous</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNavigation}
              >
                <ThemedText style={styles.nextButtonText}>
                  {isLastQuestion ? 'Show Result' : 'Next'}
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
    zIndex: 2,
  },
  questionImage: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
    gap: 16,
  },
  optionWrapper: {
    width: '48%',
    minHeight: 80,
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
  dropZone: {
    borderWidth: 3,
    borderColor: '#6B54AE',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(107, 84, 174, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  optionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  correctOption: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    backgroundColor: '#F1F8E9',
    transform: [{ scale: 1.05 }],
  },
  incorrectOption: {
    borderColor: '#F44336',
    borderWidth: 3,
    backgroundColor: '#FFEBEE',
    transform: [{ scale: 1.05 }],
  },
  correctText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  incorrectText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 10,
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
  resultScrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  pictureResultCard: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFA000',
  },
  pictureTrophyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  pictureScoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  pictureScoreLabel: {
    fontSize: 24,
    color: '#FFA000',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  pictureScoreText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#FFA000',
    marginBottom: 16,
  },
  picturePercentageContainer: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFA000',
  },
  picturePercentageText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFA000',
  },
  pictureMessageContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFA000',
  },
  pictureMessageText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#FFA000',
    lineHeight: 32,
    fontWeight: '600',
  },
  pictureActionButtons: {
    marginTop: 32,
    gap: 16,
    paddingHorizontal: 20,
  },
  pictureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 12,
  },
  pictureRetryButton: {
    backgroundColor: '#FFA000',
  },
  pictureHomeButton: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#FFA000',
  },
  pictureRetryButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  pictureHomeButtonText: {
    color: '#FFA000',
    fontSize: 24,
    fontWeight: '600',
  },
  unauthorizedText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B54AE',
    marginBottom: 20,
  },
  celebrationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  celebrationContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  incorrectContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  incorrectContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  formInputText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
}); 