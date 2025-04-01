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

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReportsScreen() {
  const { t } = useTranslation();
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
      // Sample data for demonstration
      const sampleData = {
        overallProgress: {
          percentage: 75,
          totalTopics: 20,
          completedTopics: 15,
          studyHours: 48,
        },
        performance: {
          averageScore: 85,
          quizzesTaken: 60,
          successRate: 88,
          improvement: '+15%',
        },
        learningStreak: {
          currentStreak: 12,
          bestStreak: 25,
          totalDaysActive: 90,
        },
        subjectBreakdown: [
          { subject: 'ሒሳብ', progress: 90, score: 95 },
          { subject: 'ፊዚክስ', progress: 85, score: 88 },
          { subject: 'ኬሚስትሪ', progress: 75, score: 80 },
          { subject: 'ባዮሎጂ', progress: 70, score: 75 },
        ],
        recentActivity: [
          {
            type: 'quiz',
            subject: 'ሒሳብ',
            score: 95,
            date: new Date().toLocaleDateString()
          },
          {
            type: 'study',
            subject: 'ፊዚክስ',
            duration: '2.5ሰ',
            date: new Date(Date.now() - 86400000).toLocaleDateString()
          },
          {
            type: 'homework',
            subject: 'ኬሚስትሪ',
            status: 'ተጠናቅቋል',
            date: new Date(Date.now() - 172800000).toLocaleDateString()
          },
          {
            type: 'quiz',
            subject: 'ባዮሎጂ',
            score: 85,
            date: new Date(Date.now() - 259200000).toLocaleDateString()
          },
          {
            type: 'study',
            subject: 'ሒሳብ',
            duration: '3ሰ',
            date: new Date(Date.now() - 345600000).toLocaleDateString()
          }
        ]
      };

      // Set the sample data
      setReportData(sampleData);

      // In a real app, you would load this from AsyncStorage or an API
      // const activitiesJson = await AsyncStorage.getItem('recentActivities');
      // let activities: any[] = [];
      // if (activitiesJson) {
      //   activities = JSON.parse(activitiesJson);
      //   // ... rest of the data processing logic
      // }
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
                <ThemedText style={styles.cardTitle}>{t('reports.overallProgress.title')}</ThemedText>
              </View>
              <View style={styles.progressContent}>
                <ThemedText style={styles.progressPercentage}>
                  {`${reportData.overallProgress.percentage}%`}
                </ThemedText>
                <View style={styles.progressStats}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {`${reportData.overallProgress.completedTopics}/${reportData.overallProgress.totalTopics} ${t('reports.overallProgress.topicsCompleted').split(' ')[2]}`}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>
                      {`${reportData.overallProgress.studyHours}${t('home.activityDetails.duration', { hours: '' }).slice(-1)} ${t('reports.overallProgress.studyHours').split(' ').slice(1).join(' ')}`}
                    </ThemedText>
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
                <ThemedText style={styles.cardTitle}>{t('reports.performance.title')}</ThemedText>
              </View>
              <View style={styles.progressContent}>
                <ThemedText style={styles.progressPercentage}>
                  {`${reportData.performance.averageScore}%`}
                </ThemedText>
                <View style={styles.progressStats}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {`${reportData.performance.quizzesTaken} ${t('reports.performance.quizzesTaken').split(' ')[1]} ${t('reports.performance.quizzesTaken').split(' ')[2]}`}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>
                      {`${reportData.performance.successRate}% ${t('reports.performance.successRate').split(' ')[2]} ${t('reports.performance.successRate').split(' ')[3]}`}
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {reportData.performance.improvement}
                    </ThemedText>
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
                <ThemedText style={styles.cardTitle}>{t('reports.learningStreak.title')}</ThemedText>
              </View>
              <View style={styles.progressContent}>
                <ThemedText style={styles.progressPercentage}>
                  {`${reportData.learningStreak.currentStreak} ${t('reports.learningStreak.currentStreak').split(' ')[1]}`}
                </ThemedText>
                <View style={styles.progressStats}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {`${reportData.learningStreak.bestStreak}${t('reports.learningStreak.bestStreak').split(' ')[0].slice(-1)} ${t('reports.learningStreak.bestStreak').split(' ').slice(1).join(' ')}`}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>
                      {`${reportData.learningStreak.totalDaysActive}${t('reports.learningStreak.totalActive').split(' ')[0].slice(-1)} ${t('reports.learningStreak.totalActive').split(' ').slice(1).join(' ')}`}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ThemedView>

          {/* Subject Breakdown */}
          <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              {t('reports.subjectBreakdown.title')}
            </ThemedText>
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
                    {`${subject.progress}% ${t('reports.subjectBreakdown.progress').split(' ')[1]}`}
                  </ThemedText>
                </View>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E0E0E0' }]}>
                  <View style={[styles.progressFill, { 
                    width: `${subject.progress}%`,
                    backgroundColor: colors.tint
                  }]} />
                </View>
              </ThemedView>
            ))}
          </ThemedView>

          {/* Recent Activity */}
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
                    {activity.type === 'quiz' ? `${activity.subject} - ፈተና` :
                     activity.type === 'study' ? `${activity.subject} - ጥናት` :
                     `${activity.subject} - የቤት ስራ`}
                  </ThemedText>
                  <ThemedText style={[styles.activitySubtitle, { color: colors.text }]}>
                    {activity.type === 'quiz' ? `ውጤት: ${activity.score}%` :
                     activity.type === 'study' ? `ጊዜ: ${activity.duration}` :
                     `ሁኔታ: ${activity.status}`}
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
                  {t('reports.howCalculated.title')}
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
                  outputRange: [0, 500],
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
                    <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
                      {t('reports.howCalculated.overallProgress.title')}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.infoText, { color: colors.text }]}>
                    {t('reports.howCalculated.overallProgress.description').split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}{'\n'}
                      </React.Fragment>
                    ))}
                  </ThemedText>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoTitleContainer}>
                    <IconSymbol name="message.fill" size={20} color={colors.tint} />
                    <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
                      {t('reports.howCalculated.performance.title')}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.infoText, { color: colors.text }]}>
                    {t('reports.howCalculated.performance.description').split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}{'\n'}
                      </React.Fragment>
                    ))}
                  </ThemedText>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoTitleContainer}>
                    <IconSymbol name="clock.fill" size={20} color={colors.tint} />
                    <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
                      {t('reports.howCalculated.studyHours.title')}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.infoText, { color: colors.text }]}>
                    {t('reports.howCalculated.studyHours.description').split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}{'\n'}
                      </React.Fragment>
                    ))}
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