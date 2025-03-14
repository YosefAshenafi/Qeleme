import { StyleSheet, ScrollView, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample data - replace with actual data from your backend
const reportData = {
  overallProgress: {
    percentage: 85,
    totalTopics: 15,
    completedTopics: 12,
    studyHours: 28,
  },
  performance: {
    averageScore: 92,
    quizzesTaken: 24,
    successRate: 92,
    improvement: '+5%',
  },
  learningStreak: {
    currentStreak: 7,
    bestStreak: 12,
    totalDaysActive: 45,
  },
  subjectBreakdown: [
    { subject: 'Mathematics', progress: 90, score: 95 },
    { subject: 'Physics', progress: 85, score: 88 },
    { subject: 'Chemistry', progress: 80, score: 92 },
  ],
  recentActivity: [
    { type: 'quiz', subject: 'Mathematics', score: 95, date: '2024-03-20' },
    { type: 'study', subject: 'Physics', duration: '2h', date: '2024-03-19' },
    { type: 'homework', subject: 'Chemistry', status: 'Completed', date: '2024-03-18' },
  ],
};

export default function ReportsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Learning Reports" />
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
          {/* Overall Progress Card */}
          <ThemedView style={styles.card}>
            <LinearGradient
              colors={['#6B54AE', '#8B6BCE', '#A78BFA']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
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
          <ThemedView style={styles.card}>
            <LinearGradient
              colors={['#2E7D32', '#4CAF50', '#81C784']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
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
          <ThemedView style={styles.card}>
            <LinearGradient
              colors={['#1976D2', '#2196F3', '#64B5F6']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
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
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Subject Breakdown</ThemedText>
            {reportData.subjectBreakdown.map((subject, index) => (
              <ThemedView key={index} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <ThemedText style={styles.subjectName}>{subject.subject}</ThemedText>
                  <ThemedText style={styles.subjectScore}>{subject.score}%</ThemedText>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${subject.progress}%` }]} />
                </View>
                <ThemedText style={styles.progressText}>{subject.progress}% Complete</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          {/* Recent Activity */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
            {reportData.recentActivity.map((activity, index) => (
              <ThemedView key={index} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <IconSymbol 
                    name={activity.type === 'quiz' ? 'message.fill' : 
                          activity.type === 'study' ? 'house.fill' : 'message'} 
                    size={24} 
                    color="#6B54AE" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>
                    {activity.subject} - {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </ThemedText>
                  <ThemedText style={styles.activitySubtitle}>
                    {activity.type === 'quiz' ? `Score: ${activity.score}%` :
                     activity.type === 'study' ? `Duration: ${activity.duration}` :
                     `Status: ${activity.status}`}
                  </ThemedText>
                </View>
                <ThemedText style={styles.activityDate}>{activity.date}</ThemedText>
              </ThemedView>
            ))}
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#333',
    marginBottom: 8,
  },
  subjectCard: {
    backgroundColor: '#F8F9FA',
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
    color: '#333',
  },
  subjectScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B54AE',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B54AE',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
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
  activityDate: {
    fontSize: 14,
    color: '#999',
  },
}); 