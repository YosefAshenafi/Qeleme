import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/features/common/components/ThemedView';
import { BRAND_BLUE, SESSION_RESULT_RING_SIZE, SESSION_RESULT_RING_STROKE } from '@/features/practice/constants/practiceUi';
import { PracticeScreenStyles as styles } from './PracticeScreen.styles';

type ResultCopy = { title: string; subtitle: string };

type PracticeSessionResultsPanelProps = {
  backgroundColor: string;
  textColor: string;
  isDarkMode: boolean;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  formattedTime: string;
  resultCopy: ResultCopy;
  performanceLabel: string;
  retryLabel: string;
  doneLabel: string;
  onRetry: () => void;
  onDone: () => void;
};

export function PracticeSessionResultsPanel({
  backgroundColor,
  textColor,
  isDarkMode,
  correctCount,
  incorrectCount,
  accuracy,
  formattedTime,
  resultCopy,
  performanceLabel,
  retryLabel,
  doneLabel,
  onRetry,
  onDone,
}: PracticeSessionResultsPanelProps) {
  const ringSize = SESSION_RESULT_RING_SIZE;
  const ringStroke = SESSION_RESULT_RING_STROKE;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (accuracy / 100) * ringCircumference;

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.safeArea, { backgroundColor }]}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView contentContainerStyle={styles.resultScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHero}>
            <View style={[styles.resultPill, { backgroundColor: isDarkMode ? '#1F2A44' : '#E9EEFF' }]}>
              <Text style={[styles.resultPillText, { color: BRAND_BLUE }]}>SESSION FINALIZED</Text>
            </View>

            <Text style={[styles.resultHeadline, { color: textColor }]}>{resultCopy.title}</Text>
            <Text style={[styles.resultSubhead, { color: isDarkMode ? '#C7CDD8' : '#6B7280' }]}>
              {resultCopy.subtitle}
            </Text>
          </View>

          <View style={styles.resultRingWrap}>
            <View style={styles.resultRingShadow}>
              <Svg width={ringSize} height={ringSize}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={isDarkMode ? '#2A3140' : '#E5E7EB'}
                  strokeWidth={ringStroke}
                  fill="none"
                  strokeLinecap="round"
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={BRAND_BLUE}
                  strokeWidth={ringStroke}
                  fill="none"
                  strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  rotation={-90}
                  originX={ringSize / 2}
                  originY={ringSize / 2}
                />
              </Svg>

              <View style={styles.resultRingCenter}>
                <Text style={[styles.resultRingPercent, { color: BRAND_BLUE }]}>{accuracy}%</Text>
                <Text style={[styles.resultRingLabel, { color: isDarkMode ? '#C7CDD8' : '#6B7280' }]}>
                  ACCURACY
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resultStatsGrid}>
            <View
              style={[
                styles.resultStatCard,
                { backgroundColor: isDarkMode ? '#141821' : '#FFFFFF', borderColor: isDarkMode ? '#273043' : '#E5E7EB' },
              ]}
            >
              <View style={[styles.resultStatIconBox, { backgroundColor: isDarkMode ? '#0E2A17' : '#E9FBEF' }]}>
                <Ionicons name="checkmark" size={20} color="#16A34A" />
              </View>
              <View style={styles.resultStatTextCol}>
                <Text style={[styles.resultStatValue, { color: textColor }]}>
                  {String(correctCount).padStart(2, '0')}
                </Text>
                <Text style={[styles.resultStatLabel, { color: isDarkMode ? '#C7CDD8' : '#6B7280' }]}>CORRECT</Text>
              </View>
            </View>

            <View
              style={[
                styles.resultStatCard,
                { backgroundColor: isDarkMode ? '#141821' : '#FFFFFF', borderColor: isDarkMode ? '#273043' : '#E5E7EB' },
              ]}
            >
              <View style={[styles.resultStatIconBox, { backgroundColor: isDarkMode ? '#2B1215' : '#FCE7EA' }]}>
                <Ionicons name="close" size={18} color="#DC2626" />
              </View>
              <View style={styles.resultStatTextCol}>
                <Text style={[styles.resultStatValue, { color: textColor }]}>
                  {String(incorrectCount).padStart(2, '0')}
                </Text>
                <Text style={[styles.resultStatLabel, { color: isDarkMode ? '#C7CDD8' : '#6B7280' }]}>INCORRECT</Text>
              </View>
            </View>

            <View
              style={[
                styles.resultStatCard,
                { backgroundColor: isDarkMode ? '#141821' : '#FFFFFF', borderColor: isDarkMode ? '#273043' : '#E5E7EB' },
              ]}
            >
              <View style={[styles.resultStatIconBox, { backgroundColor: isDarkMode ? '#0D2233' : '#E6F0FF' }]}>
                <Ionicons name="time-outline" size={20} color={BRAND_BLUE} />
              </View>
              <View style={styles.resultStatTextCol}>
                <Text style={[styles.resultStatValue, { color: textColor }]}>{formattedTime}</Text>
                <Text style={[styles.resultStatLabel, { color: isDarkMode ? '#C7CDD8' : '#6B7280' }]}>TIME</Text>
              </View>
            </View>

            <View
              style={[
                styles.resultStatCard,
                styles.resultMasteryCard,
                { backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE },
              ]}
            >
              <View style={[styles.resultStatIconBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                <Ionicons name="trending-up-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.resultStatTextCol}>
                <Text style={[styles.resultMasteryTitle, { color: '#FFFFFF' }]}>{accuracy}%</Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  style={[styles.resultMasterySub, { color: 'rgba(255,255,255,0.85)' }]}
                >
                  {performanceLabel}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resultButtonsWrap}>
            <TouchableOpacity
              style={[styles.resultButton, styles.resultButtonSecondary, { backgroundColor: isDarkMode ? '#2A3140' : '#E5E7EB' }]}
              onPress={onRetry}
            >
              <Text style={[styles.resultButtonSecondaryText, { color: BRAND_BLUE }]}>{retryLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resultButton, styles.resultButtonPrimary, { backgroundColor: BRAND_BLUE }]} onPress={onDone}>
              <Text style={styles.resultButtonPrimaryText}>{doneLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
