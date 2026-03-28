import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { KG_DESIGN_TOKENS } from '../../constants/DesignTokens';
import { IconSymbol } from '@/shared/components/ui/IconSymbol';

const { width } = Dimensions.get('window');

interface ProgressSectionProps {
  streak: number;
  goal: number; // 0-100
  isDarkMode?: boolean;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({ streak, goal, isDarkMode }) => {
  const colors = KG_DESIGN_TOKENS.colors;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : colors.onSurface }]}>
        Your Star Progress
      </Text>
      
      <View style={styles.content}>
        <View style={[styles.item, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.itemRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                <IconSymbol name="bolt.fill" size={24} color="white" />
            </View>
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, { color: colors.onSurface }]}>Daily Streak</Text>
              <Text style={styles.itemSubtitle}>{streak} Days in a row!</Text>
            </View>
          </View>
          <Text style={[styles.streakNumber, { color: colors.primary }]}>{streak.toString().padStart(2, '0')}</Text>
        </View>

        <View style={[styles.itemScroll, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.goalHeader}>
            <Text style={[styles.itemTitle, { color: colors.onSurface }]}>Weekly Goal</Text>
            <Text style={[styles.goalPercent, { color: colors.primary }]}>{goal}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceContainerHighest }]}>
            <View style={[styles.progressFill, { width: `${goal}%`, backgroundColor: colors.primary, shadowColor: colors.primary }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  content: {
    gap: 16,
  },
  item: {
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemSubtitle: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  itemScroll: {
    padding: 24,
    borderRadius: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalPercent: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
});
