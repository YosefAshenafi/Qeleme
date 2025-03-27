import { StyleSheet, ScrollView, TouchableOpacity, Animated, View, Image, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

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

type ReportCard = {
  title: string;
  number: string;
  subtitle: string;
  gradient: readonly [string, string, string];
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
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const loadRecentActivities = async () => {
    try {
      const activities = await AsyncStorage.getItem('recentActivities');
      if (activities) {
        const parsedActivities = JSON.parse(activities);
        // Sort by timestamp and take top 5
        const sortedActivities = parsedActivities
          .sort((a: RecentActivity, b: RecentActivity) => b.timestamp - a.timestamp)
          .slice(0, 5);
        setRecentActivities(sortedActivities);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadRecentActivities();
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

  const reportCards: ReportCard[] = [
    {
      title: 'Study Progress',
      number: '85%',
      subtitle: 'Overall Completion',
      gradient: ['#4A2B8E', '#6B54AE', '#8B6BCE'] as const,
      icon: 'chart.bar',
      stats: [
        { label: 'Topics Completed', value: '12/15' },
        { label: 'Study Hours', value: '28h' }
      ]
    },
    {
      title: 'Performance',
      number: '92%',
      subtitle: 'Average Score',
      gradient: ['#0A3D0A', '#1B5E20', '#2E7D32'] as const,
      icon: 'trophy.fill',
      stats: [
        { label: 'Quizzes Taken', value: '24' },
        { label: 'Success Rate', value: '92%' }
      ]
    },
    {
      title: 'Learning Streak',
      number: '7',
      subtitle: 'Days Active',
      gradient: ['#002171', '#0D47A1', '#1976D2'] as const,
      icon: 'clock.fill',
      stats: [
        { label: 'Current Streak', value: '7d' },
        { label: 'Best Streak', value: '12d' }
      ]
    }
  ];

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header 
        title="Welcome back, Yosef!"
        subtitle="Ready to learn something new today?"
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
                  "{motivationalQuotes[quoteIndex].quote}"
                </ThemedText>
                <ThemedText style={[styles.quoteAuthor, { color: colors.text + '80' }]}>
                  - {motivationalQuotes[quoteIndex].author}
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
                    colors={card.gradient}
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
                  <ThemedText numberOfLines={1} style={[styles.gridItemTitle, { color: colors.text }]}>Practice MCQ</ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.gridItemSubtitle, { color: colors.text + '80' }]}>Test your knowledge</ThemedText>
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
                  <ThemedText numberOfLines={1} style={[styles.gridItemTitle, { color: colors.text }]}>Flashcards</ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.gridItemSubtitle, { color: colors.text + '80' }]}>Review key concepts</ThemedText>
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
                  <ThemedText numberOfLines={1} style={[styles.gridItemTitle, { color: colors.text }]}>Homework Help</ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.gridItemSubtitle, { color: colors.text + '80' }]}>Get expert assistance</ThemedText>
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
                  <ThemedText numberOfLines={1} style={[styles.gridItemTitle, { color: colors.text }]}>Progress Report</ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.gridItemSubtitle, { color: colors.text + '80' }]}>Track your learning</ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>

                    {/* Recent Activity Section */}
          <ThemedView style={[styles.recentActivitySection, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</ThemedText>
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
                      {activity.type === 'mcq' ? 'MCQ Quiz' : 
                       activity.type === 'flashcard' ? 'Flashcards' :
                       activity.type === 'homework' ? 'Homework' :
                       'Study Session'}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.activityDetails, { color: colors.text }]}>
                    {activity.details}
                  </ThemedText>
                  <ThemedText style={[styles.activityMeta, { color: colors.text + '80' }]}>
                    {activity.grade} • {activity.subject} • {activity.chapter}
                    {activity.status && ` • ${activity.status}`}
                    {activity.duration && ` • ${activity.duration}`}
                  </ThemedText>
                </ThemedView>
              ))
            ) : (
              <ThemedText style={[styles.noActivity, { color: colors.text + '80' }]}>
                No recent activity. Start learning!
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