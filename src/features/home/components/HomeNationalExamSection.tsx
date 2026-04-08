import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { BookCover } from '@/features/common/components/ui/BookCover';
import { getBookCover } from '@/features/common/services/bookCoverService';
import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { HomeScreenStyles as styles } from './HomeScreen.styles';

type HomeNationalExamSectionProps = {
  canvasBg: string;
  sectionHeadingColor: string;
  textColor: string;
  isNationalExamLoading: boolean;
  nationalExamYears: number[];
  sectionTitle: string;
  viewAllLabel: string;
  yearExamLabel: (year: number) => string;
  gradeSubtitle: string;
};

export function HomeNationalExamSection({
  canvasBg,
  sectionHeadingColor,
  textColor,
  isNationalExamLoading,
  nationalExamYears,
  sectionTitle,
  viewAllLabel,
  yearExamLabel,
  gradeSubtitle,
}: HomeNationalExamSectionProps) {
  return (
    <ThemedView style={[styles.bookCarouselSection, { backgroundColor: canvasBg }]}>
      <View style={styles.bookCarouselHeader}>
        <ThemedText style={[styles.bookCarouselTitle, { color: sectionHeadingColor }]}>{sectionTitle}</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(tabs)/practice')}>
          <ThemedText style={styles.viewAllLink}>{viewAllLabel}</ThemedText>
        </TouchableOpacity>
      </View>
      {isNationalExamLoading ? (
        <View style={styles.bookCarouselSkeleton}>
          {[1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.bookSkeletonItem}>
              <View style={[styles.bookSkeletonCover, { backgroundColor: textColor + '20' }]} />
              <View style={[styles.bookSkeletonTitle, { backgroundColor: textColor + '20' }]} />
              <View style={[styles.bookSkeletonSubtitle, { backgroundColor: textColor + '20' }]} />
            </View>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookCarouselContainer}>
          {nationalExamYears.map((year) => {
            const coverData = getBookCover('National Exam');
            return (
              <BookCover
                key={year}
                title={yearExamLabel(year)}
                subtitle={gradeSubtitle}
                coverColor={coverData.coverColor}
                coverGradient={coverData.coverGradient}
                icon={coverData.icon as any}
                imageUrl=""
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/practice',
                    params: {
                      preSelectedExamType: 'national',
                      preSelectedYear: year.toString(),
                      booksCategory: 'national',
                    },
                  })
                }
                questionCount={Math.floor(Math.random() * 100) + 50}
              />
            );
          })}
        </ScrollView>
      )}
    </ThemedView>
  );
}
