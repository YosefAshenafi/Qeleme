import React from 'react';
import { Image, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { ThemedView } from '@/features/common/components/ThemedView';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import {
  SESSION_RESULTS_RING_SIZE,
  SESSION_RESULTS_STROKE_WIDTH,
} from '@/features/flashcards/constants/flashcardsUi';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';

type FlashcardsSessionResultsProps = {
  isDarkMode: boolean;
  backgroundColor: string;
  sessionResultsTitle: string;
  accuracyLabel: string;
  masteredLabel: string;
  persistenceLabel: string;
  stillLearningLabel: string;
  retryLabel: string;
  doneLabel: string;
  masteredCount: number;
  stillLearningCount: number;
  masteredPct: number;
  onRetry: () => void;
  onDone: () => void;
};

export function FlashcardsSessionResults({
  isDarkMode,
  backgroundColor,
  sessionResultsTitle,
  accuracyLabel,
  masteredLabel,
  persistenceLabel,
  stillLearningLabel,
  retryLabel,
  doneLabel,
  masteredCount,
  stillLearningCount,
  masteredPct,
  onRetry,
  onDone,
}: FlashcardsSessionResultsProps) {
  const ringSize = SESSION_RESULTS_RING_SIZE;
  const stroke = SESSION_RESULTS_STROKE_WIDTH;
  const r = (ringSize - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dashOffset = c - (masteredPct / 100) * c;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]} edges={['top', 'left', 'right']}>
      <StatusBar translucent={false} backgroundColor="#FFFFFF" barStyle="dark-content" />
      <ThemedView style={[styles.container, { backgroundColor: isDarkMode ? backgroundColor : '#F4F6FA' }]}>
        <View style={styles.flashResultsHeader}>
          <Image source={require('@/assets/images/logo.png')} style={styles.flashResultsBrand} resizeMode="contain" />
          <ThemedText style={styles.flashResultsTitle}>{sessionResultsTitle}</ThemedText>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Profile" style={styles.flashResultsProfileBtn}>
            <IconSymbol name={'person.crop.circle' as any} size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.flashResultsScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.flashRingWrap}>
            <Svg width={ringSize} height={ringSize}>
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={r}
                stroke="#E5E7EB"
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
              />
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={r}
                stroke="#0F4BD7"
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${c} ${c}`}
                strokeDashoffset={dashOffset}
                rotation={-90}
                originX={ringSize / 2}
                originY={ringSize / 2}
              />
            </Svg>

            <View style={styles.flashRingCenter}>
              <ThemedText style={styles.flashRingPct}>{masteredPct}%</ThemedText>
              <ThemedText style={styles.flashRingSub}>MASTERED</ThemedText>
            </View>

            <View style={styles.flashRingBadge}>
              <IconSymbol name={'star.fill' as any} size={14} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.flashResultCards}>
            <View style={styles.flashResultCard}>
              <View style={[styles.flashResultIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <IconSymbol name={'checkmark' as any} size={16} color="#10B981" />
              </View>
              <View style={styles.flashResultCardText}>
                <ThemedText style={styles.flashResultCardLabel}>{accuracyLabel}</ThemedText>
                <ThemedText style={styles.flashResultCardValue}>
                  {masteredCount} {masteredLabel}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
            </View>

            <View style={styles.flashResultCard}>
              <View style={[styles.flashResultIcon, { backgroundColor: 'rgba(245, 158, 11, 0.14)' }]}>
                <IconSymbol name={'exclamationmark' as any} size={14} color="#F59E0B" />
              </View>
              <View style={styles.flashResultCardText}>
                <ThemedText style={styles.flashResultCardLabel}>{persistenceLabel}</ThemedText>
                <ThemedText style={styles.flashResultCardValue}>
                  {stillLearningCount} {stillLearningLabel}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
            </View>
          </View>

          <View style={styles.flashResultButtons}>
            <TouchableOpacity style={styles.flashRetryBtn} onPress={onRetry}>
              <IconSymbol name={'arrow.counterclockwise' as any} size={18} color="#6B7280" />
              <ThemedText style={styles.flashRetryText}>{retryLabel}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flashDoneBtn} onPress={onDone}>
              <ThemedText style={styles.flashDoneText}>{doneLabel}</ThemedText>
              <IconSymbol name={'checkmark' as any} size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
