import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { TouchableOpacity, Dimensions, View, Modal, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/constants/Colors';
import { useAuth } from '@/core/providers/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import RichText from '@/components/ui/RichText';
import { getFlashcards, getFlashcardStructure, getFlashcardsForChapter, Grade, Subject, Chapter, Flashcard } from '@/services/flashcardService';
import ActivityTrackingService from '@/services/activityTrackingService';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';

interface RecentActivity {
  type: string;
  grade: string;
  subject: string;
  chapter: string;
  timestamp: number;
  details: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = Math.min(Math.round(SCREEN_HEIGHT * 0.56), Math.round(CARD_WIDTH * 1.12));

export default function FlashcardsScreen() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const colors = getColors(isDarkMode);
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const startFlashcardsParam = params.startFlashcards;
  const startFlashcards =
    (Array.isArray(startFlashcardsParam) ? startFlashcardsParam[0] : startFlashcardsParam) === '1';
  const hasPreSelectedSubject = Boolean(params.preSelectedSubject);
  const isDeepLinkAutoStart = startFlashcards && hasPreSelectedSubject;
  const deepLinkSubjectSlug =
    typeof params.subjectSlug === 'string' ? params.subjectSlug.trim() : '';
  const deepLinkChapterName =
    typeof params.chapterName === 'string' ? params.chapterName.trim() : '';
  const deepLinkGradeId = typeof params.gradeId === 'string' ? params.gradeId.trim() : '';
  
  const [selectedGradeId, setSelectedGradeId] = useState<string>('1');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [hasAppliedPreSelection, setHasAppliedPreSelection] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [flashPendingFinish, setFlashPendingFinish] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [previousLanguage, setPreviousLanguage] = useState(i18n.language);
  const [isPreSelected, setIsPreSelected] = useState(false);
  const preSelectionAttempted = useRef(false);
  /** Ensures Subjects tab → Flashcards deep-link only auto-starts once per navigation. */
  const flashcardsAutoStartConsumedRef = useRef(false);
  /** One tracking record per completed session (Got it / Still learning on last card). */
  const flashcardSessionTrackedRef = useRef(false);
  /**
   * Set when a session starts (picker or deep-link). Deep-link flows often never set
   * selectedSubject/selectedSubjectData, so tracking must not rely on that state alone.
   */
  const sessionTrackMetaRef = useRef<{
    subjectName: string;
    chapterName?: string;
    gradeName: string;
  } | null>(null);

  const revealAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  // This screen renders its own top bar (per design), so hide the native header.
  useLayoutEffect(() => {
    (navigation as any)?.setOptions?.({ headerShown: false });
  }, [navigation]);

  const fetchFlashcards = async (gradeLevelId: string = '1') => {
    try {
      setIsLoading(true);
      const data = await getFlashcardStructure(gradeLevelId);
      setFlashcardsData(data);
      setError(null);
    } catch (error) {
      // Ignore specific error messages and show network error
      setError(t('errors.network.message'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize grade from user data
    if (user?.grade) {
      console.log('Setting grade from user data:', user.grade);
      // Extract numeric value from grade string (e.g., "Grade 6" -> "6")
      const gradeNumber = user.grade.replace(/[^\d]/g, '');
      console.log('Extracted grade number:', gradeNumber);
      setSelectedGradeId(gradeNumber || '1');
    } else {
      // Default to grade 1 if no grade is found in user data
      console.log('No grade found in user data, defaulting to grade 1');
      setSelectedGradeId('1');
    }
  }, [user]);

  // Fetch flashcards when grade level changes
  useEffect(() => {
    if (selectedGradeId) {
      fetchFlashcards(selectedGradeId);
    }
  }, [selectedGradeId]);

  // Reset pre-selection tracking when params change
  useEffect(() => {
    if (params.preSelectedSubject) {
      console.log('Pre-selection parameter detected:', params.preSelectedSubject);
      preSelectionAttempted.current = false;
      setHasAppliedPreSelection(false);
      flashcardsAutoStartConsumedRef.current = false;
    }
  }, [params.preSelectedSubject, params.preSelectedChapterId]);

  // Update the selected grade when flashcards data is loaded
  useEffect(() => {
    if (flashcardsData && flashcardsData.length > 0) {
      const grade = flashcardsData[0];
      if (grade && grade.name) {
        setSelectedGrade(grade.name);

        // Handle pre-selected subject from route parameters
        if (params.preSelectedSubject && !preSelectionAttempted.current) {
          console.log('=== Starting Pre-Selection Process ===');
          console.log('Looking for subject:', params.preSelectedSubject);
          console.log('Available subjects:', grade.subjects?.map(s => ({ id: s.id, name: s.name })));

          // Mark that we've attempted pre-selection
          preSelectionAttempted.current = true;

          // Reset any active flashcard session when navigating from home page
          setShowFlashcards(false);
          setCurrentIndex(0);
          setIsRevealed(false);
          setCurrentFlashcards([]);
          setSessionStartTime(null);

          // Reset animations
          revealAnimation.value = withSpring(0, {
            damping: 12,
            stiffness: 80,
            mass: 0.8,
          });
          progressAnimation.value = withTiming(0);

          // Try exact match first (case-insensitive with trimming)
          const searchTerm = (params.preSelectedSubject as string).toLowerCase().trim();
          let subject = grade.subjects?.find(s =>
            s.name.toLowerCase().trim() === searchTerm
          );

          // If not found, try partial match
          if (!subject) {
            console.log('Exact match not found, trying partial match...');
            subject = grade.subjects?.find(s => {
              const subjectName = s.name.toLowerCase();
              return subjectName.includes(searchTerm) || searchTerm.includes(subjectName);
            });
          }

          if (subject) {
            console.log('✓ Found subject:', { id: subject.id, name: subject.name });
            console.log('Setting selected subject to:', subject.id);
            setSelectedSubject(subject.id);
            const chId =
              typeof params.preSelectedChapterId === 'string'
                ? params.preSelectedChapterId.trim()
                : '';
            if (chId) {
              const ch = subject.chapters?.find((c) => c.id === chId);
              setSelectedChapter(ch ? ch.id : '');
            } else {
              setSelectedChapter('');
            }
            setIsPreSelected(true); // Mark as pre-selected
            setHasAppliedPreSelection(true);
          } else {
            console.warn('✗ Subject not found!');
            console.log('Searched for:', params.preSelectedSubject);
            console.log('Available options:', grade.subjects?.map(s => s.name).join(', '));
            // Don't select anything if not found
            setSelectedSubject('');
            setSelectedChapter('');
            setIsPreSelected(false);
            setHasAppliedPreSelection(true);
          }
          console.log('=== Pre-Selection Process Complete ===');
        } else if (!params.preSelectedSubject && !hasAppliedPreSelection) {
          // Reset subject and chapter when there's no pre-selection
          setSelectedSubject('');
          setSelectedChapter('');
          setHasAppliedPreSelection(true);
        }
      }
    }
  }, [flashcardsData, params.preSelectedSubject, params.preSelectedChapterId]);

  // Reset chapter when subject changes (but don't clear during pre-selection)
  useEffect(() => {
    if (selectedSubject && hasAppliedPreSelection) {
      // Only clear chapter if this is a manual change (after pre-selection has been applied)
      if (isPreSelected) {
        // This is the first time setting from pre-selection, don't clear chapter
        setIsPreSelected(false);
      } else {
        // This is a manual change, clear chapter
        setSelectedChapter('');
      }
    }
  }, [selectedSubject]);

  const selectedGradeData = selectedGrade && flashcardsData ? flashcardsData.find(g => g.name === selectedGrade) : null;
  const selectedSubjectData = selectedSubject && selectedGradeData && selectedGradeData.subjects
    ? selectedGradeData.subjects.find(s => s.id === selectedSubject)
    : null;
  

  const selectedChapterData = selectedChapter && selectedSubjectData && selectedSubjectData.chapters
    ? selectedSubjectData.chapters.find(c => c.id === selectedChapter)
    : null;
  const currentCard = currentFlashcards.length > currentIndex 
    ? currentFlashcards[currentIndex] 
    : null;
  
  // Function to detect if text contains Amharic characters
  const isAmharicText = (text: string): boolean => {
    if (!text) return false;
    // Amharic Unicode range: U+1200-U+137F
    const amharicRegex = /[\u1200-\u137F]/;
    return amharicRegex.test(text);
  };

  // Get question and answer text - always use the same fields regardless of language
  const getQuestionText = (card: typeof currentCard) => {
    if (!card) return 'No question available';
    return card.question;
  };
  
  const getAnswerText = (card: typeof currentCard) => {
    if (!card) return 'No answer available';
    return card.answer;
  };

  // Check if the current language is Amharic
  const isAmharicLanguage = i18n.language === 'am';
  const progress = currentFlashcards.length > 0 
    ? ((currentIndex + 1) / currentFlashcards.length) * 100 
    : 0;

  // Always show questions first when a new card is loaded
  useEffect(() => {
    if (currentCard) {
      setIsRevealed(false);
      
      // Animate to show question (not revealed state)
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
    }
  }, [currentCard]);

  useEffect(() => {
    if (showFlashcards && selectedChapterData?.flashcards && selectedChapterData.flashcards.length > 0) {
      progressAnimation.value = withTiming((1 / selectedChapterData.flashcards.length) * 100);
    }
  }, [showFlashcards, selectedChapterData]);

  // Ensures the last "Got it" mark is applied before showing results.
  useEffect(() => {
    if (!flashPendingFinish) return;
    setFlashPendingFinish(false);
    setShowFlashcards(false);
    setShowResult(true);
  }, [flashPendingFinish, currentFlashcards]);

  // Track language changes for debugging
  useEffect(() => {
    if (previousLanguage !== i18n.language) {
      console.log('Language changed from', previousLanguage, 'to', i18n.language);
      setPreviousLanguage(i18n.language);
    }
  }, [i18n.language, previousLanguage]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [0, 180]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);
    
    return {
      transform: [
        { perspective: 2000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      shadowOpacity,
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    } as any;
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [180, 360]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);
    
    return {
      transform: [
        { perspective: 2000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      shadowOpacity,
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    } as any;
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value}%`,
    };
  });

  const handleReveal = () => {
    setIsRevealed(!isRevealed);
    revealAnimation.value = withSpring(isRevealed ? 0 : 1, {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    });
  };

  const resolveDeepLinkSessionMeta = (
    data: Grade[],
    gradeId: string,
    subjectSlug: string,
    chapterName: string
  ): { subjectName: string; chapterName: string; gradeName: string } => {
    if (!data.length) {
      return {
        subjectName: subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        chapterName,
        gradeName: '',
      };
    }
    const grade = data.find((g) => g.id === gradeId) ?? data[0];
    const gradeName = grade?.name || '';
    const subject = grade?.subjects?.find((s) => s.slug === subjectSlug);
    const subjectName =
      subject?.name?.trim() ||
      subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const chapter = subject?.chapters?.find(
      (c) => c.name.trim().toLowerCase() === chapterName.trim().toLowerCase()
    );
    return {
      subjectName,
      chapterName: chapter?.name || chapterName,
      gradeName: gradeName || '',
    };
  };

  const trackFlashcardSessionEnd = async (cardsSnapshot: Flashcard[]) => {
    if (flashcardSessionTrackedRef.current) return;
    if (!user?.username || cardsSnapshot.length === 0) return;

    const meta = sessionTrackMetaRef.current;
    const subjectName = (meta?.subjectName || selectedSubjectData?.name || '').trim();
    if (!subjectName) {
      console.warn('[Flashcards] Activity not tracked: missing subject name (session meta).');
      return;
    }

    flashcardSessionTrackedRef.current = true;

    try {
      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize(user.username);

      const cardsReviewed = cardsSnapshot.length;
      const cardsMastered = cardsSnapshot.filter((card) => card.isChecked).length;
      const start = sessionStartTime;
      const timeSpentSec =
        start != null ? Math.max(0, Math.round((Date.now() - start) / 1000)) : 0;

      const gradeName =
        meta?.gradeName || selectedGradeData?.name || selectedGrade || user?.grade || 'unknown';

      await trackingService.trackFlashcardActivity({
        grade: gradeName,
        subject: subjectName,
        chapter: meta?.chapterName || selectedChapterData?.name || undefined,
        cardsReviewed,
        cardsMastered,
        timeSpent: timeSpentSec,
      });
    } catch (error) {
      console.error('Failed to track flashcard activity:', error);
      flashcardSessionTrackedRef.current = false;
    }
  };

  const handleNext = () => {
    if (currentFlashcards.length > 0 && currentIndex < currentFlashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      progressAnimation.value = withTiming(((currentIndex + 2) / currentFlashcards.length) * 100);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
      if (currentFlashcards.length > 0) {
        progressAnimation.value = withTiming((currentIndex / currentFlashcards.length) * 100);
      }
    }
  };

  const handleStartFlashcards = async () => {
    if (!selectedSubject || !selectedChapter) return;
    
    try {
      setIsLoading(true);
      
      // Find the subject slug
      const grade = flashcardsData.find(g => g.name === selectedGrade);
      const subject = grade?.subjects.find(s => s.id === selectedSubject);
      const subjectSlug = subject?.slug;
      
      if (!subjectSlug) {
        throw new Error('Subject slug not found');
      }
      
      // Get the chapter name for the API call
      const chapterName = selectedChapterData?.name;
      if (!chapterName) {
        throw new Error('Chapter name not found');
      }
      
      // Fetch flashcards directly
      const flashcards = await getFlashcardsForChapter(
        selectedGradeId,
        subjectSlug,
        chapterName
      );
      
      if (!flashcards || flashcards.length === 0) {
        setError(t('flashcards.noFlashcardsAvailable'));
        return;
      }
      
      // Set the current flashcards directly for immediate use
      setCurrentFlashcards(flashcards.map((c) => ({ ...c, isChecked: false })));
      flashcardSessionTrackedRef.current = false;
      sessionTrackMetaRef.current = {
        subjectName: selectedSubjectData?.name?.trim() || '',
        chapterName: selectedChapterData?.name,
        gradeName: selectedGradeData?.name || selectedGrade || user?.grade || 'unknown',
      };
      setSessionStartTime(Date.now()); // Start tracking session time
      
      // Update the state with the flashcards
      const updatedFlashcardsData = flashcardsData.map(g => {
        if (g.name === selectedGrade) {
          return {
            ...g,
            subjects: g.subjects.map(s => {
              if (s.id === selectedSubject) {
                return {
                  ...s,
                  chapters: s.chapters.map(c => {
                    if (c.id === selectedChapter) {
                      return {
                        ...c,
                        flashcards: flashcards
                      };
                    }
                    return c;
                  })
                };
              }
              return s;
            })
          };
        }
        return g;
      });
      
      setFlashcardsData(updatedFlashcardsData);
      
      // Show flashcards immediately
      setShowFlashcards(true);
      setCurrentIndex(0);
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
      
    } catch (error) {
      console.error('Error fetching chapter flashcards:', error);
      setError(t('errors.network.message'));
    } finally {
      setIsLoading(false);
    }
  };

  // Subjects tab → chapter picker → open Flashcards with startFlashcards=1
  useEffect(() => {
    if (!startFlashcards) return;
    // If we have a direct deep-link payload (slug + chapter name), start immediately.
    if (deepLinkSubjectSlug && deepLinkChapterName) {
      if (isLoading) return;
      if (showFlashcards) return;
      if (flashcardsAutoStartConsumedRef.current) return;
      flashcardsAutoStartConsumedRef.current = true;

      const run = async () => {
        try {
          setIsLoading(true);
          const gradeToUse = deepLinkGradeId || selectedGradeId;
          const flashcards = await getFlashcardsForChapter(
            gradeToUse,
            deepLinkSubjectSlug,
            deepLinkChapterName
          );
          if (!flashcards || flashcards.length === 0) {
            setError(t('flashcards.noFlashcardsAvailable'));
            return;
          }
          setCurrentFlashcards(flashcards.map((c) => ({ ...c, isChecked: false })));
          flashcardSessionTrackedRef.current = false;
          sessionTrackMetaRef.current = resolveDeepLinkSessionMeta(
            flashcardsData,
            gradeToUse,
            deepLinkSubjectSlug,
            deepLinkChapterName
          );
          setSessionStartTime(Date.now());
          setShowFlashcards(true);
          setCurrentIndex(0);
          setIsRevealed(false);
          revealAnimation.value = withSpring(0, { damping: 12, stiffness: 80, mass: 0.8 });
          progressAnimation.value = withTiming(0);
        } catch (e) {
          console.error('Deep-link flashcards start failed:', e);
          setError(t('errors.network.message'));
        } finally {
          setIsLoading(false);
        }
      };

      void run();
      return;
    }

    if (!selectedSubject || !selectedChapter) return;
    if (isLoading) return;
    if (showFlashcards) return;
    if (flashcardsAutoStartConsumedRef.current) return;
    flashcardsAutoStartConsumedRef.current = true;
    void handleStartFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when selection is ready; handleStartFlashcards closes over latest state
  }, [
    selectedSubject,
    selectedChapter,
    isLoading,
    startFlashcards,
    showFlashcards,
    deepLinkSubjectSlug,
    deepLinkChapterName,
    deepLinkGradeId,
  ]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            {t('flashcards.loading')}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.emptyStateContainer, { backgroundColor: colors.background }]}>
            <IconSymbol name="globe" size={90} color={colors.warning} style={styles.emptyStateIcon} />
            <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>
              {t('errors.network.title')}
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtitle, { color: colors.text, opacity: 0.7 }]}>
              {t('errors.network.message')}
            </ThemedText>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.tint, marginTop: 20 }]}
              onPress={() => {
                setError(null);
                setIsLoading(true);
                fetchFlashcards(selectedGradeId);
              }}
            >
              <ThemedText style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
                {t('common.tryAgain')}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Show result page after finishing flashcards - CHECK THIS FIRST
  if (showResult) {
    const totalCards = currentFlashcards.length;
    const masteredCount = currentFlashcards.filter((c) => Boolean(c?.isChecked)).length;
    const stillLearningCount = Math.max(0, totalCards - masteredCount);
    const masteredPct = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

    const RING_SIZE = 260;
    const STROKE = 18;
    const r = (RING_SIZE - STROKE) / 2;
    const c = 2 * Math.PI * r;
    const dashOffset = c - (masteredPct / 100) * c;

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]} edges={['top', 'left', 'right']}>
        <StatusBar translucent={false} backgroundColor="#FFFFFF" barStyle="dark-content" />
        <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#F4F6FA' }]}>
          <View style={styles.flashResultsHeader}>
            <Image source={require('@/assets/images/logo.png')} style={styles.flashResultsBrand} resizeMode="contain" />
            <ThemedText style={styles.flashResultsTitle}>{t('flashcards.sessionResults', { defaultValue: 'Session Results' })}</ThemedText>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Profile" style={styles.flashResultsProfileBtn}>
              <IconSymbol name={'person.crop.circle' as any} size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.flashResultsScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.flashRingWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={r}
                  stroke="#E5E7EB"
                  strokeWidth={STROKE}
                  fill="none"
                  strokeLinecap="round"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={r}
                  stroke="#0F4BD7"
                  strokeWidth={STROKE}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${c} ${c}`}
                  strokeDashoffset={dashOffset}
                  rotation={-90}
                  originX={RING_SIZE / 2}
                  originY={RING_SIZE / 2}
                />
              </Svg>

              <View style={styles.flashRingCenter}>
                <ThemedText style={styles.flashRingPct}>{masteredPct}%</ThemedText>
                <ThemedText style={styles.flashRingSub}>MASTERED</ThemedText>
              </View>

              <View style={styles.flashRingBadge}>
                <IconSymbol name={'star.fill' as any} size={14} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.flashResultCards}>
              <View style={styles.flashResultCard}>
                <View style={[styles.flashResultIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <IconSymbol name={'checkmark' as any} size={16} color="#10B981" />
                </View>
                <View style={styles.flashResultCardText}>
                  <ThemedText style={styles.flashResultCardLabel}>{t('flashcards.accuracy', { defaultValue: 'ACCURACY' })}</ThemedText>
                  <ThemedText style={styles.flashResultCardValue}>
                    {masteredCount} {t('flashcards.mastered', { defaultValue: 'Mastered' })}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
              </View>

              <View style={styles.flashResultCard}>
                <View style={[styles.flashResultIcon, { backgroundColor: 'rgba(245, 158, 11, 0.14)' }]}>
                  <IconSymbol name={'exclamationmark' as any} size={14} color="#F59E0B" />
                </View>
                <View style={styles.flashResultCardText}>
                  <ThemedText style={styles.flashResultCardLabel}>{t('flashcards.persistence', { defaultValue: 'PERSISTENCE' })}</ThemedText>
                  <ThemedText style={styles.flashResultCardValue}>
                    {stillLearningCount} {t('flashcards.stillLearning', { defaultValue: 'Still Learning' })}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
              </View>
            </View>

            <View style={styles.flashResultButtons}>
              <TouchableOpacity
                style={styles.flashRetryBtn}
                onPress={() => {
                  setShowResult(false);
                  setShowFlashcards(true);
                  setCurrentIndex(0);
                  setIsRevealed(false);
                  flashcardSessionTrackedRef.current = false;
                  if (selectedSubjectData?.name?.trim()) {
                    sessionTrackMetaRef.current = {
                      subjectName: selectedSubjectData.name.trim(),
                      chapterName: selectedChapterData?.name,
                      gradeName: selectedGradeData?.name || selectedGrade || user?.grade || 'unknown',
                    };
                  }
                  setSessionStartTime(Date.now());
                  setCurrentFlashcards((prev) => prev.map((c) => ({ ...c, isChecked: false })));
                  revealAnimation.value = withSpring(0, { damping: 12, stiffness: 80, mass: 0.8 });
                  progressAnimation.value = withTiming(0);
                }}
              >
                <IconSymbol name={'arrow.counterclockwise' as any} size={18} color="#6B7280" />
                <ThemedText style={styles.flashRetryText}>{t('flashcards.retry', { defaultValue: 'Retry' })}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.flashDoneBtn}
                onPress={() => {
                  setShowResult(false);
                  setShowFlashcards(false);
                  setCurrentIndex(0);
                  setIsRevealed(false);
                  setCurrentFlashcards([]);
                  setSessionStartTime(null);
                  revealAnimation.value = withSpring(0, { damping: 12, stiffness: 80, mass: 0.8 });
                  progressAnimation.value = withTiming(0);
                  router.replace('/(tabs)/practice');
                }}
              >
                <ThemedText style={styles.flashDoneText}>{t('flashcards.done', { defaultValue: 'Done' })}</ThemedText>
                <IconSymbol name={'checkmark' as any} size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Show selection screen when not showing flashcards
  if (!showFlashcards) {
    // When opening from another tab via deep-link, don't flash the chooser UI.
    if (isDeepLinkAutoStart && selectedSubject && isLoading) {
      return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
            <ThemedText style={[styles.loadingText, { color: colors.text }]}>
              {t('flashcards.loading')}
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <StatusBar translucent={false} backgroundColor="#FFFFFF" barStyle="dark-content" />
          <View style={styles.flashHeaderWrap}>
            <View style={styles.flashTopBar}>
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                <Ionicons name="chevron-back" size={24} color="#111827" />
              </TouchableOpacity>
              <View style={styles.flashTopLogoLeft} />
              <LanguageToggle colors={{ card: '#F3F4F6', text: '#4B5563' }} />
            </View>
          </View>
          <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
            <ThemedView style={[styles.formContent, { backgroundColor: colors.background }]}>
              {/* Subject Selection */}
              <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                  {t('flashcards.subject')}
                  {isPreSelected && (
                    <ThemedText style={[styles.preSelectedLabel, { color: colors.tint }]}>
                      {' '}({t('flashcards.preSelected')})
                    </ThemedText>
                  )}
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.formInput, 
                    { 
                      backgroundColor: colors.cardAlt, 
                      borderColor: isPreSelected ? (isDarkMode ? '#FFFFFF' : colors.tint) : (isDarkMode ? '#FFFFFF' : colors.border),
                      borderWidth: isPreSelected ? 2 : 1,
                    }
                  ]}
                  onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                >
                  <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                    {selectedSubject ? selectedGradeData?.subjects?.find((s: Subject) => s.id === selectedSubject)?.name : t('flashcards.selectSubject')}
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                </TouchableOpacity>
                {showSubjectDropdown && (
                  <Modal
                    visible={showSubjectDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowSubjectDropdown(false)}
                  >
                    <TouchableOpacity
                      style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                      activeOpacity={1}
                      onPress={() => setShowSubjectDropdown(false)}
                    >
                      <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <ScrollView>
                          {selectedGradeData?.subjects?.sort((a, b) => {
                            // Extract numbers from subject names for proper sorting
                            const getSubjectNumber = (name: string) => {
                              const match = name.match(/(\d+)/);
                              return match ? parseInt(match[1], 10) : 0;
                            };
                            return getSubjectNumber(a.name) - getSubjectNumber(b.name);
                          }).map((subject: Subject, index: number) => (
                            <TouchableOpacity
                              key={`subject-${subject.id}-${index}`}
                              style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                              onPress={() => {
                                setSelectedSubject(subject.id);
                                setSelectedChapter('');
                                setShowSubjectDropdown(false);
                              }}
                            >
                              <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{subject.name}</ThemedText>
                              <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </ThemedView>
                    </TouchableOpacity>
                  </Modal>
                )}
              </ThemedView>

              {/* Chapter Selection */}
              <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                  {t('flashcards.chapter')}
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.formInput,
                    { backgroundColor: colors.cardAlt, borderColor: isDarkMode ? '#FFFFFF' : colors.border },
                    !selectedSubject && { 
                      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  ]}
                  onPress={() => selectedSubject && setShowChapterDropdown(!showChapterDropdown)}
                  disabled={!selectedSubject}
                >
                  <ThemedText 
                    style={[
                      styles.formInputText, 
                      { color: colors.text }, 
                      !selectedSubject && { 
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                      }
                    ]}
                  >
                    {selectedChapter ? selectedSubjectData?.chapters?.find((c: Chapter) => c.id === selectedChapter)?.name : t('flashcards.selectChapter')}
                  </ThemedText>
                  <IconSymbol 
                    name="chevron.right" 
                    size={20} 
                    color={!selectedSubject ? (isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)') : colors.tint} 
                  />
                </TouchableOpacity>
                {showChapterDropdown && selectedSubject && (
                  <Modal
                    visible={showChapterDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowChapterDropdown(false)}
                  >
                    <TouchableOpacity
                      style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                      activeOpacity={1}
                      onPress={() => setShowChapterDropdown(false)}
                    >
                      <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <ScrollView>
                          {selectedSubjectData?.chapters?.sort((a, b) => {
                            // Extract numbers from chapter names for proper sorting
                            const getChapterNumber = (name: string) => {
                              const match = name.match(/(\d+)/);
                              return match ? parseInt(match[1], 10) : 0;
                            };
                            return getChapterNumber(a.name) - getChapterNumber(b.name);
                          }).map((chapter: Chapter, index: number) => (
                            <TouchableOpacity
                              key={`chapter-${chapter.id}-${index}`}
                              style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                              onPress={() => {
                                setSelectedChapter(chapter.id);
                                setShowChapterDropdown(false);
                              }}
                            >
                              <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{chapter.name}</ThemedText>
                              <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                            </TouchableOpacity>
                          )) || (
                            <View style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                              <ThemedText style={[styles.modalItemText, { color: colors.text, opacity: 0.7 }]}>
                                No chapters available
                              </ThemedText>
                            </View>
                          )}
                        </ScrollView>
                      </ThemedView>
                    </TouchableOpacity>
                  </Modal>
                )}
              </ThemedView>

              <TouchableOpacity
                style={[
                  styles.startButton,
                  { backgroundColor: colors.tint },
                  (!selectedSubject || !selectedChapter) && { opacity: 0.5 }
                ]}
                onPress={handleStartFlashcards}
                disabled={!selectedSubject || !selectedChapter}
              >
                <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>
                  {t('flashcards.startFlashcards')}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Safety check: Don't render flashcards if there's no valid data
  if (!currentFlashcards || currentFlashcards.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.emptyStateContainer, { backgroundColor: colors.background }]}>
            <IconSymbol name="rectangle.stack" size={90} color={colors.warning} style={styles.emptyStateIcon} />
            <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>
              {t('flashcards.noFlashcards')}
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtitle, { color: colors.text, opacity: 0.7 }]}>
              No flashcards available for the selected chapter.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.tint, marginTop: 20 }]}
              onPress={() => {
                setShowFlashcards(false);
                setSelectedSubject('');
                setSelectedChapter('');
                setCurrentFlashcards([]);
              }}
            >
              <ThemedText style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
                Choose Different Chapter
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#F4F6FA' }]}>
        <StatusBar translucent={false} backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.flashHeaderWrap}>
          <View style={styles.flashTopBar}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.flashTopLogoLeft} />
            <LanguageToggle colors={{ card: '#F3F4F6', text: '#4B5563' }} />
          </View>

        </View>

        <View style={styles.flashProgressBlock}>
          <View style={styles.flashProgressRow}>
            <ThemedText style={[styles.flashProgressLabel, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
              PROGRESS
            </ThemedText>
            <View style={styles.flashProgressCountRow}>
              <ThemedText style={[styles.flashProgressCount, { color: '#0F4BD7' }]}>
                {currentIndex + 1} / {currentFlashcards.length}
              </ThemedText>
              <ThemedText style={[styles.flashProgressCardsSuffix, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
                cards
              </ThemedText>
            </View>
          </View>
          <View style={[styles.flashProgressTrack, { backgroundColor: isDarkMode ? colors.cardAlt : '#E5E7EB' }]}>
            <Animated.View
              style={[
                styles.flashProgressFill,
                { backgroundColor: '#0F4BD7' },
                progressBarStyle,
              ]}
            />
          </View>
        </View>

        <View style={styles.flashCardStage}>
          <TouchableOpacity onPress={handleReveal} activeOpacity={0.95} style={styles.flashCardTouch}>
            <View style={styles.flashCardShadowWrap}>
              <Animated.View style={[styles.flashCardFace, frontAnimatedStyle, { backgroundColor: isDarkMode ? colors.cardAlt : '#FFFFFF' }]}>
                <ThemedText style={[styles.flashCardMeta, { color: isDarkMode ? '#93A4C7' : '#9AA3B2' }]}>
                  CONCEPT MASTERY
                </ThemedText>
                <ScrollView
                  style={styles.flashCardScroll}
                  contentContainerStyle={styles.flashCardScrollContent}
                  nestedScrollEnabled
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                >
                  <RichText
                    text={getQuestionText(currentCard)}
                    style={styles.flashCardTitle}
                    color={isDarkMode ? '#FFFFFF' : '#111827'}
                    fontSize={34}
                    textAlign="center"
                    lineHeight={42}
                  />
                </ScrollView>
                <View style={styles.flashTapHintRow}>
                  <IconSymbol name={'arrow.2.squarepath' as any} size={16} color={isDarkMode ? '#9CA3AF' : '#9AA3B2'} />
                  <ThemedText style={[styles.flashTapHintText, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
                    TAP TO FLIP
                  </ThemedText>
                </View>
              </Animated.View>

              <Animated.View style={[styles.flashCardFace, styles.flashCardBackFace, backAnimatedStyle, { backgroundColor: isDarkMode ? colors.cardAlt : '#FFFFFF' }]}>
                <ThemedText style={[styles.flashCardMeta, { color: isDarkMode ? '#93A4C7' : '#9AA3B2' }]}>
                  CONCEPT MASTERY
                </ThemedText>
                <ScrollView
                  style={styles.flashCardScroll}
                  contentContainerStyle={styles.flashCardScrollContent}
                  nestedScrollEnabled
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                >
                  <RichText
                    text={getAnswerText(currentCard)}
                    style={styles.flashCardTitle}
                    color={isDarkMode ? '#FFFFFF' : '#111827'}
                    fontSize={28}
                    textAlign="center"
                    lineHeight={36}
                  />
                </ScrollView>
                <View style={styles.flashTapHintRow}>
                  <IconSymbol name={'arrow.2.squarepath' as any} size={16} color={isDarkMode ? '#9CA3AF' : '#9AA3B2'} />
                  <ThemedText style={[styles.flashTapHintText, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
                    TAP TO FLIP
                  </ThemedText>
                </View>
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.flashBottomActions}>
          <TouchableOpacity
            style={styles.flashBottomActionLeft}
            accessibilityRole="button"
            accessibilityLabel="Still learning"
            onPress={() => {
              const isLastCard = currentFlashcards.length > 0 && currentIndex === currentFlashcards.length - 1;
              if (isLastCard) {
                const nextCards = currentFlashcards.map((c, i) =>
                  i === currentIndex ? { ...c, isChecked: false } : c
                );
                setCurrentFlashcards(nextCards);
                void (async () => {
                  await trackFlashcardSessionEnd(nextCards);
                  setFlashPendingFinish(true);
                })();
              } else {
                setCurrentFlashcards((prev) => {
                  const next = [...prev];
                  if (next[currentIndex]) next[currentIndex] = { ...next[currentIndex], isChecked: false };
                  return next;
                });
                handleNext();
              }
            }}
          >
            <View style={[styles.flashBottomIconGhost, { borderColor: isDarkMode ? '#3A4354' : '#D1D5DB' }]}>
              <IconSymbol name={'arrow.counterclockwise' as any} size={18} color={isDarkMode ? '#D1D5DB' : '#6B7280'} />
            </View>
            <ThemedText style={[styles.flashBottomLabel, { color: isDarkMode ? '#D1D5DB' : '#6B7280' }]}>
              STILL LEARNING
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flashBottomActionRight}
            accessibilityRole="button"
            accessibilityLabel="Got it"
            onPress={() => {
              const isLastCard = currentFlashcards.length > 0 && currentIndex === currentFlashcards.length - 1;
              if (isLastCard) {
                const nextCards = currentFlashcards.map((c, i) =>
                  i === currentIndex ? { ...c, isChecked: true } : c
                );
                setCurrentFlashcards(nextCards);
                void (async () => {
                  await trackFlashcardSessionEnd(nextCards);
                  setFlashPendingFinish(true);
                })();
              } else {
                setCurrentFlashcards((prev) => {
                  const next = [...prev];
                  if (next[currentIndex]) next[currentIndex] = { ...next[currentIndex], isChecked: true };
                  return next;
                });
                handleNext();
              }
            }}
          >
            <View style={[styles.flashBottomIconPrimary, { backgroundColor: '#0F4BD7' }]}>
              <IconSymbol name={'checkmark' as any} size={18} color="#FFFFFF" />
            </View>
            <ThemedText style={[styles.flashBottomLabelPrimary, { color: '#0F4BD7' }]}>
              GOT IT
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

 
