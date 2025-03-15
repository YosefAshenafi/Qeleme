import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface StudyHistoryProps {
  colors: any;
}

export function StudyHistory({ colors }: StudyHistoryProps) {
  const recentActivities = [
    { date: 'Today', activity: 'Completed Physics MCQs', duration: '45 mins', icon: 'questionmark.circle.fill' },
    { date: 'Yesterday', activity: 'Reviewed Chemistry Notes', duration: '30 mins', icon: 'doc.text.fill' },
    { date: '2 days ago', activity: 'Math Practice Problems', duration: '1 hour', icon: 'function' },
    { date: '3 days ago', activity: 'Biology Flashcards', duration: '25 mins', icon: 'rectangle.stack.fill' },
  ];

  return (
    <View style={styles.studyHistoryContent}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <IconSymbol name="clock.fill" size={24} color={colors.tint} />
          <Text style={[styles.statValue, { color: colors.text }]}>2.5h</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Today's Study Time</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <IconSymbol name="calendar" size={24} color={colors.tint} />
          <Text style={[styles.statValue, { color: colors.text }]}>5</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Study Streak</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activities</Text>
      <ScrollView style={styles.activitiesList}>
        {recentActivities.map((activity, index) => (
          <View key={index} style={[styles.activityItem, { backgroundColor: colors.card }]}>
            <View style={styles.activityIcon}>
              <IconSymbol name={activity.icon as any} size={24} color={colors.tint} />
            </View>
            <View style={styles.activityDetails}>
              <Text style={[styles.activityText, { color: colors.text }]}>{activity.activity}</Text>
              <Text style={[styles.activityDate, { color: colors.text }]}>{activity.date}</Text>
            </View>
            <Text style={[styles.activityDuration, { color: colors.text }]}>{activity.duration}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  studyHistoryContent: {
    gap: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  activitiesList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 15,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  activityDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 