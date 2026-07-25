import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Image, Keyboard, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import type { Subject } from '@/features/common/services/practiceService';
import type { BooksCategoryFilter } from '@/features/practice/utils/booksCategory';
import { getBookCover } from '@/features/common/services/bookCoverService';
import { localizeSubjectName } from '@/features/common/utils/subjectDisplayName';
import {
  BOOK_CTA_ON,
  BRAND_BLUE,
  SUBJECT_ROW_COVER_WIDTH,
  SUBJECT_ROW_COVER_HEIGHT,
} from '@/features/practice/constants/practiceUi';
import { PracticeScreenStyles as styles } from './PracticeScreen.styles';
import { getBooksHubPalette } from './practiceBooksPalette';

export type BooksSubjectIntent = 'either' | 'practice' | 'flashcards';

interface PracticeBooksListProps {
  loading: boolean;
  isDarkMode: boolean;
  gradeDigit: string;
  booksSearchQuery: string;
  setBooksSearchQuery: (value: string) => void;
  availableYears: number[];
  booksCategory: BooksCategoryFilter | 'national';
  setBooksCategory: (value: BooksCategoryFilter | 'national') => void;
  displaySubjects: { id: string; name: string }[];
  selectedSubject: string;
  booksSubjectRowY: React.MutableRefObject<Record<string, number>>;
  booksListScrollRef: React.RefObject<ScrollView | null>;
  onSubjectPress: (subjectId: string, intent: BooksSubjectIntent) => void;
}

export function PracticeBooksList({
  loading,
  isDarkMode,
  gradeDigit,
  booksSearchQuery,
  setBooksSearchQuery,
  availableYears,
  booksCategory,
  setBooksCategory,
  displaySubjects,
  selectedSubject,
  booksSubjectRowY,
  booksListScrollRef,
  onSubjectPress,
}: PracticeBooksListProps) {
  const { t } = useTranslation();
  const {
    booksPrimaryText,
    booksMutedText,
    booksCardBg,
    booksCardBorder,
    booksChipIdleOnPanel,
    booksChipIdleBorderOnPanel,
  } = getBooksHubPalette(isDarkMode);

  if (loading) {
    return (
      <View style={styles.booksHubScroll}>
        <ActivityIndicator size="large" color={BRAND_BLUE} style={{ marginTop: 48 }} />
      </View>
    );
  }

  return (
    <View style={styles.booksHubSplit}>
      <View
        style={[
          styles.booksSearchPanel,
          {
            backgroundColor: booksCardBg,
            shadowColor: isDarkMode ? '#000' : '#94A3B8',
          },
        ]}
      >
        <View
          style={[
            styles.booksSearchField,
            {
              backgroundColor: isDarkMode ? '#1C222C' : '#F4F5F7',
            },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={20} color={booksMutedText} />
          <TextInput
            value={booksSearchQuery}
            onChangeText={setBooksSearchQuery}
            placeholder={t('mcq.subjects.searchPlaceholder')}
            placeholderTextColor={booksMutedText}
            style={[styles.booksSearchInput, { color: booksPrimaryText }]}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
      </View>

      <View
        style={[
          styles.booksListPanel,
          {
            backgroundColor: booksCardBg,
            borderColor: booksCardBorder,
            shadowColor: isDarkMode ? '#000' : '#64748B',
          },
        ]}
      >
        <ScrollView
          style={styles.booksHubScroll}
          contentContainerStyle={styles.booksHubListBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          ref={booksListScrollRef}
          bounces={true}
        >
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.booksChipsRow}
          >
            {(
              ['all', 'science', 'languages', 'mathematics', 'humanities', 'national'] as (BooksCategoryFilter | 'national')[]
            ).map((key) => {
              if (key === 'national' && availableYears.length === 0) {
                return null;
              }

              const active = booksCategory === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.booksChip,
                    {
                      backgroundColor: active ? BRAND_BLUE : booksChipIdleOnPanel,
                      borderColor: active ? BRAND_BLUE : booksChipIdleBorderOnPanel,
                    },
                  ]}
                  onPress={() => setBooksCategory(key)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.booksChipLabel,
                      { color: active ? '#FFFFFF' : booksPrimaryText },
                    ]}
                  >
                    {t(`mcq.subjects.filter.${key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {displaySubjects.map((subject) => {
            const ext = subject as Subject & { image_url?: string };
            const imageUrl = ext.image_url?.trim() ? ext.image_url : undefined;
            const cover = getBookCover(subject.name);
            // National-exam rows are synthesized locally and already localized.
            const subjectLabel = subject.id.startsWith('national-')
              ? subject.name
              : localizeSubjectName(subject.name, t);
            return (
              <View
                key={subject.id}
                onLayout={(e) => {
                  booksSubjectRowY.current[subject.id] = e.nativeEvent.layout.y;
                }}
                style={[
                  styles.bookRowCard,
                  {
                    backgroundColor: booksCardBg,
                    borderColor: booksCardBorder,
                    shadowColor: isDarkMode ? '#000' : '#64748B',
                  },
                  selectedSubject === subject.id && {
                    borderColor: BRAND_BLUE,
                    borderWidth: 2,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => onSubjectPress(subject.id, 'either')}
                  activeOpacity={0.92}
                  accessibilityRole="button"
                  accessibilityLabel={t('mcq.subjects.cardTitle', {
                    grade: gradeDigit,
                    subject: subjectLabel,
                  })}
                  style={[
                    styles.bookRowCover,
                    {
                      width: SUBJECT_ROW_COVER_WIDTH,
                      height: SUBJECT_ROW_COVER_HEIGHT,
                      backgroundColor: cover.coverColor,
                      shadowColor: isDarkMode ? '#000' : '#64748B',
                    },
                  ]}
                >
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <LinearGradient
                        colors={[...cover.coverGradient]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.bookRowNoImageText}>
                        <Text style={styles.bookRowNoImageTitle} numberOfLines={3}>
                          {subjectLabel}
                        </Text>
                        <Text style={styles.bookRowNoImageSubtitle}>
                          Grade {gradeDigit}
                        </Text>
                      </View>
                    </>
                  )}
                  {subject.id.startsWith('national-') && (
                    <View style={styles.bookRowBadge}>
                      <Text style={styles.bookRowBadgeText}>
                        {t('mcq.subjects.badgeNational', { defaultValue: 'NATIONAL' })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.bookRowContent}>
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => onSubjectPress(subject.id, 'either')}
                  >
                    <ThemedText
                      style={[styles.bookRowTitle, { color: booksPrimaryText }]}
                      numberOfLines={2}
                    >
                      {t('mcq.subjects.cardTitle', { grade: gradeDigit, subject: subjectLabel })}
                    </ThemedText>
                    <ThemedText
                      style={[styles.bookRowDesc, { color: booksMutedText }]}
                      numberOfLines={2}
                    >
                      {t('mcq.subjects.cardDescription')}
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={styles.bookRowActions}>
                    <TouchableOpacity
                      style={[
                        styles.bookRowPillFilled,
                        { backgroundColor: BRAND_BLUE, shadowColor: BRAND_BLUE },
                      ]}
                      onPress={() => onSubjectPress(subject.id, 'practice')}
                      activeOpacity={0.9}
                    >
                      <IconSymbol name="questionmark.circle.fill" size={16} color={BOOK_CTA_ON} />
                      <Text
                        style={styles.bookRowPillTextOnBlue}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        {t('mcq.subjects.qaPractice')}
                      </Text>
                    </TouchableOpacity>

                    {!subject.id.startsWith('national-') && (
                      <TouchableOpacity
                        style={[
                          styles.bookRowPillFilled,
                          { backgroundColor: BRAND_BLUE, shadowColor: BRAND_BLUE },
                        ]}
                        onPress={() => onSubjectPress(subject.id, 'flashcards')}
                        activeOpacity={0.9}
                      >
                        <IconSymbol name="rectangle.stack.fill" size={16} color={BOOK_CTA_ON} />
                        <Text
                          style={styles.bookRowPillTextOnBlue}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                        >
                          {t('mcq.subjects.flashcards')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
