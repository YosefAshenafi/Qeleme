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

// Helper function to format chapter names
const formatChapterName = (chapter: string, language: string): string => {
  if (!chapter || chapter === '' || chapter.toLowerCase() === 'unknown' || chapter.toLowerCase() === 'undefined') {
    return chapter;
  }
  
  // Check if chapter is already formatted
  if (chapter.toLowerCase().startsWith('ch-') || chapter.startsWith('ምዕ-')) {
    return chapter;
  }
  
  // Check if it's just a number
  const chapterNum = chapter.trim();
  if (/^\d+$/.test(chapterNum)) {
    return language === 'am' ? `ምዕ-${chapterNum}` : `ch-${chapterNum}`;
  }
  
  // If it's not a number, return as is
  return chapter;
};

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
    { label: t('profile.stats.totalQuestions', 'Total Questions'), value: '0', icon: 'chart.bar.fill' as const },
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
      subject: string;
      chapters: Array<{
        chapter: string;
        chapterFormatted: string;
        activities: Array<{
          type: string;
          subject: string;
          chapter?: string;
          chapterFormatted?: string;
          score?: number;
          duration?: string;
          status?: string;
          date: string;
          timestamp: number;
        }>;
        completedTypes: string[];
      }>;
      count: number;
      latestDate: string;
    }>,
  });
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedRotate = useRef(new Animated.Value(0)).current;

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subject)) {
        newSet.delete(subject);
      } else {
        newSet.add(subject);
      }
      return newSet;
    });
  };

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
            label: t('profile.stats.totalQuestions', 'Total Questions'), 
            value: userStats.totalQuestionsAnswered.toString(), 
            icon: 'chart.bar.fill' as const 
          },
        ]);
      }

      // Update report data with real statistics
      const subjectBreakdown = Object.entries(userStats.subjectBreakdown)
        .filter(([subject]) => {
          // Filter out subjects that are empty or unknown
          return subject && subject.trim() !== '' && 
                 subject.toLowerCase() !== 'unknown' && 
                 subject.toLowerCase() !== 'undefined';
        })
        .map(([subject, data]) => ({
          subject: subject.trim(),
          progress: Math.min(100, Math.round((data.questionsAnswered / Math.max(1, userStats.totalQuestionsAnswered)) * 100)),
          score: data.averageScore
        }))
        .sort((a, b) => b.progress - a.progress);

      const trackingService = ActivityTrackingService.getInstance();
      const allActivities = trackingService.getRecentActivities(50)
        .filter(activity => {
          // Only include completed activities with valid subject
          return activity.status === 'completed' && 
                 activity.subject && 
                 activity.subject.trim() !== '' &&
                 activity.subject.toLowerCase() !== 'unknown' &&
                 activity.subject.toLowerCase() !== 'undefined';
        })
        .map(activity => {
          const rawChapter = activity.chapter && activity.chapter.trim() !== '' && activity.chapter.toLowerCase() !== 'unknown' && activity.chapter.toLowerCase() !== 'undefined'
            ? activity.chapter.trim()
            : t('reports.recentActivity.noChapter', 'No Chapter');
          
          return {
            type: activity.type,
            subject: activity.subject.trim(),
            chapter: rawChapter,
            chapterFormatted: rawChapter !== t('reports.recentActivity.noChapter', 'No Chapter') 
              ? formatChapterName(rawChapter, i18n.language)
              : rawChapter,
            score: activity.score,
            duration: activity.duration ? `${Math.round(activity.duration)}m` : undefined,
            status: activity.status === 'completed' ? t('reports.status.completed') : activity.status,
            date: new Date(activity.timestamp).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-US'),
            timestamp: activity.timestamp
          };
        });

      // Group activities by subject, then by chapter
      const groupedBySubject = allActivities.reduce((acc, activity) => {
        if (!acc[activity.subject]) {
          acc[activity.subject] = {};
        }
        if (!acc[activity.subject][activity.chapter]) {
          acc[activity.subject][activity.chapter] = [];
        }
        acc[activity.subject][activity.chapter].push(activity);
        return acc;
      }, {} as Record<string, Record<string, typeof allActivities>>);

      // Convert to array and process chapters
      const recentActivities = Object.entries(groupedBySubject)
        .filter(([subject]) => {
          // Filter out subjects that are empty or unknown
          return subject && subject.trim() !== '' && 
                 subject.toLowerCase() !== 'unknown' && 
                 subject.toLowerCase() !== 'undefined';
        })
        .map(([subject, chaptersObj]) => {
          const chapters = Object.entries(chaptersObj)
            .filter(([chapter]) => {
              // Filter out chapters that are empty or unknown
              return chapter && chapter.trim() !== '' && 
                     chapter.toLowerCase() !== 'unknown' && 
                     chapter.toLowerCase() !== 'undefined';
            })
            .map(([chapter, activities]) => {
              // Get unique activity types for this chapter (all valid types)
              const validTypes = activities
                .map(a => a.type)
                .filter(type => type && (type === 'mcq' || type === 'flashcard' || type === 'study' || type === 'kg_question' || type === 'picture_mcq'));
              
              const completedTypes = Array.from(new Set(validTypes))
                .map(type => {
                  if (type === 'mcq') {
                    return t('reports.activityTypes.mcq');
                  } else if (type === 'flashcard') {
                    return t('reports.activityTypes.flashcard');
                  } else if (type === 'study') {
                    return t('reports.activityTypes.study');
                  } else if (type === 'kg_question') {
                    return t('reports.activityTypes.kg_question');
                  } else if (type === 'picture_mcq') {
                    return t('reports.activityTypes.picture_mcq');
                  }
                  return null;
                })
                .filter((type): type is string => type !== null);
            
              const chapterFormatted = chapter !== t('reports.recentActivity.noChapter', 'No Chapter')
                ? formatChapterName(chapter.trim(), i18n.language)
                : chapter.trim();
            
              return {
                chapter: chapter.trim(),
                chapterFormatted,
                activities: activities.sort((a, b) => b.timestamp - a.timestamp),
                completedTypes
              };
            })
            .filter(chapter => chapter.activities.length > 0); // Only include chapters with activities

          const allSubjectActivities = Object.values(chaptersObj).flat();
          const latestActivity = allSubjectActivities.sort((a, b) => b.timestamp - a.timestamp)[0];

          // Only include subjects with valid chapters
          if (chapters.length === 0) {
            return null;
          }

          return {
            subject: subject.trim(),
            chapters: chapters.sort((a, b) => {
              // Sort chapters by most recent activity
              const aLatest = a.activities[0].timestamp;
              const bLatest = b.activities[0].timestamp;
              return bLatest - aLatest;
            }),
            count: allSubjectActivities.length,
            latestDate: latestActivity.date
          };
        })
        .filter((group): group is NonNullable<typeof group> => group !== null) // Remove null entries
        .sort((a, b) => {
          // Sort subjects by most recent activity
          const aLatest = a.chapters[0].activities[0].timestamp;
          const bLatest = b.chapters[0].activities[0].timestamp;
          return bLatest - aLatest;
        })
        .slice(0, 5); // Show top 5 subjects

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
                    colors={gradients.purple}
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
                  {reportData.recentActivity.map((group, groupIndex) => {
                    const isExpanded = expandedSubjects.has(group.subject);
                    return (
                      <ThemedView 
                        key={groupIndex}
                        style={[styles.subjectGroup, { 
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          borderWidth: isDarkMode ? 1 : 0
                        }]}
                      >
                        {/* Subject Header - Clickable */}
                        <TouchableOpacity 
                          style={[styles.subjectHeader, { borderBottomColor: colors.border }]}
                          onPress={() => toggleSubject(group.subject)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.subjectIconContainer, { backgroundColor: colors.tint + '15' }]}>
                            <IconSymbol 
                              name="chart.bar.fill" 
                              size={20} 
                              color={colors.tint}
                            />
                          </View>
                          <View style={styles.subjectHeaderContent}>
                            <ThemedText style={[styles.subjectTitle, { color: colors.text }]}>
                              {group.subject}
                            </ThemedText>
                            <View style={styles.chapterSummary}>
                              <View style={styles.typeBadges}>
                                {Array.from(new Set(group.chapters.flatMap(c => c.completedTypes))).map((type, typeIdx) => (
                                  <View 
                                    key={typeIdx} 
                                    style={[styles.typeBadge, { backgroundColor: colors.tint + '20' }]}
                                  >
                                    <ThemedText style={[styles.typeBadgeText, { color: colors.tint }]}>
                                      {type}
                                    </ThemedText>
                                  </View>
                                ))}
                              </View>
                            </View>
                          </View>
                          <View style={styles.subjectHeaderRight}>
                            <ThemedText style={[styles.subjectDate, { color: colors.text + '60' }]}>
                              {group.latestDate}
                            </ThemedText>
                            <IconSymbol 
                              name={isExpanded ? 'chevron.up' : 'chevron.down'} 
                              size={20} 
                              color={colors.text + '60'}
                            />
                          </View>
                        </TouchableOpacity>

                        {/* Chapters List - Expandable */}
                        {isExpanded && (
                          <View style={styles.chaptersList}>
                            {group.chapters.map((chapter, chapterIndex) => (
                              <View 
                                key={chapterIndex}
                                style={[
                                  styles.chapterItem,
                                  chapterIndex < group.chapters.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                                ]}
                              >
                                <View style={styles.chapterHeader}>
                                  <ThemedText style={[styles.chapterTitle, { color: colors.text }]}>
                                    {chapter.chapterFormatted}
                                  </ThemedText>
                                  {chapter.completedTypes.length > 0 && (
                                    <View style={styles.completedTypesContainer}>
                                      {chapter.completedTypes.map((type, typeIdx) => (
                                        <View 
                                          key={typeIdx} 
                                          style={[styles.completedTypeBadge, { backgroundColor: colors.tint + '15' }]}
                                        >
                                          <IconSymbol 
                                            name={type.includes('MCQ') ? 'checkmark.circle.fill' : 'checkmark.circle.fill'} 
                                            size={14} 
                                            color={colors.tint}
                                          />
                                          <ThemedText style={[styles.completedTypeText, { color: colors.tint }]}>
                                            {type}
                                          </ThemedText>
                                        </View>
                                      ))}
                                    </View>
                                  )}
                                </View>
                                <View style={styles.activitiesList}>
                                  {chapter.activities.map((activity, activityIndex) => (
                                    <View 
                                      key={activityIndex}
                                      style={styles.activityItem}
                                    >
                                      <View style={[styles.activityIcon, { 
                                        backgroundColor: isDarkMode ? 'rgba(107, 84, 174, 0.2)' : '#F3E5F5'
                                      }]}>
                                        <IconSymbol 
                                          name={activity.type === 'mcq' ? 'questionmark.circle.fill' : 
                                                activity.type === 'flashcard' ? 'rectangle.stack.fill' :
                                                activity.type === 'study' ? 'house.fill' : 
                                                activity.type === 'kg_question' ? 'questionmark.circle.fill' :
                                                activity.type === 'picture_mcq' ? 'photo' : 'message'} 
                                          size={18} 
                                          color={colors.tint}
                                        />
                                      </View>
                                      <View style={styles.activityContent}>
                                        <ThemedText style={[styles.activityTitle, { color: colors.text }]}>
                                          {activity.type === 'mcq' ? t('reports.activityTypes.mcq') :
                                           activity.type === 'flashcard' ? t('reports.activityTypes.flashcard') :
                                           activity.type === 'study' ? t('reports.activityTypes.study') :
                                           activity.type === 'kg_question' ? t('reports.activityTypes.kg_question') :
                                           activity.type === 'picture_mcq' ? t('reports.activityTypes.picture_mcq') :
                                           ''} {activity.chapter && activity.chapter !== t('reports.recentActivity.noChapter', 'No Chapter') 
                                            ? `• ${activity.chapterFormatted}` 
                                            : activity.chapter === t('reports.recentActivity.noChapter', 'No Chapter')
                                            ? `• ${activity.chapter}`
                                            : ''}
                                        </ThemedText>
                                        <ThemedText style={[styles.activitySubtitle, { color: colors.text + '80' }]}>
                                          {activity.score ? 
                                            `${activity.score}%` :
                                           activity.duration ? 
                                            activity.duration :
                                           activity.status ? 
                                            activity.status : ''}
                                        </ThemedText>
                                      </View>
                                      <ThemedText style={[styles.activityDate, { color: colors.text + '60' }]}>
                                        {activity.date}
                                      </ThemedText>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </ThemedView>
                    );
                  })}
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
    color: 'white'
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    color: 'white'
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
  subjectGroup: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  subjectIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectHeaderContent: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  subjectHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  subjectCount: {
    fontSize: 12,
  },
  subjectDate: {
    fontSize: 12,
  },
  chapterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  typeBadges: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  chaptersList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chapterItem: {
    paddingVertical: 12,
    gap: 8,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  completedTypesContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  completedTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activitiesList: {
    paddingLeft: 8,
    gap: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
  },
  activityDate: {
    fontSize: 11,
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