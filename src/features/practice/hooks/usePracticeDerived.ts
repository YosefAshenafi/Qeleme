import { useMemo } from 'react';
import type { Grade, Subject } from '@/features/common/services/practiceService';
import type { BooksCategoryFilter } from '@/features/practice/utils/booksCategory';
import { getSubjectBooksCategory } from '@/features/practice/utils/booksCategory';

export interface PracticeDerivedDeps {
  selectedGradeData: Grade | undefined;
  selectedSubjectData: Subject | undefined;
  availableYears: number[];
  booksSearchQuery: string;
  booksCategory: BooksCategoryFilter | 'national';
  windowWidth: number;
  t: (key: string, options?: Record<string, unknown>) => string;
}

// Memoized selectors derived from curriculum + books-browser state. Kept out of
// the orchestrator so it reads as state + composition rather than computation.
export function usePracticeDerived(deps: PracticeDerivedDeps) {
  const {
    selectedGradeData,
    selectedSubjectData,
    availableYears,
    booksSearchQuery,
    booksCategory,
    windowWidth,
    t,
  } = deps;

  const practiceSubjectsSorted = useMemo(() => {
    if (!selectedGradeData?.subjects) return [];
    return [...selectedGradeData.subjects].sort((a, b) => {
      const getSubjectNumber = (name: string) => {
        const match = name.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getSubjectNumber(a.name) - getSubjectNumber(b.name);
    });
  }, [selectedGradeData]);

  const filteredBooksSubjects = useMemo(() => {
    let list = practiceSubjectsSorted;
    const q = booksSearchQuery.trim().toLowerCase();
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q));

    if (booksCategory !== 'all') {
      list = list.filter((s) => getSubjectBooksCategory(s.name) === booksCategory);
    }

    return list;
  }, [practiceSubjectsSorted, booksSearchQuery, booksCategory]);

  const nationalExamYears = useMemo(() => {
    if (availableYears.length === 0) return [];

    const label = t('mcq.subjects.nationalExamLabel', { defaultValue: 'National Exam (A.A)' });
    return availableYears.map(year => ({
      id: `national-${year}`,
      name: `${year} ${label}`,
      chapters: []
    }));
  }, [availableYears, t]);

  // National exams filtered by the current search query (used in the All tab,
  // where the search bar is visible).
  const filteredNationalExamYears = useMemo(() => {
    const q = booksSearchQuery.trim().toLowerCase();
    if (!q) return nationalExamYears;
    return nationalExamYears.filter((s) => s.name.toLowerCase().includes(q));
  }, [nationalExamYears, booksSearchQuery]);

  const displaySubjects = useMemo(() => {
    if (booksCategory === 'national') {
      // Same layout/behavior as the other tabs (search bar visible) — honor the query.
      return filteredNationalExamYears;
    }
    if (booksCategory === 'all') {
      // "All" shows regular subjects plus national exams, both honoring search.
      return [...filteredBooksSubjects, ...filteredNationalExamYears];
    }
    return filteredBooksSubjects;
  }, [booksCategory, filteredBooksSubjects, filteredNationalExamYears, nationalExamYears]);

  const chapterGridColumns = useMemo(() => {
    if (windowWidth < 350) return 3;
    if (windowWidth < 420) return 4;
    return 5;
  }, [windowWidth]);

  const booksModalChaptersSorted = useMemo(() => {
    if (!selectedSubjectData?.chapters?.length) return [];
    return [...selectedSubjectData.chapters].sort((a, b) => {
      const getChapterNumber = (name: string) => {
        const match = name.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getChapterNumber(a.name) - getChapterNumber(b.name);
    });
  }, [selectedSubjectData]);

  return {
    displaySubjects,
    chapterGridColumns,
    booksModalChaptersSorted,
  };
}
