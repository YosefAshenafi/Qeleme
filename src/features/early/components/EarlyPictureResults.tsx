import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { getColors } from '@/features/common/constants/Colors';
import { EarlyPictureScreenStyles as styles } from './EarlyPictureScreen.styles';

interface EarlyPictureResultsProps {
  colors: ReturnType<typeof getColors>;
  isDarkMode: boolean;
  score: number;
  totalQuestions: number;
  percentage: number;
  hasNextCategory: boolean;
  message: string;
  onHome: () => void;
  onRetry: () => void;
}

export function EarlyPictureResults({
  colors,
  isDarkMode,
  score,
  totalQuestions,
  percentage,
  hasNextCategory,
  message,
  onHome,
  onRetry,
}: EarlyPictureResultsProps) {
  const { t } = useTranslation();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.backButton} onPress={onHome}>
            <IconSymbol name="house.fill" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : undefined }]}>
            {t('mcq.results.title')}
          </ThemedText>
          <View style={styles.headerRight}>
            <LanguageToggle colors={{ ...colors, text: isDarkMode ? '#FFFFFF' : colors.tint }} />
          </View>
        </View>
        <LinearGradient colors={['#2196F3', '#42A5F5', '#00BCD4']} style={styles.resultGradientContainer}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.resultContent}>
              <View style={styles.celebrationEmojiContainer}>
                <Text style={styles.celebrationEmoji}>
                  {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <View style={styles.scoreCircle}>
                  <ThemedText style={[styles.scoreText, { color: '#FFFFFF' }]}>
                    {score}/{totalQuestions}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.percentageContainer}>
                <ThemedText style={styles.percentageText}>{percentage}%</ThemedText>
              </View>
              <View style={styles.messageContainer}>
                <ThemedText style={[styles.messageText, styles.funMessageText]}>{message}</ThemedText>
              </View>
              <View style={styles.starsContainer}>
                {[...Array(5)].map((_, index) => (
                  <IconSymbol
                    key={index}
                    name="star.fill"
                    size={30}
                    color={index < Math.ceil(percentage / 20) ? "#FFD700" : "rgba(255,255,255,0.3)"}
                    style={styles.star}
                  />
                ))}
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.retryButton, hasNextCategory && { backgroundColor: '#FF9800' }]}
                onPress={onRetry}
              >
                <IconSymbol name={hasNextCategory ? "arrow.right.circle.fill" : "chevron.right"} size={24} color="#FFFFFF" />
                <ThemedText style={styles.retryButtonText}>
                  {hasNextCategory ? t('mcq.results.tryOtherQuestions', 'Try other remaining Questions') : t('mcq.results.tryAgain')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={onHome}>
                <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>{i18n.language === 'am' ? 'ያጠናቅቁ' : 'Done'}</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
