import React, { useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from 'expo-router';
import ActivityTrackingService, { Activity, UserStats } from '@/features/common/services/activityTrackingService';

export type SubjectRow = {
  subject: string;
  score: number;
  progress: number;
  mcqCount: number;
  flashcardCount: number;
};

// Loads tracking stats for the reports screen and derives the 14-day study
// series + per-subject rows. Reloads on focus and when the app returns to the
// foreground; kept separate so ReportsScreen stays a presentation component.
export function useReportsData(username: string | undefined, language: string) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [studyDailySeries, setStudyDailySeries] = useState<{ x: string; y: number }[]>([]);
  const [studyRangeLabel, setStudyRangeLabel] = useState('');
  const [topSubjects, setTopSubjects] = useState<SubjectRow[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  const loadReportData = useCallback(async () => {
    try {
      if (!username) {
        setUserStats(null);
        setRecentActivities([]);
        setLoading(false);
        return;
      }
      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize(username);
      setUserStats(trackingService.getStats());
      setRecentActivities(trackingService.getRecentActivities(8));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      void loadReportData();
    }, [loadReportData])
  );

  React.useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active' && username) void loadReportData();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [loadReportData, username]);

  // Derive chart series + subject rows whenever stats change.
  React.useEffect(() => {
    if (!userStats) {
      setStudyDailySeries([]);
      setStudyRangeLabel('');
      setTopSubjects([]);
      return;
    }
    const trackingService = ActivityTrackingService.getInstance();

    // Daily study time (minutes) over the last 2 weeks — shows which dates the
    // user studied and for how long.
    const completedActivities = trackingService
      .getRecentActivities(10000)
      .filter((a) => a.status === 'completed');

    const now = new Date();
    const daysBack = 14;
    const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const dayBuckets: { key: string; label: string; minutes: number }[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      dayBuckets.push({ key: dayKey(d), label: `${d.getDate()}`, minutes: 0 });
    }
    const dayBucketByKey = new Map(dayBuckets.map((b) => [b.key, b]));
    completedActivities.forEach((a) => {
      const bucket = dayBucketByKey.get(dayKey(new Date(a.timestamp)));
      if (!bucket) return;
      const withTime = a as { timeSpent?: number };
      const seconds = typeof withTime.timeSpent === 'number' ? withTime.timeSpent : (a.duration ?? 0) * 60;
      bucket.minutes += seconds / 60;
    });
    const studySeries = dayBuckets.map((b) => ({ x: b.label, y: Math.round(b.minutes) }));
    setStudyDailySeries(studySeries.some((p) => p.y > 0) ? studySeries : []);

    const locale = language === 'am' ? 'am-ET' : 'en-US';
    const rangeFmt = (d: Date) => d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    const firstDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysBack - 1));
    setStudyRangeLabel(`${rangeFmt(firstDate)} – ${rangeFmt(now)}`);

    const allCompleted = trackingService
      .getRecentActivities(10000)
      .filter((a) => a.status === 'completed' && a.subject && a.subject.trim() !== '');
    const perSubjectCounts = allCompleted.reduce((acc, a) => {
      const subject = a.subject.trim();
      const lower = subject.toLowerCase();
      if (!subject || lower.includes('unknown') || lower.includes('undefined')) return acc;
      if (!acc[subject]) acc[subject] = { mcqCount: 0, flashcardCount: 0 };
      if (a.type === 'mcq') acc[subject].mcqCount += 1;
      if (a.type === 'flashcard') acc[subject].flashcardCount += 1;
      return acc;
    }, {} as Record<string, { mcqCount: number; flashcardCount: number }>);

    const subjectRows = Object.entries(userStats.subjectBreakdown)
      .filter(([subject]) => {
        const s = (subject || '').trim().toLowerCase();
        return s && !s.includes('unknown') && !s.includes('undefined');
      })
      .map(([subject, data]) => ({
        subject: subject.trim(),
        progress: Math.min(100, Math.round((data.questionsAnswered / Math.max(1, userStats.totalQuestionsAnswered)) * 100)),
        score: data.averageScore,
        mcqCount: perSubjectCounts[subject.trim()]?.mcqCount ?? 0,
        flashcardCount: perSubjectCounts[subject.trim()]?.flashcardCount ?? 0,
      }))
      .sort((a, b) => b.score - a.score || b.progress - a.progress);
    setTopSubjects(subjectRows);
  }, [language, userStats]);

  return {
    userStats,
    recentActivities,
    loading,
    studyDailySeries,
    studyRangeLabel,
    topSubjects,
    reload: loadReportData,
  };
}
