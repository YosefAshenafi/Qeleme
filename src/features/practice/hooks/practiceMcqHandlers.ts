import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import type { ScrollView, View } from 'react-native';
import {
  getNationalExamQuestions,
  getRegularPracticeQuestions,
  type Chapter,
  type Grade,
  type Subject,
  type Option,
  type NationalExamAPIResponse,
} from '@/features/common/services/practiceService';
import ActivityTrackingService from '@/features/common/services/activityTrackingService';
import { getGradeNumber } from './practiceHelpers';
import type { BooksChapterIntent } from './practiceBooksHandlers';

export interface McqHandlerDeps {
  user: { username?: string; grade?: string } | null;
  currentQuestion: NationalExamAPIResponse | undefined;
  nationalExamQuestions: NationalExamAPIResponse[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  answeredQuestions: { [key: number]: string };
  score: number;
  time: number;
  selectedGrade: Grade | null;
  selectedSubject: string;
  selectedChapter: string;
  selectedYear: string | null;
  selectedSubjectData: Subject | undefined;
  selectedChapterData: Chapter | undefined;
  scrollViewRef: RefObject<ScrollView | null>;
  explanationRef: RefObject<View | null>;
  timerRef: MutableRefObject<ReturnType<typeof setInterval> | null>;
  autoNextEnabledRef: MutableRefObject<boolean>;
  autoNextDelayRef: MutableRefObject<number>;
  autoNextTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  advanceRef: MutableRefObject<() => void>;
  clearAutoNext: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  fetchPracticeData: () => void;
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  setSelectedAnswer: Dispatch<SetStateAction<string | null>>;
  setShowExplanation: Dispatch<SetStateAction<boolean>>;
  setShowAnswerMessage: Dispatch<SetStateAction<boolean>>;
  setAnsweredQuestions: Dispatch<SetStateAction<{ [key: number]: string }>>;
  setScore: Dispatch<SetStateAction<number>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  setShowTest: Dispatch<SetStateAction<boolean>>;
  setNationalExamQuestions: Dispatch<SetStateAction<NationalExamAPIResponse[]>>;
  setTime: Dispatch<SetStateAction<number>>;
  setIsTimerRunning: Dispatch<SetStateAction<boolean>>;
  setSelectedChapter: Dispatch<SetStateAction<string>>;
  setSelectedChapterName: Dispatch<SetStateAction<string>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setSelectedYear: Dispatch<SetStateAction<string | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setBooksChapterIntent: Dispatch<SetStateAction<BooksChapterIntent>>;
  setBooksChapterModalStep: Dispatch<SetStateAction<'grid' | 'eitherPick'>>;
  setShowChapterChooser: Dispatch<SetStateAction<boolean>>;
}

export function createMcqHandlers(deps: McqHandlerDeps) {
  const {
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
  } = deps;

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answerId);
    setAnsweredQuestions((prev) => ({ ...prev, [currentQuestionIndex]: answerId }));
    setShowExplanation(true);
    setShowAnswerMessage(false);

    const isCorrect = currentQuestion?.options?.find((opt: Option) => opt.id === answerId)?.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      explanationRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        scrollViewRef.current?.scrollTo({
          y: pageY - 100,
          animated: true
        });
      });
    }, 100);

    // Auto-advance after the chosen delay when the setting is enabled.
    clearAutoNext();
    if (autoNextEnabledRef.current) {
      autoNextTimerRef.current = setTimeout(() => {
        autoNextTimerRef.current = null;
        advanceRef.current();
      }, autoNextDelayRef.current);
    }
  };

  const handleNextQuestion = () => {
    clearAutoNext();
    if (currentQuestionIndex < nationalExamQuestions.length - 1) {
      if (!selectedAnswer) {
        setShowAnswerMessage(true);
        return;
      }
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowAnswerMessage(false);
    } else {
      setShowResult(true);
    }
  };

  const handlePreviousQuestion = () => {
    clearAutoNext();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answeredQuestions[currentQuestionIndex - 1] || null);
      setShowExplanation(true);
    }
  };

  const handleResult = async () => {
    clearAutoNext();
    stopTimer();
    setShowResult(true);

    try {
      if (!user?.username) {
        return;
      }

      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize(user.username);

      const totalQuestions = nationalExamQuestions.length;
      const correctAnswers = score;
      const timeSpent = time;
      const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      const subjectName = (selectedSubjectData?.name || selectedSubject || '').trim();
      if (!subjectName) {
        return;
      }

      await trackingService.trackMCQActivity({
        grade: selectedGrade?.id || user?.grade || 'unknown',
        subject: subjectName,
        chapter: selectedChapterData?.name || undefined,
        examType: selectedYear ? 'national' : 'regular',
        year: selectedYear ? parseInt(selectedYear) : undefined,
        questionsAnswered: totalQuestions,
        correctAnswers: correctAnswers,
        timeSpent: timeSpent,
        score: scorePercentage,
      });
    } catch {
    }
  };

  const handleCheckOtherQuestions = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const isKGStudent = typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg');

    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowAnswerMessage(false);
    setScore(0);
    setShowResult(false);
    setShowTest(false);
    setAnsweredQuestions({});
    setTime(0);
    setIsTimerRunning(false);

    if (isKGStudent) {
      if (selectedSubjectData && selectedChapterData) {
        const sortedChapters = [...selectedSubjectData.chapters].sort((a, b) => {
          const getChapterNumber = (name: string) => {
            const match = name.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getChapterNumber(a.name) - getChapterNumber(b.name);
        });

        const currentChapterIndex = sortedChapters.findIndex((chapter: Chapter) => chapter.id === selectedChapter);
        const nextChapterIndex = currentChapterIndex + 1;

        if (nextChapterIndex < sortedChapters.length) {
          const nextChapter = sortedChapters[nextChapterIndex];
          setSelectedChapter(nextChapter.id);
          setSelectedChapterName(nextChapter.name);
        } else {
          const firstChapter = sortedChapters[0];
          setSelectedChapter(firstChapter.id);
          setSelectedChapterName(firstChapter.name);
        }

        setBooksChapterIntent('practice');
        setBooksChapterModalStep('grid');
        setShowChapterChooser(true);
      }
    } else {
      try {
        if (selectedYear) {
          if (!selectedYear || !selectedSubject) {
            setError('Missing required parameters for national exam');
            return;
          }

          const gradeNumber = getGradeNumber(user?.grade);
          const questions = await getNationalExamQuestions(
            gradeNumber,
            parseInt(selectedYear),
            selectedSubject
          );

          const filteredQuestions = questions?.filter(q =>
            !q.question?.toLowerCase().includes('valuing our elders')
          ) || [];

          if (filteredQuestions && filteredQuestions.length > 0) {
            setNationalExamQuestions(filteredQuestions);
            setShowTest(true);
            startTimer();
          } else {
            setError('No more questions available for this exam');
          }
        } else {
          if (!selectedSubject || !selectedChapter) {
            setError('Missing required parameters for MCQ');
            return;
          }

          const gradeNumber = getGradeNumber(user?.grade);
          const questions = await getRegularPracticeQuestions(
            gradeNumber,
            selectedSubject,
            selectedChapter
          );

          if (questions && questions.length > 0) {
            setNationalExamQuestions(questions);
            setShowTest(true);
            startTimer();
          } else {
            setError('No more questions available for this chapter');
          }
        }
      } catch {
        setError('Failed to load new questions. Please try again.');
      }
    }
  };

  // Retry Session: immediately start a new MCQ session on the SAME chapter
  // (or national exam year), pulling a fresh batch of questions. The fetch
  // happens before switching screens so the results stay visible (no flash
  // back to the subject list) until the new questions are ready.
  const handleRetry = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const gradeNumber = getGradeNumber(user?.grade);
      let questions: NationalExamAPIResponse[] = [];

      if (selectedYear) {
        if (!selectedSubject) {
          setError('Missing required parameters for national exam');
          return;
        }
        const fetched = await getNationalExamQuestions(gradeNumber, parseInt(selectedYear), selectedSubject);
        questions = (fetched || []).filter(
          (q) => !q.question?.toLowerCase().includes('valuing our elders')
        );
      } else {
        if (!selectedSubject || !selectedChapter) {
          setError('Missing required parameters for MCQ');
          return;
        }
        questions = (await getRegularPracticeQuestions(gradeNumber, selectedSubject, selectedChapter)) || [];
      }

      if (questions.length === 0) {
        setError('No more questions available for this chapter.');
        return;
      }

      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowAnswerMessage(false);
      setScore(0);
      setAnsweredQuestions({});
      setTime(0);
      setNationalExamQuestions(questions);
      setShowResult(false);
      setShowTest(true);
      startTimer();
    } catch {
      setError('Failed to load new questions. Please try again.');
    }
  };

  const handleSessionResultsDone = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setShowResult(false);
    setShowTest(false);
    setNationalExamQuestions([]);
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedChapterName('');
    setSelectedYear('');
    setTime(0);
    setIsTimerRunning(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnsweredQuestions({});
    setScore(0);

    fetchPracticeData();
  };

  return {
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleResult,
    handleCheckOtherQuestions,
    handleRetry,
    handleSessionResultsDone,
  };
}
