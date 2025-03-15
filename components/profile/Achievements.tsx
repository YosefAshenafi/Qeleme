import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface AchievementsProps {
  colors: any;
}

export function Achievements({ colors }: AchievementsProps) {
  const achievements = [
    { title: 'Study Streak Master', description: 'Maintained a 7-day study streak', icon: 'flame.fill', progress: 100 },
    { title: 'MCQ Champion', description: 'Completed 100 MCQs', icon: 'questionmark.circle.fill', progress: 75 },
    { title: 'Flashcard Expert', description: 'Reviewed 500 flashcards', icon: 'rectangle.stack.fill', progress: 60 },
    { title: 'Perfect Score', description: 'Scored 100% on any quiz', icon: 'star.fill', progress: 0 },
    { title: 'Night Owl', description: 'Studied for 2 hours after midnight', icon: 'moon.fill', progress: 0 },
  ];

  return (
    <View style={styles.achievementsContent}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <IconSymbol name="trophy.fill" size={24} color={colors.tint} />
          <Text style={[styles.statValue, { color: colors.text }]}>3</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Achievements Earned</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <IconSymbol name="star.fill" size={24} color={colors.tint} />
          <Text style={[styles.statValue, { color: colors.text }]}>2</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Achievements Left</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Achievements</Text>
      <ScrollView style={styles.achievementsList}>
        {achievements.map((achievement, index) => (
          <View key={index} style={[styles.achievementItem, { backgroundColor: colors.card }]}>
            <View style={[styles.achievementIcon, { backgroundColor: achievement.progress === 100 ? colors.tint : 'rgba(0,0,0,0.05)' }]}>
              <IconSymbol 
                name={achievement.icon as any} 
                size={24} 
                color={achievement.progress === 100 ? colors.background : colors.tint} 
              />
            </View>
            <View style={styles.achievementDetails}>
              <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
              <Text style={[styles.achievementDescription, { color: colors.text }]}>{achievement.description}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.tint,
                      width: `${achievement.progress}%`
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.text }]}>{achievement.progress}%</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  achievementsContent: {
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
  achievementsList: {
    gap: 10,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 15,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  achievementDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressContainer: {
    alignItems: 'flex-end',
    gap: 5,
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 