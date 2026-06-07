import { useEffect } from 'react';
import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import type { ScrollView } from 'react-native';
import type {
  PracticeData,
  Chapter,
  NationalExamAPIResponse,
} from '@/features/common/services/practiceService';
import type { BooksCategoryFilter } from '@/features/practice/utils/booksCategory';
import type { BooksChapterIntent } from './practiceBooksHandlers';

// The effects in this hook intentionally use curated dependency arrays that
// reproduce the original screen behavior exactly. The setters and refs received
// via props are stable (useState/useRef), so excluding them is safe.
/* eslint-disable react-hooks/exhaustive-deps */

type RouteParams = { [key: string]: string | string[] | undefined };

export interface PreselectionDeps {
  params: RouteParams;
  practiceData: PracticeData | null;
  preSelectionAttempted: MutableRefObject<boolean>;
  booksListScrollRef: RefObject<ScrollView | null>;
  booksSubjectRowY: MutableRefObject<Record<string, number>>;
  availableSubjects: string[];
  booksCategory: BooksCategoryFilter | 'national';
  selectedSubject: string;
  displaySubjects: { id: string }[];
  isPreSelected: boolean;
  selectedYear: string | null;
  fetchNationalExamAvailable: () => Promise<void> | void;
  setShowTest: Dispatch<SetStateAction<boolean>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  setSelectedAnswer: Dispatch<SetStateAction<string | null>>;
  setShowExplanation: Dispatch<SetStateAction<boolean>>;
  setAnsweredQuestions: Dispatch<SetStateAction<{ [key: number]: string }>>;
  setShowAnswerMessage: Dispatch<SetStateAction<boolean>>;
  setScore: Dispatch<SetStateAction<number>>;
  setNationalExamQuestions: Dispatch<SetStateAction<NationalExamAPIResponse[]>>;
  setSelectedChapter: Dispatch<SetStateAction<string>>;
  setSelectedChapterName: Dispatch<SetStateAction<string>>;
  setSelectedYear: Dispatch<SetStateAction<string | null>>;
  setBooksCategory: Dispatch<SetStateAction<BooksCategoryFilter | 'national'>>;
  setBooksSearchQuery: Dispatch<SetStateAction<string>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setIsPreSelected: Dispatch<SetStateAction<boolean>>;
  setBooksEitherPendingChapter: Dispatch<SetStateAction<Chapter | null>>;
  setBooksChapterIntent: Dispatch<SetStateAction<BooksChapterIntent>>;
  setBooksChapterModalStep: Dispatch<SetStateAction<'grid' | 'eitherPick'>>;
  setShowChapterChooser: Dispatch<SetStateAction<boolean>>;
}

// Applies navigation preselection params (a subject tile or national exam
// chosen on another screen) exactly once, and keeps the books list scrolled to
// the active row. Extracted from usePracticeScreen to keep the orchestrator
// focused on state + composition.
export function usePracticePreselection(deps: PreselectionDeps) {
  const {
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
  } = deps;

  // A new (or changed) preselection arrived from navigation — allow it to be
  // applied exactly once. Param-only dependency means a practiceData refetch
  // does NOT reset this guard.
  useEffect(() => {
    preSelectionAttempted.current = false;
  }, [params.preSelectedSubject, params.preSelectedSubjectId, params.preSelectedExamType, params.preSelectedYear]);

  useEffect(() => {
    if (params.preSelectedSubject && params.preSelectedSubjectId && practiceData && !preSelectionAttempted.current) {
      preSelectionAttempted.current = true;
      setShowTest(false);
      setShowResult(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnsweredQuestions({});
      setShowAnswerMessage(false);
      setScore(0);
      setNationalExamQuestions([]);

      setSelectedChapter('');
      setSelectedChapterName('');
      setSelectedYear(null);

      // Reset the category filter and search so the full subject list shows
      // (they may have been left on 'national'/filtered from a previous selection).
      setBooksCategory('all');
      setBooksSearchQuery('');

      const subjectId = params.preSelectedSubjectId as string;
      setSelectedSubject(subjectId);
      setIsPreSelected(true);

      // Arriving from a Home subject tile: after scrolling to the selected book,
      // open the chapter chooser in "either" mode so the user picks a chapter and
      // then chooses MCQ (Q&A) or Flashcards.
      setBooksEitherPendingChapter(null);
      setBooksChapterIntent('either');
      setBooksChapterModalStep('grid');
      setShowChapterChooser(true);
    }
  }, [params.preSelectedSubject, params.preSelectedSubjectId, practiceData]);

  useEffect(() => {
    if (booksCategory === 'national' && availableSubjects.length > 0 && booksListScrollRef.current) {
      const scrollToNationalSubject = () => {
        const firstNationalSubject = availableSubjects[0];
        if (firstNationalSubject && booksSubjectRowY.current[firstNationalSubject]) {
          booksListScrollRef.current?.scrollTo({
            y: booksSubjectRowY.current[firstNationalSubject],
            animated: true,
          });
        }
      };

      const timer = setTimeout(scrollToNationalSubject, 500);
      return () => clearTimeout(timer);
    }
  }, [booksCategory, availableSubjects, booksSubjectRowY]);

  useEffect(() => {
    if (!selectedSubject) return;
    if (!displaySubjects.some((s) => s.id === selectedSubject)) return;

    const scrollToSelected = () => {
      const scrollNode = booksListScrollRef.current;
      const y = booksSubjectRowY.current[selectedSubject];
      if (!scrollNode) return;
      if (typeof y !== 'number') return;
      scrollNode.scrollTo({ y: Math.max(0, y - 16), animated: true });
    };

    const tmr = setTimeout(scrollToSelected, 250);
    return () => clearTimeout(tmr);
  }, [selectedSubject, displaySubjects]);

  useEffect(() => {
    if (params.preSelectedExamType === 'national' && params.preSelectedYear && practiceData && !preSelectionAttempted.current) {
      preSelectionAttempted.current = true;
      setShowTest(false);
      setShowResult(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnsweredQuestions({});
      setShowAnswerMessage(false);
      setScore(0);
      setNationalExamQuestions([]);
      setShowChapterChooser(false);

      setSelectedSubject('');
      setSelectedChapter('');
      setSelectedChapterName('');

      setBooksCategory('national');
      setSelectedSubject(`national-${params.preSelectedYear}`);

      setIsPreSelected(true);

      fetchNationalExamAvailable();
    }
  }, [params.preSelectedExamType, params.preSelectedYear, params.booksCategory, practiceData]);

  useEffect(() => {
    if (isPreSelected) {
      const isFromPreSelection = params.preSelectedSubjectId === selectedSubject ||
        (params.preSelectedExamType === 'national' && params.preSelectedYear === selectedYear);

      if (!isFromPreSelection) {
        setIsPreSelected(false);
      }
    }
  }, [selectedSubject, selectedYear, isPreSelected, params.preSelectedSubjectId, params.preSelectedExamType, params.preSelectedYear]);
}
