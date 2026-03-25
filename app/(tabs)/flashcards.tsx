import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View, Modal, ScrollView, StatusBar } from 'react-native';
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
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import RichText from '@/components/ui/RichText';
import { getFlashcards, getFlashcardStructure, getFlashcardsForChapter, Grade, Subject, Chapter, Flashcard } from '@/services/flashcardService';
import ActivityTrackingService from '@/services/activityTrackingService';

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

  const handleNext = () => {
    if (currentFlashcards.length > 0 && currentIndex < currentFlashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // The useEffect will handle setting the correct reveal state based on Amharic detection
      progressAnimation.value = withTiming(((currentIndex + 2) / currentFlashcards.length) * 100);
      
      // Track activity when reaching the end
      if (currentIndex + 1 === currentFlashcards.length - 1) {
        const trackActivity = async () => {
          try {
            if (!user?.username) {
              console.warn('Cannot track flashcard activity: no user logged in');
              return;
            }
            
            const trackingService = ActivityTrackingService.getInstance();
            await trackingService.initialize(user.username);
            
            const cardsReviewed = currentIndex + 1;
            const cardsMastered = currentFlashcards.filter(card => card.isChecked).length;
            const timeSpent = Date.now() - (sessionStartTime || Date.now()); // Approximate time spent
            
            // Get proper names for tracking
            const gradeName = selectedGradeData?.name || selectedGrade || '';
            const subjectName = selectedSubjectData?.name || '';
            const chapterName = selectedChapterData?.name || '';

            if (!subjectName) {
              // Don’t record incomplete/unknown activities
              return;
            }
            
            console.log('Tracking flashcard activity:', {
              grade: gradeName,
              subject: subjectName,
              chapter: chapterName,
              cardsReviewed,
              cardsMastered,
              selectedGrade,
              selectedSubject,
              selectedChapter,
              selectedGradeData: selectedGradeData?.name,
              selectedSubjectData: selectedSubjectData?.name,
              selectedChapterData: selectedChapterData?.name
            });
            
            await trackingService.trackFlashcardActivity({
              grade: gradeName || user?.grade || 'unknown',
              subject: subjectName,
              chapter: chapterName || undefined,
              cardsReviewed: cardsReviewed,
              cardsMastered: cardsMastered,
              timeSpent: Math.round(timeSpent / 1000), // Convert to seconds
            });
          } catch (error) {
            console.error('Failed to track flashcard activity:', error);
            // Silently fail - activity tracking is not critical
          }
        };
        
        trackActivity();
      }
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
            <ThemedText style={styles.flashResultsBrand}>M+</ThemedText>
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
                  router.replace('/(tabs)/mcq');
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
    if (isDeepLinkAutoStart) {
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
            <View style={styles.flashBrandPill}>
              <ThemedText style={styles.flashBrandText}>M+</ThemedText>
            </View>
            <ThemedText style={[styles.flashTopTitle, { color: '#0F4BD7' }]} numberOfLines={1}>
              {(selectedSubjectData?.name || (typeof params.preSelectedSubject === 'string' ? params.preSelectedSubject : '') || t('flashcards.subject'))}
              {(selectedChapterData?.name || deepLinkChapterName) ? `: ${selectedChapterData?.name || deepLinkChapterName}` : ''}
            </ThemedText>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              onPress={() => {
                setShowFlashcards(false);
                setCurrentIndex(0);
                setIsRevealed(false);
                setCurrentFlashcards([]);
                setSessionStartTime(null);
                progressAnimation.value = withTiming(0);
                revealAnimation.value = withSpring(0, { damping: 12, stiffness: 80, mass: 0.8 });
                router.replace('/(tabs)/mcq');
              }}
              style={styles.flashCloseBtn}
            >
              <IconSymbol name={'xmark' as any} size={18} color={colors.text} />
            </TouchableOpacity>
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
              setCurrentFlashcards((prev) => {
                const next = [...prev];
                if (next[currentIndex]) next[currentIndex] = { ...next[currentIndex], isChecked: false };
                return next;
              });
              if (currentFlashcards.length > 0 && currentIndex === currentFlashcards.length - 1) {
                setFlashPendingFinish(true);
              } else {
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
              setCurrentFlashcards((prev) => {
                const next = [...prev];
                if (next[currentIndex]) next[currentIndex] = { ...next[currentIndex], isChecked: true };
                return next;
              });

              if (isLastCard) {
                setFlashPendingFinish(true);
              } else {
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  flashHeaderWrap: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 4,
  },
  flashTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 10,
  },
  flashBrandPill: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#0F4BD7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4BD7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  flashBrandText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  flashTopTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  flashCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashProgressBlock: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopWidth: 0,
  },
  flashProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  flashProgressCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  flashProgressLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  flashProgressCount: {
    fontSize: 16,
    fontWeight: '800',
  },
  flashProgressCardsSuffix: {
    fontSize: 16,
    fontWeight: '700',
  },
  flashProgressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  flashProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  flashCardStage: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  flashCardTouch: {
    flex: 1,
  },
  flashCardShadowWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 6,
  },
  flashCardFace: {
    flex: 1,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flashCardBackFace: {
    transform: [{ rotateY: '180deg' }],
  },
  flashCardMeta: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.4,
    marginBottom: 18,
  },
  flashCardScroll: {
    flex: 1,
  },
  flashCardScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  flashCardTitle: {
    fontWeight: '500',
    letterSpacing: -0.4,
  },
  flashTapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 10,
  },
  flashTapHintText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  flashBottomActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 22,
    marginBottom: 10,
  },
  flashBottomActionLeft: {
    alignItems: 'center',
    gap: 10,
  },
  flashBottomActionRight: {
    alignItems: 'center',
    gap: 10,
  },
  flashBottomIconGhost: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  flashBottomIconPrimary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4BD7',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 6,
  },
  flashBottomLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  flashBottomLabelPrimary: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  // Results screen (per design)
  flashResultsHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
  },
  flashResultsBrand: {
    color: '#0F4BD7',
    fontWeight: '900',
    fontSize: 18,
    width: 40,
  },
  flashResultsTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#0F4BD7',
    fontWeight: '800',
    fontSize: 16,
  },
  flashResultsProfileBtn: {
    width: 40,
    alignItems: 'flex-end',
  },
  flashResultsScroll: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    flexGrow: 1,
  },
  flashRingWrap: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  flashRingCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashRingPct: {
    fontSize: 44,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.6,
    lineHeight: 54,
  },
  flashRingSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.4,
    color: '#0F4BD7',
  },
  flashRingBadge: {
    position: 'absolute',
    right: 42,
    top: 28,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F4BD7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4BD7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  flashResultCards: {
    gap: 14,
    marginTop: 8,
    marginBottom: 18,
  },
  flashResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  flashResultIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashResultCardText: {
    flex: 1,
  },
  flashResultCardLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
    color: '#9AA3B2',
    marginBottom: 6,
  },
  flashResultCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  flashResultButtons: {
    gap: 14,
    paddingTop: 8,
    paddingBottom: 18,
    marginTop: 'auto',
  },
  flashRetryBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  flashRetryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B7280',
  },
  flashDoneBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#0F4BD7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#0F4BD7',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 5,
  },
  flashDoneText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  progressTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    marginTop: 20,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
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
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.7,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    padding: 20,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardScrollView: {
    flex: 1,
    width: '100%',
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: '100%',
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 0,
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
  },
  nextButton: {
    backgroundColor: '#6B54AE',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  formContainer: {
    flex: 1,
    padding: 20,
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
  },
  preSelectedLabel: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
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
  },
  modalItemText: {
    fontSize: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -40,
  },
  emptyStateIcon: {
    marginBottom: 25,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  breadcrumbItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 20,
  },
  resultCard: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
  },
  resultContent: {
    gap: 16,
    alignItems: 'center',
  },
  trophyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  scoreText: {
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  percentageContainer: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    width: '100%',
  },
  messageText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
    paddingBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  homeButton: {
    borderWidth: 2,
    // backgroundColor and borderColor set inline
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
}); 