import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { router } from 'expo-router';
import { withTiming, withSpring, type SharedValue } from 'react-native-reanimated';
import {
  getFlashcardsForChapter,
  type Grade,
  type Subject,
  type Chapter,
  type Flashcard,
} from '@/features/common/services/flashcardService';
import ActivityTrackingService from '@/features/common/services/activityTrackingService';

type SessionMeta = { subjectName: string; chapterName?: string; gradeName: string } | null;

export interface FlashcardsHandlerDeps {
  user: { username?: string; grade?: string } | null;
  t: (key: string, options?: Record<string, unknown>) => string;
  selectedGradeId: string;
  selectedGrade: string;
  selectedSubject: string;
  selectedChapter: string;
  flashcardsData: Grade[];
  selectedGradeData: Grade | null;
  selectedSubjectData: Subject | null;
  selectedChapterData: Chapter | null;
  currentFlashcards: Flashcard[];
  currentIndex: number;
  isRevealed: boolean;
  sessionStartTime: number | null;
  revealAnimation: SharedValue<number>;
  progressAnimation: SharedValue<number>;
  flashcardSessionTrackedRef: MutableRefObject<boolean>;
  sessionTrackMetaRef: MutableRefObject<SessionMeta>;
  fetchFlashcards: (gradeLevelId?: string) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setCurrentFlashcards: Dispatch<SetStateAction<Flashcard[]>>;
  setFlashcardsData: Dispatch<SetStateAction<Grade[]>>;
  setShowFlashcards: Dispatch<SetStateAction<boolean>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setIsRevealed: Dispatch<SetStateAction<boolean>>;
  setSessionStartTime: Dispatch<SetStateAction<number | null>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setSelectedChapter: Dispatch<SetStateAction<string>>;
  setFlashPendingFinish: Dispatch<SetStateAction<boolean>>;
}

const SPRING = { damping: 12, stiffness: 80, mass: 0.8 };

export function createFlashcardsHandlers(deps: FlashcardsHandlerDeps) {
  const {
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
  } = deps;

  const handleReveal = () => {
    setIsRevealed(!isRevealed);
    revealAnimation.value = withSpring(isRevealed ? 0 : 1, SPRING);
  };

  const trackFlashcardSessionEnd = async (cardsSnapshot: Flashcard[]) => {
    if (flashcardSessionTrackedRef.current) return;
    if (!user?.username || cardsSnapshot.length === 0) return;

    const meta = sessionTrackMetaRef.current;
    const subjectName = (meta?.subjectName || selectedSubjectData?.name || '').trim();
    if (!subjectName) {
      return;
    }

    flashcardSessionTrackedRef.current = true;

    try {
      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize(user.username);

      const cardsReviewed = cardsSnapshot.length;
      const cardsMastered = cardsSnapshot.filter((card) => card.isChecked).length;
      const start = sessionStartTime;
      const timeSpentSec = start != null ? Math.max(0, Math.round((Date.now() - start) / 1000)) : 0;

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
    } catch {
      flashcardSessionTrackedRef.current = false;
    }
  };

  const handleNext = () => {
    if (currentFlashcards.length > 0 && currentIndex < currentFlashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      progressAnimation.value = withTiming(((currentIndex + 2) / currentFlashcards.length) * 100);
    }
  };

  const handleStartFlashcards = async () => {
    if (!selectedSubject || !selectedChapter) return;

    try {
      setIsLoading(true);

      const grade = flashcardsData.find((g) => g.name === selectedGrade);
      const subject = grade?.subjects.find((s) => s.id === selectedSubject);
      const subjectSlug = subject?.slug;

      if (!subjectSlug) {
        throw new Error('Subject slug not found');
      }

      const chapterName = selectedChapterData?.name;
      if (!chapterName) {
        throw new Error('Chapter name not found');
      }

      const flashcards = await getFlashcardsForChapter(selectedGradeId, subjectSlug, chapterName);

      if (!flashcards || flashcards.length === 0) {
        setError(t('flashcards.noFlashcardsAvailable'));
        return;
      }

      setCurrentFlashcards(flashcards.map((c) => ({ ...c, isChecked: false })));
      flashcardSessionTrackedRef.current = false;
      sessionTrackMetaRef.current = {
        subjectName: selectedSubjectData?.name?.trim() || '',
        chapterName: selectedChapterData?.name,
        gradeName: selectedGradeData?.name || selectedGrade || user?.grade || 'unknown',
      };
      setSessionStartTime(Date.now());

      const updatedFlashcardsData = flashcardsData.map((g) => {
        if (g.name === selectedGrade) {
          return {
            ...g,
            subjects: g.subjects.map((s) => {
              if (s.id === selectedSubject) {
                return {
                  ...s,
                  chapters: s.chapters.map((c) => {
                    if (c.id === selectedChapter) {
                      return {
                        ...c,
                        flashcards,
                      };
                    }
                    return c;
                  }),
                };
              }
              return s;
            }),
          };
        }
        return g;
      });

      setFlashcardsData(updatedFlashcardsData);

      setShowFlashcards(true);
      setCurrentIndex(0);
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, SPRING);
    } catch {
      setError(t('errors.network.message'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryNetworkError = () => {
    setError(null);
    setIsLoading(true);
    fetchFlashcards(selectedGradeId);
  };

  const handleSessionResultsRetry = () => {
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
    revealAnimation.value = withSpring(0, SPRING);
    progressAnimation.value = withTiming(0);
  };

  const handleSessionResultsDone = () => {
    setShowResult(false);
    setShowFlashcards(false);
    setCurrentIndex(0);
    setIsRevealed(false);
    setCurrentFlashcards([]);
    setSessionStartTime(null);
    revealAnimation.value = withSpring(0, SPRING);
    progressAnimation.value = withTiming(0);
    router.replace('/(tabs)/practice');
  };

  const handleEmptyChapterChooseDifferent = () => {
    setShowFlashcards(false);
    setSelectedSubject('');
    setSelectedChapter('');
    setCurrentFlashcards([]);
  };

  const onStillLearningPress = () => {
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
  };

  const onGotItPress = () => {
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
  };

  return {
    handleReveal,
    trackFlashcardSessionEnd,
    handleNext,
    handleStartFlashcards,
    handleRetryNetworkError,
    handleSessionResultsRetry,
    handleSessionResultsDone,
    handleEmptyChapterChooseDifferent,
    onStillLearningPress,
    onGotItPress,
  };
}
