import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { IconSymbolName } from '@/features/common/components/ui/IconSymbol';
import { BookCover } from '@/features/common/components/ui/BookCover';
import { getBookCover } from '@/features/common/services/bookCoverService';
import { ThemedText } from '@/features/common/components/ThemedText';
import {
  SUBJECT_COVER_INNER_HEIGHT,
  SUBJECT_COVER_INNER_WIDTH,
  SUBJECT_GRID_TOP_BAND_HEIGHT,
} from '@/features/home/constants/homeUi';
import type { BookItem } from '@/features/home/types/home';
import { HomeScreenStyles as styles } from './HomeScreen.styles';
import { SubjectCoverAtmosphere } from './SubjectCoverAtmosphere';

type HomeSubjectGridSectionProps = {
  sectionHeadingColor: string;
  metaMuted: string;
  quickCardBg: string;
  quickCardBorder: string;
  isDarkMode: boolean;
  isPracticeLoading: boolean;
  subjectsTitle: string;
  viewAllLabel: string;
  formatChapterLabel: (n: number) => string;
  homeMcqSubjects: BookItem[];
  onPracticePress: (book: BookItem) => void;
};

export function HomeSubjectGridSection({
  sectionHeadingColor,
  metaMuted,
  quickCardBg,
  quickCardBorder,
  isDarkMode,
  isPracticeLoading,
  subjectsTitle,
  viewAllLabel,
  formatChapterLabel,
  homeMcqSubjects,
  onPracticePress,
}: HomeSubjectGridSectionProps) {

  const renderSubjectTile = (book: BookItem) => {
    const coverData = getBookCover(book.subject);
    return (
      <View
        key={book.id}
        style={[styles.subjectGridCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
      >
        <View
          style={[
            styles.subjectGridCoverWrap,
            { minHeight: SUBJECT_GRID_TOP_BAND_HEIGHT, backgroundColor: quickCardBg },
          ]}
        >
          <SubjectCoverAtmosphere dark={isDarkMode} />
          <View style={styles.subjectGridCoverLift}>
            <BookCover
              title={book.title}
              subtitle={book.subtitle}
              coverColor={coverData.coverColor}
              coverGradient={coverData.coverGradient}
              icon={coverData.icon as IconSymbolName}
              imageUrl={book.image_url}
              onPress={() => onPracticePress(book)}
              coverWidth={SUBJECT_COVER_INNER_WIDTH}
              coverHeight={SUBJECT_COVER_INNER_HEIGHT}
              compact
            />
          </View>
        </View>
        <View style={styles.subjectGridCardBody}>
          <ThemedText numberOfLines={2} style={[styles.subjectGridTitle, { color: sectionHeadingColor }]}>
            {book.title}
          </ThemedText>
          <ThemedText style={[styles.subjectGridChapters, { color: metaMuted }]}>
            {formatChapterLabel(book.chapterCount)}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.subjectsSectionHeader}>
        <ThemedText style={[styles.subjectsSectionTitle, { color: sectionHeadingColor }]}>{subjectsTitle}</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(tabs)/practice')} hitSlop={12}>
          <ThemedText style={styles.viewAllLink}>{viewAllLabel}</ThemedText>
        </TouchableOpacity>
      </View>

      {isPracticeLoading ? (
        <View style={styles.subjectGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.subjectGridCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
            >
              <View
                style={[
                  styles.subjectGridCoverWrap,
                  { minHeight: SUBJECT_GRID_TOP_BAND_HEIGHT, backgroundColor: quickCardBg },
                ]}
              >
                <SubjectCoverAtmosphere dark={isDarkMode} />
                <View
                  style={[
                    styles.subjectGridCoverLift,
                    styles.subjectGridSkeletonCover,
                    { backgroundColor: metaMuted + '45' },
                  ]}
                />
              </View>
              <View style={styles.subjectGridCardBody}>
                <View style={[styles.skeletonLine, { backgroundColor: metaMuted + '40' }]} />
                <View style={[styles.skeletonLineShort, { backgroundColor: metaMuted + '30' }]} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.subjectGrid}>{homeMcqSubjects.map(renderSubjectTile)}</View>
      )}
    </>
  );
}
