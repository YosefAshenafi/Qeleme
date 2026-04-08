import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/features/common/components/ThemedView';
import { useFlashcardsScreen } from '@/features/flashcards/hooks/useFlashcardsScreen';
import {
  getFlashcardAnswerText,
  getFlashcardQuestionText,
} from '@/features/flashcards/utils/flashcardText';
import { FlashcardsEmptyChapterState } from './FlashcardsEmptyChapterState';
import { FlashcardsErrorState } from './FlashcardsErrorState';
import { FlashcardsFlipCard } from './FlashcardsFlipCard';
import { FlashcardsLoadingState } from './FlashcardsLoadingState';
import { FlashcardsScreenTopBar } from './FlashcardsScreenTopBar';
import { FlashcardsSelectionForm } from './FlashcardsSelectionForm';
import { FlashcardsSessionBottomActions } from './FlashcardsSessionBottomActions';
import { FlashcardsSessionProgress } from './FlashcardsSessionProgress';
import { FlashcardsSessionResults } from './FlashcardsSessionResults';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';

export default function FlashcardsScreen() {
  const fc = useFlashcardsScreen();

  if (fc.isLoading) {
    return (
      <FlashcardsLoadingState
        backgroundColor={fc.colors.background}
        textColor={fc.colors.text}
        message={fc.t('flashcards.loading')}
      />
    );
  }

  if (fc.error) {
    return (
      <FlashcardsErrorState
        backgroundColor={fc.colors.background}
        textColor={fc.colors.text}
        tintColor={fc.colors.tint}
        warningColor={fc.colors.warning}
        title={fc.t('errors.network.title')}
        message={fc.t('errors.network.message')}
        retryLabel={fc.t('common.tryAgain')}
        onRetry={fc.handleRetryNetworkError}
      />
    );
  }

  if (fc.showResult) {
    return (
      <FlashcardsSessionResults
        isDarkMode={fc.isDarkMode}
        backgroundColor={fc.colors.background}
        sessionResultsTitle={fc.t('flashcards.sessionResults', { defaultValue: 'Session Results' })}
        accuracyLabel={fc.t('flashcards.accuracy', { defaultValue: 'ACCURACY' })}
        masteredLabel={fc.t('flashcards.mastered', { defaultValue: 'Mastered' })}
        persistenceLabel={fc.t('flashcards.persistence', { defaultValue: 'PERSISTENCE' })}
        stillLearningLabel={fc.t('flashcards.stillLearning', { defaultValue: 'Still Learning' })}
        retryLabel={fc.t('flashcards.retry', { defaultValue: 'Retry' })}
        doneLabel={fc.t('flashcards.done', { defaultValue: 'Done' })}
        masteredCount={fc.masteredCount}
        stillLearningCount={fc.stillLearningCount}
        masteredPct={fc.masteredPct}
        onRetry={fc.handleSessionResultsRetry}
        onDone={fc.handleSessionResultsDone}
      />
    );
  }

  if (!fc.showFlashcards) {
    if (fc.isDeepLinkAutoStart && fc.selectedSubject && fc.isLoading) {
      return (
        <FlashcardsLoadingState
          backgroundColor={fc.colors.background}
          textColor={fc.colors.text}
          message={fc.t('flashcards.loading')}
          centered
        />
      );
    }

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: fc.colors.background }]}>
        <ThemedView style={[styles.container, { backgroundColor: fc.colors.background }]}>
          <FlashcardsSelectionForm
          colors={fc.colors}
          isDarkMode={fc.isDarkMode}
          isPreSelected={fc.isPreSelected}
          subjectLabel={fc.t('flashcards.subject')}
          chapterLabel={fc.t('flashcards.chapter')}
          preSelectedSuffix={fc.t('flashcards.preSelected')}
          selectSubjectPlaceholder={fc.t('flashcards.selectSubject')}
          selectChapterPlaceholder={fc.t('flashcards.selectChapter')}
          startButtonLabel={fc.t('flashcards.startFlashcards')}
          noChaptersLabel={fc.t('flashcards.noChaptersInList', { defaultValue: 'No chapters available' })}
          selectedSubject={fc.selectedSubject}
          selectedChapter={fc.selectedChapter}
          selectedGradeData={fc.selectedGradeData ?? undefined}
          selectedSubjectData={fc.selectedSubjectData ?? undefined}
          showSubjectDropdown={fc.showSubjectDropdown}
          showChapterDropdown={fc.showChapterDropdown}
          onToggleSubjectDropdown={() => fc.setShowSubjectDropdown(!fc.showSubjectDropdown)}
          onToggleChapterDropdown={() => fc.setShowChapterDropdown(!fc.showChapterDropdown)}
          onCloseSubjectDropdown={() => fc.setShowSubjectDropdown(false)}
          onCloseChapterDropdown={() => fc.setShowChapterDropdown(false)}
          onSelectSubject={(subjectId) => {
            fc.setSelectedSubject(subjectId);
            fc.setSelectedChapter('');
            fc.setShowSubjectDropdown(false);
          }}
          onSelectChapter={(chapterId) => {
            fc.setSelectedChapter(chapterId);
            fc.setShowChapterDropdown(false);
          }}
          onStart={fc.handleStartFlashcards}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!fc.currentFlashcards || fc.currentFlashcards.length === 0) {
    return (
      <FlashcardsEmptyChapterState
        backgroundColor={fc.colors.background}
        textColor={fc.colors.text}
        tintColor={fc.colors.tint}
        warningColor={fc.colors.warning}
        title={fc.t('flashcards.noFlashcards')}
        subtitle={fc.t('flashcards.noFlashcardsForChapter', {
          defaultValue: 'No flashcards available for the selected chapter.',
        })}
        actionLabel={fc.t('flashcards.chooseDifferentChapter', { defaultValue: 'Choose Different Chapter' })}
        onChooseDifferent={fc.handleEmptyChapterChooseDifferent}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { backgroundColor: fc.isDarkMode ? fc.colors.background : '#F4F6FA' }]}>
        <StatusBar translucent={false} backgroundColor="#FFFFFF" barStyle="dark-content" />
        <FlashcardsScreenTopBar />

        <FlashcardsSessionProgress
          isDarkMode={fc.isDarkMode}
          cardAltColor={fc.colors.cardAlt}
          currentIndex={fc.currentIndex}
          totalCards={fc.currentFlashcards.length}
          progressBarStyle={fc.progressBarStyle}
        />

        <FlashcardsFlipCard
          isDarkMode={fc.isDarkMode}
          cardBackgroundColor={fc.isDarkMode ? fc.colors.cardAlt : '#FFFFFF'}
          mutedTextColor={fc.cardMutedMeta}
          questionText={getFlashcardQuestionText(fc.currentCard)}
          answerText={getFlashcardAnswerText(fc.currentCard)}
          frontAnimatedStyle={fc.frontAnimatedStyle}
          backAnimatedStyle={fc.backAnimatedStyle}
          onReveal={fc.handleReveal}
        />

        <FlashcardsSessionBottomActions
          isDarkMode={fc.isDarkMode}
          onStillLearning={fc.onStillLearningPress}
          onGotIt={fc.onGotItPress}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
