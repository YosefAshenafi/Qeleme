import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Image, Modal, Text, ActivityIndicator } from 'react-native';
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
import { Video, ResizeMode } from 'expo-av';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ImageSkeleton } from '@/components/ui/ImageSkeleton';
import { getKGQuestions, getKGSubcategoryQuestions, KGQuestion } from '@/services/kgService';

// No local image mapping needed - we'll use remote images from the API

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

interface PictureMCQScreenProps {
  onBackToInstructions: () => void;
}

// Memoized image component for better performance
const QuestionImage = React.memo(({ 
  question, 
  imageStates, 
  setImageStates, 
  isDarkMode, 
  colors, 
  t 
}: {
  question: Question;
  imageStates: { [key: number]: { loading: boolean; error: boolean; loaded: boolean } };
  setImageStates: React.Dispatch<React.SetStateAction<{ [key: number]: { loading: boolean; error: boolean; loaded: boolean } }>>;
  isDarkMode: boolean;
  colors: any;
  t: any;
}) => {
  const imageState = imageStates[question.id] || { loading: false, error: false, loaded: false };
  
  return (
    <>
      {/* Image Loading Skeleton - only show if not loaded and not error */}
      {(!imageState.loaded && !imageState.error && question.image) && (
        <ImageSkeleton 
          width="100%" 
          height="100%" 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        />
      )}
      
      {/* Main Image */}
      {question.image && !imageState.error && (
        <Image
          source={{ uri: question.image }}
          style={styles.questionImage}
          resizeMode="contain"
          onLoadStart={() => {
            setImageStates(prev => ({ 
              ...prev, 
              [question.id]: { loading: true, error: false, loaded: false } 
            }));
          }}
          onLoad={() => {
            setImageStates(prev => ({ 
              ...prev, 
              [question.id]: { loading: false, error: false, loaded: true } 
            }));
          }}
          onError={() => {
            setImageStates(prev => ({ 
              ...prev, 
              [question.id]: { loading: false, error: true, loaded: false } 
            }));
          }}
        />
      )}
      
      {/* Image Error State */}
      {imageState.error && (
        <View style={styles.imageErrorContainer}>
          <IconSymbol name="photo" size={48} color={colors.text} />
          <ThemedText style={[styles.imageErrorText, { color: colors.text }]}>
            {t('common.imageLoadError', 'Image failed to load')}
          </ThemedText>
        </View>
      )}
    </>
  );
});

export default function PictureMCQScreen({ onBackToInstructions }: PictureMCQScreenProps) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState<number>(0);

  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropZones, setDropZones] = useState<{ [key: string]: { x: number, y: number, width: number, height: number } }>({});
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [droppedOption, setDroppedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageStates, setImageStates] = useState<{ [key: number]: { loading: boolean; error: boolean; loaded: boolean } }>({});
  const { t } = useTranslation();

  // Transform API questions to the expected format
  const transformQuestions = useCallback((apiQuestions: KGQuestion[]): Question[] => {
    return apiQuestions.map((apiQuestion, index) => ({
      id: apiQuestion.id,
      question: `What is shown in this image?`,
      image: apiQuestion.image_url,
      options: apiQuestion.choices.map((choice, choiceIndex) => ({
        id: String.fromCharCode(65 + choiceIndex), // A, B, C, D...
        text: choice.text_en, // Use English text for now
        isCorrect: choice.is_correct
      })),
      explanation: `This is a ${apiQuestion.image_alt}.`
    }));
  }, []);

  // Preload images for better performance using React Native Image.prefetch
  const preloadImages = useCallback(async (questions: Question[]) => {
    const imagePromises = questions.map(async (question) => {
      if (question.image) {
        try {
          // Use React Native's Image.prefetch for better performance
          await Image.prefetch(question.image);
          
          // Mark as preloaded
          setImageStates(prev => ({ 
            ...prev, 
            [question.id]: { loading: false, error: false, loaded: true } 
          }));
        } catch (error) {
          // Mark as error
          setImageStates(prev => ({ 
            ...prev, 
            [question.id]: { loading: false, error: true, loaded: false } 
          }));
        }
      }
    });

    // Start preloading in background
    Promise.allSettled(imagePromises);
  }, []);

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryId = params.categoryId as string;
      const subcategoryId = params.subcategoryId as string;
      const isSubcategory = params.isSubcategory === 'true';
      
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      let apiQuestions: KGQuestion[];
      
      if (isSubcategory && subcategoryId) {
        // Fetch questions for subcategory
        const { questions } = await getKGSubcategoryQuestions(parseInt(subcategoryId));
        apiQuestions = questions;
        console.log('Raw API subcategory questions:', apiQuestions); // DEBUG LOG
      } else {
        // Fetch questions for main category
        const { questions } = await getKGQuestions(parseInt(categoryId));
        apiQuestions = questions;
        console.log('Raw API category questions:', apiQuestions); // DEBUG LOG
      }
      
      const transformedQuestions = transformQuestions(apiQuestions);
      console.log('Fetched and transformed questions:', transformedQuestions); // DEBUG LOG
      setQuestions(transformedQuestions);
      
      // Start preloading images immediately
      preloadImages(transformedQuestions);
    } catch (err) {
      console.error('Error fetching KG questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const percentage = Math.round((score / questions.length) * 100);

  // Memoize expensive calculations
  const memoizedCurrentQuestion = useMemo(() => currentQuestion, [currentQuestion]);
  const memoizedPercentage = useMemo(() => percentage, [score, questions.length]);
  const memoizedIsFirstQuestion = useMemo(() => isFirstQuestion, [currentQuestionIndex]);
  const memoizedIsLastQuestion = useMemo(() => isLastQuestion, [currentQuestionIndex, questions.length]);

  // Animation refs
  const scaleAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const imagePosition = useSharedValue({ x: 0, y: 0 });
  const imageScale = useSharedValue(1);
  const isDraggingShared = useSharedValue(false);
  
  // Video animation states
  const [showCorrectVideo, setShowCorrectVideo] = useState(false);
  const [showIncorrectVideo, setShowIncorrectVideo] = useState(false);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: imagePosition.value.x },
        { translateY: imagePosition.value.y },
        { scale: imageScale.value },
      ],
    };
  });



  useAnimatedReaction(
    () => isDraggingShared.value,
    (value) => {
      runOnJS(setIsDragging)(value);
    }
  );

  // Optimized gesture handling with throttled updates
  const updateHoveredOption = useCallback((optionId: string | null) => {
    setHoveredOption(optionId);
  }, []);

  const updateDropZones = useCallback((zones: { [key: string]: { x: number, y: number, width: number, height: number } }) => {
    setDropZones(zones);
  }, []);

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

      // Calculate distances to each option with throttling
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

      runOnJS(updateHoveredOption)(closestOption);
    })
    .onEnd(() => {
      'worklet';
      // Don't process drop if an option has already been dropped
      if (droppedOption) return;
      
      isDraggingShared.value = false;
      imageScale.value = withSpring(1);
      imagePosition.value = withSpring({ x: 0, y: 0 });
      runOnJS(updateHoveredOption)(null);

      if (hoveredOption && currentQuestion) {
        const selectedOption = currentQuestion.options.find(opt => opt.id === hoveredOption);
        if (selectedOption) {
          runOnJS(setDroppedOption)(hoveredOption);
          runOnJS(setSelectedAnswer)(hoveredOption);
          
          if (selectedOption.isCorrect) {
            // Simplified score update
            runOnJS(setScore)(score + 1);
            runOnJS(setShowCorrectVideo)(true);
          } else {
            // Incorrect animation
            runOnJS(setShowIncorrectVideo)(true);
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

  // Fetch questions when component mounts
  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleNextQuestion = () => {
    console.log('handleNextQuestion called', { currentQuestionIndex, questionsLength: questions.length });
    if (!currentQuestion) {
      console.log('No current question, returning');
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      console.log('Moving to next question', { from: currentQuestionIndex, to: currentQuestionIndex + 1 });
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCorrectVideo(false);
      setShowIncorrectVideo(false);
      setDroppedOption(null);
      setHoveredOption(null);
    } else {
      console.log('Already at last question');
    }
  };

  const handlePreviousQuestion = () => {
    if (!currentQuestion) return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCorrectVideo(false);
      setShowIncorrectVideo(false);
      setDroppedOption(null);
      setHoveredOption(null);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowCorrectVideo(false);
    setShowIncorrectVideo(false);
    setScore(0);
    setShowResult(false);
    setDroppedOption(null);
    setHoveredOption(null);
  };

  const handleGoToInstructions = () => {
    // Reset states but stay in the picture questions interface
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowResult(false);
    setScore(0);
    setDroppedOption(null);
    setHoveredOption(null);
    setShowCorrectVideo(false);
    setShowIncorrectVideo(false);
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

  // Auto-advance to next question after showing video animations
  useEffect(() => {
    if (selectedAnswer && (showCorrectVideo || showIncorrectVideo)) {
      console.log('Auto-advance timer started', { currentQuestionIndex, questionsLength: questions.length });
      const timer = setTimeout(() => {
        console.log('Auto-advance timer triggered', { currentQuestionIndex, questionsLength: questions.length });
        // Hide videos first
        setShowCorrectVideo(false);
        setShowIncorrectVideo(false);
        
        if (currentQuestionIndex < questions.length - 1) {
          console.log('Moving to next question');
          handleNextQuestion();
        } else {
          console.log('Showing results');
          setShowResult(true);
        }
      }, 3000); // Wait 4 seconds to show the video

      return () => clearTimeout(timer);
    }
  }, [selectedAnswer, showCorrectVideo, showIncorrectVideo]);



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

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
            <ThemedView style={[styles.formContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
              <ActivityIndicator size="large" color={colors.tint} />
              <ThemedText style={[styles.formTitle, { color: colors.tint }]}>
                {t('common.loading', 'Loading questions...')}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (error) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
            <ThemedView style={[styles.formContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
              <ThemedText style={[styles.formTitle, { color: colors.tint }]}>
                ❌ {error}
              </ThemedText>
              <TouchableOpacity
                style={[styles.pictureButton, styles.pictureHomeButton]}
                onPress={fetchQuestions}
              >
                <ThemedText style={styles.pictureHomeButtonText}>{t('common.retry', 'Retry')}</ThemedText>
                <IconSymbol name="chevron.right" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </ThemedView>
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
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : '#F8F9FA' }]}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? '#000000' : '#F8F9FA' }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.tint + '20' }]}
            onPress={handleGoToInstructions}
          >
            <IconSymbol name="house.fill" size={24} color={colors.tint} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
              🎨 {t('mcq.pictureQuiz.title', 'Picture Quiz')} 🎨
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: colors.text + '80' }]}>
              {t('mcq.pictureQuiz.subtitle', 'Let\'s learn with pictures!')} 🖼️
            </ThemedText>
          </View>
          <View style={styles.headerRight}>
            <LanguageToggle colors={colors} />
            <ProfileAvatar colors={colors} />
          </View>
        </View>
        <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8F9FA' }]}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.progressContainer}>
              <LinearGradient
                colors={[colors.tint, colors.tint + 'DD']}
                style={styles.progressGradient}
              >
                                  <View style={styles.progressContent}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              backgroundColor: '#FFFFFF',
                              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                            }
                          ]} 
                        />
                      </View>
                    </View>
                    <View style={styles.progressLabels}>
                      <ThemedText style={styles.progressText}>
                        🎯 {t('mcq.question', 'Question')} {currentQuestionIndex + 1} {t('mcq.of', 'of')} {questions.length} 🎯
                      </ThemedText>
                    </View>
                  </View>
              </LinearGradient>
            </View>

            {memoizedCurrentQuestion && (
              <>
                <View style={styles.questionContainer}>
                  <LinearGradient
                    colors={[colors.tint + '20', colors.tint + '10']}
                    style={styles.questionGradient}
                  >
                    <ThemedText style={[styles.questionText, { color: colors.text }]}>
                      🤔 {memoizedCurrentQuestion.question} 🤔
                    </ThemedText>
                  </LinearGradient>
                </View>

                <GestureDetector gesture={imagePan}>
                  <Animated.View 
                    style={[
                      styles.imageContainer,
                      imageAnimatedStyle,
                      { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
                    ]}
                  >
                                         <QuestionImage 
                       question={memoizedCurrentQuestion}
                       imageStates={imageStates}
                       setImageStates={setImageStates}
                       isDarkMode={isDarkMode}
                       colors={colors}
                       t={t}
                     />
                  </Animated.View>
                </GestureDetector>

                                {/* Correct Video Animation */}
                {showCorrectVideo && (
                  <View style={styles.inlineVideoContainer}>
                    <Video
                      source={require('@/assets/animations/correct.mp4')}
                      style={styles.inlineVideo}
                      shouldPlay
                      isLooping={true}
                      resizeMode={ResizeMode.CONTAIN}
                      onPlaybackStatusUpdate={(status) => {
                        if ('didJustFinish' in status && status.didJustFinish) {
                          console.log('Correct video finished');
                          // Don't hide the video - let the auto-advance timer handle it
                        }
                      }}
                    />
                  </View>
                )}

                {/* Incorrect Video Animation */}
                {showIncorrectVideo && (
                  <View style={styles.inlineVideoContainer}>
                    <Video
                      source={require('@/assets/animations/not-correct.mp4')}
                      style={styles.inlineVideo}
                      shouldPlay
                      isLooping={true}
                      resizeMode={ResizeMode.CONTAIN}
                      onPlaybackStatusUpdate={(status) => {
                        if ('didJustFinish' in status && status.didJustFinish) {
                          console.log('Incorrect video finished');
                          // Don't hide the video - let the auto-advance timer handle it
                        }
                      }}
                    />
                  </View>
                )}

                <View style={styles.optionsContainer}>
                  {memoizedCurrentQuestion.options.map((option) => (
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

                {showExplanation && memoizedCurrentQuestion?.explanation && memoizedCurrentQuestion.explanation.trim() !== '' && memoizedCurrentQuestion.explanation !== 'No explanation available' && (
                  <View style={[styles.explanationContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5' }]}>
                    <ThemedText style={[styles.explanationTitle, { color: '#6B54AE' }]}>{t('mcq.explanation')}</ThemedText>
                    <ThemedText style={[styles.explanationText, { color: colors.text }]}>
                      {memoizedCurrentQuestion.explanation}
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
                disabled={memoizedIsFirstQuestion}
              >
                <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#6B54AE" />
                <ThemedText style={styles.prevButtonText}>{t('mcq.previous')}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNavigation}
                testID="next-button"
              >
                <ThemedText style={styles.nextButtonText}>
                  {memoizedIsLastQuestion ? t('mcq.finish') : t('mcq.next')}
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
    paddingHorizontal: 20,
  },
  progressGradient: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  questionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  questionGradient: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  questionImage: {
    width: '100%',
    height: '100%',
  },
  imageErrorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageErrorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  optionContainer: {
    width: '48%',
    minHeight: 100,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 2,
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
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    flexWrap: 'wrap',
    fontWeight: '600',
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
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
      inlineVideoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: -300,
      paddingHorizontal: 20,
      minHeight: 350,
      zIndex: 1000,
    },
      inlineVideo: {
      width: 300,
      height: 300,
    },
}); 