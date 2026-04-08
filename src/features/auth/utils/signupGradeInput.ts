import type { Grade } from '@/features/common/constants/Grades';
import { SIGNUP_CLASS_MAX, SIGNUP_CLASS_MIN } from '@/features/auth/constants/signupGrade';

export function parseSignupClassInputToGrade(digits: string): Grade | '' {
  if (digits === '') return '';
  const n = parseInt(digits, 10);
  if (Number.isNaN(n)) return '';
  if (n < SIGNUP_CLASS_MIN || n > SIGNUP_CLASS_MAX) return '';
  if (n === 0) return 'KG';
  return String(n) as Grade;
}

export function gradeToSignupClassInput(grade: string): string {
  if (grade === 'KG') return '0';
  return grade;
}
