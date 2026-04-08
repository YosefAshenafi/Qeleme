import type { Flashcard } from '@/features/common/services/flashcardService';

export function getFlashcardQuestionText(card: Flashcard | null | undefined): string {
  if (!card) return 'No question available';
  return card.question;
}

export function getFlashcardAnswerText(card: Flashcard | null | undefined): string {
  if (!card) return 'No answer available';
  return card.answer;
}
