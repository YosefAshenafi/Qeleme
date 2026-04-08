import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import RichText from '@/features/common/components/ui/RichText';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';

type FlashcardsFlipCardProps = {
  isDarkMode: boolean;
  cardBackgroundColor: string;
  mutedTextColor: string;
  questionText: string;
  answerText: string;
  frontAnimatedStyle: AnimatedStyle<ViewStyle>;
  backAnimatedStyle: AnimatedStyle<ViewStyle>;
  onReveal: () => void;
};

export function FlashcardsFlipCard({
  isDarkMode,
  cardBackgroundColor,
  mutedTextColor,
  questionText,
  answerText,
  frontAnimatedStyle,
  backAnimatedStyle,
  onReveal,
}: FlashcardsFlipCardProps) {
  const mainTextColor = isDarkMode ? '#FFFFFF' : '#111827';

  return (
    <View style={styles.flashCardStage}>
      <TouchableOpacity onPress={onReveal} activeOpacity={0.95} style={styles.flashCardTouch}>
        <View style={styles.flashCardShadowWrap}>
          <Animated.View style={[styles.flashCardFace, frontAnimatedStyle, { backgroundColor: cardBackgroundColor }]}>
            <ThemedText style={[styles.flashCardMeta, { color: mutedTextColor }]}>CONCEPT MASTERY</ThemedText>
            <ScrollView
              style={styles.flashCardScroll}
              contentContainerStyle={styles.flashCardScrollContent}
              nestedScrollEnabled
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <RichText
                text={questionText}
                style={styles.flashCardTitle}
                color={mainTextColor}
                fontSize={34}
                textAlign="center"
                lineHeight={42}
              />
            </ScrollView>
            <View style={styles.flashTapHintRow}>
              <IconSymbol name={'arrow.2.squarepath' as any} size={16} color={isDarkMode ? '#9CA3AF' : '#9AA3B2'} />
              <ThemedText style={[styles.flashTapHintText, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
                TAP TO FLIP
              </ThemedText>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.flashCardFace,
              styles.flashCardBackFace,
              backAnimatedStyle,
              { backgroundColor: cardBackgroundColor },
            ]}
          >
            <ThemedText style={[styles.flashCardMeta, { color: mutedTextColor }]}>CONCEPT MASTERY</ThemedText>
            <ScrollView
              style={styles.flashCardScroll}
              contentContainerStyle={styles.flashCardScrollContent}
              nestedScrollEnabled
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <RichText
                text={answerText}
                style={styles.flashCardTitle}
                color={mainTextColor}
                fontSize={28}
                textAlign="center"
                lineHeight={36}
              />
            </ScrollView>
            <View style={styles.flashTapHintRow}>
              <IconSymbol name={'arrow.2.squarepath' as any} size={16} color={isDarkMode ? '#9CA3AF' : '#9AA3B2'} />
              <ThemedText style={[styles.flashTapHintText, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
                TAP TO FLIP
              </ThemedText>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
