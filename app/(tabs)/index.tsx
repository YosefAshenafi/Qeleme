import { StyleSheet, ScrollView, TouchableOpacity, Animated, View, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState, useRef } from 'react';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // Full width minus padding
const CARD_SPACING = 16;

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const reportCards = [
    {
      title: 'Study Progress',
      number: '85%',
      subtitle: 'Overall Completion',
      gradient: ['#6B54AE', '#8B6BCE', '#A78BFA'] as const,
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
      gradient: ['#2E7D32', '#4CAF50', '#81C784'] as const,
      icon: 'star',
      stats: [
        { label: 'Quizzes Taken', value: '24' },
        { label: 'Success Rate', value: '92%' }
      ]
    },
    {
      title: 'Learning Streak',
      number: '7',
      subtitle: 'Days Active',
      gradient: ['#1976D2', '#2196F3', '#64B5F6'] as const,
      icon: 'flame',
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
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title="Welcome back, Student!"
        subtitle="Ready to learn something new today?"
      />
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
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
          <ThemedView style={styles.gridContainer}>
            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/(tabs)/mcq')}
            >
              <LinearGradient
                colors={['#F3E5F5', '#E1BEE7']}
                style={styles.gridItemContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gridIconContainer}>
                  <IconSymbol name="questionmark.circle" size={32} color="#6B54AE" />
                </View>
                <View style={styles.gridTextContainer}>
                  <ThemedText style={styles.gridItemTitle}>Practice MCQ</ThemedText>
                  <ThemedText style={styles.gridItemSubtitle}>Test your knowledge</ThemedText>
                </View>
                <View style={styles.gridDecoration}>
                  <View style={[styles.decorationDot, { backgroundColor: '#6B54AE' }]} />
                  <View style={[styles.decorationDot, { backgroundColor: '#6B54AE' }]} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/(tabs)/flashcards')}
            >
              <LinearGradient
                colors={['#E8F5E9', '#C8E6C9']}
                style={styles.gridItemContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gridIconContainer}>
                  <IconSymbol name="rectangle.stack" size={32} color="#2E7D32" />
                </View>
                <View style={styles.gridTextContainer}>
                  <ThemedText style={styles.gridItemTitle}>Flashcards</ThemedText>
                  <ThemedText style={styles.gridItemSubtitle}>Review key concepts</ThemedText>
                </View>
                <View style={styles.gridDecoration}>
                  <View style={[styles.decorationDot, { backgroundColor: '#2E7D32' }]} />
                  <View style={[styles.decorationDot, { backgroundColor: '#2E7D32' }]} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/(tabs)/homework')}
            >
              <LinearGradient
                colors={['#E3F2FD', '#BBDEFB']}
                style={styles.gridItemContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gridIconContainer}>
                  <IconSymbol name="message" size={32} color="#1976D2" />
                </View>
                <View style={styles.gridTextContainer}>
                  <ThemedText style={styles.gridItemTitle}>Homework Help</ThemedText>
                  <ThemedText style={styles.gridItemSubtitle}>Get expert assistance</ThemedText>
                </View>
                <View style={styles.gridDecoration}>
                  <View style={[styles.decorationDot, { backgroundColor: '#1976D2' }]} />
                  <View style={[styles.decorationDot, { backgroundColor: '#1976D2' }]} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/(tabs)/reports')}
            >
              <LinearGradient
                colors={['#FFF3E0', '#FFE0B2']}
                style={styles.gridItemContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gridIconContainer}>
                  <IconSymbol name="chart.bar" size={32} color="#ED6C02" />
                </View>
                <View style={styles.gridTextContainer}>
                  <ThemedText style={styles.gridItemTitle}>Progress Report</ThemedText>
                  <ThemedText style={styles.gridItemSubtitle}>Track your learning</ThemedText>
                </View>
                <View style={styles.gridDecoration}>
                  <View style={[styles.decorationDot, { backgroundColor: '#ED6C02' }]} />
                  <View style={[styles.decorationDot, { backgroundColor: '#ED6C02' }]} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>

          {/* Today's Schedule */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="title" style={styles.sectionTitle}>
                Today's Schedule
              </ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.seeAllButton}>See All</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedView style={styles.scheduleList}>
              <ThemedView style={styles.scheduleItem}>
                <View style={[styles.scheduleTime, { backgroundColor: '#F3E5F5' }]}>
                  <ThemedText style={[styles.timeText, { color: '#6B54AE' }]}>09:00</ThemedText>
                  <ThemedText style={[styles.durationText, { color: '#6B54AE' }]}>1h</ThemedText>
                </View>
                <View style={styles.scheduleContent}>
                  <ThemedText style={styles.scheduleTitle}>Mathematics Class</ThemedText>
                  <ThemedText style={styles.scheduleSubtitle}>Chapter 5: Algebra</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#666" />
              </ThemedView>
              <ThemedView style={styles.scheduleItem}>
                <View style={[styles.scheduleTime, { backgroundColor: '#E8F5E9' }]}>
                  <ThemedText style={[styles.timeText, { color: '#2E7D32' }]}>11:00</ThemedText>
                  <ThemedText style={[styles.durationText, { color: '#2E7D32' }]}>1.5h</ThemedText>
                </View>
                <View style={styles.scheduleContent}>
                  <ThemedText style={styles.scheduleTitle}>Science Lab</ThemedText>
                  <ThemedText style={styles.scheduleSubtitle}>Physics Experiment</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#666" />
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Recent Activity Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="title" style={styles.sectionTitle}>
                Recent Activity
              </ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.seeAllButton}>See All</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedView style={styles.activityList}>
              <ThemedView style={styles.activityItem}>
                <ThemedView style={[styles.activityIcon, { backgroundColor: '#F3E5F5' }]}>
                  <IconSymbol name="list.bullet.clipboard" size={24} color="#6B54AE" />
                </ThemedView>
                <ThemedView style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>Math Quiz</ThemedText>
                  <ThemedText style={styles.activitySubtitle}>Completed 10 questions</ThemedText>
                </ThemedView>
                <View style={[styles.activityBadge, { backgroundColor: '#6B54AE' }]}>
                  <ThemedText style={styles.activityBadgeText}>New</ThemedText>
                </View>
              </ThemedView>
              <ThemedView style={styles.activityItem}>
                <ThemedView style={[styles.activityIcon, { backgroundColor: '#E8F5E9' }]}>
                  <IconSymbol name="rectangle.stack" size={24} color="#2E7D32" />
                </ThemedView>
                <ThemedView style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>Science Flashcards</ThemedText>
                  <ThemedText style={styles.activitySubtitle}>Reviewed 5 cards</ThemedText>
                </ThemedView>
                <View style={[styles.activityBadge, { backgroundColor: '#2E7D32' }]}>
                  <ThemedText style={styles.activityBadgeText}>2h ago</ThemedText>
                </View>
              </ThemedView>
              <ThemedView style={styles.activityItem}>
                <ThemedView style={[styles.activityIcon, { backgroundColor: '#E3F2FD' }]}>
                  <IconSymbol name="message" size={24} color="#1976D2" />
                </ThemedView>
                <ThemedView style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>English Homework</ThemedText>
                  <ThemedText style={styles.activitySubtitle}>Asked 2 questions</ThemedText>
                </ThemedView>
                <View style={[styles.activityBadge, { backgroundColor: '#1976D2' }]}>
                  <ThemedText style={styles.activityBadgeText}>5h ago</ThemedText>
                </View>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gridItemContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gridTextContainer: {
    gap: 4,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  gridItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  gridDecoration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  decorationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.5,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#6B54AE',
    fontWeight: '500',
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scheduleTime: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  carouselSection: {
    marginTop: 8,
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
}); 