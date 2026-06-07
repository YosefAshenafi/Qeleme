import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useAuth } from '@/core/providers/AuthProvider';
import {
  getFlashcardStructure,
  getFlashcardsForChapter,
  Grade,
  Flashcard,
} from '@/features/common/services/flashcardService';
import { resolveDeepLinkSessionMeta } from '@/features/flashcards/utils/resolveDeepLinkSessionMeta';
import { createFlashcardsHandlers } from './createFlashcardsHandlers';



export function useFlashcardsScreen() {
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
  const [previousLanguage, setPreviousLanguage] = useState(i18n.language);
  const [isPreSelected, setIsPreSelected] = useState(false);
  const preSelectionAttempted = useRef(false);

  const flashcardsAutoStartConsumedRef = useRef(false);

  const flashcardSessionTrackedRef = useRef(false);

  const sessionTrackMetaRef = useRef<{
    subjectName: string;
    chapterName?: string;
    gradeName: string;
  } | null>(null);

  const revealAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  useLayoutEffect(() => {
    (navigation as any)?.setOptions?.({ headerShown: false });
  }, [navigation]);

  const fetchFlashcards = async (gradeLevelId: string = '1') => {
    try {
      setIsLoading(true);
      const data = await getFlashcardStructure(gradeLevelId);
      setFlashcardsData(data);
      setError(null);
    } catch {
      setError(t('errors.network.message'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.grade) {
      const gradeNumber = user.grade.replace(/[^\d]/g, '');
      setSelectedGradeId(gradeNumber || '1');
    } else {
      setSelectedGradeId('1');
    }
  }, [user]);

  useEffect(() => {
    if (selectedGradeId) {
      fetchFlashcards(selectedGradeId);
    }
  }, [selectedGradeId]);

  useEffect(() => {
    if (params.preSelectedSubject) {
      preSelectionAttempted.current = false;
      setHasAppliedPreSelection(false);
      flashcardsAutoStartConsumedRef.current = false;
    }
  }, [params.preSelectedSubject, params.preSelectedChapterId]);

  useEffect(() => {
    if (flashcardsData && flashcardsData.length > 0) {
      const grade = flashcardsData[0];
      if (grade && grade.name) {
        setSelectedGrade(grade.name);

        if (params.preSelectedSubject && !preSelectionAttempted.current) {
          preSelectionAttempted.current = true;

          setShowFlashcards(false);
          setCurrentIndex(0);
          setIsRevealed(false);
          setCurrentFlashcards([]);
          setSessionStartTime(null);

          revealAnimation.value = withSpring(0, {
            damping: 12,
            stiffness: 80,
            mass: 0.8,
          });
          progressAnimation.value = withTiming(0);

          const searchTerm = (params.preSelectedSubject as string).toLowerCase().trim();
          let subject = grade.subjects?.find((s) => s.name.toLowerCase().trim() === searchTerm);

          if (!subject) {
            subject = grade.subjects?.find((s) => {
              const subjectName = s.name.toLowerCase();
              return subjectName.includes(searchTerm) || searchTerm.includes(subjectName);
            });
          }

          if (subject) {
            setSelectedSubject(subject.id);
            const chId =
              typeof params.preSelectedChapterId === 'string' ? params.preSelectedChapterId.trim() : '';
            if (chId) {
              const ch = subject.chapters?.find((c) => c.id === chId);
              setSelectedChapter(ch ? ch.id : '');
            } else {
              setSelectedChapter('');
            }
            setIsPreSelected(true);
            setHasAppliedPreSelection(true);
          } else {
            setSelectedSubject('');
            setSelectedChapter('');
            setIsPreSelected(false);
            setHasAppliedPreSelection(true);
          }
        } else if (!params.preSelectedSubject && !hasAppliedPreSelection) {
          setSelectedSubject('');
          setSelectedChapter('');
          setHasAppliedPreSelection(true);
        }
      }
    }
  }, [flashcardsData, params.preSelectedSubject, params.preSelectedChapterId]);

  useEffect(() => {
    if (selectedSubject && hasAppliedPreSelection) {
      if (isPreSelected) {
        setIsPreSelected(false);
      } else {
        setSelectedChapter('');
      }
    }
  }, [selectedSubject]);

  const selectedGradeData = selectedGrade && flashcardsData ? flashcardsData.find((g) => g.name === selectedGrade) : null;
  const selectedSubjectData =
    selectedSubject && selectedGradeData && selectedGradeData.subjects
      ? selectedGradeData.subjects.find((s) => s.id === selectedSubject)
      : null;

  const selectedChapterData =
    selectedChapter && selectedSubjectData && selectedSubjectData.chapters
      ? selectedSubjectData.chapters.find((c) => c.id === selectedChapter)
      : null;
  const currentCard = currentFlashcards.length > currentIndex ? currentFlashcards[currentIndex] : null;

  useEffect(() => {
    if (currentCard) {
      setIsRevealed(false);

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

  useEffect(() => {
    if (!flashPendingFinish) return;
    setFlashPendingFinish(false);
    setShowFlashcards(false);
    setShowResult(true);
  }, [flashPendingFinish, currentFlashcards]);

  useEffect(() => {
    if (previousLanguage !== i18n.language) {
      setPreviousLanguage(i18n.language);
    }
  }, [i18n.language, previousLanguage]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [0, 180]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);

    return {
      transform: [{ perspective: 2000 }, { rotateY: `${rotateY}deg` }, { scale }],
      shadowOpacity,
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    } as any;
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [180, 360]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);

    return {
      transform: [{ perspective: 2000 }, { rotateY: `${rotateY}deg` }, { scale }],
      shadowOpacity,
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    } as any;
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value}%`,
    };
  });

  const {
    handleReveal,
    handleStartFlashcards,
    handleRetryNetworkError,
    handleSessionResultsRetry,
    handleSessionResultsDone,
    handleEmptyChapterChooseDifferent,
    onStillLearningPress,
    onGotItPress,
  } = createFlashcardsHandlers({
    user,
    t,
    selectedGradeId,
    selectedGrade,
    selectedSubject,
    selectedChapter,
    flashcardsData,
    selectedGradeData,
    selectedSubjectData,
    selectedChapterData,
    currentFlashcards,
    currentIndex,
    isRevealed,
    sessionStartTime,
    revealAnimation,
    progressAnimation,
    flashcardSessionTrackedRef,
    sessionTrackMetaRef,
    fetchFlashcards,
    setIsLoading,
    setError,
    setCurrentFlashcards,
    setFlashcardsData,
    setShowFlashcards,
    setShowResult,
    setCurrentIndex,
    setIsRevealed,
    setSessionStartTime,
    setSelectedSubject,
    setSelectedChapter,
    setFlashPendingFinish,
  });

  useEffect(() => {
    if (!startFlashcards) return;

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
        } catch {
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

  const totalCards = currentFlashcards.length;
  const masteredCount = currentFlashcards.filter((c) => Boolean(c?.isChecked)).length;
  const stillLearningCount = Math.max(0, totalCards - masteredCount);
  const masteredPct = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  const cardMutedMeta = isDarkMode ? '#93A4C7' : '#9AA3B2';

  return {
    isDarkMode,
    user,
    t,
    colors,
    params,
    startFlashcards,
    hasPreSelectedSubject,
    isDeepLinkAutoStart,
    autoStartConsumed: flashcardsAutoStartConsumedRef.current,
    deepLinkSubjectSlug,
    deepLinkChapterName,
    deepLinkGradeId,
    selectedGradeId,
    setSelectedGradeId,
    selectedGrade,
    setSelectedGrade,
    selectedSubject,
    setSelectedSubject,
    selectedChapter,
    setSelectedChapter,
    showFlashcards,
    setShowFlashcards,
    showResult,
    setShowResult,
    currentIndex,
    setCurrentIndex,
    isRevealed,
    setIsRevealed,
    showSubjectDropdown,
    setShowSubjectDropdown,
    showChapterDropdown,
    setShowChapterDropdown,
    flashcardsData,
    setFlashcardsData,
    isLoading,
    setIsLoading,
    error,
    setError,
    currentFlashcards,
    setCurrentFlashcards,
    hasAppliedPreSelection,
    sessionStartTime,
    isPreSelected,
    setIsPreSelected,
    selectedGradeData,
    selectedSubjectData,
    selectedChapterData,
    currentCard,
    frontAnimatedStyle,
    backAnimatedStyle,
    progressBarStyle,
    handleReveal,
    fetchFlashcards,
    handleStartFlashcards,
    handleRetryNetworkError,
    handleSessionResultsRetry,
    handleSessionResultsDone,
    handleEmptyChapterChooseDifferent,
    totalCards,
    masteredCount,
    stillLearningCount,
    masteredPct,
    cardMutedMeta,
    onStillLearningPress,
    onGotItPress,
  };
}
