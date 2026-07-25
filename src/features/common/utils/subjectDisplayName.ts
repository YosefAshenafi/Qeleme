// Subject/book names arrive from the API in English only (there is no `name_am`
// on /api/mcq), so the Amharic label is looked up locally from the `subjectNames`
// block in the locale files. The API name stays the identifier everywhere —
// cover art, category filtering and query params all key off it — and only the
// rendered label goes through here.
//
// Unknown subjects fall back to the API name via `defaultValue`, so a new
// subject shows up in English rather than as a raw translation key.

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function subjectNameKey(apiName: string | null | undefined): string {
  return (apiName ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function localizeSubjectName(
  apiName: string | null | undefined,
  t: TranslateFn
): string {
  const fallback = (apiName ?? '').trim();
  const key = subjectNameKey(fallback);
  if (!key) return fallback;
  return t(`subjectNames.${key}`, { defaultValue: fallback });
}
