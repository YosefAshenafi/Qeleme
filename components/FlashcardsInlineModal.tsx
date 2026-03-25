import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import RichText from '@/components/ui/RichText';
import type { Flashcard } from '@/services/flashcardService';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = Math.min(Math.round(SCREEN_HEIGHT * 0.56), Math.round(CARD_WIDTH * 1.12));

type Props = {
  visible: boolean;
  flashcards: Flashcard[];
  subjectLabel: string;
  chapterLabel: string;
  onClose: () => void;
};

export function FlashcardsInlineModal({
  visible,
  flashcards,
  subjectLabel,
  chapterLabel,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const revealAnimation = useSharedValue(0);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const currentCard = flashcards.length > currentIndex ? flashcards[currentIndex] : null;

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setIsRevealed(false);
      setCheckedIds(new Set());
      revealAnimation.value = withSpring(0, { damping: 12, stiffness: 80, mass: 0.8 });
    }
  }, [visible, flashcards]);

  useEffect(() => {
    if (currentCard) {
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, { damping: 12, stiffness: 80, mass: 0.8 });
    }
  }, [currentCard]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [0, 180]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    return {
      transform: [{ perspective: 2000 }, { rotateY: `${rotateY}deg` }, { scale }],
      shadowOpacity: interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [180, 360]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    return {
      transform: [{ perspective: 2000 }, { rotateY: `${rotateY}deg` }, { scale }],
      shadowOpacity: interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]),
    };
  });

  const handleReveal = () => {
    setIsRevealed(!isRevealed);
    revealAnimation.value = withSpring(isRevealed ? 0 : 1, {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    });
  };

  if (!visible || flashcards.length === 0) return null;

  const atEnd = currentIndex >= flashcards.length - 1;
  const progressPct = useMemo(() => {
    if (!flashcards.length) return 0;
    return ((currentIndex + 1) / flashcards.length) * 100;
  }, [currentIndex, flashcards.length]);

  const handleNext = () => {
    if (atEnd) {
      onClose();
      return;
    }
    setCurrentIndex((i) => Math.min(flashcards.length - 1, i + 1));
  };

  const handleGotIt = () => {
    if (currentCard?.id) {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        next.add(currentCard.id);
        return next;
      });
    }
    handleNext();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? colors.background : '#F4F6FA' }]} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <View style={styles.brandPill}>
            <ThemedText style={styles.brandText}>M+</ThemedText>
          </View>
          <ThemedText style={[styles.topTitle, { color: colors.tint }]} numberOfLines={1}>
            {subjectLabel}{chapterLabel ? `: ${chapterLabel}` : ''}
          </ThemedText>
          <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button" style={styles.closeBtn}>
            <IconSymbol name="xmark" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            <ThemedText style={[styles.progressLabel, { color: isDarkMode ? '#A7B4D6' : '#8EA2D6' }]}>
              PROGRESS
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <ThemedText style={[styles.progressCount, { color: colors.tint }]}>
                {currentIndex + 1} / {flashcards.length}
              </ThemedText>
              <ThemedText style={[styles.progressCardsSuffix, { color: isDarkMode ? '#9CA3AF' : '#9AA3B2' }]}>
                cards
              </ThemedText>
            </View>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? colors.cardAlt : '#E5E7EB' }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.tint, width: `${progressPct}%` }]} />
          </View>
        </View>

        <View style={styles.cardStage}>
          <TouchableOpacity onPress={handleReveal} activeOpacity={0.95} style={styles.cardTouch}>
            <View style={styles.cardShadowWrap}>
              <Animated.View style={[styles.cardFace, frontAnimatedStyle, { backgroundColor: isDarkMode ? colors.cardAlt : '#FFFFFF' }]}>
                {!isDarkMode && (
                  <LinearGradient
                    colors={['rgba(15,75,215,0.10)', 'rgba(15,75,215,0.00)']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0.2, y: 0.8 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <ThemedText style={[styles.cardMeta, { color: isDarkMode ? '#93A4C7' : '#8EA2D6' }]}>
                  CONCEPT MASTERY
                </ThemedText>
                <ScrollView
                  style={styles.cardScroll}
                  contentContainerStyle={styles.cardScrollContent}
                  nestedScrollEnabled
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                >
                  <RichText
                    text={currentCard?.question || ''}
                    style={styles.cardTitle}
                    color={isDarkMode ? '#FFFFFF' : '#111827'}
                    fontSize={34}
                    textAlign="center"
                    lineHeight={42}
                  />
                </ScrollView>
                <View style={styles.tapHintRow}>
                  <IconSymbol name="arrow.2.squarepath" size={16} color={isDarkMode ? '#9CA3AF' : '#8EA2D6'} />
                  <ThemedText style={[styles.tapHintText, { color: isDarkMode ? '#9CA3AF' : '#8EA2D6' }]}>
                    TAP TO FLIP
                  </ThemedText>
                </View>
              </Animated.View>

              <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle, { backgroundColor: isDarkMode ? colors.cardAlt : '#FFFFFF' }]}>
                {!isDarkMode && (
                  <LinearGradient
                    colors={['rgba(15,75,215,0.10)', 'rgba(15,75,215,0.00)']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0.2, y: 0.8 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <ThemedText style={[styles.cardMeta, { color: isDarkMode ? '#93A4C7' : '#8EA2D6' }]}>
                  CONCEPT MASTERY
                </ThemedText>
                <ScrollView
                  style={styles.cardScroll}
                  contentContainerStyle={styles.cardScrollContent}
                  nestedScrollEnabled
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                >
                  <RichText
                    text={currentCard?.answer || ''}
                    style={styles.cardTitle}
                    color={isDarkMode ? '#FFFFFF' : '#111827'}
                    fontSize={28}
                    textAlign="center"
                    lineHeight={36}
                  />
                </ScrollView>
                <View style={styles.tapHintRow}>
                  <IconSymbol name="arrow.2.squarepath" size={16} color={isDarkMode ? '#9CA3AF' : '#8EA2D6'} />
                  <ThemedText style={[styles.tapHintText, { color: isDarkMode ? '#9CA3AF' : '#8EA2D6' }]}>
                    TAP TO FLIP
                  </ThemedText>
                </View>
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.bottomActionLeft}
            accessibilityRole="button"
            accessibilityLabel="Still learning"
            onPress={handleNext}
          >
            <View style={[styles.bottomIconGhost, { borderColor: isDarkMode ? '#3A4354' : '#D1D5DB' }]}>
              <IconSymbol name="arrow.counterclockwise" size={18} color={isDarkMode ? '#D1D5DB' : '#6B7280'} />
            </View>
            <ThemedText style={[styles.bottomLabel, { color: isDarkMode ? '#D1D5DB' : '#6B7280' }]}>
              STILL LEARNING
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomActionRight}
            accessibilityRole="button"
            accessibilityLabel="Got it"
            onPress={handleGotIt}
          >
            <View style={[styles.bottomIconPrimary, { backgroundColor: colors.tint, shadowColor: colors.tint }]}>
              <IconSymbol name="checkmark" size={18} color="#FFFFFF" />
            </View>
            <ThemedText style={[styles.bottomLabelPrimary, { color: colors.tint }]}>
              GOT IT
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 10,
  },
  brandPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0F4BD7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4BD7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  brandText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBlock: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressCardsSuffix: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  cardStage: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  cardTouch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardShadowWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 6,
    marginTop: 20,
  },
  cardFace: {
    flex: 1,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardMeta: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.4,
    marginBottom: 18,
  },
  cardScroll: { flex: 1 },
  cardScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  cardTitle: { fontWeight: '900', letterSpacing: -0.4 },
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 10,
  },
  tapHintText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.6,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 8,
  },
  bottomActionLeft: { alignItems: 'center', gap: 10 },
  bottomActionRight: { alignItems: 'center', gap: 10 },
  bottomIconGhost: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  bottomIconPrimary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 6,
  },
  bottomLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  bottomLabelPrimary: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
});
