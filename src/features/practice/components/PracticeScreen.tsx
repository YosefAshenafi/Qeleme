import React from 'react';
import { TouchableOpacity, ScrollView, View, Modal, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/features/common/components/ThemedView';
import { usePracticeScreen } from '@/features/practice/hooks/usePracticeScreen';
import { PracticeLoadingState } from './PracticeLoadingState';
import { PracticeErrorState } from './PracticeErrorState';
import { PracticeNoSubjectsState } from './PracticeNoSubjectsState';
import { PracticeSessionResultsPanel } from './PracticeSessionResultsPanel';
import { PracticeMcqQuestionView } from './PracticeMcqQuestionView';
import { PracticeSettingsModal } from './PracticeSettingsModal';
import { PracticeBooksList, type BooksSubjectIntent } from './PracticeBooksList';
import { PracticeChapterChooserModal } from './PracticeChapterChooserModal';
import { getBooksHubPalette } from './practiceBooksPalette';

export default function PracticeScreen() {
  const {
    isKGStudent,
    isDarkMode,
    user,
    colors,
    t,
    loading,
    error,
    practiceData,
    fetchPracticeData,
    selectedSubject,
    setSelectedSubject,
    setSelectedChapter,
    setSelectedChapterName,
    setIsPreSelected,
    scrollViewRef,
    booksListScrollRef,
    booksSubjectRowY,
    currentQuestionIndex,
    selectedAnswer,
    showExplanation,
    showAnswerMessage,
    showResult,
    showTest,
    availableSubjects,
    availableYears,
    currentQuestion,
    showChapterChooser,
    setShowChapterChooser,
    showNationalExamSubjectChooser,
    setShowNationalExamSubjectChooser,
    booksSearchQuery,
    setBooksSearchQuery,
    booksCategory,
    setBooksCategory,
    booksChapterIntent,
    setBooksChapterIntent,
    booksChapterModalStep,
    setBooksChapterModalStep,
    booksEitherPendingChapter,
    setBooksEitherPendingChapter,
    subjectLoading,
    booksChapterModeLabel,
    booksHubActionLoading,
    selectedGradeData,
    selectedSubjectData,
    displaySubjects,
    chapterGridColumns,
    booksModalChaptersSorted,
    isLastQuestion,
    totalQuestions,
    handleNationalExamYearPress,
    handleNationalExamSubjectPress,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleResult,
    autoNextEnabled,
    setAutoNextEnabled,
    autoNextDelay,
    setAutoNextDelay,
    showPracticeSettings,
    setShowPracticeSettings,
    handleRetry,
    dismissBooksChapterModal,
    applyBooksChapterAndStartMcq,
    applyBooksChapterAndOpenFlashcards,
    getOptionStyle,
    timeHours,
    timeMinutes,
    timeSeconds,
    handleSessionResultsDone,
    sessionCorrectCount,
    sessionIncorrectCount,
    sessionAccuracy,
    resultPanelCopy,
    formattedPracticeTime,
    styles,
    BRAND_BLUE,
    StyleSheet,
  } = usePracticeScreen();

  if (isKGStudent) {
    return <Redirect href="/early-dashboard" />;
  }

  
  if (loading) {
    return (
      <PracticeLoadingState
        backgroundColor={colors.background}
        tintColor={colors.tint}
        textColor={colors.text}
        message={t('common.loading')}
      />
    );
  }

  if (error) {
    return (
      <PracticeErrorState
        backgroundColor={colors.background}
        textColor={colors.text}
        tintColor={colors.tint}
        warningColor={colors.warning}
        title={t('errors.network.title')}
        message={t('errors.network.message')}
        retryLabel={t('common.tryAgain')}
        onRetry={fetchPracticeData}
      />
    );
  }

  if (
    practiceData &&
    practiceData.grades.length > 0 &&
    (!selectedGradeData?.subjects || (selectedGradeData?.subjects?.length || 0) === 0)
  ) {
    return (
      <PracticeNoSubjectsState
        backgroundColor={colors.background}
        textColor={colors.text}
        errorColor={colors.error}
        warningColor={colors.warning}
        tintColor={colors.tint}
        cardAltColor={colors.cardAlt}
        borderColor={colors.border}
        title={t('mcq.noSubjectsFound.title')}
        description={t('mcq.noSubjectsFound.description', { gradeName: selectedGradeData?.name })}
        reasonAccount={t('mcq.noSubjectsFound.reasons.accountUpdate')}
        reasonServer={t('mcq.noSubjectsFound.reasons.serverUnavailable')}
        reasonContent={t('mcq.noSubjectsFound.reasons.contentBeingAdded')}
        tryAgainLabel={t('common.tryAgain')}
        homeLabel={t('home.goto')}
        onRetry={fetchPracticeData}
      />
    );
  }

  if (showResult) {
    return (
      <PracticeSessionResultsPanel
        backgroundColor={colors.background}
        textColor={colors.text}
        isDarkMode={isDarkMode}
        correctCount={sessionCorrectCount}
        incorrectCount={sessionIncorrectCount}
        accuracy={sessionAccuracy}
        formattedTime={formattedPracticeTime}
        resultCopy={resultPanelCopy}
        performanceLabel={t('mcq.results.performance')}
        retryLabel={t('mcq.results.retrySession')}
        doneLabel={t('mcq.results.done')}
        onRetry={handleRetry}
        onDone={handleSessionResultsDone}
      />
    );
  }

  if (!showTest) {
    const { booksCanvasBg } = getBooksHubPalette(isDarkMode);
    const gradeDigit = user?.grade?.replace(/\D/g, '') || '12';

    const onBooksSubjectPress = (subjectId: string, intent: BooksSubjectIntent) => {
      if (subjectId.startsWith('national-')) {
        handleNationalExamYearPress(subjectId.replace('national-', ''));
        return;
      }
      setSelectedSubject(subjectId);
      setSelectedChapter('');
      setSelectedChapterName('');
      setIsPreSelected(false);
      setBooksChapterIntent(intent);
      setBooksChapterModalStep('grid');
      setShowChapterChooser(true);
    };

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: booksCanvasBg }]} edges={['bottom', 'left', 'right']}>
        <ThemedView style={[styles.container, styles.containerBooks, { backgroundColor: booksCanvasBg }]}>
          <ThemedView style={[styles.formContainerBooks, { backgroundColor: booksCanvasBg }]}>
            <ThemedView style={[styles.formContent, { flex: 1, backgroundColor: booksCanvasBg }]}>
              <PracticeBooksList
                loading={loading}
                isDarkMode={isDarkMode}
                gradeDigit={gradeDigit}
                booksSearchQuery={booksSearchQuery}
                setBooksSearchQuery={setBooksSearchQuery}
                availableYears={availableYears}
                booksCategory={booksCategory}
                setBooksCategory={setBooksCategory}
                displaySubjects={displaySubjects}
                selectedSubject={selectedSubject}
                booksSubjectRowY={booksSubjectRowY}
                booksListScrollRef={booksListScrollRef}
                onSubjectPress={onBooksSubjectPress}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <PracticeChapterChooserModal
          visible={showChapterChooser && !!selectedSubjectData}
          onDismiss={dismissBooksChapterModal}
          isDarkMode={isDarkMode}
          tintColor={colors.tint}
          selectedSubject={selectedSubject}
          selectedSubjectData={selectedSubjectData}
          booksChapterModeLabel={booksChapterModeLabel}
          booksChapterModalStep={booksChapterModalStep}
          setBooksChapterModalStep={setBooksChapterModalStep}
          booksEitherPendingChapter={booksEitherPendingChapter}
          setBooksEitherPendingChapter={setBooksEitherPendingChapter}
          booksChapterIntent={booksChapterIntent}
          booksModalChaptersSorted={booksModalChaptersSorted}
          chapterGridColumns={chapterGridColumns}
          applyBooksChapterAndStartMcq={applyBooksChapterAndStartMcq}
          applyBooksChapterAndOpenFlashcards={applyBooksChapterAndOpenFlashcards}
        />
        <Modal
          visible={showNationalExamSubjectChooser}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNationalExamSubjectChooser(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowNationalExamSubjectChooser(false)}
            />
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              margin: 20,
              maxHeight: '80%',
              width: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5
            }}>
              <View style={{
                backgroundColor: 'rgba(15,75,215,0.05)',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(15,75,215,0.1)'
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#0F4BD7', fontSize: 18, fontWeight: '600' }}>
                    {t('mcq.subjects.selectSubject', { defaultValue: 'Select Subject' })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowNationalExamSubjectChooser(false)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close" size={20} color="#0F4BD7" />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: 'rgba(15,75,215,0.7)', fontSize: 14, marginTop: 4 }}>
                  {t('mcq.subjects.nationalExam', { defaultValue: 'National Exam' })}
                </Text>
              </View>

              <ScrollView
                style={styles.booksChapterGridScroll}
                contentContainerStyle={styles.booksChapterGridScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.booksChapterBody}>
                  <View style={styles.booksChapterGrid}>
                  {subjectLoading ? (
                    <View style={{ 
                      flex: 1, 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      minHeight: 200 
                    }}>
                      <Text style={{ 
                        color: '#0F4BD7', 
                        fontSize: 18, 
                        fontWeight: '500',
                        textAlign: 'center'
                      }}>
                        Loading...
                      </Text>
                    </View>
                  ) : availableSubjects.length === 0 ? (
                    <Text style={[styles.booksChapterGridEmpty, { color: 'rgba(15,75,215,0.6)' }]}>
                      No subjects available.
                    </Text>
                  ) : (
                    availableSubjects.map((subject, idx) => (
                      <TouchableOpacity
                        key={subject}
                        style={[
                          styles.booksChapterGridCell,
                          { width: `${100 / 2}%`, maxWidth: `${100 / 2}%` },
                        ]}
                        onPress={() => handleNationalExamSubjectPress(subject)}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.booksChapterTile,
                            {
                              backgroundColor: 'rgba(15,75,215,0.05)',
                              borderColor: 'rgba(15,75,215,0.15)',
                              justifyContent: 'center',
                              alignItems: 'center',
                            },
                          ]}
                        >
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.booksChapterTileLabel,
                              { 
                                color: '#0F4BD7',
                                fontSize: 16,
                                fontWeight: '500',
                                textAlign: 'center',
                                textAlignVertical: 'center'
                              },
                            ]}
                          >
                            {subject}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {booksHubActionLoading && (
          <View
            style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }]}
            pointerEvents="auto"
          >
            <ActivityIndicator size="large" color={BRAND_BLUE} />
          </View>
        )}

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ThemedView
        style={[styles.container, { backgroundColor: colors.background }, styles.practiceQuestionContainer]}
      >
        <ThemedView
          style={[styles.content, { backgroundColor: colors.background }, styles.questionModeInnerContent]}
        >
          <PracticeMcqQuestionView
            colors={colors}
            isDarkMode={isDarkMode}
            sessionProgressLabel={t('mcq.results.sessionProgress')}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            timeHours={timeHours}
            timeMinutes={timeMinutes}
            timeSeconds={timeSeconds}
            showAnswerMessage={showAnswerMessage}
            selectAnswerHint={t('mcq.selectAnswer')}
            currentQuestion={currentQuestion}
            selectedAnswer={selectedAnswer}
            showExplanation={showExplanation}
            getOptionStyle={getOptionStyle}
            onSelectOption={handleAnswerSelect}
            onAdvance={() => (isLastQuestion ? handleResult() : handleNextQuestion())}
            onPrevious={handlePreviousQuestion}
            reviewLaterLabel={t('mcq.results.reviewLater')}
            finishLabel={t('mcq.finish')}
            nextLabel={t('mcq.next')}
            isLastQuestion={isLastQuestion}
            scrollViewRef={scrollViewRef}
          />
        </ThemedView>
      </ThemedView>

      <PracticeSettingsModal
        visible={showPracticeSettings}
        onClose={() => setShowPracticeSettings(false)}
        autoNextEnabled={autoNextEnabled}
        onToggleAutoNext={setAutoNextEnabled}
        autoNextDelay={autoNextDelay}
        onChangeDelay={setAutoNextDelay}
      />
    </SafeAreaView>
  );
}
