import { ScrollView, View, RefreshControl, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';
import { useFocusEffect } from 'expo-router';
import ActivityTrackingService, { Activity, UserStats } from '@/features/common/services/activityTrackingService';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';

import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { ReportsScreenStyles as styles } from './ReportsScreen.styles';
import { REPORTS_BRAND_BLUE } from '@/features/reports/constants/reportsUi';

const BLUE = REPORTS_BRAND_BLUE;
const RING_SIZE = 116;
const RING_STROKE = 11;

type SubjectRow = { subject: string; score: number; progress: number; mcqCount: number; flashcardCount: number };

const scoreColor = (score: number) => (score >= 70 ? '#16A34A' : score >= 50 ? '#F59E0B' : '#EF4444');

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);
  const scrollRef = useRef<ScrollView | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mcqMonthlySeries, setMcqMonthlySeries] = useState<{ x: string; y: number }[]>([]);
  const [topSubjects, setTopSubjects] = useState<SubjectRow[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  const muted = colors.text + (isDarkMode ? 'B0' : '99');
  const faint = colors.text + (isDarkMode ? '70' : '66');
  const trackColor = isDarkMode ? '#1B2230' : '#EEF2F7';
  const cardExtras = { backgroundColor: colors.card, borderColor: colors.border, borderWidth: isDarkMode ? 1 : 0 };

  const loadReportData = useCallback(async () => {
    try {
      if (!user?.username) {
        setUserStats(null);
        setRecentActivities([]);
        setLoading(false);
        return;
      }
      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize(user.username);
      setUserStats(trackingService.getStats());
      setRecentActivities(trackingService.getRecentActivities(8));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [user?.username]);

  useFocusEffect(
    useCallback(() => {
      void loadReportData();
    }, [loadReportData])
  );

  React.useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active' && user?.username) void loadReportData();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [loadReportData, user?.username]);

  // Derive chart series + subject rows whenever stats change.
  React.useEffect(() => {
    if (!userStats) {
      setMcqMonthlySeries([]);
      setTopSubjects([]);
      return;
    }
    const trackingService = ActivityTrackingService.getInstance();

    const mcqActivities = trackingService
      .getActivitiesByType('mcq')
      .filter((a) => a.status === 'completed' && typeof a.score === 'number');

    const now = new Date();
    const monthsBack = 6;
    const buckets: { key: string; label: string; scores: number[] }[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString(i18n.language === 'am' ? 'am-ET' : 'en-US', { month: 'short' }).toUpperCase(),
        scores: [],
      });
    }
    mcqActivities.forEach((a) => {
      const d = new Date(a.timestamp);
      const bucket = buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (bucket && typeof a.score === 'number') bucket.scores.push(a.score);
    });
    const series = buckets.map((b) => ({
      x: b.label,
      y: b.scores.length ? Math.round(b.scores.reduce((s, v) => s + v, 0) / b.scores.length) : 0,
    }));
    setMcqMonthlySeries(series.some((p) => p.y > 0) ? series : []);

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
  }, [i18n.language, userStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  }, [loadReportData]);

  const accuracy = Math.max(0, Math.min(100, userStats?.averageScore ?? 0));
  const hasGradedQuestions = (userStats?.totalQuestionsAnswered ?? 0) > 0;
  const accuracyText = hasGradedQuestions ? `${accuracy}%` : '—';
  const ringRadius = (RING_SIZE - RING_STROKE) / 2;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc - (accuracy / 100) * ringCirc;

  // Score progression headline = trend across the charted months (distinct from the
  // overall accuracy shown in the hero ring), so the two cards never repeat the same number.
  const scoreTrend = useMemo(() => {
    const pts = mcqMonthlySeries.filter((p) => p.y > 0);
    if (pts.length < 2) return null;
    return pts[pts.length - 1].y - pts[0].y;
  }, [mcqMonthlySeries]);
  const scoreTrendText =
    !hasGradedQuestions || scoreTrend === null ? '—' : `${scoreTrend > 0 ? '+' : ''}${scoreTrend}%`;
  const scoreTrendColor =
    scoreTrend === null || scoreTrend === 0 ? BLUE : scoreTrend > 0 ? '#16A34A' : '#DC2626';

  const studyTimeText = useMemo(() => {
    const totalMin = Math.max(0, Math.round(userStats?.totalStudyTime ?? 0));
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [userStats?.totalStudyTime]);

  const streakText = useCallback(
    (n: number) => (n === 1 ? t('reports.dash.dayOne') : t('reports.dash.dayOther', { count: n })),
    [t]
  );
  const sessionsText = useCallback(
    (n: number) => (n === 1 ? t('reports.dash.sessionsOne') : t('reports.dash.sessionsOther', { count: n })),
    [t]
  );
  const timeAgo = useCallback(
    (ts: number) => {
      const min = Math.floor((Date.now() - ts) / 60000);
      if (min < 1) return t('reports.dash.justNow');
      if (min < 60) return t('reports.dash.minutesAgo', { count: min });
      const hours = Math.floor(min / 60);
      if (hours < 24) return t('reports.dash.hoursAgo', { count: hours });
      const days = Math.floor(hours / 24);
      if (days === 1) return t('reports.dash.yesterday');
      return t('reports.dash.daysAgo', { count: days });
    },
    [t]
  );

  const mcqSessions = userStats?.activityTypeBreakdown.mcq.count ?? 0;
  const flashSessions = userStats?.activityTypeBreakdown.flashcard.count ?? 0;
  const mixTotal = mcqSessions + flashSessions;
  const isEmpty = !userStats || (userStats.totalActivities === 0 && mixTotal === 0);

  const Header = (
    <View style={styles.headerRow}>
      <ThemedText style={[styles.screenTitle, { color: colors.text }]}>
        {t('reports.title', { defaultValue: 'Reports' })}
      </ThemedText>
      <ThemedText style={[styles.screenSubtitle, { color: muted }]}>
        {t('reports.dash.subtitle')}
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container]}>
          {Header}
          <View style={[styles.heroCard, cardExtras, { height: 156 }]} />
          <View style={[styles.card, cardExtras, { height: 210 }]} />
          <View style={[styles.card, cardExtras, { height: 120 }]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={(node) => {
          scrollRef.current = node;
        }}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE} colors={[BLUE]} />
        }
      >
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          {Header}

          {isEmpty ? (
            <View style={[styles.emptyState]}>
              <View style={[styles.emptyIconWrap, { backgroundColor: BLUE + '14' }]}>
                <IconSymbol name="chart.bar.fill" size={40} color={BLUE} />
              </View>
              <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>
                {t('reports.progressStats.title', { defaultValue: 'Your Progress' })}
              </ThemedText>
              <ThemedText style={[styles.emptyStateText, { color: colors.text }]}>
                {t('reports.noData', {
                  defaultValue: 'Complete MCQs or study flashcards to see your learning reports here.',
                })}
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Hero — accuracy ring + key stats */}
              <ThemedView style={[styles.heroCard, cardExtras]}>
                <View style={[styles.ringWrap, { width: RING_SIZE, height: RING_SIZE }]}>
                  <Svg width={RING_SIZE} height={RING_SIZE}>
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={ringRadius}
                      stroke={trackColor}
                      strokeWidth={RING_STROKE}
                      fill="none"
                    />
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={ringRadius}
                      stroke={BLUE}
                      strokeWidth={RING_STROKE}
                      fill="none"
                      strokeDasharray={`${ringCirc} ${ringCirc}`}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      rotation={-90}
                      originX={RING_SIZE / 2}
                      originY={RING_SIZE / 2}
                    />
                  </Svg>
                  <View style={styles.ringCenter}>
                    <ThemedText style={[styles.ringPercent, { color: colors.text }]}>{accuracyText}</ThemedText>
                    <ThemedText style={[styles.ringLabel, { color: faint }]}>
                      {t('reports.dash.accuracy').toUpperCase()}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.heroStats}>
                  <View style={styles.heroStatRow}>
                    <View style={[styles.heroStatIcon, { backgroundColor: BLUE + '14' }]}>
                      <IconSymbol name="checkmark.circle.fill" size={20} color={BLUE} />
                    </View>
                    <View style={styles.heroStatText}>
                      <ThemedText style={[styles.heroStatValue, { color: colors.text }]}>
                        {userStats!.totalQuestionsAnswered}
                      </ThemedText>
                      <ThemedText style={[styles.heroStatLabel, { color: muted }]}>
                        {t('reports.dash.questions')}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.heroStatRow}>
                    <View style={[styles.heroStatIcon, { backgroundColor: BLUE + '14' }]}>
                      <IconSymbol name="clock.fill" size={20} color={BLUE} />
                    </View>
                    <View style={styles.heroStatText}>
                      <ThemedText style={[styles.heroStatValue, { color: colors.text }]}>{studyTimeText}</ThemedText>
                      <ThemedText style={[styles.heroStatLabel, { color: muted }]}>
                        {t('reports.dash.studyTime')}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.heroStatRow}>
                    <View style={[styles.heroStatIcon, { backgroundColor: '#F9731614' }]}>
                      <IconSymbol name="flame.fill" size={20} color="#F97316" />
                    </View>
                    <View style={styles.heroStatText}>
                      <ThemedText style={[styles.heroStatValue, { color: colors.text }]}>
                        {streakText(userStats!.currentStreak)}
                      </ThemedText>
                      <ThemedText style={[styles.heroStatLabel, { color: muted }]}>
                        {t('reports.dash.currentStreak')} · {t('reports.dash.bestStreak')} {userStats!.bestStreak}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </ThemedView>

              {/* Score progression */}
              <ThemedView style={[styles.card, cardExtras]}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                      {t('reports.scoreProgression.title', { defaultValue: 'Score Progression' })}
                    </ThemedText>
                    <ThemedText style={[styles.cardSubtitle, { color: faint }]}>
                      {t('reports.scoreProgression.subtitle', { defaultValue: 'Overall Academic Performance' })}
                    </ThemedText>
                  </View>
                  <View style={[styles.chip, { backgroundColor: scoreTrendColor + '15' }]}>
                    <ThemedText style={[styles.chipText, { color: scoreTrendColor }]}>{scoreTrendText}</ThemedText>
                  </View>
                </View>

                {mcqMonthlySeries.length > 0 ? (
                  <VictoryChart height={180} padding={{ top: 12, left: 16, right: 16, bottom: 34 }} domain={{ y: [0, 100] }}>
                    <VictoryAxis
                      style={{
                        axis: { stroke: 'transparent' },
                        tickLabels: { fill: faint, fontSize: 10, fontWeight: '700' },
                        grid: { stroke: 'transparent' },
                        ticks: { stroke: 'transparent' },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      style={{
                        axis: { stroke: 'transparent' },
                        tickLabels: { fill: 'transparent' },
                        grid: { stroke: isDarkMode ? '#FFFFFF10' : '#0F172A0D' },
                        ticks: { stroke: 'transparent' },
                      }}
                    />
                    <VictoryLine
                      data={mcqMonthlySeries}
                      interpolation="monotoneX"
                      style={{ data: { stroke: BLUE, strokeWidth: 3 } }}
                    />
                  </VictoryChart>
                ) : (
                  <View style={styles.emptyChart}>
                    <ThemedText style={[styles.emptyChartText, { color: faint }]}>
                      {t('reports.scoreProgression.empty', {
                        defaultValue: 'Complete an MCQ session to see your score trend.',
                      })}
                    </ThemedText>
                  </View>
                )}
              </ThemedView>

              {/* Practice mix */}
              {mixTotal > 0 && (
                <ThemedView style={[styles.card, cardExtras]}>
                  <View style={styles.cardHeaderRow}>
                    <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                      {t('reports.dash.practiceMix')}
                    </ThemedText>
                  </View>
                  <View style={[styles.mixBarTrack, { backgroundColor: trackColor }]}>
                    {mcqSessions > 0 && (
                      <View style={[styles.mixSegment, { flex: mcqSessions, backgroundColor: BLUE }]} />
                    )}
                    {flashSessions > 0 && (
                      <View style={[styles.mixSegment, { flex: flashSessions, backgroundColor: '#38BDF8' }]} />
                    )}
                  </View>
                  <View style={styles.mixLegendRow}>
                    <View style={styles.mixLegendItem}>
                      <View style={[styles.mixLegendDot, { backgroundColor: BLUE }]} />
                      <View>
                        <ThemedText style={[styles.mixLegendLabel, { color: colors.text }]}>
                          {t('reports.dash.mcq')}
                        </ThemedText>
                        <ThemedText style={[styles.mixLegendSub, { color: muted }]}>
                          {sessionsText(mcqSessions)}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.mixLegendItem}>
                      <View style={[styles.mixLegendDot, { backgroundColor: '#38BDF8' }]} />
                      <View>
                        <ThemedText style={[styles.mixLegendLabel, { color: colors.text }]}>
                          {t('reports.dash.flashcards')}
                        </ThemedText>
                        <ThemedText style={[styles.mixLegendSub, { color: muted }]}>
                          {sessionsText(flashSessions)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </ThemedView>
              )}

              {/* Subject performance */}
              {topSubjects.length > 0 && (
                <View style={{ gap: 10 }}>
                  <ThemedText style={[styles.sectionHeading, { color: colors.text }]}>
                    {t('reports.dash.subjectPerformance')}
                  </ThemedText>
                  <View style={styles.subjectBarsList}>
                    {topSubjects.slice(0, 5).map((item, idx) => (
                      <ThemedView key={`${item.subject}-${idx}`} style={[styles.subjectBarCard, cardExtras]}>
                        <View style={styles.subjectBarHeader}>
                          <View style={[styles.subjectBarIcon, { backgroundColor: BLUE + '16' }]}>
                            <IconSymbol name="trophy.fill" size={17} color={BLUE} />
                          </View>
                          <View style={styles.subjectBarTitleWrap}>
                            <ThemedText style={[styles.subjectBarTitle, { color: colors.text }]} numberOfLines={1}>
                              {item.subject}
                            </ThemedText>
                            <View style={styles.subjectBadgesRow}>
                              {item.mcqCount > 0 && (
                                <View style={[styles.subjectBadge, { backgroundColor: BLUE + '12' }]}>
                                  <IconSymbol name="book.fill" size={11} color={BLUE} />
                                  <ThemedText style={[styles.subjectBadgeText, { color: BLUE }]}>{`${item.mcqCount}`}</ThemedText>
                                </View>
                              )}
                              {item.flashcardCount > 0 && (
                                <View style={[styles.subjectBadge, { backgroundColor: '#38BDF820' }]}>
                                  <IconSymbol name="rectangle.stack" size={11} color="#0EA5E9" />
                                  <ThemedText style={[styles.subjectBadgeText, { color: '#0EA5E9' }]}>{`${item.flashcardCount}`}</ThemedText>
                                </View>
                              )}
                            </View>
                          </View>
                          <ThemedText style={[styles.subjectBarScore, { color: scoreColor(item.score || 0) }]}>
                            {`${item.score || 0}%`}
                          </ThemedText>
                        </View>
                        <View style={[styles.subjectBarTrack, { backgroundColor: trackColor }]}>
                          <View
                            style={[
                              styles.subjectBarFill,
                              { width: `${Math.max(4, Math.min(100, item.progress || 0))}%`, backgroundColor: BLUE },
                            ]}
                          />
                        </View>
                      </ThemedView>
                    ))}
                  </View>
                </View>
              )}

              {/* Recent activity */}
              {recentActivities.length > 0 && (
                <View style={{ gap: 10 }}>
                  <ThemedText style={[styles.sectionHeading, { color: colors.text }]}>
                    {t('reports.dash.recentActivity')}
                  </ThemedText>
                  <View style={styles.recentList}>
                    {recentActivities.map((a) => {
                      const isFlash = a.type === 'flashcard';
                      const iconName = isFlash
                        ? 'rectangle.stack'
                        : a.type === 'mcq'
                          ? 'book.fill'
                          : 'chart.bar.fill';
                      const iconColor = isFlash ? '#0EA5E9' : BLUE;
                      const iconBg = isFlash ? '#38BDF820' : BLUE + '14';

                      const flash = a as Activity & { cardsReviewed?: number; cardsMastered?: number };
                      const mcq = a as Activity & { questionsAnswered?: number; correctAnswers?: number };

                      const meta = isFlash
                        ? t('reports.dash.flashResult', {
                            count: flash.cardsReviewed ?? 0,
                            mastered: flash.cardsMastered ?? 0,
                          })
                        : t('reports.dash.mcqResult', {
                            correct: mcq.correctAnswers ?? 0,
                            total: mcq.questionsAnswered ?? a.totalQuestions ?? 0,
                          });

                      const showScore = !isFlash && typeof a.score === 'number';
                      const sc = a.score ?? 0;

                      return (
                        <ThemedView key={a.id} style={[styles.recentRow, cardExtras]}>
                          <View style={[styles.recentIcon, { backgroundColor: iconBg }]}>
                            <IconSymbol name={iconName} size={19} color={iconColor} />
                          </View>
                          <View style={styles.recentBody}>
                            <ThemedText style={[styles.recentTitle, { color: colors.text }]} numberOfLines={1}>
                              {a.subject || t(`reports.activityTypes.${a.type}`, { defaultValue: a.type })}
                            </ThemedText>
                            <ThemedText style={[styles.recentMeta, { color: muted }]} numberOfLines={1}>
                              {meta}
                            </ThemedText>
                          </View>
                          <View style={styles.recentRight}>
                            {showScore ? (
                              <View style={[styles.recentScorePill, { backgroundColor: scoreColor(sc) + '1F' }]}>
                                <ThemedText style={[styles.recentScoreText, { color: scoreColor(sc) }]}>{`${sc}%`}</ThemedText>
                              </View>
                            ) : (
                              <View style={[styles.recentScorePill, { backgroundColor: '#0EA5E91F' }]}>
                                <ThemedText style={[styles.recentScoreText, { color: '#0EA5E9' }]}>
                                  {`${flash.cardsMastered ?? 0}/${flash.cardsReviewed ?? 0}`}
                                </ThemedText>
                              </View>
                            )}
                            <ThemedText style={[styles.recentTime, { color: faint }]}>{timeAgo(a.timestamp)}</ThemedText>
                          </View>
                        </ThemedView>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
