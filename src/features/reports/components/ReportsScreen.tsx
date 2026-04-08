import { ScrollView, View, Dimensions, RefreshControl, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';
import { useFocusEffect } from 'expo-router';
import ActivityTrackingService, { UserStats } from '@/features/common/services/activityTrackingService';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';

import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { ReportsScreenStyles as styles } from './ReportsScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [mcqMonthlySeries, setMcqMonthlySeries] = useState<{ x: string; y: number }[]>([]);
  const [topSubjects, setTopSubjects] = useState<{ subject: string; score: number; progress: number; mcqCount: number; flashcardCount: number }[]>([]);
  const [kpiCards, setKpiCards] = useState<StatCard[]>([]);
  const [scoreSectionY, setScoreSectionY] = useState(0);
  const [topSubjectsSectionY, setTopSubjectsSectionY] = useState(0);

  const loadReportData = useCallback(async () => {
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
      if (state === 'active' && user?.username) {
        void loadReportData();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [loadReportData, user?.username]);

  React.useEffect(() => {
    if (!userStats) return;
    const trackingService = ActivityTrackingService.getInstance();

    
    const mcqActivities = trackingService
      .getActivitiesByType('mcq')
      .filter(a => a.status === 'completed' && typeof a.score === 'number');

    const now = new Date();
    const monthsBack = 6;
    const buckets: { key: string; label: string; scores: number[] }[] = [];

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

    
    const subjectBreakdown = Object.entries(userStats.subjectBreakdown)
      .filter(([subject]) => {
        if (!subject) return false;
        const s = subject.trim();
        if (!s) return false;
        const lower = s.toLowerCase();
        
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  }, [loadReportData]);

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
                  <ThemedText style={[styles.kpiValue, styles.kpiValueStudyTime, { color: colors.text }]}>
                    {kpiCards[2].value}
                  </ThemedText>
                  {!!kpiCards[2].deltaText && (
                    <ThemedText style={[styles.kpiDelta, { color: '#22C55E' }]}>{kpiCards[2].deltaText}</ThemedText>
                  )}
                </ThemedView>
              )}

              
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
 