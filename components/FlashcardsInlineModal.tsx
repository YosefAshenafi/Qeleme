import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import RichText from '@/components/ui/RichText';
import type { Flashcard } from '@/services/flashcardService';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

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

  const currentCard = flashcards.length > currentIndex ? flashcards[currentIndex] : null;

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setIsRevealed(false);
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (!visible || flashcards.length === 0) return null;

  const atEnd = currentIndex === flashcards.length - 1;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button">
            <IconSymbol name="chevron.left" size={24} color={colors.tint} />
          </TouchableOpacity>
          <ThemedText style={[styles.topTitle, { color: colors.text }]} numberOfLines={1}>
            {subjectLabel} · {chapterLabel}
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <View style={{ height: 4, backgroundColor: colors.cardAlt, borderRadius: 2, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                backgroundColor: colors.tint,
                borderRadius: 2,
              }}
            />
          </View>
          <ThemedText
            style={{ color: colors.tint, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 4 }}
          >
            {t('flashcards.cardProgress', { current: currentIndex + 1, total: flashcards.length })}
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 }}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              { borderColor: colors.border, opacity: currentIndex === 0 ? 0.4 : 1 },
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <IconSymbol name="chevron.left" size={16} color={colors.tint} />
            <ThemedText style={{ color: colors.tint, fontSize: 12, marginLeft: 4 }}>
              {t('flashcards.previous')}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.tint,
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 0,
              },
            ]}
            onPress={() => {
              if (atEnd) {
                onClose();
              } else {
                handleNext();
              }
            }}
          >
            <ThemedText style={{ color: '#fff', fontSize: 12, fontWeight: '600', marginRight: 4 }}>
              {atEnd ? t('flashcards.finish') : t('flashcards.next')}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardContainer}>
            <TouchableOpacity onPress={handleReveal} activeOpacity={0.9} style={styles.cardWrapper}>
              <Animated.View
                style={[
                  styles.card,
                  frontAnimatedStyle,
                  { borderColor: colors.border, backgroundColor: colors.cardAlt },
                ]}
              >
                <ScrollView
                  style={styles.cardScroll}
                  contentContainerStyle={styles.cardScrollContent}
                  nestedScrollEnabled
                  bounces={false}
                >
                  <RichText
                    text={currentCard?.question || ''}
                    style={styles.cardText}
                    color={isDarkMode ? '#FFFFFF' : colors.tint}
                    fontSize={20}
                    textAlign="center"
                    lineHeight={28}
                  />
                </ScrollView>
              </Animated.View>
              <Animated.View
                style={[
                  styles.card,
                  styles.cardBack,
                  backAnimatedStyle,
                  { borderColor: colors.border, backgroundColor: colors.cardAlt },
                ]}
              >
                <ScrollView
                  style={styles.cardScroll}
                  contentContainerStyle={styles.cardScrollContent}
                  nestedScrollEnabled
                  bounces={false}
                >
                  <RichText
                    text={currentCard?.answer || ''}
                    style={styles.cardText}
                    color={isDarkMode ? '#FFFFFF' : colors.tint}
                    fontSize={20}
                    textAlign="center"
                    lineHeight={28}
                  />
                </ScrollView>
              </Animated.View>
            </TouchableOpacity>
            <ThemedText style={[styles.hint, { color: colors.text }]}>
              {isRevealed ? t('flashcards.tapToSeeQuestion') : t('flashcards.tapToSeeAnswer')}
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', marginHorizontal: 8 },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  scrollContent: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  cardContainer: { alignItems: 'center', marginVertical: 12 },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.7,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    padding: 20,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardScroll: { flex: 1, width: '100%' },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: '100%',
  },
  cardText: { fontSize: 20, textAlign: 'center', lineHeight: 28 },
  hint: { opacity: 0.7, textAlign: 'center', marginTop: 16, fontSize: 14 },
});
