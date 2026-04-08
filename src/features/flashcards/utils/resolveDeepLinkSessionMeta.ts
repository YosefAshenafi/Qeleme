import type { Grade } from '@/features/common/services/flashcardService';

export function resolveDeepLinkSessionMeta(
  data: Grade[],
  gradeId: string,
  subjectSlug: string,
  chapterName: string
): { subjectName: string; chapterName: string; gradeName: string } {
  if (!data.length) {
    return {
      subjectName: subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      chapterName,
      gradeName: '',
    };
  }
  const grade = data.find((g) => g.id === gradeId) ?? data[0];
  const gradeName = grade?.name || '';
  const subject = grade?.subjects?.find((s) => s.slug === subjectSlug);
  const subjectName =
    subject?.name?.trim() ||
    subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const chapter = subject?.chapters?.find(
    (c) => c.name.trim().toLowerCase() === chapterName.trim().toLowerCase()
  );
  return {
    subjectName,
    chapterName: chapter?.name || chapterName,
    gradeName: gradeName || '',
  };
}
