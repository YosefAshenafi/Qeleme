import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { ThemedText } from '@/features/common/components/ThemedText';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';

type FlashcardsSessionProgressProps = {
  isDarkMode: boolean;
  cardAltColor: string;
  currentIndex: number;
  totalCards: number;
  progressBarStyle: AnimatedStyle<ViewStyle>;
};

export function FlashcardsSessionProgress({
  isDarkMode,
  cardAltColor,
  currentIndex,
  totalCards,
  progressBarStyle,
}: FlashcardsSessionProgressProps) {
  return (
    <View style={styles.flashProgressBlock}>
      <View style={styles.flashProgressRow}>
        <ThemedText style={[styles.flashProgressLabel, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
          PROGRESS
        </ThemedText>
        <View style={styles.flashProgressCountRow}>
          <ThemedText style={[styles.flashProgressCount, { color: '#0F4BD7' }]}>
            {currentIndex + 1} / {totalCards}
          </ThemedText>
          <ThemedText style={[styles.flashProgressCardsSuffix, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
            cards
          </ThemedText>
        </View>
      </View>
      <View style={[styles.flashProgressTrack, { backgroundColor: isDarkMode ? cardAltColor : '#E5E7EB' }]}>
        <Animated.View
          style={[styles.flashProgressFill, { backgroundColor: '#0F4BD7' }, progressBarStyle]}
        />
      </View>
    </View>
  );
}
