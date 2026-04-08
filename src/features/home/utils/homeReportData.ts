import type { TFunction } from 'i18next';
import type { ReportCard } from '@/features/home/types/home';

export function getDefaultReportCards(t: TFunction): ReportCard[] {
  return [
    {
      title: t('home.reportCards.performance.title'),
      number: '0%',
      subtitle: t('home.reportCards.performance.subtitle'),
      gradient: 'purple',
      icon: 'chart.bar',
      stats: [
        { label: t('home.reportCards.performance.stats.quizzesTaken'), value: '0' },
        { label: t('home.reportCards.performance.stats.successRate'), value: '0%' },
      ],
    },
    {
      title: t('home.reportCards.studyProgress.title'),
      number: '0h',
      subtitle: t('home.reportCards.studyProgress.subtitle'),
      gradient: 'blue',
      icon: 'clock.fill',
      stats: [
        { label: t('home.reportCards.studyProgress.stats.dailyGoal'), value: '0h' },
        { label: t('home.reportCards.studyProgress.stats.weeklyGoal'), value: '0h' },
      ],
    },
    {
      title: t('home.reportCards.learningStreak.title'),
      number: '0d',
      subtitle: t('home.reportCards.learningStreak.subtitle'),
      gradient: 'green',
      icon: 'trophy.fill',
      stats: [
        { label: t('home.reportCards.learningStreak.stats.currentStreak'), value: '0d' },
        { label: t('home.reportCards.learningStreak.stats.bestStreak'), value: '0d' },
      ],
    },
    {
      title: t('home.reportCards.studyFocus.title'),
      number: '0',
      subtitle: t('home.reportCards.studyFocus.subtitle'),
      gradient: 'orange',
      icon: 'chart.bar',
      stats: [
        { label: t('home.reportCards.studyFocus.stats.topSubject'), value: '-' },
        { label: t('home.reportCards.studyFocus.stats.hoursPerSubject'), value: '0h' },
      ],
    },
  ];
}

type StoredActivity = {
  username?: string;
  type?: string;
  status?: string;
  duration?: string;
  subject?: string;
  timestamp: number;
};

export function calculateReportData(
  activities: unknown[],
  username: string | undefined,
  t: TFunction
): ReportCard[] {
  const userActivities = (activities as StoredActivity[]).filter((activity) => activity.username === username);

  const practiceActivities = userActivities.filter((activity) => activity.type === 'mcq');
  const totalPracticeSessions = practiceActivities.length;
  const completedPracticeSessions = practiceActivities.filter((activity) => activity.status === 'Completed').length;
  const performancePercentage =
    totalPracticeSessions > 0 ? Math.round((completedPracticeSessions / totalPracticeSessions) * 100) : 0;

  const studyActivities = userActivities.filter((activity) => activity.type === 'study');
  const totalStudyHours: number = studyActivities.reduce((total, activity) => {
    const duration = activity.duration || '0h';
    const hours = parseInt(duration.replace('h', ''), 10) || 0;
    return total + hours;
  }, 0);

  const today = new Date();
  const lastActivity =
    userActivities.length > 0
      ? new Date(Math.max(...userActivities.map((a) => a.timestamp)))
      : null;
  const daysSinceLastActivity = lastActivity
    ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const currentStreak = daysSinceLastActivity === 0 ? 1 : 0;

  const subjectCounts: Record<string, number> = {};
  userActivities.forEach((activity) => {
    if (activity.subject) {
      subjectCounts[activity.subject] = (subjectCounts[activity.subject] || 0) + 1;
    }
  });
  const topSubject =
    Object.keys(subjectCounts).length > 0
      ? Object.keys(subjectCounts).reduce((a, b) => (subjectCounts[a] > subjectCounts[b] ? a : b))
      : '-';

  return [
    {
      title: t('home.reportCards.performance.title'),
      number: `${performancePercentage}%`,
      subtitle: t('home.reportCards.performance.subtitle'),
      gradient: 'purple',
      icon: 'chart.bar',
      stats: [
        { label: t('home.reportCards.performance.stats.quizzesTaken'), value: totalPracticeSessions.toString() },
        {
          label: t('home.reportCards.performance.stats.successRate'),
          value: `${performancePercentage}%`,
        },
      ],
    },
    {
      title: t('home.reportCards.studyProgress.title'),
      number: `${totalStudyHours}h`,
      subtitle: t('home.reportCards.studyProgress.subtitle'),
      gradient: 'blue',
      icon: 'clock.fill',
      stats: [
        { label: t('home.reportCards.studyProgress.stats.dailyGoal'), value: '2h' },
        { label: t('home.reportCards.studyProgress.stats.weeklyGoal'), value: '14h' },
      ],
    },
    {
      title: t('home.reportCards.learningStreak.title'),
      number: `${currentStreak}d`,
      subtitle: t('home.reportCards.learningStreak.subtitle'),
      gradient: 'green',
      icon: 'trophy.fill',
      stats: [
        {
          label: t('home.reportCards.learningStreak.stats.currentStreak'),
          value: `${currentStreak}d`,
        },
        { label: t('home.reportCards.learningStreak.stats.bestStreak'), value: '7d' },
      ],
    },
    {
      title: t('home.reportCards.studyFocus.title'),
      number: Object.keys(subjectCounts).length.toString(),
      subtitle: t('home.reportCards.studyFocus.subtitle'),
      gradient: 'orange',
      icon: 'chart.bar',
      stats: [
        { label: t('home.reportCards.studyFocus.stats.topSubject'), value: topSubject },
        {
          label: t('home.reportCards.studyFocus.stats.hoursPerSubject'),
          value: `${Math.round(totalStudyHours / Math.max(Object.keys(subjectCounts).length, 1))}h`,
        },
      ],
    },
  ];
}
