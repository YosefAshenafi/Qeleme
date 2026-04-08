import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { TouchableOpacity, ScrollView, View, Text, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import { useTheme } from '@/core/providers/ThemeProvider';
import { useAuth } from '@/core/providers/AuthProvider';
import { getColors } from '@/features/common/constants/Colors';
import { KG_DESIGN_TOKENS } from '../constants/DesignTokens';
import { Header } from '@/features/common/components/Header';
import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { ImageSkeleton } from '@/features/common/components/ui/ImageSkeleton';
import RichText from '@/features/common/components/ui/RichText';
import ActivityTrackingService from '@/features/common/services/activityTrackingService';
import { PictureMCQStyles as styles } from './PictureMCQScreen.styles';
import { useQuizSettings } from '../hooks/useQuizSettings';
import { useQuizSounds } from '../hooks/useQuizSounds';
import { useQuizData, type Question, type Option } from '../hooks/useQuizData';
import { FireworkBurst } from './FireworkBurst';
import { ShakeOverlay } from './ShakeOverlay';
import { QuizSettingsModal } from './QuizSettingsModal';

interface PictureMCQScreenProps {
  onBackToInstructions: () => void;
}

const QuestionImage = React.memo(({
  question,
  imageStates,
  setImageStates,
  colors,
  t
}: {
  question: Question;
  imageStates: { [key: number]: { loading: boolean; error: boolean; loaded: boolean } };
  setImageStates: React.Dispatch<React.SetStateAction<{ [key: number]: { loading: boolean; error: boolean; loaded: boolean } }>>;
  colors: any;
  t: any;
}) => {
  const imageState = imageStates[question.id] || { loading: true, error: false, loaded: false };

  return (
    <>
      {(!imageState.loaded && !imageState.error && question.image) && (
        <ImageSkeleton
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        />
      )}
      {question.image && !imageState.error && (
        <Image
          key={`question-image-${question.id}`}
          source={{ uri: question.image }}
          style={styles.questionImage}
          resizeMode="contain"
          onLoadStart={() => {
            setImageStates(prev => {
              const existing = prev[question.id];
              if (existing && existing.loaded) return prev;
              return { ...prev, [question.id]: { loading: true, error: false, loaded: false } };
            });
          }}
          onLoad={() => {
            setImageStates(prev => ({ ...prev, [question.id]: { loading: false, error: false, loaded: true } }));
          }}
          onError={() => {
            setImageStates(prev => ({ ...prev, [question.id]: { loading: false, error: true, loaded: false } }));
          }}
        />
      )}
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
  const { user, logout } = useAuth();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const categoryId = (params.categoryId as string) || '';
  const subcategoryId = params.subcategoryId as string | undefined;
  const isSubcategory = params.isSubcategory === 'true';

  const {
    soundEnabled, setSoundEnabled, autoAdvanceDelay, setAutoAdvanceDelay, saveSettings,
  } = useQuizSettings();
  const { playCorrectSound, playIncorrectSound } = useQuizSounds(soundEnabled);
  const {
    questions, loading, error, allCategories, nextCategory, imageStates, setImageStates,
    fetchQuestions, preloadImages,
  } = useQuizData(categoryId, subcategoryId, isSubcategory);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [droppedOption, setDroppedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCorrectVideo, setShowCorrectVideo] = useState(false);
  const [showIncorrectVideo, setShowIncorrectVideo] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [dropZones, setDropZones] = useState<{ [key: string]: { x: number; y: number; width: number; height: number } }>({});

  const dropZonesRef = useRef(dropZones);
  dropZonesRef.current = dropZones;

  const updateDropZone = useCallback((optionId: string, zone: { x: number; y: number; width: number; height: number }) => {
    setDropZones(prev => {
      const updated = { ...prev, [optionId]: zone };
      dropZonesRef.current = updated;
      return updated;
    });
  }, []);

  useEffect(() => {
    setDropZones({});
  }, [currentQuestionIndex]);

  const imagePosition = useSharedValue({ x: 0, y: 0 });
  const imageScale = useSharedValue(1);
  const isDraggingShared = useSharedValue(false);
  const hoveredOptionShared = useSharedValue<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const percentage = Math.round((score / questions.length) * 100);

  const getLocalizedCategoryName = useCallback(() => {
    if (!categoryId || allCategories.length === 0) {
      return (params.category as string) || 'Category';
    }
    const category = allCategories.find(cat => cat.id === parseInt(categoryId));
    if (!category) return (params.category as string) || 'Category';
    return i18n.language === 'am' ? (category.name_am || category.name_en) : category.name_en;
  }, [categoryId, params.category, allCategories, i18n.language]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: imagePosition.value.x },
      { translateY: imagePosition.value.y },
      { scale: imageScale.value },
    ],
  } as any));

  const updateHoveredOption = useCallback((optionId: string | null) => {
    setHoveredOption(optionId);
  }, []);

  const handleAnswerSelection = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    if (selectedOption) {
      setDroppedOption(optionId);
      setSelectedAnswer(optionId);
      if (selectedOption.isCorrect) {
        setScore(prev => prev + 1);
        setShowCorrectVideo(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playCorrectSound();
      } else {
        setShowIncorrectVideo(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        playIncorrectSound();
      }
    }
  }, [currentQuestion, playCorrectSound, playIncorrectSound]);

  const imagePan = Gesture.Pan()
    .onStart(() => {
      'worklet';
      if (droppedOption) return;
      isDraggingShared.value = true;
      imageScale.value = withSpring(0.5);
    })
    .onUpdate((event) => {
      'worklet';
      if (droppedOption) return;
      imagePosition.value = { x: event.translationX, y: event.translationY };
      const imageCenterX = event.absoluteX;
      const imageCenterY = event.absoluteY;
      let closestOption: string | null = null;
      let minDistance = Infinity;
      const zones = dropZonesRef.current;
      const zoneKeys = Object.keys(zones);
      if (zoneKeys.length === 0) {
        return;
      }
      zoneKeys.forEach((optionId) => {
        const zone = zones[optionId];
        const zoneCenterX = zone.x + zone.width / 2;
        const zoneCenterY = zone.y + zone.height / 2;
        const distance = Math.sqrt(Math.pow(imageCenterX - zoneCenterX, 2) + Math.pow(imageCenterY - zoneCenterY, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestOption = optionId;
        }
      });
      runOnJS(updateHoveredOption)(closestOption);
      hoveredOptionShared.value = closestOption;
    })
    .onEnd(() => {
      'worklet';
      if (droppedOption) return;
      isDraggingShared.value = false;
      imageScale.value = withSpring(1);
      imagePosition.value = withSpring({ x: 0, y: 0 });
      runOnJS(updateHoveredOption)(null);
      const currentHoveredOption = hoveredOptionShared.value;
      if (currentHoveredOption) {
        runOnJS(handleAnswerSelection)(currentHoveredOption);
      }
      hoveredOptionShared.value = null;
    });

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
        setIsAuthorized(true);
      }
    };
    checkAuth();
    setSessionStartTime(Date.now());
  }, [user]);

  useEffect(() => {
    setDropZones({});
  }, [currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (!currentQuestion) return;
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex + 1 < questions.length) {
        preloadImages(questions.slice(nextIndex + 1, Math.min(nextIndex + 4, questions.length)));
      }
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCorrectVideo(false);
      setShowIncorrectVideo(false);
      setDroppedOption(null);
      setHoveredOption(null);
      setDropZones({});
    } else {
      setShowResult(true);
    }
  }, [currentQuestion, currentQuestionIndex, questions, preloadImages]);

  const handleGoToInstructions = () => {
    router.push('/kg-dashboard');
  };

  const getMessage = () => {
    if (percentage >= 90) return t('mcq.results.message.outstanding');
    if (percentage >= 70) return t('mcq.results.message.great');
    if (percentage >= 50) return t('mcq.results.message.good');
    return t('mcq.results.message.keepLearning');
  };

  const handleRetry = () => {
    if (nextCategory) {
      const categoryName = i18n.language === 'am' ? (nextCategory.name_am || nextCategory.name_en) : nextCategory.name_en;
      if (nextCategory.has_subcategories) {
        router.push(`/kg-subcategories?categoryId=${nextCategory.id}&categoryName=${categoryName}`);
      } else {
        router.push({ pathname: '/picture-mcq', params: { category: categoryName, categoryId: nextCategory.id } });
      }
    } else {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCorrectVideo(false);
      setShowIncorrectVideo(false);
      setScore(0);
      setShowResult(false);
    }
  };

  if (!isAuthorized) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.unauthorizedText, { color: isDarkMode ? '#A0A0A5' : '#6B54AE' }]}>
              {t('mcq.pictureQuiz.unauthorizedText')}
            </ThemedText>
            <TouchableOpacity style={[styles.pictureButton, styles.pictureHomeButton]} onPress={() => router.push('/(tabs)/practice')}>
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.formTitle, { color: colors.tint }]}>❌ {error}</ThemedText>
              <TouchableOpacity style={[styles.pictureButton, styles.pictureHomeButton]} onPress={fetchQuestions}>
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.formTitle, { color: colors.tint }]}>{t('mcq.pictureQuiz.noQuestionsAvailable')}</ThemedText>
              <TouchableOpacity style={[styles.pictureButton, styles.pictureHomeButton]} onPress={() => router.push('/(tabs)/practice')}>
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
            <TouchableOpacity style={styles.backButton} onPress={handleGoToInstructions}>
              <IconSymbol name="house.fill" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : undefined }]}>
              {t('mcq.results.title')}
            </ThemedText>
            <View style={styles.headerRight}>
              <LanguageToggle colors={{ ...colors, text: isDarkMode ? '#FFFFFF' : colors.tint }} />
            </View>
          </View>
          <LinearGradient colors={['#4CAF50', '#2196F3', '#00BCD4']} style={styles.resultGradientContainer}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.resultContent}>
                <View style={styles.celebrationEmojiContainer}>
                  <Text style={styles.celebrationEmoji}>
                    {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
                  </Text>
                </View>
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreCircle}>
                    <ThemedText style={[styles.scoreText, { color: '#FFFFFF' }]}>
                      {score}/{questions.length}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.percentageContainer}>
                  <ThemedText style={styles.percentageText}>{percentage}%</ThemedText>
                </View>
                <View style={styles.messageContainer}>
                  <ThemedText style={[styles.messageText, styles.funMessageText]}>{getMessage()}</ThemedText>
                </View>
                <View style={styles.starsContainer}>
                  {[...Array(5)].map((_, index) => (
                    <IconSymbol
                      key={index}
                      name="star.fill"
                      size={40}
                      color={index < Math.ceil(percentage / 20) ? "#FFD700" : "rgba(255,255,255,0.3)"}
                      style={styles.star}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.retryButton, nextCategory && { backgroundColor: '#FF9800' }]}
                  onPress={handleRetry}
                >
                  <IconSymbol name={nextCategory ? "arrow.right.circle.fill" : "chevron.right"} size={24} color="#FFFFFF" />
                  <ThemedText style={styles.retryButtonText}>
                    {nextCategory ? t('mcq.results.tryOtherQuestions', 'Try other remaining Questions') : t('mcq.results.tryAgain')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={handleGoToInstructions}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.buttonText}>{i18n.language === 'am' ? 'ያጠናቅቁ' : 'Done'}</ThemedText>
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { backgroundColor: '#FFFFFF', paddingHorizontal: 0 }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoToInstructions}>
            <Ionicons name="chevron-back" size={28} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitleText}>{getLocalizedCategoryName()}</Text>
          </View>
          <View style={[styles.headerRight, { marginRight: 10 }]}>
            <LanguageToggle colors={{ card: 'transparent', text: KG_DESIGN_TOKENS.colors.primary, tint: KG_DESIGN_TOKENS.colors.primary }} />
            <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={KG_DESIGN_TOKENS.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <LinearGradient colors={['#f0f4ff', '#e8f5e9', '#fff8e1']} style={styles.funContainer}>
          <QuizSettingsModal
            visible={showSettings}
            onClose={() => setShowSettings(false)}
            soundEnabled={soundEnabled}
            onSoundToggle={(value) => { setSoundEnabled(value); saveSettings(value, autoAdvanceDelay); }}
            autoAdvanceDelay={autoAdvanceDelay}
            onDelayChange={(delay) => { setAutoAdvanceDelay(delay); saveSettings(soundEnabled, delay); }}
            onLogout={() => { setShowSettings(false); logout(); }}
          />
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.kgProgressContainer}>
              <View style={styles.kgProgressBar}>
                <View
                  style={[styles.kgProgressFill, { backgroundColor: KG_DESIGN_TOKENS.colors.primary, width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]}
                />
              </View>
              <Text style={styles.kgProgressText}>{currentQuestionIndex + 1} / {questions.length}</Text>
            </View>
            {currentQuestion && (
              <>
                <GestureDetector gesture={imagePan}>
                  <Animated.View style={[styles.imageContainer, imageAnimatedStyle, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
                    <QuestionImage
                      question={currentQuestion}
                      imageStates={imageStates}
                      setImageStates={setImageStates}
                      colors={colors}
                      t={t}
                    />
                    <FireworkBurst visible={showCorrectVideo} onAnimationEnd={handleNextQuestion} delay={autoAdvanceDelay} />
                    <ShakeOverlay visible={showIncorrectVideo} onAnimationEnd={handleNextQuestion} language={i18n.language} delay={autoAdvanceDelay} />
                  </Animated.View>
                </GestureDetector>
                <View style={styles.kgOptionsContainer}>
                  {currentQuestion.options.map((option, index) => {
                    const funColors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'];
                    const funColor = funColors[index % funColors.length];
                    const isHovered = hoveredOption === option.id;
                    return (
                      <View
                        key={option.id}
                        onLayout={(event) => {
                          const { x, y, width, height } = event.nativeEvent.layout;
                          event.target.measureInWindow((pageX, pageY, measuredWidth, measuredHeight) => {
                            updateDropZone(option.id, { x: pageX, y: pageY, width: measuredWidth || width, height: measuredHeight || height });
                          });
                        }}
                      >
                        <TouchableOpacity
                          style={[styles.kgOptionButton, styles.kgOptionButtonBounce, isHovered && styles.kgOptionButtonHovered, { backgroundColor: selectedAnswer === option.id ? (option.isCorrect ? '#4CAF50' : '#F44336') : isHovered ? '#2E7D32' : funColor }]}
                          onPress={() => handleAnswerSelection(option.id)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.optionTextRow}>
                            <Text style={styles.kgOptionText}>{option.text_en}</Text>
                            <Text style={styles.kgOptionTextAmharic}>{option.text_am}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.instructionTextContainer}>
                  <ThemedText style={[styles.instructionText, { color: isDarkMode ? colors.text + 'CC' : '#666666' }]}>
                    {t('mcq.pictureQuiz.dragInstruction')}
                  </ThemedText>
                </View>
                {showExplanation && currentQuestion?.explanation && currentQuestion.explanation.trim() !== '' && currentQuestion.explanation !== 'No explanation available' && (
                  <View style={[styles.explanationContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5' }]}>
                    <ThemedText style={[styles.explanationTitle, { color: '#6B54AE' }]}>{t('mcq.explanation')}</ThemedText>
                    <RichText text={currentQuestion.explanation} style={styles.explanationText} color={colors.text} fontSize={16} textAlign="left" lineHeight={24} />
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
