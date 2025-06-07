import { StyleSheet, ScrollView, TouchableOpacity, Animated, View, Image, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { BASE_URL } from '../../config/constants';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // Full width minus padding
const CARD_SPACING = 16;

const motivationalQuotes = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Education is not preparation for life; education is life itself.",
    author: "John Dewey"
  },
  {
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King"
  }
];

const GRADIENTS = {
  purple: ['#8E6FFF', '#9577FF', '#9C7FFF'] as const,
  blue: ['#5478FF', '#5B80FF', '#6288FF'] as const,
  green: ['#00BA88', '#0AC090', '#14C698'] as const,
  orange: ['#FF8F6B', '#FF9775', '#FF9F7F'] as const,
} as const;

type ReportCard = {
  title: string;
  number: string;
  subtitle: string;
  gradient: keyof typeof GRADIENTS;
  icon: 'chart.bar' | 'trophy.fill' | 'clock.fill';
  stats: Array<{ label: string; value: string }>;
};

type RecentActivity = {
  type: 'mcq' | 'flashcard' | 'homework' | 'study';
  grade: string;
  subject: string;
  chapter: string;
  timestamp: number;
  details: string; // e.g. "Completed 5 questions" or "Reviewed 10 flashcards"
  status?: string; // e.g. "Completed", "In Progress"
  duration?: string; // e.g. "2h" for study hours
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user, login } = useAuth();
  const colors = getColors(isDarkMode);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);

  const loadRecentActivities = async () => {
    try {
      const activitiesJson = await AsyncStorage.getItem('recentActivities');
      if (!activitiesJson) {
        setRecentActivities([]);
        return;
      }

      const activities = JSON.parse(activitiesJson);
      
      // Filter activities for the current user
      const userActivities = activities.filter((activity: any) => activity.username === user?.username);
      
      // Sort by timestamp and take top 5
      const sortedActivities = userActivities
        .sort((a: RecentActivity, b: RecentActivity) => b.timestamp - a.timestamp)
        .slice(0, 5);
      
      setRecentActivities(sortedActivities);
    } catch (error) {
      // Silently handle recent activities loading error
      setRecentActivities([]);
    }
  };

  useEffect(() => {
    loadRecentActivities();
  }, []);

  // Add useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await loadRecentActivities();
        await loadReportData();
      };
      loadData();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Get stored credentials
      const storedUsername = await AsyncStorage.getItem('@username');
      const storedPassword = await AsyncStorage.getItem('@password');
      
      if (storedUsername && storedPassword) {
        // Login to get fresh user data
        const response = await fetch(`${BASE_URL}/api/auth/student/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: storedUsername,
            password: storedPassword,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          await login(data);
        }
      }

      await Promise.all([loadRecentActivities(), loadReportData()]);
    } catch (error) {
      // Silently handle refresh error
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Set initial opacity to 1 when loading is complete
      fadeAnim.setValue(1);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadReportData = async () => {
    try {
      const activitiesJson = await AsyncStorage.getItem('recentActivities');
      let activities: any[] = [];
      if (activitiesJson) {
        activities = JSON.parse(activitiesJson);
      }

      // Initialize with zeros if no activities
      if (activities.length === 0) {
        const cards: ReportCard[] = [
          {
            title: t('home.reportCards.performance.title'),
            number: '0%',
            subtitle: t('home.reportCards.performance.subtitle'),
            gradient: 'purple',
            icon: 'chart.bar',
            stats: [
              { label: t('home.reportCards.performance.stats.quizzesTaken'), value: '0' },
              { label: t('home.reportCards.performance.stats.successRate'), value: '0%' }
            ]
          },
          {
            title: t('home.reportCards.studyProgress.title'),
            number: '0h',
            subtitle: t('home.reportCards.studyProgress.subtitle'),
            gradient: 'blue',
            icon: 'clock.fill',
            stats: [
              { label: t('home.reportCards.studyProgress.stats.dailyGoal'), value: '0h' },
              { label: t('home.reportCards.studyProgress.stats.weeklyGoal'), value: '0h' }
            ]
          },
          {
            title: t('home.reportCards.learningStreak.title'),
            number: '0d',
            subtitle: t('home.reportCards.learningStreak.subtitle'),
            gradient: 'green',
            icon: 'trophy.fill',
            stats: [
              { label: t('home.reportCards.learningStreak.stats.currentStreak'), value: '0d' },
              { label: t('home.reportCards.learningStreak.stats.bestStreak'), value: '0d' }
            ]
          },
          {
            title: t('home.reportCards.studyFocus.title'),
            number: '0',
            subtitle: t('home.reportCards.studyFocus.subtitle'),
            gradient: 'orange',
            icon: 'chart.bar',
            stats: [
              { label: t('home.reportCards.studyFocus.stats.topSubject'), value: '-' },
              { label: t('home.reportCards.studyFocus.stats.hoursPerSubject'), value: '0h' }
            ]
          }
        ];
        setReportCards(cards);
        return;
      }

      // Filter activities for the current user
      const userActivities = activities.filter((activity: any) => activity.username === user?.username);

      // Calculate report data
      const reportData = calculateReportData(userActivities);
      setReportCards(reportData);
    } catch (error) {
      // Silently handle report data loading error
      const defaultCards: ReportCard[] = [
        {
          title: t('home.reportCards.performance.title'),
          number: '0%',
          subtitle: t('home.reportCards.performance.subtitle'),
          gradient: 'purple',
          icon: 'chart.bar',
          stats: [
            { label: t('home.reportCards.performance.stats.quizzesTaken'), value: '0' },
            { label: t('home.reportCards.performance.stats.successRate'), value: '0%' }
          ]
        },
        {
          title: t('home.reportCards.studyProgress.title'),
          number: '0h',
          subtitle: t('home.reportCards.studyProgress.subtitle'),
          gradient: 'blue',
          icon: 'clock.fill',
          stats: [
            { label: t('home.reportCards.studyProgress.stats.dailyGoal'), value: '0h' },
            { label: t('home.reportCards.studyProgress.stats.weeklyGoal'), value: '0h' }
          ]
        },
        {
          title: t('home.reportCards.learningStreak.title'),
          number: '0d',
          subtitle: t('home.reportCards.learningStreak.subtitle'),
          gradient: 'green',
          icon: 'trophy.fill',
          stats: [
            { label: t('home.reportCards.learningStreak.stats.currentStreak'), value: '0d' },
            { label: t('home.reportCards.learningStreak.stats.bestStreak'), value: '0d' }
          ]
        },
        {
          title: t('home.reportCards.studyFocus.title'),
          number: '0',
          subtitle: t('home.reportCards.studyFocus.subtitle'),
          gradient: 'orange',
          icon: 'chart.bar',
          stats: [
            { label: t('home.reportCards.studyFocus.stats.topSubject'), value: '-' },
            { label: t('home.reportCards.studyFocus.stats.hoursPerSubject'), value: '0h' }
          ]
        }
      ];
      setReportCards(defaultCards);
    }
  };

  const calculateReportData = (activities: any[]): ReportCard[] => {
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
      const score = parseInt(activity.details.match(/\d+/)?.[0] || '0');
      return sum + score;
    }, 0);
    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    // Calculate learning streak
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasActivityToday = activities.some((activity: any) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate.toDateString() === today.toDateString();
    });

    const hasActivityYesterday = activities.some((activity: any) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate.toDateString() === yesterday.toDateString();
    });

    const currentStreak = hasActivityToday ? 1 : 0;
    const bestStreak = 1;

    // Create report cards with translations
    return [
      {
        title: t('home.reportCards.performance.title'),
        number: `${averageScore}%`,
        subtitle: t('home.reportCards.performance.subtitle'),
        gradient: 'purple',
        icon: 'chart.bar',
        stats: [
          { label: t('home.reportCards.performance.stats.quizzesTaken'), value: totalQuizzes.toString() },
          { label: t('home.reportCards.performance.stats.successRate'), value: `${averageScore}%` }
        ]
      },
      {
        title: t('home.reportCards.studyProgress.title'),
        number: `${studyHours}h`,
        subtitle: t('home.reportCards.studyProgress.subtitle'),
        gradient: 'blue',
        icon: 'clock.fill',
        stats: [
          { label: t('home.reportCards.studyProgress.stats.dailyGoal'), value: '2h' },
          { label: t('home.reportCards.studyProgress.stats.weeklyGoal'), value: '10h' }
        ]
      },
      {
        title: t('home.reportCards.learningStreak.title'),
        number: `${currentStreak}d`,
        subtitle: t('home.reportCards.learningStreak.subtitle'),
        gradient: 'green',
        icon: 'trophy.fill',
        stats: [
          { label: t('home.reportCards.learningStreak.stats.currentStreak'), value: `${currentStreak}d` },
          { label: t('home.reportCards.learningStreak.stats.bestStreak'), value: `${bestStreak}d` }
        ]
      },
      {
        title: t('home.reportCards.studyFocus.title'),
        number: '4',
        subtitle: t('home.reportCards.studyFocus.subtitle'),
        gradient: 'orange',
        icon: 'chart.bar',
        stats: [
          { label: t('home.reportCards.studyFocus.stats.topSubject'), value: 'Math' },
          { label: t('home.reportCards.studyFocus.stats.hoursPerSubject'), value: '2.5h' }
        ]
      }
    ];
  };

  const getShimmerStyle = () => {
    const translateX = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
    });

    return {
      transform: [{ translateX }],
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    };
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header 
        title={t('home.welcome', { name: user?.fullName || '' })}
        subtitle={t('home.subtitle')}
      />
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
            progressBackgroundColor={colors.cardAlt}
          />
        }
      >
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Motivational Quote Section */}
          <ThemedView style={[styles.quoteSection, { 
            backgroundColor: isDarkMode ? colors.card : '#F5F5F5'
          }]}>
            {isLoading ? (
              <View style={styles.quoteSkeleton}>
                <View style={[styles.quoteSkeletonLine, { backgroundColor: colors.text + '20' }]} />
                <View style={[styles.quoteSkeletonLine, { backgroundColor: colors.text + '20' }]} />
                <View style={[styles.quoteSkeletonLineShort, { backgroundColor: colors.text + '20' }]} />
                <View style={[styles.quoteSkeletonAuthor, { backgroundColor: colors.text + '20' }]} />
                <Animated.View 
                  style={[
                    styles.shimmer,
                    getShimmerStyle(),
                    { backgroundColor: colors.text + '10' }
                  ]} 
                />
              </View>
            ) : (
              <Animated.View style={{ opacity: fadeAnim }}>
                <ThemedText style={[styles.quoteText, { color: colors.text }]}>
                  "{t(`home.motivationalQuotes.${quoteIndex}.quote`)}"
                </ThemedText>
                <ThemedText style={[styles.quoteAuthor, { color: colors.text + '80' }]}>
                  - {t(`home.motivationalQuotes.${quoteIndex}.author`)}
                </ThemedText>
              </Animated.View>
            )}
          </ThemedView>

          {/* Report Cards Carousel */}
          <View style={styles.carouselSection}>
            <ScrollView 
              ref={scrollViewRef}
              horizontal 
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContainer}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {reportCards.map((card, index) => (
                <ThemedView key={index} style={styles.reportCard}>
                  <LinearGradient
                    colors={GRADIENTS[card.gradient]}
                    style={styles.reportCardContent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.reportCardHeader}>
                      <View style={styles.reportCardIconContainer}>
                        <IconSymbol name={card.icon} size={24} color="#fff" />
                      </View>
                      <ThemedText style={styles.reportCardTitle}>{card.title}</ThemedText>
                      <View style={styles.paginationDots}>
                        {reportCards.map((_, dotIndex) => (
                          <View
                            key={dotIndex}
                            style={[
                              styles.paginationDot,
                              dotIndex === activeIndex && styles.paginationDotActive
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                    <View style={styles.reportCardMain}>
                      <ThemedText style={styles.reportCardNumber}>{card.number}</ThemedText>
                      <ThemedText style={styles.reportCardSubtitle}>{card.subtitle}</ThemedText>
                    </View>
                    <View style={styles.reportCardStats}>
                      {card.stats.map((stat, statIndex) => (
                        <View key={statIndex} style={styles.reportStatItem}>
                          <ThemedText style={styles.reportStatValue}>{stat.value}</ThemedText>
                          <ThemedText style={styles.reportStatLabel}>{stat.label}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </LinearGradient>
                </ThemedView>
              ))}
            </ScrollView>
          </View>

          {/* Quick Actions Grid */}
          <ThemedView style={[styles.gridContainer, { backgroundColor: colors.background }]}>
            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: colors.background }]} 
              onPress={() => router.push('/(tabs)/mcq')}
            >
              <LinearGradient
                colors={isDarkMode ? ['#2D1B4D', '#3D2B6D'] : ['#F3E5F5', '#E1BEE7']}
                style={[styles.gridItemContent, { backgroundColor: colors.card }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.gridIconContainer, { backgroundColor: isDarkMode ? '#4A2B8E30' : '#6B54AE20' }]}>
                  <IconSymbol name="questionmark.circle" size={32} color={colors.tint} />
                </View>
                <View style={styles.gridTextContainer}>
                  <ThemedText numberOfLines={1} style={[styles.gridItemTitle, { color: colors.text }]}>
                    {t('home.quickActions.mcq.title')}
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.gridItemSubtitle, { color: colors.text + '80' }]}>
                    {t('home.quickActions.mcq.subtitle')}
                  </ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: colors.background }]} 
              onPress={() => router.push('/(tabs)/flashcards')}
            >
              <LinearGradient
                colors={isDarkMode ? ['#0A2F0A', '#1A4A1F'] : ['#E8F5E9', '#C8E6C9']}
                style={[styles.gridItemContent, { backgroundColor: colors.card }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.gridIconContainer, { backgroundColor: isDarkMode ? '#2E7D3230' : '#2E7D3220' }]}>
                  <IconSymbol name="rectangle.stack" size={32} color="#2E7D32" />
                </View>
                <View style={styles.gridTextContainer}>
                  <ThemedText numberOfLines={1} style={[styles.gridItemTitle, { color: colors.text }]}>
                    {t('home.quickActions.flashcards.title')}
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.gridItemSubtitle, { color: colors.text + '80' }]}>
                    {t('home.quickActions.flashcards.subtitle')}
                  </ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: colors.background }]} 
              onPress={() => router.push('/(tabs)/homework')}
            >
              <LinearGradient
                colors={isDarkMode ? ['#0A1F2F', '#0D3B71'] : ['#E3F2FD', '#BBDEFB']}
                style={[styles.gridItemContent, { backgroundColor: colors.card }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.gridIconContainer, { backgroundColor: isDarkMode ? '#1976D230' : '#1976D220' }]}>
                  <IconSymbol name="message" size={32} color="#1976D2" />
                </View>
                <View style={styles.gridTextContainer}>
                  <ThemedText numberOfLines={1} style={[styles.gridItemTitle, { color: colors.text }]}>
                    {t('home.quickActions.homework.title')}
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.gridItemSubtitle, { color: colors.text + '80' }]}>
                    {t('home.quickActions.homework.subtitle')}
                  </ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: colors.background }]} 
              onPress={() => router.push('/(tabs)/reports')}
            >
              <LinearGradient
                colors={isDarkMode ? ['#2F1F0A', '#8B4D0A'] : ['#FFF3E0', '#FFE0B2']}
                style={[styles.gridItemContent, { backgroundColor: colors.card }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.gridIconContainer, { backgroundColor: isDarkMode ? '#ED6C0230' : '#ED6C0220' }]}>
                  <IconSymbol name="chart.bar" size={32} color="#ED6C02" />
                </View>
                <View style={styles.gridTextContainer}>
                  <ThemedText numberOfLines={1} style={[styles.gridItemTitle, { color: colors.text }]}>
                    {t('home.quickActions.reports.title')}
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.gridItemSubtitle, { color: colors.text + '80' }]}>
                    {t('home.quickActions.reports.subtitle')}
                  </ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>

          {/* Recent Activity Section */}
          <ThemedView style={[styles.recentActivitySection, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.recentActivity.title')}
            </ThemedText>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <ThemedView 
                  key={index} 
                  style={[styles.activityCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.activityHeader}>
                    <IconSymbol 
                      name={
                        activity.type === 'mcq' ? 'questionmark.circle' : 
                        activity.type === 'flashcard' ? 'rectangle.stack' :
                        activity.type === 'homework' ? 'message' :
                        'clock.fill'
                      } 
                      size={24} 
                      color={colors.tint} 
                    />
                    <ThemedText style={[styles.activityType, { color: colors.text }]}>
                      {t(`home.activityTypes.${activity.type}`)}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.activityDetails, { color: colors.text }]}>
                    {activity.type === 'mcq' && t('home.activityDetails.questions.completed', { count: parseInt(activity.details.match(/\d+/)?.[0] || '0', 10) })}
                    {activity.type === 'flashcard' && t('home.activityDetails.flashcards.reviewed', { count: parseInt(activity.details.match(/\d+/)?.[0] || '0', 10) })}
                    {activity.type === 'homework' && t(`home.activityDetails.homework.${activity.status === 'Completed' ? 'submitted' : 'working'}`)}
                    {activity.type === 'study' && t('home.activityDetails.study.session', { duration: activity.duration })}
                  </ThemedText>
                  <ThemedText style={[styles.activityMeta, { color: colors.text + '80' }]}>
                    {t('home.activityDetails.grade')}: {activity.grade} • {t('home.activityDetails.subject')}: {activity.subject} • {t('home.activityDetails.chapter')}: {activity.chapter}
                    {activity.status && ` • ${t(`home.activityDetails.${activity.status.toLowerCase()}`)}`}
                    {activity.duration && ` • ${t('home.activityDetails.duration', { hours: activity.duration.replace('h', '') })}`}
                  </ThemedText>
                </ThemedView>
              ))
            ) : (
              <ThemedText style={[styles.noActivity, { color: colors.text + '80' }]}>
                {t('home.noActivity')}
              </ThemedText>
            )}
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
  },
  quoteSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    textAlign: 'right',
  },
  quoteSkeleton: {
    position: 'relative',
    overflow: 'hidden',
  },
  quoteSkeletonLine: {
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  quoteSkeletonLineShort: {
    height: 16,
    width: '60%',
    borderRadius: 8,
    marginBottom: 16,
  },
  quoteSkeletonAuthor: {
    height: 14,
    width: '40%',
    borderRadius: 7,
    alignSelf: 'flex-end',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    padding: 2,
    marginTop: 8,
  },
  gridItem: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridItemContent: {
    padding: 16,
    height: 140,
    borderRadius: 16,
    justifyContent: 'flex-start',
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridTextContainer: {
    flex: 1,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridItemSubtitle: {
    fontSize: 13,
  },
  gridDecoration: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
  },
  decorationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 4,
    opacity: 0.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
  },
  activityProgress: {
    height: 2,
    borderRadius: 1,
    marginTop: 8,
    width: '100%',
  },
  activityProgressBar: {
    height: '100%',
    width: '80%',
    borderRadius: 1,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  carouselSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  carouselContainer: {
    paddingHorizontal: 20,
  },
  reportCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginRight: 40,
    marginLeft: -20,
  },
  reportCardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between',
  },
  reportCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  reportCardMain: {
    marginTop: 10,
  },
  reportCardNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  reportCardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  reportCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  reportStatItem: {
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  reportStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 18,
  },
  recentActivitySection: {
    padding: 20,
    marginTop: 20,
    marginBottom: 50,
  },
  activityCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  activityDetails: {
    fontSize: 15,
    marginBottom: 6,
  },
  activityMeta: {
    fontSize: 13,
  },
  noActivity: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
  },
}); 