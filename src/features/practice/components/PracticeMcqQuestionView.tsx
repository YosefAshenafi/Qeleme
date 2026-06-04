import React from 'react';
import { ScrollView, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RichText from '@/features/common/components/ui/RichText';
import { ThemedText } from '@/features/common/components/ThemedText';
import type { NationalExamAPIResponse, Option } from '@/features/common/services/practiceService';
import { BRAND_BLUE } from '@/features/practice/constants/practiceUi';
import { PracticeScreenStyles as styles } from './PracticeScreen.styles';

type ColorTokens = {
  background: string;
  text: string;
  cardAlt: string;
  border: string;
  tabIconDefault: string;
  warning: string;
};

type PracticeMcqQuestionViewProps = {
  colors: ColorTokens;
  isDarkMode: boolean;
  sessionProgressLabel: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeHours: number;
  timeMinutes: number;
  timeSeconds: number;
  hoursLabel: string;
  minutesLabel: string;
  secondsLabel: string;
  showAnswerMessage: boolean;
  selectAnswerHint: string;
  currentQuestion: NationalExamAPIResponse | undefined;
  selectedAnswer: string | null;
  showExplanation: boolean;
  getOptionStyle: (optionId: string) => ViewStyle[];
  onSelectOption: (optionId: string) => void;
  onAdvance: () => void;
  onPrevious: () => void;
  reviewLaterLabel: string;
  finishLabel: string;
  nextLabel: string;
  isLastQuestion: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
};

export function PracticeMcqQuestionView({
  colors,
  isDarkMode,
  sessionProgressLabel,
  currentQuestionIndex,
  totalQuestions,
  timeHours,
  timeMinutes,
  timeSeconds,
  hoursLabel,
  minutesLabel,
  secondsLabel,
  showAnswerMessage,
  selectAnswerHint,
  currentQuestion,
  selectedAnswer,
  showExplanation,
  getOptionStyle,
  onSelectOption,
  onAdvance,
  onPrevious,
  reviewLaterLabel,
  finishLabel,
  nextLabel,
  isLastQuestion,
  scrollViewRef,
}: PracticeMcqQuestionViewProps) {
  return (
    <>
      <View style={styles.sessionProgressSection}>
        <View style={styles.sessionProgressTopRow}>
          <ThemedText style={[styles.sessionProgressLabel, { color: isDarkMode ? '#FFFFFF' : '#6B7280' }]}>
            {sessionProgressLabel}
          </ThemedText>
          <ThemedText style={[styles.sessionProgressCount, { color: isDarkMode ? '#FFFFFF' : BRAND_BLUE }]}>
            {currentQuestionIndex + 1} of {totalQuestions}
          </ThemedText>
        </View>

        <View style={[styles.sessionProgressBarTrack, { backgroundColor: colors.cardAlt }]}>
          <View
            style={[
              styles.sessionProgressBarFill,
              {
                backgroundColor: BRAND_BLUE,
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              },
            ]}
          />
        </View>

        <View style={styles.timeBoxesRow}>
          <View style={[styles.timeBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <ThemedText style={[styles.timeValueText, { color: isDarkMode ? '#FFFFFF' : BRAND_BLUE }]}>{String(timeHours).padStart(2, '0')}</ThemedText>
            <ThemedText style={[styles.timeLabelText, { color: colors.tabIconDefault }]}>{hoursLabel}</ThemedText>
          </View>
          <View style={[styles.timeBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <ThemedText style={[styles.timeValueText, { color: isDarkMode ? '#FFFFFF' : BRAND_BLUE }]}>{String(timeMinutes).padStart(2, '0')}</ThemedText>
            <ThemedText style={[styles.timeLabelText, { color: colors.tabIconDefault }]}>{minutesLabel}</ThemedText>
          </View>
          <View style={[styles.timeBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <ThemedText style={[styles.timeValueText, { color: isDarkMode ? '#FFFFFF' : BRAND_BLUE }]}>{String(timeSeconds).padStart(2, '0')}</ThemedText>
            <ThemedText style={[styles.timeLabelText, { color: colors.tabIconDefault }]}>{secondsLabel}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.questionModeBody}>
        {showAnswerMessage && (
          <View
            style={{
              backgroundColor: colors.warning + '20',
              borderLeftWidth: 4,
              borderLeftColor: colors.warning,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginTop: 8,
              borderRadius: 8,
              marginHorizontal: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 14, color: colors.warning, marginRight: 6 }}>⚠️</ThemedText>
              <ThemedText style={{ fontSize: 13, fontWeight: '500', color: colors.warning, flex: 1 }}>
                {selectAnswerHint}
              </ThemedText>
            </View>
          </View>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.questionScrollContent}
        >
          <View style={styles.questionContainer}>
            <RichText
              text={currentQuestion?.question || 'Question not available'}
              style={styles.questionText}
              color={colors.text}
              fontSize={20}
              textAlign="left"
              lineHeight={28}
              image_url={currentQuestion?.image_url}
            />
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion?.options
              ?.filter((option: Option) => option.text && option.text.trim() !== '')
              ?.map((option: Option, index: number) => {
                const optionId = String(option.id);
                const isCorrect = !!option.isCorrect;
                const isSelected = selectedAnswer === optionId;
                return (
                  <TouchableOpacity
                    key={optionId}
                    style={[
                      styles.optionContainer,
                      { backgroundColor: colors.background, borderColor: isDarkMode ? '#FFFFFF' : colors.border },
                      ...getOptionStyle(optionId),
                    ]}
                    onPress={() => onSelectOption(optionId)}
                    disabled={!!selectedAnswer}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionId,
                          {
                            backgroundColor: showExplanation && isCorrect
                              ? BRAND_BLUE
                              : showExplanation && isSelected && !isCorrect
                                ? 'rgba(244, 67, 54, 0.10)'
                                : colors.background,
                            borderColor: showExplanation && isCorrect
                              ? BRAND_BLUE
                              : showExplanation && isSelected && !isCorrect
                                ? '#F44336'
                                : isDarkMode
                                  ? '#FFFFFF'
                                  : colors.border,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.optionIdText,
                            {
                              color: showExplanation && isCorrect
                                ? '#FFFFFF'
                                : showExplanation && isSelected && !isCorrect
                                  ? '#F44336'
                                  : colors.tabIconDefault,
                            },
                          ]}
                        >
                          {String.fromCharCode(65 + index)}
                        </ThemedText>
                      </View>
                      <RichText
                        text={option.text}
                        style={styles.optionText}
                        color={colors.text}
                        fontSize={16}
                        textAlign="left"
                        lineHeight={22}
                      />
                    </View>

                    {showExplanation && isCorrect && (
                      <View style={styles.optionCheckIcon} pointerEvents="none">
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }) || (
              <View
                style={[
                  styles.optionContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: isDarkMode ? '#FFFFFF' : colors.border,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <ThemedText style={[styles.optionText, { color: colors.text, opacity: 0.7 }]}>
                  No options available
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={[styles.bottomActionBar, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.bottomSecondaryButton,
              { opacity: currentQuestionIndex > 0 ? 1 : 0.55, backgroundColor: colors.cardAlt, borderColor: colors.border },
            ]}
            onPress={onPrevious}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons name="arrow-back" size={20} color={BRAND_BLUE} />
            <ThemedText style={styles.bottomSecondaryButtonText}>{reviewLaterLabel}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomPrimaryButton, { opacity: selectedAnswer ? 1 : 0.55 }]}
            onPress={onAdvance}
          >
            <ThemedText style={styles.bottomPrimaryButtonText}>{isLastQuestion ? finishLabel : nextLabel}</ThemedText>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
