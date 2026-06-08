import { ASSET_BASE_URL } from '@/config/constants';

export function resolveKgQuestionImageUrl(url: string | undefined | null): string {
  if (url == null || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = ASSET_BASE_URL.replace(/\/$/, '');
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}
