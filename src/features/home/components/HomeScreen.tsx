import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import { ThemedView } from '@/features/common/components/ThemedView';
import { useHomeScreen } from '@/features/home/hooks/useHomeScreen';
import { HomeNationalExamSection } from './HomeNationalExamSection';
import { HomeQuickAccessSection } from './HomeQuickAccessSection';
import { HomeSubjectGridSection } from './HomeSubjectGridSection';
import { HomeWelcomeBlock } from './HomeWelcomeBlock';
import { HomeScreenStyles as styles } from './HomeScreen.styles';

export default function HomeScreen() {
  const h = useHomeScreen();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: h.canvasBg }]} edges={['bottom']}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: h.canvasBg }]}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: h.canvasBg }]}
        refreshControl={
          <RefreshControl
            refreshing={h.refreshing}
            onRefresh={h.onRefresh}
            tintColor="#0F4BD7"
            colors={['#0F4BD7']}
            progressBackgroundColor={h.colors.cardAlt}
          />
        }
      >
        <ThemedView style={[styles.container, { backgroundColor: h.canvasBg }]}>
          <HomeWelcomeBlock
            isKGStudent={h.isKGStudent}
            fullName={h.user?.fullName}
            welcomeTitleColor={h.welcomeTitleColor}
            welcomeSubtitleColor={h.welcomeSubtitleColor}
            titleKg={h.t('home.welcomeCard.titleKg', { grade: h.t('common.kindergarten') })}
            helloTitle={h.t('home.welcomeCard.helloTitle', { name: (h.user?.fullName || '').split(' ')[0] })}
            titleDefault={h.t('home.welcomeCard.title', { grade: h.gradeDigit })}
            subtitleKg={h.t('home.welcomeCard.subtitle')}
            helloSubtitle={h.t('home.welcomeCard.helloSubtitle')}
          />

          {!h.isKGStudent ? (
            <>
              <HomeQuickAccessSection
                sectionHeadingColor={h.sectionHeading}
                quickCardBg={h.quickCardBg}
                quickCardBorder={h.quickCardBorder}
                isDarkMode={h.isDarkMode}
                sectionTitle={h.t('home.quickAccess.sectionTitle')}
                practiceLabel={h.t('home.quickAccess.practiceLabel')}
                flashcardsLabel={h.t('home.quickAccess.flashcardsLabel')}
              />

              <HomeSubjectGridSection
                sectionHeadingColor={h.sectionHeading}
                metaMuted={h.metaMuted}
                quickCardBg={h.quickCardBg}
                quickCardBorder={h.quickCardBorder}
                isDarkMode={h.isDarkMode}
                isPracticeLoading={h.isPracticeLoading}
                subjectsTitle={h.t('home.gradeSubjects.title', { grade: h.gradeDigit })}
                viewAllLabel={h.t('home.viewAll')}
                formatChapterLabel={h.formatChapterLabel}
                homeMcqSubjects={h.homeMcqSubjects}
                onPracticePress={(book) => h.handleBookPress('practice', book)}
              />

              {h.hasNationalExams() && h.nationalExamYears.length > 0 && (
                <HomeNationalExamSection
                  canvasBg={h.canvasBg}
                  sectionHeadingColor={h.sectionHeading}
                  textColor={h.colors.text}
                  isNationalExamLoading={h.isNationalExamLoading}
                  nationalExamYears={h.nationalExamYears}
                  sectionTitle={h.t('home.quickActions.nationalExams.title')}
                  viewAllLabel={h.t('home.viewAll')}
                  yearExamLabel={(year) => h.t('home.quickActions.nationalExams.yearExam', { year })}
                  gradeSubtitle={h.t('home.quickActions.nationalExams.grade', {
                    grade: h.user?.grade?.replace(/[^\d]/g, '') ?? '',
                  })}
                />
              )}
            </>
          ) : null}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
