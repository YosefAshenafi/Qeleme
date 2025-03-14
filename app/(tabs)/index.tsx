import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title="Welcome back, Student!"
        subtitle="Ready to learn something new today?"
      />
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
          {/* Quick Actions Grid */}
          <ThemedView style={styles.gridContainer}>
            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/(tabs)/mcq')}
            >
              <ThemedView style={[styles.gridItemContent, { backgroundColor: '#E3F2FD' }]}>
                <ThemedText style={styles.gridItemTitle}>Practice MCQ</ThemedText>
                <ThemedText style={styles.gridItemSubtitle}>Test your knowledge</ThemedText>
              </ThemedView>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/(tabs)/flashcards')}
            >
              <ThemedView style={[styles.gridItemContent, { backgroundColor: '#F3E5F5' }]}>
                <ThemedText style={styles.gridItemTitle}>Flashcards</ThemedText>
                <ThemedText style={styles.gridItemSubtitle}>Review key concepts</ThemedText>
              </ThemedView>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/(tabs)/homework')}
            >
              <ThemedView style={[styles.gridItemContent, { backgroundColor: '#E8F5E9' }]}>
                <ThemedText style={styles.gridItemTitle}>Homework Help</ThemedText>
                <ThemedText style={styles.gridItemSubtitle}>Get expert assistance</ThemedText>
              </ThemedView>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/(tabs)/reports')}
            >
              <ThemedView style={[styles.gridItemContent, { backgroundColor: '#FFF3E0' }]}>
                <ThemedText style={styles.gridItemTitle}>Progress Report</ThemedText>
                <ThemedText style={styles.gridItemSubtitle}>Track your learning</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>

          {/* Recent Activity Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Recent Activity
            </ThemedText>
            <ThemedView style={styles.activityList}>
              <ThemedView style={styles.activityItem}>
                <ThemedText style={styles.activityTitle}>Math Quiz</ThemedText>
                <ThemedText style={styles.activitySubtitle}>Completed 10 questions</ThemedText>
              </ThemedView>
              <ThemedView style={styles.activityItem}>
                <ThemedText style={styles.activityTitle}>Science Flashcards</ThemedText>
                <ThemedText style={styles.activitySubtitle}>Reviewed 5 cards</ThemedText>
              </ThemedView>
              <ThemedView style={styles.activityItem}>
                <ThemedText style={styles.activityTitle}>English Homework</ThemedText>
                <ThemedText style={styles.activitySubtitle}>Asked 2 questions</ThemedText>
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
  },
  gridItemContent: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'flex-end',
  },
  gridItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
  },
}); 