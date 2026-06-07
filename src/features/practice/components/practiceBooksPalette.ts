import { BOOKS_CANVAS } from '@/features/practice/constants/practiceUi';

// Dark/light palette for the books hub surfaces, shared by PracticeScreen and
// its extracted sub-components so the colors stay in one place.
export const getBooksHubPalette = (isDarkMode: boolean) => ({
  booksCanvasBg: isDarkMode ? BOOKS_CANVAS.dark : BOOKS_CANVAS.light,
  booksPrimaryText: isDarkMode ? '#F3F4F6' : '#111827',
  booksMutedText: isDarkMode ? '#9CA3AF' : '#6B7280',
  booksCardBg: isDarkMode ? '#252A32' : '#FFFFFF',
  booksCardBorder: isDarkMode ? '#2C3340' : '#E5E7EB',
  booksChipIdleOnPanel: isDarkMode ? '#2A313D' : '#F3F4F6',
  booksChipIdleBorderOnPanel: isDarkMode ? '#363D4A' : '#E5E7EB',
});
