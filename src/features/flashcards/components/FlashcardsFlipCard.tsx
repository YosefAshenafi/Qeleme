import React, { useEffect } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import RichText from '@/features/common/components/ui/RichText';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 110;

type FlashcardsFlipCardProps = {
  isDarkMode: boolean;
  cardBackgroundColor: string;
  mutedTextColor: string;
  questionText: string;
  answerText: string;
  frontAnimatedStyle: AnimatedStyle<ViewStyle>;
  backAnimatedStyle: AnimatedStyle<ViewStyle>;
  onReveal: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
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
  onSwipeLeft,
  onSwipeRight,
}: FlashcardsFlipCardProps) {
  const mainTextColor = isDarkMode ? '#FFFFFF' : '#111827';

  const translateX = useSharedValue(0);

  // Snap back to center whenever a new card is shown.
  useEffect(() => {
    translateX.value = 0;
  }, [questionText, answerText, translateX]);

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-18, 18])
    .onUpdate((e) => {
      'worklet';
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationX > SWIPE_THRESHOLD && onSwipeRight) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.2, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onSwipeRight)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD && onSwipeLeft) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.2, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const swipeAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: translateX.value }, { rotateZ: `${rotate}deg` }],
    } as any;
  });

  return (
    <View style={styles.flashCardStage}>
      <GestureDetector gesture={pan}>
        <Animated.View style={swipeAnimatedStyle}>
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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
