import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Image, Modal, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/shared/constants/Colors';
import { KG_DESIGN_TOKENS } from '../constants/DesignTokens';
import { useAuth } from '@/core/providers/AuthProvider';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  runOnJS,
  useAnimatedReaction,
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import { Header } from '@/shared/components/Header';
import { ThemedText } from '@/shared/components/ThemedText';
import { ThemedView } from '@/shared/components/ThemedView';
import { IconSymbol } from '@/shared/components/ui/IconSymbol';
import { ProfileAvatar } from '@/shared/components/ui/ProfileAvatar';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { ImageSkeleton } from '@/shared/components/ui/ImageSkeleton';
import RichText from '@/shared/components/ui/RichText';
import { getKGQuestions, getKGSubcategoryQuestions, getKGCategories, KGQuestion, KGCategory } from '@/shared/services/kgService';
import ActivityTrackingService from '@/shared/services/activityTrackingService';

// No local image mapping needed - we'll use remote images from the API

interface Option {
  id: string;
  text: string;
  text_en: string;
  text_am: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  image: string;
  image_url?: string; // Added to support images in rich text
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
  const imageState = imageStates[question.id] || { loading: true, error: false, loaded: false };

  // Initialize loading state if not set for this question
  React.useEffect(() => {
    if (question.image && !imageStates[question.id]) {
      setImageStates(prev => ({
        ...prev,
        [question.id]: { loading: true, error: false, loaded: false }
      }));
    }
  }, [question.id, question.image]);

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
          key={`question-image-${question.id}`}
          source={{ uri: question.image }}
          style={styles.questionImage}
          resizeMode="contain"
          onLoadStart={() => {
            // Only set loading if not already loaded
            setImageStates(prev => {
              const existing = prev[question.id];
              if (existing && existing.loaded) return prev;
              return {
                ...prev,
                [question.id]: { loading: true, error: false, loaded: false }
              };
            });
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

const FIREWORK_COLORS = ['#FFD700', '#FF4136', '#FF851B', '#FFFFFF', '#FF69B4', '#7FDBFF', '#01FF70', '#FFDC00'];
const FIREWORK_COLORS2 = ['#FF0000', '#FFFF00', '#FF6600', '#FFFFFF'];
const FIREWORK_COLORS3 = ['#00FF00', '#00FFFF', '#FF00FF', '#FFFFFF'];

interface FireworkParticle {
  id: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
}

const FireworkBurst = ({ visible, onAnimationEnd }: { visible: boolean; onAnimationEnd?: () => void }) => {
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setBurstKey(prev => prev + 1);

      // Call onAnimationEnd after animation completes (1500ms)
      const timer = setTimeout(() => {
        onAnimationEnd?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const fireworks = useMemo(() => {
    const bursts = [];
    for (let b = 0; b < 1; b++) {
      const colorSet = b === 0 ? FIREWORK_COLORS : b === 1 ? FIREWORK_COLORS2 : b === 2 ? FIREWORK_COLORS3 : b === 3 ? FIREWORK_COLORS : FIREWORK_COLORS2;
      const particles: FireworkParticle[] = [];
      const particleCount = 60;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: b * 1000 + i,
          angle: (i / particleCount) * Math.PI * 2,
          speed: 80 + Math.random() * 120,
          color: colorSet[Math.floor(Math.random() * colorSet.length)],
          size: 6 + Math.random() * 6,
        });
      }
      bursts.push({ id: b, particles, x: 50, y: 50 });
    }
    return bursts;
  }, [burstKey]);

  if (!visible) return null;

  return (
    <View style={styles.fireworkContainer} pointerEvents="none">
      {fireworks.map((firework) => (
        <View key={`${burstKey}-${firework.id}`} style={styles.fireworkOrigin}>
          {firework.particles.map((particle) => (
            <FireworkParticleComponent key={`${burstKey}-${particle.id}`} particle={particle} />
          ))}
        </View>
      ))}
    </View>
  );
};

const FireworkParticleComponent = ({ particle }: { particle: FireworkParticle }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);
  const particleOpacity = useSharedValue(1);

  useEffect(() => {
    progress.value = 0;
    opacity.value = 1;
    particleOpacity.value = 1;

    progress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 1200 });
    particleOpacity.value = withDelay(600, withTiming(0, { duration: 600 }));
  }, [particle.id]);

  const animatedStyle = useAnimatedStyle(() => {
    const x = Math.cos(particle.angle) * particle.speed * progress.value;
    const y = Math.sin(particle.angle) * particle.speed * progress.value;
    const scale = 1 - progress.value * 0.3;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: scale },
      ] as any,
      opacity: opacity.value,
    };
  });

  const dotStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.fireworkParticle, animatedStyle]}>
      <Animated.View
        style={[
          styles.fireworkDot,
          dotStyle,
          {
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            shadowColor: particle.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: particle.size,
          },
        ]}
      />
    </Animated.View>
  );
};

interface ShakeOverlayProps {
  visible: boolean;
  onAnimationEnd?: () => void;
  language?: string;
}

const ShakeOverlay = ({ visible, onAnimationEnd, language = 'en' }: ShakeOverlayProps) => {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50, easing: Easing.linear }),
        withRepeat(withTiming(10, { duration: 100, easing: Easing.linear }), 4, true),
        withTiming(0, { duration: 50 })
      );

      // Call onAnimationEnd after the shake animation completes
      const timer = setTimeout(() => {
        onAnimationEnd?.();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const getTryAgainText = () => {
    return language === 'am' ? 'እንደገና ይሞክሩ!' : 'Try Again!';
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.shakeOverlayContainer, animatedStyle]}>
      <View style={styles.shakeIconContainer}>
        <Text style={styles.shakeEmoji}>😢</Text>
        <Text style={styles.shakeText}>{getTryAgainText()}</Text>
      </View>
    </Animated.View>
  );
};

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
  const [allCategories, setAllCategories] = useState<KGCategory[]>([]);
  const [nextCategory, setNextCategory] = useState<KGCategory | null>(null);
  const { t } = useTranslation();

  // Get localized category name based on current language
  const getLocalizedCategoryName = useCallback(() => {
    const categoryId = params.categoryId as string;
    if (!categoryId || allCategories.length === 0) {
      return params.category as string || 'Category';
    }

    const category = allCategories.find(cat => cat.id === parseInt(categoryId));
    if (!category) {
      return params.category as string || 'Category';
    }

    return i18n.language === 'am' ? (category.name_am || category.name_en) : category.name_en;
  }, [params.categoryId, params.category, allCategories, i18n.language]);

  // Transform API questions to the expected format
  const transformQuestions = useCallback((apiQuestions: KGQuestion[]): Question[] => {
    return apiQuestions.map((apiQuestion, index) => ({
      id: apiQuestion.id,
      image: apiQuestion.image_url,
      options: apiQuestion.choices.map((choice, choiceIndex) => {
        // Extract only the English part (before newline) from text_en
        const englishOnly = choice.text_en.split('\n')[0].trim();

        return {
          id: String.fromCharCode(65 + choiceIndex), // A, B, C, D...
          text: choice.text_en, // Keep for backward compatibility
          text_en: englishOnly, // English text only
          text_am: choice.text_am, // Amharic text
          isCorrect: choice.is_correct
        };
      }),
      explanation: `This is a ${apiQuestion.image_alt}.`
    }));
  }, []);

  // Cache utility functions
  const getCacheKey = useCallback((categoryId: string, subcategoryId?: string): string => {
    if (subcategoryId) {
      return `kg_questions_${categoryId}_${subcategoryId}`;
    }
    return `kg_questions_${categoryId}`;
  }, []);

  const getCachedQuestions = useCallback(async (categoryId: string, subcategoryId?: string): Promise<KGQuestion[] | null> => {
    try {
      const cacheKey = getCacheKey(categoryId, subcategoryId);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // Check if cache is less than 24 hours old
        const cacheAge = Date.now() - parsed.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (cacheAge < maxAge) {
          console.log('Using cached questions for', cacheKey);
          return parsed.questions;
        } else {
          // Cache expired, remove it
          await AsyncStorage.removeItem(cacheKey);
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }, [getCacheKey]);

  const cacheQuestions = useCallback(async (categoryId: string, questions: KGQuestion[], subcategoryId?: string): Promise<void> => {
    try {
      const cacheKey = getCacheKey(categoryId, subcategoryId);
      const cacheData = {
        questions,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('Cached questions for', cacheKey);
    } catch (error) {
      console.error('Error caching questions:', error);
    }
  }, [getCacheKey]);

  // Preload image for a single question (awaited for first question)
  const preloadSingleImage = useCallback(async (question: Question): Promise<void> => {
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
  }, []);

  // Preload images for specific questions in background (non-blocking)
  const preloadImages = useCallback(async (questionsToPreload: Question[]) => {
    const imagePromises = questionsToPreload.map(async (question) => {
      if (question.image) {
        try {
          // Use React Native's Image.prefetch for better performance
          await Image.prefetch(question.image);

          // Mark as preloaded (only if not already loaded)
          setImageStates(prev => {
            const existing = prev[question.id];
            if (existing && existing.loaded) return prev;
            return {
              ...prev,
              [question.id]: { loading: false, error: false, loaded: true }
            };
          });
        } catch (error) {
          // Mark as error only if not already loaded
          setImageStates(prev => {
            const existing = prev[question.id];
            if (existing && existing.loaded) return prev;
            return {
              ...prev,
              [question.id]: { loading: false, error: true, loaded: false }
            };
          });
        }
      }
    });

    // Start preloading in background (don't await, let it run)
    Promise.allSettled(imagePromises);
  }, []);

  // Fetch questions with caching and progressive loading
  const fetchQuestions = async () => {
    try {
      setError(null);
      const categoryId = params.categoryId as string;
      const subcategoryId = params.subcategoryId as string;
      const isSubcategory = params.isSubcategory === 'true';

      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      // Check cache first
      const cachedQuestions = await getCachedQuestions(categoryId, isSubcategory ? subcategoryId : undefined);

      if (cachedQuestions && cachedQuestions.length > 0) {
        console.log('Using cached questions, transforming...');
        const transformedQuestions = transformQuestions(cachedQuestions);
        console.log('Transformed cached questions:', transformedQuestions);

        // Show first question immediately
        setQuestions(transformedQuestions);
        setLoading(false);
        setSessionStartTime(Date.now());

        // Load first question's image first (prioritize it)
        if (transformedQuestions.length > 0) {
          // Wait for first image to load before preloading others
          await preloadSingleImage(transformedQuestions[0]);

          // After first image is loaded, preload next 2-3 questions in background
          if (transformedQuestions.length > 1) {
            const nextQuestions = transformedQuestions.slice(1, Math.min(4, transformedQuestions.length));
            // Don't await - let this run in background
            preloadImages(nextQuestions);
          }
        }

        // Fetch from API in background to update cache (don't block UI)
        fetchAndUpdateCache(categoryId, subcategoryId, isSubcategory, transformedQuestions);
        return;
      }

      // No cache, fetch from API
      setLoading(true);
      let apiQuestions: KGQuestion[];

      if (isSubcategory && subcategoryId) {
        const { questions } = await getKGSubcategoryQuestions(parseInt(subcategoryId), parseInt(categoryId));
        apiQuestions = questions;
        console.log('Raw API subcategory questions:', apiQuestions);
      } else {
        const { questions } = await getKGQuestions(parseInt(categoryId));
        apiQuestions = questions;
        console.log('Raw API category questions:', apiQuestions);
      }

      // Cache the fetched questions
      await cacheQuestions(categoryId, apiQuestions, isSubcategory ? subcategoryId : undefined);

      const transformedQuestions = transformQuestions(apiQuestions);
      console.log('Fetched and transformed questions:', transformedQuestions);

      // Show first question immediately
      setQuestions(transformedQuestions);
      setLoading(false);
      setSessionStartTime(Date.now());

      // Load first question's image first (prioritize it)
      if (transformedQuestions.length > 0) {
        // Wait for first image to load before preloading others
        await preloadSingleImage(transformedQuestions[0]);

        // After first image is loaded, preload next 2-3 questions in background
        if (transformedQuestions.length > 1) {
          const nextQuestions = transformedQuestions.slice(1, Math.min(4, transformedQuestions.length));
          // Don't await - let this run in background
          preloadImages(nextQuestions);
        }
      }
    } catch (err) {
      console.error('Error fetching KG questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      setLoading(false);
    }
  };

  // Fetch from API and update cache in background (non-blocking)
  const fetchAndUpdateCache = async (
    categoryId: string,
    subcategoryId: string | undefined,
    isSubcategory: boolean,
    currentQuestions: Question[]
  ) => {
    try {
      let apiQuestions: KGQuestion[];

      if (isSubcategory && subcategoryId) {
        const { questions } = await getKGSubcategoryQuestions(parseInt(subcategoryId), parseInt(categoryId));
        apiQuestions = questions;
      } else {
        const { questions } = await getKGQuestions(parseInt(categoryId));
        apiQuestions = questions;
      }

      // Update cache with fresh data
      await cacheQuestions(categoryId, apiQuestions, isSubcategory ? subcategoryId : undefined);

      // Only update questions if current questions are different (to avoid flicker)
      const transformedQuestions = transformQuestions(apiQuestions);
      const currentIds = new Set(currentQuestions.map(q => q.id));
      const newIds = new Set(transformedQuestions.map(q => q.id));

      // Check if questions have changed
      if (currentIds.size !== newIds.size ||
        ![...currentIds].every(id => newIds.has(id))) {
        // Questions changed, update state
        setQuestions(transformedQuestions);

        // Preload any new images
        const newQuestions = transformedQuestions.filter(q => !currentIds.has(q.id));
        if (newQuestions.length > 0) {
          preloadImages(newQuestions.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Background cache update failed:', error);
      // Silently fail - we already have cached questions showing
    }
  };

  // Fetch all categories to find next category
  const fetchAllCategories = async () => {
    try {
      const categories = await getKGCategories();
      setAllCategories(categories);

      // Find next category after current one
      const currentCategoryId = parseInt(params.categoryId as string);
      const currentIndex = categories.findIndex(cat => cat.id === currentCategoryId);

      if (currentIndex !== -1 && currentIndex < categories.length - 1) {
        setNextCategory(categories[currentIndex + 1]);
      }
    } catch (err) {
      console.error('Error fetching all categories:', err);
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
  const hoveredOptionShared = useSharedValue<string | null>(null);

  // Video animation states
  const [showCorrectVideo, setShowCorrectVideo] = useState(false);
  const [showIncorrectVideo, setShowIncorrectVideo] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const imageAnimatedStyle = useAnimatedStyle<any>(() => {
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
        // Firework animation will call handleNextQuestion via onAnimationEnd
      } else {
        setShowIncorrectVideo(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        // Shake animation will call handleNextQuestion via onAnimationEnd
      }
    }
  }, [currentQuestion]);

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
      hoveredOptionShared.value = closestOption;
    })
    .onEnd(() => {
      'worklet';
      // Don't process drop if an option has already been dropped
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
    fetchAllCategories();
  }, []);

  const handleNextQuestion = () => {
    console.log('handleNextQuestion called', { currentQuestionIndex, questionsLength: questions.length });
    if (!currentQuestion) {
      console.log('No current question, returning');
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = questions[nextIndex];
      console.log('Moving to next question', { from: currentQuestionIndex, to: nextIndex });

      // Preload images for upcoming questions synchronously before moving
      if (nextIndex + 1 < questions.length) {
        const upcomingQuestions = questions.slice(nextIndex + 1, Math.min(nextIndex + 4, questions.length));
        preloadImages(upcomingQuestions);
      }

      // Only reset image state if not already preloaded/cached
      if (nextQuestion && nextQuestion.image) {
        const currentImageState = imageStates[nextQuestion.id];
        if (!currentImageState || !currentImageState.loaded) {
          Image.prefetch(nextQuestion.image).then(() => {
            setImageStates(prev => ({
              ...prev,
              [nextQuestion.id]: { loading: false, error: false, loaded: true }
            }));
          }).catch(() => {
            setImageStates(prev => ({
              ...prev,
              [nextQuestion.id]: { loading: false, error: true, loaded: false }
            }));
          });
        }
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
      console.log('Already at last question, showing results');
      setShowResult(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (!currentQuestion) return;
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      const prevQuestion = questions[prevIndex];

      // Reset image state for previous question to ensure it loads
      if (prevQuestion && prevQuestion.image) {
        setImageStates(prev => ({
          ...prev,
          [prevQuestion.id]: { loading: true, error: false, loaded: false }
        }));
      }

      setCurrentQuestionIndex(prevIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCorrectVideo(false);
      setShowIncorrectVideo(false);
      setDroppedOption(null);
      setHoveredOption(null);
    }
  };

  const handleRetry = () => {
    if (nextCategory) {
      // If there's a next category, go to it instead of retrying current one
      handleTryOtherQuestions();
    } else {
      // If no next category, retry current category
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowCorrectVideo(false);
      setShowIncorrectVideo(false);
      setScore(0);
      setShowResult(false);
      setDroppedOption(null);
      setHoveredOption(null);
    }
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

  const handleTryOtherQuestions = () => {
    if (nextCategory) {
      // Reset states for next category
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowResult(false);
      setScore(0);
      setDroppedOption(null);
      setHoveredOption(null);
      setShowCorrectVideo(false);
      setShowIncorrectVideo(false);

      // Navigate to next category questions
      const categoryName = i18n.language === 'am' ? (nextCategory.name_am || nextCategory.name_en) : nextCategory.name_en;

      if (nextCategory.has_subcategories) {
        router.push(`/kg-subcategories?categoryId=${nextCategory.id}&categoryName=${categoryName}`);
      } else {
        router.push({
          pathname: '/picture-mcq',
          params: { category: categoryName, categoryId: nextCategory.id }
        });
      }
    }
  };

  const getMessage = () => {
    if (percentage >= 90) return t('mcq.results.message.outstanding');
    if (percentage >= 70) return t('mcq.results.message.great');
    if (percentage >= 50) return t('mcq.results.message.good');
    return t('mcq.results.message.keepLearning');
  };

  const handleNavigation = async () => {
    if (!currentQuestion) return;

    // Prevent navigation if no answer is selected
    if (!selectedAnswer) {
      return;
    }

    const currentScore = Number(score) || 0; // Ensure score is a number
    if (isLastQuestion) {
      // Track activity when quiz is completed
      try {
        const trackingService = ActivityTrackingService.getInstance();
        await trackingService.initialize();

        const categoryId = parseInt(params.categoryId as string);
        const categoryName = params.categoryName as string || 'Unknown Category';
        const timeSpent = Date.now() - (sessionStartTime || Date.now());

        await trackingService.trackPictureMCQActivity({
          grade: user?.grade || 'kg',
          subject: categoryName,
          categoryId: categoryId,
          categoryName: categoryName,
          questionsAnswered: questions.length,
          correctAnswers: currentScore,
          timeSpent: Math.round(timeSpent / 1000), // Convert to seconds
        });
      } catch (error) {
        console.error('Failed to track picture MCQ activity:', error);
        // Silently fail - activity tracking is not critical
      }

      setShowResult(true);
    } else {
      handleNextQuestion();
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <Header title={t('mcq.pictureQuiz.title')} />
          <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
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
            <ThemedText style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : undefined }]}>
              {t('mcq.results.title')}
            </ThemedText>
            <View style={styles.headerRight}>
              <LanguageToggle colors={{ ...colors, text: isDarkMode ? '#FFFFFF' : colors.tint }} />
              <TouchableOpacity
                onPress={() => router.push('/profile')}
                style={[styles.profileIconContainer, { backgroundColor: colors.tint + '20' }]}
              >
                <IconSymbol name="gearshape.fill" size={24} color={isDarkMode ? '#FFFFFF' : colors.tint} />
              </TouchableOpacity>
            </View>
          </View>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.resultGradientContainer}
          >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <Animated.View style={[styles.resultContainer]}>
                <View style={styles.resultContent}>
                  {/* Celebration Emoji */}
                  <View style={styles.celebrationEmojiContainer}>
                    <Text style={styles.celebrationEmoji}>
                      {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
                    </Text>
                  </View>

                  {/* Trophy Icon */}
                  <View style={styles.trophyContainer}>
                    <IconSymbol
                      name="trophy.fill"
                      size={60}
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
                    <ThemedText style={[styles.messageText, styles.funMessageText]}>
                      {getMessage()}
                    </ThemedText>
                  </View>

                  {/* Stars Animation */}
                  <View style={styles.starsContainer}>
                    {[...Array(5)].map((_, index) => (
                      <IconSymbol
                        key={index}
                        name="star.fill"
                        size={32}
                        color={index < Math.ceil(percentage / 20) ? "#FFD700" : "#E0E0E0"}
                        style={styles.star}
                      />
                    ))}
                  </View>
                </View>
              </Animated.View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.retryButton,
                    nextCategory && { backgroundColor: '#FF9800' }
                  ]}
                  onPress={handleRetry}
                >
                  <IconSymbol name={nextCategory ? "arrow.right.circle.fill" : "chevron.right"} size={24} color="#FFFFFF" />
                  <ThemedText style={styles.retryButtonText}>
                    {nextCategory ? t('mcq.results.tryOtherQuestions', 'Try other remaining Questions') : t('mcq.results.tryAgain')}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.homeButton]}
                  onPress={handleGoToInstructions}
                >
                  <IconSymbol name="house.fill" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.buttonText}>{t('mcq.pictureQuiz.goToInstructions')}</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Sponsored By Section */}
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoToInstructions}
          >
            <Ionicons name="chevron-back" size={28} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitleText}>{getLocalizedCategoryName()}</Text>
          </View>
          <View style={styles.headerRight}>
            <LanguageToggle colors={{ card: 'transparent', text: KG_DESIGN_TOKENS.colors.primary, tint: KG_DESIGN_TOKENS.colors.primary }} />
          </View>
        </View>
        <LinearGradient
          colors={['#f0f4ff', '#e8f5e9', '#fff8e1']}
          style={styles.funContainer}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Progress Bar */}
            <View style={styles.kgProgressContainer}>
              <View style={styles.kgProgressBar}>
                <View
                  style={[
                    styles.kgProgressFill,
                    {
                      backgroundColor: KG_DESIGN_TOKENS.colors.primary,
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                    }
                  ]}
                />
              </View>
              <Text style={styles.kgProgressText}>
                {currentQuestionIndex + 1} / {questions.length}
              </Text>
            </View>

            {memoizedCurrentQuestion && (
              <>
                <GestureDetector gesture={imagePan}>
                  <Animated.View
                    style={[
                      styles.imageContainer,
                      imageAnimatedStyle,
                      { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
                    ]}
                  >
                    <QuestionImage
                      key={`question-${memoizedCurrentQuestion.id}`}
                      question={memoizedCurrentQuestion}
                      imageStates={imageStates}
                      setImageStates={setImageStates}
                      isDarkMode={isDarkMode}
                      colors={colors}
                      t={t}
                    />

                    {/* Firework Animation for Correct Answer */}
                    <FireworkBurst
                      visible={showCorrectVideo}
                      onAnimationEnd={handleNextQuestion}
                    />

                    {/* Shake Animation for Incorrect Answer */}
                    <ShakeOverlay
                      visible={showIncorrectVideo}
                      onAnimationEnd={handleNextQuestion}
                      language={i18n.language}
                    />
                  </Animated.View>
                </GestureDetector>

                <View style={styles.kgOptionsContainer}>
                  {memoizedCurrentQuestion.options.map((option, index) => {
                    const funColors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'];
                    const funColor = funColors[index % funColors.length];
                    const isHovered = hoveredOption === option.id;

                    return (
                      <View
                        key={option.id}
                        onLayout={(event) => {
                          const { x, y, width, height } = event.nativeEvent.layout;
                          event.target.measureInWindow((pageX, pageY, measuredWidth, measuredHeight) => {
                            setDropZones(prev => ({
                              ...prev,
                              [option.id]: {
                                x: pageX,
                                y: pageY,
                                width: measuredWidth || width,
                                height: measuredHeight || height
                              }
                            }));
                          });
                        }}
                      >
                        <TouchableOpacity
                          style={[
                            styles.kgOptionButton,
                            styles.kgOptionButtonBounce,
                            isHovered && styles.kgOptionButtonHovered,
                            {
                              backgroundColor: selectedAnswer === option.id
                                ? (option.isCorrect ? '#4CAF50' : '#F44336')
                                : isHovered
                                  ? '#2E7D32'
                                  : funColor
                            },
                          ]}
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

                {/* Instruction text below choices */}
                <View style={styles.instructionTextContainer}>
                  <ThemedText style={[styles.instructionText, { color: isDarkMode ? colors.text + 'CC' : '#666666' }]}>
                    {t('mcq.pictureQuiz.dragInstruction')}
                  </ThemedText>
                </View>

                {showExplanation && memoizedCurrentQuestion?.explanation && memoizedCurrentQuestion.explanation.trim() !== '' && memoizedCurrentQuestion.explanation !== 'No explanation available' && (
                  <View style={[styles.explanationContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5' }]}>
                    <ThemedText style={[styles.explanationTitle, { color: '#6B54AE' }]}>{t('mcq.explanation')}</ThemedText>
                    <RichText
                      text={memoizedCurrentQuestion.explanation}
                      style={styles.explanationText}
                      color={colors.text}
                      fontSize={16}
                      textAlign="left"
                      lineHeight={24}
                      image_url={memoizedCurrentQuestion?.image_url}
                    />
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

const styles = StyleSheet.create<any>({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeAreaFooter: {
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  funContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
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
  progressCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressCategoryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
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
  compactNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  compactNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    gap: 4,
  },
  compactPrevButton: {
    backgroundColor: 'transparent',
  },
  compactNextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  compactNavButtonDisabled: {
    opacity: 0.4,
  },
  compactNavButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  questionCounterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  compactProgressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 0,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: KG_DESIGN_TOKENS.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    shadowColor: KG_DESIGN_TOKENS.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    // backgroundColor and borderColor are set dynamically based on theme
  },
  optionHovered: {
    borderColor: '#6B54AE',
    borderWidth: 3,
    backgroundColor: 'rgba(107, 84, 174, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  optionDroppedCorrect: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  optionDroppedIncorrect: {
    borderColor: '#F44336',
    borderWidth: 3,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  optionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  bilingualTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  optionText: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    flexWrap: 'wrap',
    fontWeight: '600',
  },
  optionTextEnglish: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    flexWrap: 'wrap',
    fontWeight: '600',
  },
  optionTextAmharic: {
    fontSize: 17,
    color: '#666666',
    textAlign: 'center',
    flexWrap: 'wrap',
    fontWeight: '500',
    marginTop: 2,
  },
  correctText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  incorrectText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  instructionTextContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.8,
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
    paddingHorizontal: 20,
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
    padding: 12,
  },
  resultContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 12,
    marginTop: 10,
  },
  trophyContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  celebrationEmojiContainer: {
    marginBottom: 12,
  },
  celebrationEmoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  funMessageText: {
    fontSize: 20,
    lineHeight: 28,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scoreText: {
    paddingTop: 8,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  percentageText: {
    paddingTop: 6,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    width: '100%',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  star: {
    marginHorizontal: 4,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 24,
    gap: 10,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  homeButton: {
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonText: {
    fontSize: 18,
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 6,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  gradeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
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
    marginVertical: 20,
    paddingHorizontal: 20,
    minHeight: 150,
    zIndex: 10,
  },
  overlayVideoContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  inlineVideo: {
    width: '100%',
    height: '100%',
  },
  fireworkContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: 'visible',
    elevation: 1000,
  },
  fireworkOrigin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireworkParticle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireworkDot: {
    elevation: 10,
  },
  shakeOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shakeIconContainer: {
    backgroundColor: 'rgba(255, 100, 100, 0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shakeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  shakeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // KG Question Page Styles
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  kgProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  kgProgressBar: {
    flex: 1,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    overflow: 'hidden',
  },
  kgProgressFill: {
    height: '100%',
    borderRadius: 7,
  },
  kgProgressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    minWidth: 50,
    textAlign: 'right',
  },
  kgOptionsContainer: {
    flexDirection: 'column',
    gap: 26,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  kgOptionButton: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: KG_DESIGN_TOKENS.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  kgOptionButtonBounce: {
    transform: [{ scale: 1 }],
  },
  kgOptionButtonHovered: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  kgOptionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  kgOptionTextAmharic: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 8,
  },
  optionTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 
