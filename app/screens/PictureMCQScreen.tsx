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
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import kgQuestionsData from '@/data/kgMCQData.json';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

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

const typedPictureQuestionsData = kgQuestionsData as PictureMCQData;

interface PictureMCQScreenProps {
  onBackToInstructions: () => void;
}

export default function PictureMCQScreen({ onBackToInstructions }: PictureMCQScreenProps) {
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
  const [showResult, setShowResult] = useState(false);
  const { t } = useTranslation();

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
      
      // For KG students, always allow access
      if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
        setIsAuthorized(true);
        
        // Check if we need to reset the state
        if (params?.reset === 'true') {
          handleRetry();
        }
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
    setShowResult(false);
    setDroppedOption(null);
  };

  const handleGoToInstructions = () => {
    // Reset states but stay in the picture questions interface
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowResult(false);
    setScore(0);
    setDroppedOption(null);
    // Navigate to the KG dashboard instead of regular MCQ
    router.push('/kg-dashboard');
  };

  const getMessage = () => {
    if (percentage >= 90) return t('mcq.results.message.outstanding');
    if (percentage >= 70) return t('mcq.results.message.great');
    if (percentage >= 50) return t('mcq.results.message.good');
    return t('mcq.results.message.keepLearning');
  };

  const handleNavigation = () => {
    if (!currentQuestion) return;
    const currentScore = Number(score) || 0; // Ensure score is a number
    if (isLastQuestion) {
      setShowResult(true);
    } else {
      handleNextQuestion();
    }
  };

  if (!isAuthorized) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
            <ThemedText style={[styles.unauthorizedText, { color: isDarkMode ? '#A0A0A5' : '#6B54AE' }]}>
              {t('mcq.pictureQuiz.unauthorizedText')}
            </ThemedText>
            <TouchableOpacity
              style={[styles.pictureButton, styles.pictureHomeButton]}
              onPress={() => router.push('/mcq')}
            >
              <ThemedText style={styles.pictureHomeButtonText}>{t('mcq.pictureQuiz.goToRegularQuestions')}</ThemedText>
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
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
            <ThemedView style={[styles.formContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
              <ThemedText style={[styles.formTitle, { color: colors.tint }]}>{t('mcq.pictureQuiz.noQuestionsAvailable')}</ThemedText>
              <TouchableOpacity
                style={[styles.pictureButton, styles.pictureHomeButton]}
                onPress={() => router.push('/mcq')}
              >
                <ThemedText style={styles.pictureHomeButtonText}>{t('mcq.pictureQuiz.goToRegularQuestions')}</ThemedText>
                <IconSymbol name="house.fill" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (showResult) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoToInstructions}
            >
              <IconSymbol name="house.fill" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>
              {t('mcq.results.title')}
            </ThemedText>
            <View style={styles.headerRight}>
              <LanguageToggle colors={colors} />
              <TouchableOpacity 
                onPress={() => router.push('/profile')}
                style={[styles.profileIconContainer, { backgroundColor: colors.tint + '20' }]}
              >
                <IconSymbol name="person.fill" size={24} color={colors.tint} />
              </TouchableOpacity>
            </View>
          </View>
          <LinearGradient
            colors={['#6B54AE', '#4CAF50']}
            style={styles.resultGradientContainer}
          >
            <ScrollView style={styles.scrollView}>
              <Animated.View style={[styles.resultContainer]}>
                <View style={styles.resultContent}>
                  {/* Trophy Icon */}
                  <View style={styles.trophyContainer}>
                    <IconSymbol 
                      name="trophy.fill" 
                      size={80} 
                      color="#FFD700" 
                    />
                  </View>

                  {/* Score Display */}
                  <View style={styles.scoreContainer}>
                    <View style={styles.scoreCircle}>
                      <ThemedText style={[styles.scoreText, { color: '#FFFFFF' }]}>
                        {score}/{questions.length}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Percentage Badge */}
                  <View style={styles.percentageContainer}>
                    <ThemedText style={styles.percentageText}>
                      {percentage}%
                    </ThemedText>
                  </View>
                  
                  {/* Encouraging Message */}
                  <View style={styles.messageContainer}>
                    <ThemedText style={styles.messageText}>
                      {getMessage()}
                    </ThemedText>
                  </View>

                  {/* Stars Animation */}
                  <View style={styles.starsContainer}>
                    {[...Array(5)].map((_, index) => (
                      <IconSymbol 
                        key={index}
                        name="trophy.fill" 
                        size={30} 
                        color={index < Math.ceil(percentage/20) ? "#FFD700" : "#E0E0E0"}
                        style={styles.star}
                      />
                    ))}
                  </View>
                </View>
              </Animated.View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={handleRetry}
                >
                  <IconSymbol name="chevron.right" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.retryButtonText}>{t('mcq.results.tryAgain')}</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.homeButton]}
                  onPress={handleGoToInstructions}
                >
                  <IconSymbol name="house.fill" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.buttonText}>{t('mcq.pictureQuiz.goToInstructions')}</ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoToInstructions}
          >
            <IconSymbol name="house.fill" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            {t('mcq.pictureQuiz.title')}
          </ThemedText>
          <View style={styles.headerRight}>
            <LanguageToggle colors={colors} />
            <ProfileAvatar colors={colors} />
          </View>
        </View>
        <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]}>
                <View style={[styles.progressFill, { backgroundColor: '#6B54AE' }]} />
              </View>
              <View style={styles.progressLabels}>
                <View style={styles.questionLabelContainer}>
                  <ThemedText style={[styles.progressText, { color: '#6B54AE' }]}>
                    {t('mcq.question')} {currentQuestionIndex + 1} {t('mcq.of')} {questions.length}
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
                    <ThemedText style={styles.celebrationText}>{t('mcq.correct')}</ThemedText>
                  </View>
                </Animated.View>

                {/* Incorrect Animation */}
                <Animated.View style={[styles.incorrectContainer, incorrectAnimatedStyle]}>
                  <View style={[styles.incorrectContent, { backgroundColor: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)' }]}>
                    <IconSymbol name="xmark.circle.fill" size={80} color="#F44336" />
                    <ThemedText style={styles.incorrectText}>{t('mcq.incorrect')}</ThemedText>
                  </View>
                </Animated.View>

                <View style={styles.optionsContainer}>
                  {currentQuestion.options.map((option) => (
                    <View
                      key={option.id}
                      style={[
                        styles.optionContainer,
                        hoveredOption === option.id && styles.optionHovered,
                        droppedOption === option.id && styles.optionDropped,
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
                    <ThemedText style={[styles.explanationTitle, { color: '#6B54AE' }]}>{t('mcq.explanation')}</ThemedText>
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
                <ThemedText style={styles.prevButtonText}>{t('mcq.previous')}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNavigation}
              >
                <ThemedText style={styles.nextButtonText}>
                  {isLastQuestion ? t('mcq.finish') : t('mcq.next')}
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
  optionContainer: {
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
  optionHovered: {
    borderColor: '#6B54AE',
    borderWidth: 3,
    backgroundColor: 'rgba(107, 84, 174, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  optionDropped: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
  correctText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  incorrectText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
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
  resultGradientContainer: {
    flex: 1,
    width: '100%',
  },
  resultContainer: {
    padding: 20,
  },
  resultContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
    padding: 20,
    marginTop: 20,
  },
  trophyContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  scoreText: {
    paddingTop: 15,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  percentageText: {
    paddingTop: 10,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    width: '100%',
  },
  messageText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 25,
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  homeButton: {
    backgroundColor: '#6B54AE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  retryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  celebrationText: {
    fontSize: 28,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FF9800',
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
  unauthorizedText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B54AE',
    marginBottom: 20,
  },
  pictureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 12,
  },
  pictureHomeButton: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#FFA000',
  },
  pictureHomeButtonText: {
    color: '#FFA000',
    fontSize: 24,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
}); 