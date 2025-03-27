import { StyleSheet, ScrollView, View, Dimensions, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReportsScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
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
    recentActivity: [] as Array<{ type: string; subject: string; score?: number; duration?: string; status?: string; date: string }>,
  });
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedRotate = useRef(new Animated.Value(0)).current;

  const loadReportData = async () => {
    try {
      // Load recent activities
      const activitiesJson = await AsyncStorage.getItem('recentActivities');
      let activities: any[] = [];
      if (activitiesJson) {
        activities = JSON.parse(activitiesJson);
        const recentActivity = activities.map((activity: any) => ({
          type: activity.type,
          subject: activity.subject,
          score: activity.type === 'mcq' ? parseInt(activity.details.match(/\d+/)[0]) : undefined,
          duration: activity.duration,
          status: activity.status,
          date: new Date(activity.timestamp).toLocaleDateString()
        }));
        setReportData(prev => ({ ...prev, recentActivity }));
      }

      // Calculate study hours from activities
      const studyHours = activities
        .filter((activity: any) => activity.type === 'study')
        .reduce((total: number, activity: any) => {
          const hours = parseInt(activity.duration?.replace('h', '') || '0');
          return total + hours;
        }, 0);

      // Calculate performance metrics
      const mcqActivities = activities.filter((activity: any) => activity.type === 'mcq');
      const totalQuizzes = mcqActivities.length;
      const totalScore = mcqActivities.reduce((sum: number, activity: any) => {
        const score = parseInt(activity.details.match(/\d+/)[0]);
        return sum + score;
      }, 0);
      const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

      // Calculate subject breakdown and completed topics
      const subjectProgress = new Map<string, { totalQuizzes: number; totalScore: number }>();
      let totalTopics = 0;
      let completedTopics = 0;

      activities.forEach((activity: any) => {
        if (activity.subject) {
          if (!subjectProgress.has(activity.subject)) {
            subjectProgress.set(activity.subject, { totalQuizzes: 0, totalScore: 0 });
            totalTopics++;
          }
          
          const subjectData = subjectProgress.get(activity.subject)!;
          if (activity.type === 'mcq') {
            subjectData.totalQuizzes++;
            subjectData.totalScore += parseInt(activity.details.match(/\d+/)[0]);
            if (subjectData.totalQuizzes >= 5 && (subjectData.totalScore / subjectData.totalQuizzes) >= 70) {
              completedTopics++;
            }
          }
        }
      });

      // Calculate overall progress percentage
      const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      // Update report data
      setReportData(prev => ({
        ...prev,
        overallProgress: {
          ...prev.overallProgress,
          percentage: overallProgress,
          totalTopics,
          completedTopics,
          studyHours,
        },
        performance: {
          ...prev.performance,
          averageScore,
          quizzesTaken: totalQuizzes,
          successRate: averageScore,
          improvement: '+5%', // This could be calculated based on historical data
        },
      }));
    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadReportData();
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Learning Reports" />
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
          {/* Overall Progress Card */}
          <ThemedView style={[styles.card, { backgroundColor: colors.background }]}>
            <LinearGradient
              colors={gradients.purple}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <IconSymbol name="message" size={24} color="#fff" />
                </View>
                <ThemedText style={styles.cardTitle}>Overall Progress</ThemedText>
              </View>
              <View style={styles.progressContent}>
                <ThemedText style={styles.progressPercentage}>
                  {reportData.overallProgress.percentage}%
                </ThemedText>
                <View style={styles.progressStats}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {reportData.overallProgress.completedTopics}/{reportData.overallProgress.totalTopics}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Topics Completed</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {reportData.overallProgress.studyHours}h
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Study Hours</ThemedText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ThemedView>

          {/* Performance Metrics */}
          <ThemedView style={[styles.card, { backgroundColor: colors.background }]}>
            <LinearGradient
              colors={gradients.green}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <IconSymbol name="message.fill" size={24} color="#fff" />
                </View>
                <ThemedText style={styles.cardTitle}>Performance</ThemedText>
              </View>
              <View style={styles.progressContent}>
                <ThemedText style={styles.progressPercentage}>
                  {reportData.performance.averageScore}%
                </ThemedText>
                <View style={styles.progressStats}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {reportData.performance.quizzesTaken}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Quizzes Taken</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {reportData.performance.successRate}%
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Success Rate</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {reportData.performance.improvement}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Improvement</ThemedText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ThemedView>

          {/* Learning Streak */}
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
                <ThemedText style={styles.cardTitle}>Learning Streak</ThemedText>
              </View>
              <View style={styles.progressContent}>
                <ThemedText style={styles.progressPercentage}>
                  {reportData.learningStreak.currentStreak} days
                </ThemedText>
                <View style={styles.progressStats}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {reportData.learningStreak.bestStreak}d
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Best Streak</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {reportData.learningStreak.totalDaysActive}d
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Total Active</ThemedText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ThemedView>

          {/* Subject Breakdown */}
          <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Subject Breakdown</ThemedText>
            {reportData.subjectBreakdown.map((subject, index) => (
              <ThemedView 
                key={index} 
                style={[styles.subjectCard, { 
                  backgroundColor: colors.cardAlt,
                  borderColor: colors.border,
                  borderWidth: isDarkMode ? 1 : 0
                }]}
              >
                <View style={styles.subjectHeader}>
                  <ThemedText style={[styles.subjectName, { color: colors.text }]}>
                    {subject.subject}
                  </ThemedText>
                  <ThemedText style={[styles.subjectScore, { color: colors.tint }]}>
                    {subject.score}%
                  </ThemedText>
                </View>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E0E0E0' }]}>
                  <View style={[styles.progressFill, { 
                    width: `${subject.progress}%`,
                    backgroundColor: colors.tint
                  }]} />
                </View>
                <ThemedText style={[styles.progressText, { color: colors.text }]}>
                  {subject.progress}% Complete
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          {/* Recent Activity */}
          <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</ThemedText>
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
                    {activity.subject} - {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </ThemedText>
                  <ThemedText style={[styles.activitySubtitle, { color: colors.text }]}>
                    {activity.type === 'quiz' ? `Score: ${activity.score}%` :
                     activity.type === 'study' ? `Duration: ${activity.duration}` :
                     `Status: ${activity.status}`}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.activityDate, { 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                }]}>
                  {activity.date}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          {/* How Reports are Calculated */}
          <ThemedView style={[styles.section, { backgroundColor: colors.background, marginBottom: 40 }]}>
            <TouchableOpacity 
              onPress={toggleInfo}
              style={[styles.accordionHeader, { 
                backgroundColor: colors.cardAlt,
                borderColor: colors.border,
                borderWidth: isDarkMode ? 1 : 0,
              }]}
            >
              <View style={styles.accordionTitleContainer}>
                <IconSymbol 
                  name="questionmark.circle.fill" 
                  size={24} 
                  color={colors.tint} 
                  style={styles.infoIcon}
                />
                <ThemedText style={[styles.sectionTitle, styles.accordionTitle, { color: colors.text }]}>
                  How Reports are Calculated
                </ThemedText>
              </View>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconSymbol 
                  name="chevron.right" 
                  size={24} 
                  color={colors.text}
                />
              </Animated.View>
            </TouchableOpacity>

            <Animated.View style={[
              styles.accordionContent,
              {
                maxHeight: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500], // Adjust this value based on content height
                }),
                opacity: animatedHeight,
              }
            ]}>
              <ThemedView 
                style={[styles.infoCard, { 
                  backgroundColor: colors.cardAlt,
                  borderColor: colors.border,
                  borderWidth: isDarkMode ? 1 : 0,
                  borderTopWidth: 0,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                }]}
              >
                <View style={styles.infoSection}>
                  <View style={styles.infoTitleContainer}>
                    <IconSymbol name="message.fill" size={20} color={colors.tint} />
                    <ThemedText style={[styles.infoTitle, { color: colors.text }]}>Overall Progress</ThemedText>
                  </View>
                  <ThemedText style={[styles.infoText, { color: colors.text }]}>
                    • Each unique subject counts as a topic{'\n'}
                    • A topic is considered completed when:{'\n'}
                    {'  '}- You've taken at least 5 MCQ quizzes{'\n'}
                    {'  '}- Your average score is 70% or higher{'\n'}
                    • Progress = (Completed Topics / Total Topics) × 100
                  </ThemedText>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoTitleContainer}>
                    <IconSymbol name="message.fill" size={20} color={colors.tint} />
                    <ThemedText style={[styles.infoTitle, { color: colors.text }]}>Performance Metrics</ThemedText>
                  </View>
                  <ThemedText style={[styles.infoText, { color: colors.text }]}>
                    • Average Score: Total of all MCQ scores ÷ Number of quizzes{'\n'}
                    • Success Rate: Same as average score{'\n'}
                    • Quizzes Taken: Total number of MCQ quizzes completed
                  </ThemedText>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoTitleContainer}>
                    <IconSymbol name="clock.fill" size={20} color={colors.tint} />
                    <ThemedText style={[styles.infoTitle, { color: colors.text }]}>Study Hours</ThemedText>
                  </View>
                  <ThemedText style={[styles.infoText, { color: colors.text }]}>
                    • Calculated from all study sessions{'\n'}
                    • Each study activity's duration is added to the total
                  </ThemedText>
                </View>
              </ThemedView>
            </Animated.View>
          </ThemedView>
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
    gap: 20,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subjectCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
  },
  subjectScore: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
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
  activityDate: {
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
}); 