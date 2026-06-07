import type { Dispatch, SetStateAction } from 'react';
import {
  getNationalExamQuestions,
  getNationalExamAvailable,
  type NationalExamAPIResponse,
} from '@/features/common/services/practiceService';
import { getAuthToken } from '@/features/auth/utils/authStorage';
import { BASE_URL } from '@/config/constants';
import { getGradeNumber } from './practiceHelpers';

export interface NationalExamHandlerDeps {
  userGrade: string | undefined;
  selectedYear: string | null;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setAvailableYears: Dispatch<SetStateAction<number[]>>;
  setAvailableSubjects: Dispatch<SetStateAction<string[]>>;
  setSelectedYear: Dispatch<SetStateAction<string | null>>;
  setShowNationalExamSubjectChooser: Dispatch<SetStateAction<boolean>>;
  setSubjectLoading: Dispatch<SetStateAction<boolean>>;
  setNationalExamQuestions: Dispatch<SetStateAction<NationalExamAPIResponse[]>>;
  setShowTest: Dispatch<SetStateAction<boolean>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setIsPreSelected: Dispatch<SetStateAction<boolean>>;
  startTimer: () => void;
}

export function createNationalExamHandlers(deps: NationalExamHandlerDeps) {
  const {
    userGrade,
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
  } = deps;

  const fetchNationalExamAvailable = async () => {
    if (!userGrade) {
      return;
    }

    try {
      setLoading(true);
      const gradeNumber = getGradeNumber(userGrade);

      if (![6, 8, 12].includes(gradeNumber)) {
        setError('National exams are only available for grades 6, 8, and 12');
        return;
      }

      const data = await getNationalExamAvailable(gradeNumber);
      setAvailableYears(data.data.years);
      setAvailableSubjects(data.data.subjects);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch available national exam data');
    } finally {
      setLoading(false);
    }
  };

  const handleNationalExamYearPress = async (year: string) => {
    try {
      const gradeNumber = getGradeNumber(userGrade);

      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/national-exams/${gradeNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch national exam data`);
      }

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error('Invalid API response structure');
      }

      const yearData = data.data.years.find((y: { year: number }) => y.year === parseInt(year, 10));

      const subjectsForYear = yearData ? yearData.subjects : [];

      setAvailableSubjects(subjectsForYear);
      setSelectedYear(year);
      setShowNationalExamSubjectChooser(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load subjects');
    }
  };

  const handleNationalExamSubjectPress = async (subject: string) => {
    if (!selectedYear) {
      setError('Please select a year first');
      return;
    }

    try {
      setSubjectLoading(true);
      const gradeNumber = getGradeNumber(userGrade);
      const questions = await getNationalExamQuestions(
        gradeNumber,
        parseInt(selectedYear),
        subject
      );

      const filteredQuestions = questions?.filter((q) => {
        const questionText = q.question?.toLowerCase() || '';
        const shouldFilter =
          questionText.includes('valuing our elders') ||
          (questionText.includes('valuing') && questionText.includes('elders'));
        return !shouldFilter;
      }) || [];

      if (filteredQuestions && filteredQuestions.length > 0) {
        setNationalExamQuestions(filteredQuestions);
        setShowTest(true);
        startTimer();
        setSelectedSubject(subject);
        setIsPreSelected(true);
        setShowNationalExamSubjectChooser(false);
      } else {
        setError('No questions available for this subject');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      setSubjectLoading(false);
    }
  };

  return {
    fetchNationalExamAvailable,
    handleNationalExamYearPress,
    handleNationalExamSubjectPress,
  };
}
