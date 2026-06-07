import type { Grade, Option } from '@/features/common/services/practiceService';

export const normalizeGrade = (gradeString: string | undefined): string => {
  if (!gradeString) return '6';
  return gradeString.replace(/^grade\s*/i, '').trim();
};

export const getGradeNumber = (gradeString: string | undefined): number => {
  const normalized = normalizeGrade(gradeString);
  return parseInt(normalized) || 6;
};

// National exams only exist for grades 6, 8 and 12. A grade-6 user may browse
// other grades, so fall back to the inspected grade's id in that case.
export const gradeNeedsExamTypeSelection = (
  grade: Grade | null,
  userGradeString: string | undefined,
): boolean => {
  if (!grade) return false;

  const userGradeNumber = getGradeNumber(userGradeString);
  if (userGradeNumber !== 6) {
    return [6, 8, 12].includes(userGradeNumber);
  }

  const gradeNumber = parseInt(grade.id.replace('grade-', ''));
  return [6, 8, 12].includes(gradeNumber);
};

export interface ResultPanelCopy {
  title: string;
  subtitle: string;
}

export const getResultPanelCopy = (accuracy: number): ResultPanelCopy =>
  accuracy >= 90
    ? { title: 'Outstanding work.', subtitle: 'You’re performing at a top level — keep it up.' }
    : accuracy >= 75
      ? { title: 'Great job.', subtitle: 'Solid accuracy — a little more practice and you’ll master it.' }
      : accuracy >= 50
        ? { title: 'Good progress.', subtitle: 'You’re getting there — review mistakes and try again.' }
        : { title: 'Keep practising.', subtitle: 'Focus on the explanations and retake the session.' };

export const getMcqOptionStyle = (params: {
  optionId: string;
  showExplanation: boolean;
  options: Option[] | undefined;
  selectedAnswer: string | null;
  baseStyle: unknown;
  brandBlue: string;
}) => {
  const { optionId, showExplanation, options, selectedAnswer, baseStyle, brandBlue } = params;
  if (!showExplanation) return [baseStyle];

  const isCorrect = options?.find((opt: Option) => opt.id === optionId)?.isCorrect;
  const isSelected = selectedAnswer === optionId;

  if (isCorrect) {
    return [{ borderColor: brandBlue, borderWidth: 2 }];
  }
  if (isSelected && !isCorrect) {
    return [{ borderColor: '#F44336', borderWidth: 2 }];
  }
  return [baseStyle];
};
