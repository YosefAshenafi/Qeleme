import { StyleSheet, ScrollView, View, Dimensions, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/shared/components/ui/IconSymbol';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/shared/constants/Colors';
import { useMemo, useRef, useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import ActivityTrackingService, { UserStats } from '@/shared/services/activityTrackingService';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';

import { ThemedText } from '@/shared/components/ThemedText';
import { ThemedView } from '@/shared/components/ThemedView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Empty state message when no report data yet (hardcoded so it always shows correctly)
const REPORTS_EMPTY_MESSAGE = {
  en: 'Complete MCQs or study flashcards to see your learning reports here.',
  am: 'የትምህርት ሪፖርቶችዎን ለማየት ምርጫ ጥያቄዎች ወይም ፍላሽ ካርዶች ይሥሩ።',
};

type StatCard = {
  title: string;
  value: string;
  deltaText?: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  iconBg: string;
};

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);
  const brandBlue = '#0F4BD7';
  const scrollRef = useRef<ScrollView | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mcqMonthlySeries, setMcqMonthlySeries] = useState<Array<{ x: string; y: number }>>([]);
  const [topSubjects, setTopSubjects] = useState<Array<{ subject: string; score: number; progress: number; mcqCount: number; flashcardCount: number }>>([]);
  const [kpiCards, setKpiCards] = useState<StatCard[]>([]);
  const [scoreSectionY, setScoreSectionY] = useState(0);
  const [topSubjectsSectionY, setTopSubjectsSectionY] = useState(0);

  // Initialize tracking service when user changes
  React.useEffect(() => {
    const initializeTracking = async () => {
      try {
        if (!user?.username) {
          setUserStats(null);
          setLoading(false);
          return;
        }
        
        const trackingService = ActivityTrackingService.getInstance();
        await trackingService.initialize(user.username);
        const stats = trackingService.getStats();
        setUserStats(stats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize tracking service:', error);
        setLoading(false);
      }
    };

    initializeTracking();
  }, [user?.username]);

  // Auto-refresh data when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      loadReportData();
    }, [user?.username])
  );

  React.useEffect(() => {
    if (!userStats) return;
    const trackingService = ActivityTrackingService.getInstance();

    // Score progression series (MCQ only)
    const mcqActivities = trackingService
      .getActivitiesByType('mcq')
      .filter(a => a.status === 'completed' && typeof a.score === 'number');

    const now = new Date();
    const monthsBack = 6;
    const buckets: Array<{ key: string; label: string; scores: number[] }> = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString(i18n.language === 'am' ? 'am-ET' : 'en-US', { month: 'short' }).toUpperCase();
      buckets.push({ key, label, scores: [] });
    }

    mcqActivities.forEach(a => {
      const d = new Date(a.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find(b => b.key === key);
      if (bucket && typeof a.score === 'number') bucket.scores.push(a.score);
    });

    const series = buckets.map(b => {
      const avg = b.scores.length ? Math.round(b.scores.reduce((sum, s) => sum + s, 0) / b.scores.length) : 0;
      return { x: b.label, y: avg };
    });

    setMcqMonthlySeries(series.some(p => p.y > 0) ? series : []);

    const allCompletedActivities = trackingService
      .getRecentActivities(10000)
      .filter(a => a.status === 'completed' && a.subject && a.subject.trim() !== '');

    const perSubjectCounts = allCompletedActivities.reduce((acc, a) => {
      const subject = a.subject.trim();
      const lower = subject.toLowerCase();
      if (!subject || lower.includes('unknown') || lower.includes('undefined')) return acc;
      if (!acc[subject]) acc[subject] = { mcqCount: 0, flashcardCount: 0 };
      if (a.type === 'mcq') acc[subject].mcqCount += 1;
      if (a.type === 'flashcard') acc[subject].flashcardCount += 1;
      return acc;
    }, {} as Record<string, { mcqCount: number; flashcardCount: number }>);

    // Top subjects (by progress share + avg score) + include practice/flashcard counts
    const subjectBreakdown = Object.entries(userStats.subjectBreakdown)
      .filter(([subject]) => {
        if (!subject) return false;
        const s = subject.trim();
        if (!s) return false;
        const lower = s.toLowerCase();
        // Exclude any unknown/undefined-like placeholders (e.g. "Unknown Subject")
        if (lower.includes('unknown') || lower.includes('undefined')) return false;
        return true;
      })
      .map(([subject, data]) => ({
        subject: subject.trim(),
        progress: Math.min(100, Math.round((data.questionsAnswered / Math.max(1, userStats.totalQuestionsAnswered)) * 100)),
        score: data.averageScore,
        mcqCount: perSubjectCounts[subject.trim()]?.mcqCount ?? 0,
        flashcardCount: perSubjectCounts[subject.trim()]?.flashcardCount ?? 0,
      }))
      .sort((a, b) => b.progress - a.progress);

    setTopSubjects(subjectBreakdown);

    // KPI cards (real tracked data only)
    const scoreDelta = (() => {
      const currentMonth = series[series.length - 1]?.y ?? 0;
      const prevMonth = series[series.length - 2]?.y ?? 0;
      if (!currentMonth || !prevMonth) return undefined;
      const diff = currentMonth - prevMonth;
      return `${diff >= 0 ? '+' : ''}${diff}%`;
    })();

    const formatHHMMSS = (totalSeconds: number) => {
      const safe = Math.max(0, Math.floor(totalSeconds));
      const hh = Math.floor(safe / 3600);
      const mm = Math.floor((safe % 3600) / 60);
      const ss = safe % 60;
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    };

    const totalStudySeconds = (userStats.totalStudyTime || 0) * 60;
    const studyTimeText = formatHHMMSS(totalStudySeconds);

    setKpiCards([
      {
        title: t('reports.kpi.practiceQuestions', { defaultValue: 'Practice Questions' }),
        value: String(userStats.activityTypeBreakdown.mcq.count || 0),
        deltaText: scoreDelta,
        icon: 'book.fill',
        iconBg: isDarkMode ? 'rgba(15, 75, 215, 0.22)' : 'rgba(15, 75, 215, 0.12)',
      },
      {
        title: t('profile.stats.flashcardsClicked', { defaultValue: 'Flashcards Clicked' }),
        value: String(userStats.activityTypeBreakdown.flashcard.count || 0),
        deltaText: undefined,
        icon: 'rectangle.stack',
        iconBg: isDarkMode ? 'rgba(15, 75, 215, 0.22)' : 'rgba(15, 75, 215, 0.12)',
      },
      {
        title: t('reports.kpi.studyTime', { defaultValue: 'Study Time' }),
        value: studyTimeText,
        deltaText: userStats.currentStreak > 0 ? t('reports.kpi.streakDays', { defaultValue: '{{count}} day streak', count: userStats.currentStreak }) : undefined,
        icon: 'clock.fill',
        iconBg: isDarkMode ? 'rgba(15, 75, 215, 0.22)' : 'rgba(15, 75, 215, 0.12)',
      },
    ]);
  }, [i18n.language, isDarkMode, userStats]);

  const loadReportData = async () => {
    try {
      if (!user?.username) {
        console.warn('Cannot load report data: no user logged in');
        setUserStats(null);
        return;
      }
      
      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize(user.username);
      const stats = trackingService.getStats();
      setUserStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load report data:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  }, []);

  const avgChipText = useMemo(() => {
    const val = userStats?.averageScore ?? 0;
    return `${Math.max(0, Math.min(100, val))}%`;
  }, [userStats?.averageScore]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            {t('reports.loading', { defaultValue: 'Loading your progress...' })}
          </ThemedText>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brandBlue}
            colors={[brandBlue]}
          />
        }
      >
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          {!userStats ? (
            <ThemedView style={[styles.emptyState, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.emptyStateText, { color: colors.text }]}>
                {REPORTS_EMPTY_MESSAGE[i18n.language === 'am' ? 'am' : 'en']}
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              {/* KPI cards row (GPA / Ranking) */}
              <View style={styles.kpiRow}>
                {kpiCards.slice(0, 2).map((card, idx) => {
                  const onPress = () => {
                    const y = idx === 0 ? scoreSectionY : topSubjectsSectionY;
                    scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
                  };

                  return (
                    <TouchableOpacity
                      key={card.title}
                      style={styles.kpiTouchable}
                      activeOpacity={0.85}
                      onPress={onPress}
                      accessibilityRole="button"
                      accessibilityLabel={`${card.title} report`}
                    >
                      <ThemedView
                        style={[
                          styles.kpiCard,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            borderWidth: isDarkMode ? 1 : 0,
                          },
                        ]}
                      >
                        <View style={styles.kpiTop}>
                          <View style={[styles.kpiIconLgWrap, { backgroundColor: card.iconBg }]}>
                            <IconSymbol name={card.icon} size={28} color={brandBlue} />
                          </View>
                          <ThemedText style={[styles.kpiTitleBelow, { color: colors.text + '80' }]}>{card.title}</ThemedText>
                        </View>

                        <View style={styles.kpiBottomRow}>
                          <View style={[styles.kpiValueCircle, { backgroundColor: brandBlue + '10', borderColor: brandBlue + '20' }]}>
                            <ThemedText style={[styles.kpiValueCircleText, { color: brandBlue }]}>{card.value}</ThemedText>
                          </View>
                        </View>

                        {!!card.deltaText && (
                          <ThemedText style={[styles.kpiDelta, { color: '#22C55E' }]}>{card.deltaText}</ThemedText>
                        )}
                      </ThemedView>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Credits wide card */}
              {kpiCards[2] && (
                <ThemedView
                  style={[
                    styles.creditsCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: isDarkMode ? 1 : 0,
                    },
                  ]}
                >
                  <View style={styles.kpiHeader}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: kpiCards[2].iconBg }]}>
                      <IconSymbol name={kpiCards[2].icon} size={18} color={brandBlue} />
                    </View>
                    <ThemedText style={[styles.kpiTitle, { color: colors.text + '80' }]}>{kpiCards[2].title}</ThemedText>
                  </View>
                  <ThemedText style={[styles.kpiValue, { color: colors.text }]}>{kpiCards[2].value}</ThemedText>
                  {!!kpiCards[2].deltaText && (
                    <ThemedText style={[styles.kpiDelta, { color: '#22C55E' }]}>{kpiCards[2].deltaText}</ThemedText>
                  )}
                </ThemedView>
              )}

              {/* Score Progression */}
              <ThemedView
                style={[
                  styles.progressCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: isDarkMode ? 1 : 0,
                  },
                ]}
                onLayout={(e) => setScoreSectionY(e.nativeEvent.layout.y)}
              >
                <View style={styles.progressHeader}>
                  <View>
                    <ThemedText style={[styles.progressTitle, { color: colors.text }]}>
                      {t('reports.scoreProgression.title', { defaultValue: 'Score Progression' })}
                    </ThemedText>
                    <ThemedText style={[styles.progressSubtitle, { color: colors.text + '70' }]}>
                      {t('reports.scoreProgression.subtitle', { defaultValue: 'Overall Academic Performance' })}
                    </ThemedText>
                  </View>
                  <View style={[styles.progressChip, { backgroundColor: brandBlue + '15' }]}>
                    <ThemedText style={[styles.progressChipText, { color: brandBlue }]}>{avgChipText}</ThemedText>
                  </View>
                </View>

                {mcqMonthlySeries.length > 0 ? (
                  <VictoryChart height={180} padding={{ top: 10, left: 18, right: 18, bottom: 36 }} domain={{ y: [0, 100] }}>
                    <VictoryAxis
                      style={{
                        axis: { stroke: 'transparent' },
                        tickLabels: { fill: colors.text + '60', fontSize: 10, fontWeight: '700' },
                        grid: { stroke: 'transparent' },
                        ticks: { stroke: 'transparent' },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      style={{
                        axis: { stroke: 'transparent' },
                        tickLabels: { fill: 'transparent' },
                        grid: { stroke: 'transparent' },
                        ticks: { stroke: 'transparent' },
                      }}
                    />
                    <VictoryLine
                      data={mcqMonthlySeries}
                      interpolation="monotoneX"
                      style={{
                        data: { stroke: brandBlue, strokeWidth: 3 },
                      }}
                    />
                  </VictoryChart>
                ) : (
                  <View style={styles.emptyChart}>
                    <ThemedText style={[styles.emptyChartText, { color: colors.text + '70' }]}>
                      {t('reports.scoreProgression.empty', { defaultValue: 'Complete an MCQ session to see your score trend.' })}
                    </ThemedText>
                  </View>
                )}
              </ThemedView>

              {/* Top Performing Subjects */}
              {topSubjects.length > 0 && (
                <ThemedView
                  style={[styles.section, { backgroundColor: colors.background }]}
                  onLayout={(e) => setTopSubjectsSectionY(e.nativeEvent.layout.y)}
                >
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('reports.topPerformingSubjects.title', { defaultValue: 'Top Performing Subjects' })}
                  </ThemedText>
                  <View style={styles.subjectBarsList}>
                    {topSubjects.slice(0, 5).map((item, idx) => (
                      <ThemedView
                        key={`${item.subject}-${idx}`}
                        style={[
                          styles.subjectBarCard,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            borderWidth: isDarkMode ? 1 : 0,
                          },
                        ]}
                      >
                        <View style={styles.subjectBarHeader}>
                          <View style={[styles.subjectBarIcon, { backgroundColor: colors.tint + '15' }]}>
                            <IconSymbol name="trophy.fill" size={18} color={brandBlue} />
                          </View>
                          <View style={styles.subjectBarTitleWrap}>
                            <ThemedText style={[styles.subjectBarTitle, { color: colors.text }]} numberOfLines={1}>
                              {item.subject}
                            </ThemedText>
                            <View style={styles.subjectBadgesRow}>
                              {item.mcqCount > 0 && (
                                <View style={[styles.subjectBadge, { backgroundColor: brandBlue + '12' }]}>
                                  <IconSymbol name="book.fill" size={12} color={brandBlue} />
                                  <ThemedText style={[styles.subjectBadgeText, { color: brandBlue }]}>
                                    {`${item.mcqCount}`}
                                  </ThemedText>
                                </View>
                              )}
                              {item.flashcardCount > 0 && (
                                <View style={[styles.subjectBadge, { backgroundColor: brandBlue + '12' }]}>
                                  <IconSymbol name="rectangle.stack" size={12} color={brandBlue} />
                                  <ThemedText style={[styles.subjectBadgeText, { color: brandBlue }]}>
                                    {`${item.flashcardCount}`}
                                  </ThemedText>
                                </View>
                              )}
                            </View>
                          </View>
                          <ThemedText style={[styles.subjectBarScore, { color: colors.text + '80' }]}>
                            {`${item.score || 0}%`}
                          </ThemedText>
                        </View>
                        <View style={[styles.subjectBarTrack, { backgroundColor: isDarkMode ? '#1B2230' : '#EEF2F7' }]}>
                          <View
                            style={[
                              styles.subjectBarFill,
                              {
                                width: `${Math.max(0, Math.min(100, item.progress || 0))}%`,
                                backgroundColor: brandBlue,
                              },
                            ]}
                          />
                        </View>
                      </ThemedView>
                    ))}
                  </View>
                </ThemedView>
              )}
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  section: {
    gap: 10,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiTouchable: {
    flex: 1,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 92,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  creditsCard: {
    borderRadius: 16,
    padding: 14,
    minHeight: 92,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kpiTop: {
    alignItems: 'flex-start',
    gap: 10,
  },
  kpiIconLgWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitleBelow: {
    fontSize: 13,
    fontWeight: '800',
  },
  kpiBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  kpiValueCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  kpiValueCircleText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  kpiDelta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  progressCard: {
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  progressChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  progressChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyChart: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyChartText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  subjectBarsList: {
    gap: 10,
  },
  subjectBarCard: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  subjectBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectBarTitleWrap: {
    flex: 1,
    gap: 6,
  },
  subjectBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subjectBarIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectBarTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  subjectBarScore: {
    fontSize: 12,
    fontWeight: '700',
  },
  subjectBarTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  subjectBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
}); 