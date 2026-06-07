import type { Dispatch, SetStateAction } from 'react';
import { router } from 'expo-router';
import {
  getRegularPracticeQuestions,
  type Chapter,
  type Grade,
  type PracticeData,
  type NationalExamAPIResponse,
} from '@/features/common/services/practiceService';
import { getFlashcardStructure, getFlashcardsForChapter } from '@/features/common/services/flashcardService';
import { normalizeGrade, getGradeNumber } from './practiceHelpers';

export type BooksChapterIntent = 'practice' | 'flashcards' | 'either' | null;

export interface BooksHandlerDeps {
  practiceData: PracticeData | null;
  userGrade: string | undefined;
  selectedGrade: Grade | null;
  t: (key: string, options?: Record<string, unknown>) => string;
  setError: Dispatch<SetStateAction<string | null>>;
  setBooksHubActionLoading: Dispatch<SetStateAction<boolean>>;
  setShowChapterChooser: Dispatch<SetStateAction<boolean>>;
  setBooksChapterIntent: Dispatch<SetStateAction<BooksChapterIntent>>;
  setBooksChapterModalStep: Dispatch<SetStateAction<'grid' | 'eitherPick'>>;
  setBooksEitherPendingChapter: Dispatch<SetStateAction<Chapter | null>>;
  setSelectedGrade: Dispatch<SetStateAction<Grade | null>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setSelectedChapter: Dispatch<SetStateAction<string>>;
  setSelectedChapterName: Dispatch<SetStateAction<string>>;
  setShowSubjectDropdown: Dispatch<SetStateAction<boolean>>;
  setShowChapterDropdown: Dispatch<SetStateAction<boolean>>;
  setShowYearDropdown: Dispatch<SetStateAction<boolean>>;
  setNationalExamQuestions: Dispatch<SetStateAction<NationalExamAPIResponse[]>>;
  setShowTest: Dispatch<SetStateAction<boolean>>;
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  setSelectedAnswer: Dispatch<SetStateAction<string | null>>;
  setShowExplanation: Dispatch<SetStateAction<boolean>>;
  setShowAnswerMessage: Dispatch<SetStateAction<boolean>>;
  setScore: Dispatch<SetStateAction<number>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  setAnsweredQuestions: Dispatch<SetStateAction<{ [key: number]: string }>>;
  setTime: Dispatch<SetStateAction<number>>;
  startTimer: () => void;
}

export function createBooksHandlers(deps: BooksHandlerDeps) {
  const {
    practiceData,
    userGrade,
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
  } = deps;

  const dismissBooksChapterModal = () => {
    setShowChapterChooser(false);
    setBooksChapterIntent(null);
    setBooksChapterModalStep('grid');
    setBooksEitherPendingChapter(null);
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedChapterName('');
    setShowSubjectDropdown(false);
    setShowChapterDropdown(false);
    setShowYearDropdown(false);
  };

  const applyBooksChapterAndStartMcq = async (chapter: Chapter, subjectId: string) => {
    if (!subjectId.trim()) return;
    if (!practiceData?.grades?.length) {
      setError('Curriculum is still loading. Please try again.');
      return;
    }

    const userGradeId = `grade-${normalizeGrade(userGrade)}`;
    const grade =
      selectedGrade ||
      practiceData.grades.find((g) => g.id === userGradeId) ||
      practiceData.grades[0];

    if (!grade) {
      setError('No grade data available.');
      return;
    }

    setBooksHubActionLoading(true);
    setError(null);

    setSelectedGrade(grade);
    setSelectedSubject(subjectId);
    setSelectedChapter(chapter.id);
    setSelectedChapterName(chapter.name);
    setShowChapterChooser(false);
    setBooksChapterIntent(null);
    setBooksChapterModalStep('grid');
    setBooksEitherPendingChapter(null);

    try {
      const gradeNumber = getGradeNumber(userGrade);
      const questions = await getRegularPracticeQuestions(gradeNumber, subjectId, chapter.id);

      if (!questions || questions.length === 0) {
        setError('No questions found for this chapter. Please try another chapter or contact support.');
        return;
      }

      setNationalExamQuestions(questions);
      setShowTest(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowAnswerMessage(false);
      setScore(0);
      setShowResult(false);
      setAnsweredQuestions({});
      setTime(0);
      startTimer();
    } catch {
      setError('Failed to load practice questions. Please try again.');
    } finally {
      setBooksHubActionLoading(false);
    }
  };

  const applyBooksChapterAndOpenFlashcards = async (chapter: Chapter, subjectName: string) => {
    setShowChapterChooser(false);
    setBooksChapterIntent(null);
    setBooksChapterModalStep('grid');
    setBooksEitherPendingChapter(null);
    setBooksHubActionLoading(true);
    setError(null);

    const normalizedGradeId = userGrade?.replace(/[^\d]/g, '') || '12';

    try {
      const structure = await getFlashcardStructure(normalizedGradeId);
      const grade = structure[0];
      if (!grade?.subjects?.length) {
        setError(t('flashcards.noFlashcards'));
        return;
      }

      const searchTerm = subjectName.toLowerCase().trim();
      let subject = grade.subjects.find(
        (s) => s.name.toLowerCase().trim() === searchTerm
      );
      if (!subject) {
        subject = grade.subjects.find((s) => {
          const n = s.name.toLowerCase();
          return n.includes(searchTerm) || searchTerm.includes(n);
        });
      }

      if (!subject?.slug) {
        setError(t('flashcards.noFlashcards'));
        return;
      }

      const flashcards = await getFlashcardsForChapter(
        normalizedGradeId,
        subject.slug,
        chapter.name
      );

      if (!flashcards?.length) {
        setError(t('flashcards.noFlashcards'));
        return;
      }

      setSelectedChapter(chapter.id);
      setSelectedChapterName(chapter.name);
      router.push({
        pathname: '/(tabs)/flashcards',
        params: {
          preSelectedSubject: subjectName,
          subjectSlug: subject.slug,
          chapterName: chapter.name,
          gradeId: normalizedGradeId,
          startFlashcards: '1',
        },
      });
    } catch {
      setError(t('errors.network.message'));
    } finally {
      setBooksHubActionLoading(false);
    }
  };

  return {
    dismissBooksChapterModal,
    applyBooksChapterAndStartMcq,
    applyBooksChapterAndOpenFlashcards,
  };
}
