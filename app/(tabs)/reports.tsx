import { StyleSheet, ScrollView, View, Dimensions, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import ActivityTrackingService, { UserStats } from '@/services/activityTrackingService';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: t('profile.stats.mcqsCompleted'), value: '0', icon: 'questionmark.circle.fill' as const },
    { label: t('profile.stats.flashcardsClicked'), value: '0', icon: 'rectangle.stack.fill' as const },
    { label: t('profile.stats.homeworkQuestions'), value: '0', icon: 'message.fill' as const },
    { label: t('profile.stats.studyHours'), value: '0', icon: 'clock.fill' as const },
  ]);

  const [kgStats, setKgStats] = useState([
    { label: t('profile.stats.pictureQuestions'), value: '0', icon: 'photo' as const },
    { label: t('profile.stats.cardGroups'), value: '0', icon: 'rectangle.stack.fill' as const },
  ]);

  const [reportData, setReportData] = useState({
    overallProgress: {
      percentage: 0,
      totalTopics: 0,
      completedTopics: 0,
      studyHours: 0,
    },
    performance: {
      averageScore: 0,
      quizzesTaken: 0,
      successRate: 0,
      improvement: '0%',
    },
    learningStreak: {
      currentStreak: 0,
      bestStreak: 0,
      totalDaysActive: 0,
    },
    subjectBreakdown: [] as Array<{ subject: string; progress: number; score: number }>,
    recentActivity: [] as Array<{
      type: string;
      subject: string;
      score?: number;
      duration?: string;
      status?: string;
      date: string;
    }>,
  });
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedRotate = useRef(new Animated.Value(0)).current;

  // Initialize tracking service
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        const trackingService = ActivityTrackingService.getInstance();
        await trackingService.initialize();
        const stats = trackingService.getStats();
        setUserStats(stats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize tracking service:', error);
        setLoading(false);
      }
    };

    initializeTracking();
  }, []);

  // Auto-refresh data when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      loadReportData();
    }, [])
  );

  // Update stats when language changes or userStats changes
  useEffect(() => {
    if (userStats) {
      const isKGStudent = typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg');
      
      if (isKGStudent) {
        setKgStats([
          { 
            label: t('profile.stats.pictureQuestions'), 
            value: userStats.activityTypeBreakdown.picture_mcq.count.toString(), 
            icon: 'photo' as const 
          },
          { 
            label: t('profile.stats.cardGroups'), 
            value: userStats.activityTypeBreakdown.kg_question.count.toString(), 
            icon: 'rectangle.stack.fill' as const 
          },
        ]);
      } else {
        setStats([
          { 
            label: t('profile.stats.mcqsCompleted'), 
            value: userStats.activityTypeBreakdown.mcq.count.toString(), 
            icon: 'questionmark.circle.fill' as const 
          },
          { 
            label: t('profile.stats.flashcardsClicked'), 
            value: userStats.activityTypeBreakdown.flashcard.count.toString(), 
            icon: 'rectangle.stack.fill' as const 
          },
          { 
            label: t('profile.stats.homeworkQuestions'), 
            value: userStats.activityTypeBreakdown.homework.count.toString(), 
            icon: 'message.fill' as const 
          },
          { 
            label: t('profile.stats.studyHours'), 
            value: `${Math.round(userStats.totalStudyTime / 60)}h`, 
            icon: 'clock.fill' as const 
          },
        ]);
      }

      // Update report data with real statistics
      const subjectBreakdown = Object.entries(userStats.subjectBreakdown).map(([subject, data]) => ({
        subject: subject,
        progress: Math.min(100, Math.round((data.questionsAnswered / Math.max(1, userStats.totalQuestionsAnswered)) * 100)),
        score: data.averageScore
      })).sort((a, b) => b.progress - a.progress);

      const trackingService = ActivityTrackingService.getInstance();
      const recentActivities = trackingService.getRecentActivities(5).map(activity => ({
        type: activity.type,
        subject: activity.subject,
        score: activity.score,
        duration: activity.duration ? `${Math.round(activity.duration)}m` : undefined,
        status: activity.status === 'completed' ? t('reports.status.completed') : activity.status,
        date: new Date(activity.timestamp).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-US')
      }));

      setReportData({
        overallProgress: {
          percentage: Math.min(100, Math.round((userStats.totalQuestionsAnswered / Math.max(1, userStats.totalQuestionsAnswered)) * 100)),
          totalTopics: Object.keys(userStats.subjectBreakdown).length,
          completedTopics: Object.values(userStats.subjectBreakdown).filter(subject => subject.questionsAnswered > 0).length,
          studyHours: Math.round(userStats.totalStudyTime / 60),
        },
        performance: {
          averageScore: userStats.averageScore,
          quizzesTaken: userStats.activityTypeBreakdown.mcq.count,
          successRate: userStats.averageScore,
          improvement: userStats.averageScore > 0 ? `+${userStats.averageScore}%` : '0%',
        },
        learningStreak: {
          currentStreak: userStats.currentStreak,
          bestStreak: userStats.bestStreak,
          totalDaysActive: Math.ceil((Date.now() - userStats.lastActivityDate) / (1000 * 60 * 60 * 24)),
        },
        subjectBreakdown,
        recentActivity: recentActivities
      });
    }
  }, [t, i18n.language, user?.grade, userStats]);

  const loadReportData = async () => {
    try {
      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize();
      const stats = trackingService.getStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load report data:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  }, []);

  const gradients = {
    purple: isDarkMode 
      ? ['#4B3A7A', '#6B54AE', '#8B6BCE'] as const
      : ['#6B54AE', '#8B6BCE', '#A78BFA'] as const,
    green: isDarkMode
      ? ['#1B4D1F', '#2E7D32', '#4CAF50'] as const
      : ['#2E7D32', '#4CAF50', '#81C784'] as const,
    blue: isDarkMode
      ? ['#0D47A1', '#1976D2', '#2196F3'] as const
      : ['#1976D2', '#2196F3', '#64B5F6'] as const,
  };

  const toggleInfo = () => {
    const toValue = isInfoExpanded ? 0 : 1;
    Animated.parallel([
      Animated.spring(animatedHeight, {
        toValue,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.spring(animatedRotate, {
        toValue,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
    ]).start();
    setIsInfoExpanded(!isInfoExpanded);
  };

  const spin = animatedRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('reports.title')} />
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
      <Header title={t('reports.title')} />
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Only show content if we have user stats */}
          {userStats ? (
            <>
              {/* Progress Stats Section - Only show if there's actual data */}
              {(userStats.totalActivities > 0 || userStats.totalStudyTime > 0) && (
                <ThemedView style={[styles.statsSection, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('reports.progressStats.title')}
                  </ThemedText>
                  <View style={styles.statsGrid}>
                    {typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg') ? (
                      kgStats.map((stat, index) => (
                        <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
                          <View style={[styles.statIconContainer, { backgroundColor: colors.tint + '15' }]}>
                            <IconSymbol name={stat.icon} size={24} color={colors.tint} />
                          </View>
                          <ThemedText style={[styles.statValue, { color: colors.text }]}>{stat.value}</ThemedText>
                          <ThemedText style={[styles.statLabel, { color: colors.text + '80' }]}>{stat.label}</ThemedText>
                        </View>
                      ))
                    ) : (
                      stats.map((stat, index) => (
                        <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
                          <View style={[styles.statIconContainer, { backgroundColor: colors.tint + '15' }]}>
                            <IconSymbol name={stat.icon} size={24} color={colors.tint} />
                          </View>
                          <ThemedText style={[styles.statValue, { color: colors.text }]}>{stat.value}</ThemedText>
                          <ThemedText style={[styles.statLabel, { color: colors.text + '80' }]}>{stat.label}</ThemedText>
                        </View>
                      ))
                    )}
                  </View>
                </ThemedView>
              )}


              {/* Learning Streak - Only show if there's actual streak data */}
              {userStats.currentStreak > 0 && (
                <ThemedView style={[styles.card, { backgroundColor: colors.background }]}>
                  <LinearGradient
                    colors={gradients.blue}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                        <IconSymbol name="house.fill" size={24} color="#fff" />
                      </View>
                      <ThemedText style={styles.cardTitle}>{t('reports.learningStreak.title')}</ThemedText>
                    </View>
                    <View style={styles.progressContent}>
                      <ThemedText style={styles.progressPercentage}>
                        {`${reportData.learningStreak.currentStreak} ${t('reports.learningStreak.currentStreak')}`}
                      </ThemedText>
                      <View style={styles.progressStats}>
                        <View style={styles.statItem}>
                          <ThemedText style={styles.statValue}>
                            {`${reportData.learningStreak.bestStreak} ${t('reports.learningStreak.bestStreak')}`}
                          </ThemedText>
                          <ThemedText style={styles.statLabel}>
                            {`${reportData.learningStreak.totalDaysActive} ${t('reports.learningStreak.totalDaysActive')}`}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </ThemedView>
              )}

              {/* Recent Activity - Only show if there are recent activities */}
              {reportData.recentActivity.length > 0 && (
                <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('reports.recentActivity.title')}
                  </ThemedText>
                  {reportData.recentActivity.map((activity, index) => (
                    <ThemedView 
                      key={index} 
                      style={[styles.activityCard, { 
                        backgroundColor: colors.cardAlt,
                        borderColor: colors.border,
                        borderWidth: isDarkMode ? 1 : 0
                      }]}
                    >
                      <View style={[styles.activityIcon, { 
                        backgroundColor: isDarkMode ? 'rgba(107, 84, 174, 0.2)' : '#F3E5F5'
                      }]}>
                        <IconSymbol 
                          name={activity.type === 'quiz' ? 'message.fill' : 
                                activity.type === 'study' ? 'house.fill' : 'message'} 
                          size={24} 
                          color={colors.tint}
                        />
                      </View>
                      <View style={styles.activityContent}>
                        <ThemedText style={[styles.activityTitle, { color: colors.text }]}>
                          {activity.subject} - {t(`reports.activityTypes.${activity.type}`, { defaultValue: activity.type })}
                        </ThemedText>
                        <ThemedText style={[styles.activitySubtitle, { color: colors.text }]}>
                          {activity.score ? 
                            `${activity.score}%` :
                           activity.duration ? 
                            activity.duration :
                           activity.status ? 
                            t('reports.recentActivity.completed') : ''}
                        </ThemedText>
                      </View>
                    </ThemedView>
                  ))}
                </ThemedView>
              )}

              {/* Coming Soon Message - Always visible */}
              <ThemedView style={[styles.card, { backgroundColor: colors.background }]}>
                <LinearGradient
                  colors={gradients.purple}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                      <IconSymbol name="clock.fill" size={24} color="#fff" />
                    </View>
                    <ThemedText style={styles.cardTitle}>{t('reports.comingSoon')}</ThemedText>
                  </View>
                  <View style={styles.progressContent}>
                    <ThemedText style={[styles.comingSoonText, { color: '#fff' }]}>
                      {t('reports.comingSoonDescription')}
                    </ThemedText>
                  </View>
                </LinearGradient>
              </ThemedView>

              {/* Show message if no data available */}
              {userStats.totalActivities === 0 && userStats.totalStudyTime === 0 && (
                <ThemedView style={[styles.emptyState, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.emptyStateText, { color: colors.text }]}>
                    {t('reports.noData', { defaultValue: 'Start learning to see your progress here!' })}
                  </ThemedText>
                </ThemedView>
              )}
            </>
          ) : (
            <ThemedView style={[styles.emptyState, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.emptyStateText, { color: colors.text }]}>
                {t('reports.noData', { defaultValue: 'Start learning to see your progress here!' })}
              </ThemedText>
            </ThemedView>
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
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
  },
  cardGradient: {
    padding: 20,
    paddingTop: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  progressContent: {
    gap: 20,
  },
  progressPercentage: {
    paddingTop: 10,
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  section: {
    gap: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  accordionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accordionTitle: {
    marginBottom: 0,
  },
  accordionContent: {
    overflow: 'hidden',
  },
  infoIcon: {
    opacity: 0.8,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  infoSection: {
    gap: 8,
  },
  infoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    paddingLeft: 28,
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
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
}); 