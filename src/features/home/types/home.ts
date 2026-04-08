import type { HomeReportGradientKey } from '@/features/home/constants/homeUi';

export type ReportCard = {
  title: string;
  number: string;
  subtitle: string;
  gradient: HomeReportGradientKey;
  icon: 'chart.bar' | 'trophy.fill' | 'clock.fill';
  stats: { label: string; value: string }[];
};

export type BookItem = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  subject: string;
  grade: string;
  progress?: number;
  chapterCount: number;
};
