export type BooksCategoryFilter = 'all' | 'science' | 'languages' | 'mathematics' | 'humanities';

export function getSubjectBooksCategory(name: string): BooksCategoryFilter | 'other' {
  const n = name.toLowerCase();
  if (/\b(math|mathematics|algebra|geometry|calculus)\b/i.test(n)) return 'mathematics';
  if (/\b(english|amharic|afaan|oromo|language|literature|grammar)\b/i.test(n)) return 'languages';
  if (/\b(biology|chemistry|physics|science|environment)\b/i.test(n)) return 'science';
  if (/\b(history|geography|civics|economics|social)\b/i.test(n)) return 'humanities';
  return 'other';
}
