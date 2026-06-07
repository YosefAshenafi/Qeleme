import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Keyboard, useWindowDimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useAuth } from '@/core/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { getBookCover } from '@/features/common/services/bookCoverService';
import {
  getPracticeData,
  type PracticeData,
  type Grade,
  type Subject,
  type Chapter,
  type NationalExamAPIResponse,
} from '@/features/common/services/practiceService';
import {
  BOOK_CTA_ON,
  BOOKS_CANVAS,
  BRAND_BLUE,
  SUBJECT_ROW_COVER_WIDTH,
  SUBJECT_ROW_COVER_HEIGHT,
} from '@/features/practice/constants/practiceUi';
import type { BooksCategoryFilter } from '@/features/practice/utils/booksCategory';
import { usePracticeSettings } from '@/features/practice/hooks/usePracticeSettings';
import { PracticeScreenStyles as styles } from '../components/PracticeScreen.styles';
import { usePracticeTimer } from './usePracticeTimer';
import { usePracticeDerived } from './usePracticeDerived';
import { usePracticePreselection } from './usePracticePreselection';
import { usePracticeLifecycle } from './usePracticeLifecycle';
import { normalizeGrade, getResultPanelCopy, getMcqOptionStyle } from './practiceHelpers';
import { createNationalExamHandlers } from './practiceNationalExamHandlers';
import { createBooksHandlers, type BooksChapterIntent } from './practiceBooksHandlers';
import { createMcqHandlers } from './practiceMcqHandlers';

export function usePracticeScreen() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);
  const { width: windowWidth } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedChapterName, setSelectedChapterName] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: string }>({});
  const [showAnswerMessage, setShowAnswerMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const booksListScrollRef = useRef<ScrollView>(null);
  const booksSubjectRowY = useRef<Record<string, number>>({});
  const explanationRef = useRef<View>(null);

  // MCQ practice settings (persisted) + auto-next plumbing.
  const { autoNextEnabled, setAutoNextEnabled, autoNextDelay, setAutoNextDelay } = usePracticeSettings();
  const [showPracticeSettings, setShowPracticeSettings] = useState(false);
  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoNextEnabledRef = useRef(autoNextEnabled);
  autoNextEnabledRef.current = autoNextEnabled;
  const autoNextDelayRef = useRef(autoNextDelay);
  autoNextDelayRef.current = autoNextDelay;
  const advanceRef = useRef<() => void>(() => {});
  const clearAutoNext = React.useCallback(() => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
  }, []);
  // Guards one-shot consumption of route preselection params. A focus refetch
  // refreshes practiceData, so without this the preselect effects would re-run
  // and snap the user back to the originally selected subject/national exam.
  const preSelectionAttempted = useRef(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [, setShowSubjectDropdown] = useState(false);
  const [, setShowChapterDropdown] = useState(false);
  const [, setShowYearDropdown] = useState(false);
  const [, setUserPhoneNumber] = useState<string | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [nationalExamQuestions, setNationalExamQuestions] = useState<NationalExamAPIResponse[]>([]);
  const [showChapterChooser, setShowChapterChooser] = useState(false);
  const [showNationalExamSubjectChooser, setShowNationalExamSubjectChooser] = useState(false);
  const [isPreSelected, setIsPreSelected] = useState(false);
  const [booksSearchQuery, setBooksSearchQuery] = useState('');
  const [booksCategory, setBooksCategory] = useState<BooksCategoryFilter | 'national'>('all');
  const [booksChapterIntent, setBooksChapterIntent] = useState<BooksChapterIntent>(null);

  const [booksChapterModalStep, setBooksChapterModalStep] = useState<'grid' | 'eitherPick'>('grid');
  const [booksEitherPendingChapter, setBooksEitherPendingChapter] = useState<Chapter | null>(null);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const booksChapterModeLabel =
    booksChapterIntent === 'practice'
      ? 'Multiple Choice Questions'
      : booksChapterIntent === 'flashcards'
        ? 'Flashcards'
        : '';

  const [booksHubActionLoading, setBooksHubActionLoading] = useState(false);

  const {
    time,
    setTime,
    setIsTimerRunning,
    timerRef,
    startTimer,
    stopTimer,
    timeHours,
    timeMinutes,
    timeSeconds,
    formattedPracticeTime,
  } = usePracticeTimer({ showTest, showResult });

  const selectedGradeData = practiceData?.grades.find((grade: Grade) => grade.id === selectedGrade?.id);
  const selectedSubjectData = selectedGradeData?.subjects.find((subject: Subject) => subject.id === selectedSubject);
  const selectedChapterData = selectedSubjectData?.chapters.find((chapter: Chapter) => chapter.id === selectedChapter);
  const { displaySubjects, chapterGridColumns, booksModalChaptersSorted } = usePracticeDerived({
    selectedGradeData,
    selectedSubjectData,
    availableYears,
    booksSearchQuery,
    booksCategory,
    windowWidth,
    t,
  });

  const currentQuestion = nationalExamQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (nationalExamQuestions.length - 1);
  const totalQuestions = nationalExamQuestions.length;
  const totalQuestionsSafe = Math.max(1, totalQuestions);

  const fetchPracticeData = async () => {
    setLoading(true);
    setError(null);

    const normalizedGradeNumber = normalizeGrade(user?.grade);
    const userGrade = `grade-${normalizedGradeNumber}`;
    const gradeToFetch = selectedGrade?.id || userGrade;

    getPracticeData(gradeToFetch).then(data => {
      if (data.grades.length > 0 && !selectedGrade) {
        setSelectedGrade(data.grades[0]);
      }

      setPracticeData(data);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load practice data');
    }).finally(() => {
      setLoading(false);
    });
  };

  const exitSession = React.useCallback(() => {
    clearAutoNext();
    setNationalExamQuestions([]);
    setShowResult(false);
    setShowTest(false);
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedChapterName('');
    setSelectedGrade(null);
    setSelectedYear(null);
    setCurrentQuestionIndex(0);
    setAnsweredQuestions({});
    setSelectedAnswer(null);
  }, [clearAutoNext]);

  const { fetchNationalExamAvailable, handleNationalExamYearPress, handleNationalExamSubjectPress } =
    createNationalExamHandlers({
      userGrade: user?.grade,
      selectedYear,
      setLoading,
      setError,
      setAvailableYears,
      setAvailableSubjects,
      setSelectedYear,
      setShowNationalExamSubjectChooser,
      setSubjectLoading,
      setNationalExamQuestions,
      setShowTest,
      setSelectedSubject,
      setIsPreSelected,
      startTimer,
    });

  const { dismissBooksChapterModal, applyBooksChapterAndStartMcq, applyBooksChapterAndOpenFlashcards } =
    createBooksHandlers({
      practiceData,
      userGrade: user?.grade,
      selectedGrade,
      t,
      setError,
      setBooksHubActionLoading,
      setShowChapterChooser,
      setBooksChapterIntent,
      setBooksChapterModalStep,
      setBooksEitherPendingChapter,
      setSelectedGrade,
      setSelectedSubject,
      setSelectedChapter,
      setSelectedChapterName,
      setShowSubjectDropdown,
      setShowChapterDropdown,
      setShowYearDropdown,
      setNationalExamQuestions,
      setShowTest,
      setCurrentQuestionIndex,
      setSelectedAnswer,
      setShowExplanation,
      setShowAnswerMessage,
      setScore,
      setShowResult,
      setAnsweredQuestions,
      setTime,
      startTimer,
    });

  const {
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleResult,
    handleRetry,
    handleSessionResultsDone,
  } = createMcqHandlers({
    user,
    currentQuestion,
    nationalExamQuestions,
    currentQuestionIndex,
    selectedAnswer,
    answeredQuestions,
    score,
    time,
    selectedGrade,
    selectedSubject,
    selectedChapter,
    selectedYear,
    selectedSubjectData,
    selectedChapterData,
    scrollViewRef,
    explanationRef,
    timerRef,
    autoNextEnabledRef,
    autoNextDelayRef,
    autoNextTimerRef,
    advanceRef,
    clearAutoNext,
    startTimer,
    stopTimer,
    fetchPracticeData,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setShowExplanation,
    setShowAnswerMessage,
    setAnsweredQuestions,
    setScore,
    setShowResult,
    setShowTest,
    setNationalExamQuestions,
    setTime,
    setIsTimerRunning,
    setSelectedChapter,
    setSelectedChapterName,
    setSelectedSubject,
    setSelectedYear,
    setError,
    setBooksChapterIntent,
    setBooksChapterModalStep,
    setShowChapterChooser,
  });

  useEffect(() => {
    fetchPracticeData();
  }, []);

  usePracticePreselection({
    params,
    practiceData,
    preSelectionAttempted,
    booksListScrollRef,
    booksSubjectRowY,
    availableSubjects,
    booksCategory,
    selectedSubject,
    displaySubjects,
    isPreSelected,
    selectedYear,
    fetchNationalExamAvailable,
    setShowTest,
    setShowResult,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setShowExplanation,
    setAnsweredQuestions,
    setShowAnswerMessage,
    setScore,
    setNationalExamQuestions,
    setSelectedChapter,
    setSelectedChapterName,
    setSelectedYear,
    setBooksCategory,
    setBooksSearchQuery,
    setSelectedSubject,
    setIsPreSelected,
    setBooksEitherPendingChapter,
    setBooksChapterIntent,
    setBooksChapterModalStep,
    setShowChapterChooser,
  });

  usePracticeLifecycle({
    fetchPracticeData,
    fetchNationalExamAvailable,
    booksCategory,
    selectedGrade,
    userGrade: user?.grade,
    timerRef,
    advanceRef,
    isLastQuestion,
    handleResult,
    handleNextQuestion,
    clearAutoNext,
    navigation,
    colors,
    showTest,
    showResult,
    nationalExamQuestions,
    selectedChapterName,
    selectedSubjectData,
    t,
    exitSession,
    params,
    setBooksChapterIntent,
    setBooksChapterModalStep,
    setBooksEitherPendingChapter,
    setUserPhoneNumber,
    setSelectedGrade,
    setSelectedSubject,
    setSelectedChapter,
    setSelectedChapterName,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setShowExplanation,
    setAnsweredQuestions,
    setShowAnswerMessage,
    setScore,
    setShowResult,
    setShowTest,
    setTime,
    setIsTimerRunning,
  });

  const getOptionStyle = (optionId: string) =>
    getMcqOptionStyle({
      optionId,
      showExplanation,
      options: currentQuestion?.options,
      selectedAnswer,
      baseStyle: styles.optionContainer,
      brandBlue: BRAND_BLUE,
    });

  const sessionCorrectCount = score;
  const sessionIncorrectCount = Math.max(0, totalQuestions - score);
  const sessionAccuracy = totalQuestionsSafe > 0 ? Math.round((score / totalQuestionsSafe) * 100) : 0;
  const resultPanelCopy = getResultPanelCopy(sessionAccuracy);

  const isKGStudent = typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg');

  return {
    isKGStudent,
    isDarkMode,
    user,
    colors,
    t,
    loading,
    error,
    practiceData,
    fetchPracticeData,
    selectedSubject,
    setSelectedSubject,
    setSelectedChapter,
    setSelectedChapterName,
    setIsPreSelected,
    scrollViewRef,
    booksListScrollRef,
    booksSubjectRowY,
    currentQuestionIndex,
    selectedAnswer,
    showExplanation,
    showAnswerMessage,
    showResult,
    showTest,
    availableSubjects,
    availableYears,
    currentQuestion,
    showChapterChooser,
    setShowChapterChooser,
    showNationalExamSubjectChooser,
    setShowNationalExamSubjectChooser,
    booksSearchQuery,
    setBooksSearchQuery,
    booksCategory,
    setBooksCategory,
    booksChapterIntent,
    setBooksChapterIntent,
    booksChapterModalStep,
    setBooksChapterModalStep,
    booksEitherPendingChapter,
    setBooksEitherPendingChapter,
    subjectLoading,
    booksChapterModeLabel,
    booksHubActionLoading,
    selectedGradeData,
    selectedSubjectData,
    displaySubjects,
    chapterGridColumns,
    booksModalChaptersSorted,
    isLastQuestion,
    totalQuestions,
    handleNationalExamYearPress,
    handleNationalExamSubjectPress,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleResult,
    autoNextEnabled,
    setAutoNextEnabled,
    autoNextDelay,
    setAutoNextDelay,
    showPracticeSettings,
    setShowPracticeSettings,
    handleRetry,
    dismissBooksChapterModal,
    applyBooksChapterAndStartMcq,
    applyBooksChapterAndOpenFlashcards,
    getOptionStyle,
    timeHours,
    timeMinutes,
    timeSeconds,
    handleSessionResultsDone,
    sessionCorrectCount,
    sessionIncorrectCount,
    sessionAccuracy,
    resultPanelCopy,
    formattedPracticeTime,
    styles,
    SUBJECT_ROW_COVER_WIDTH,
    SUBJECT_ROW_COVER_HEIGHT,
    BOOK_CTA_ON,
    BOOKS_CANVAS,
    BRAND_BLUE,
    getBookCover,
    Keyboard,
    LinearGradient,
    StyleSheet,
  };
}
