import React from 'react';
import { TouchableOpacity, ScrollView, View, Modal, ActivityIndicator, TextInput, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import type { Subject } from '@/features/common/services/practiceService';
import type { BooksCategoryFilter } from '@/features/practice/utils/booksCategory';
import { usePracticeScreen } from '@/features/practice/hooks/usePracticeScreen';
import { PracticeLoadingState } from './PracticeLoadingState';
import { PracticeErrorState } from './PracticeErrorState';
import { PracticeNoSubjectsState } from './PracticeNoSubjectsState';
import { PracticeSessionResultsPanel } from './PracticeSessionResultsPanel';
import { PracticeMcqQuestionView } from './PracticeMcqQuestionView';

export default function PracticeScreen() {
  const {
    isKGStudent,
    isDarkMode,
    user,
    colors,
    t,
    loading,
    setLoading,
    error,
    setError,
    practiceData,
    setPracticeData,
    selectedGrade,
    setSelectedGrade,
    selectedSubject,
    setSelectedSubject,
    selectedChapter,
    setSelectedChapter,
    selectedChapterName,
    setSelectedChapterName,
    selectedYear,
    setSelectedYear,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedAnswer,
    setSelectedAnswer,
    showExplanation,
    setShowExplanation,
    answeredQuestions,
    setAnsweredQuestions,
    showAnswerMessage,
    setShowAnswerMessage,
    scrollViewRef,
    booksListScrollRef,
    booksSubjectRowY,
    explanationRef,
    score,
    setScore,
    showResult,
    setShowResult,
    showTest,
    setShowTest,
    showSubjectDropdown,
    setShowSubjectDropdown,
    showChapterDropdown,
    setShowChapterDropdown,
    showYearDropdown,
    setShowYearDropdown,
    userPhoneNumber,
    setUserPhoneNumber,
    availableSubjects,
    setAvailableSubjects,
    availableYears,
    setAvailableYears,
    nationalExamQuestions,
    setNationalExamQuestions,
    showChapterChooser,
    setShowChapterChooser,
    showNationalExamSubjectChooser,
    setShowNationalExamSubjectChooser,
    isPreSelected,
    setIsPreSelected,
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
    setSubjectLoading,
    booksChapterModeLabel,
    booksHubActionLoading,
    setBooksHubActionLoading,
    time,
    setTime,
    isTimerRunning,
    setIsTimerRunning,
    timerRef,
    selectedGradeData,
    selectedSubjectData,
    selectedChapterData,
    practiceSubjectsSorted,
    filteredBooksSubjects,
    nationalExamYears,
    displaySubjects,
    chapterGridColumns,
    booksModalChaptersSorted,
    currentQuestion,
    isLastQuestion,
    totalQuestions,
    totalQuestionsSafe,
    startTimer,
    stopTimer,
    normalizeGrade,
    getGradeNumber,
    needsExamTypeSelection,
    fetchPracticeData,
    fetchNationalExamAvailable,
    handleNationalExamYearPress,
    handleNationalExamSubjectPress,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleResult,
    exitSession,
    handleCheckOtherQuestions,
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
    SUBJECT_ROW_COVER_WIDTH,
    SUBJECT_ROW_COVER_HEIGHT,
    BOOK_CTA_ON,
    BOOKS_CANVAS,
    BRAND_BLUE,
    getBookCover,
    Keyboard,
    LinearGradient,
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
    const booksCanvasBg = isDarkMode ? BOOKS_CANVAS.dark : BOOKS_CANVAS.light;
    const gradeDigit = user?.grade?.replace(/\D/g, '') || '12';
    const booksPrimaryText = isDarkMode ? '#F3F4F6' : '#111827';
    const booksMutedText = isDarkMode ? '#9CA3AF' : '#6B7280';
    const booksCardBg = isDarkMode ? '#252A32' : '#FFFFFF';
    const booksCardBorder = isDarkMode ? '#2C3340' : '#E5E7EB';
    const booksChipInactiveBg = isDarkMode ? '#252A32' : '#FFFFFF';
    const booksChipIdleOnPanel = isDarkMode ? '#2A313D' : '#F3F4F6';
    const booksChipIdleBorderOnPanel = isDarkMode ? '#363D4A' : '#E5E7EB';

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: booksCanvasBg }]} edges={['bottom', 'left', 'right']}>
        <ThemedView style={[styles.container, styles.containerBooks, { backgroundColor: booksCanvasBg }]}>
          <ThemedView style={[styles.formContainerBooks, { backgroundColor: booksCanvasBg }]}>
            <ThemedView style={[styles.formContent, { flex: 1, backgroundColor: booksCanvasBg }]}>
              {loading ? (
                        <View style={styles.booksHubScroll}>
                          <ActivityIndicator size="large" color={BRAND_BLUE} style={{ marginTop: 48 }} />
                        </View>
                      ) : (
                        <View style={styles.booksHubSplit}>
                          {booksCategory !== 'national' && (
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
                          )}

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

                          {displaySubjects.map((subject, index) => {
                            const ext = subject as Subject & { image_url?: string };
                            const imageUrl = ext.image_url?.trim() ? ext.image_url : undefined;
                            const cover = getBookCover(subject.name);
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
                                  onPress={() => {
                                    const isNationalExamYear = subject.id.startsWith('national-');
                                    if (isNationalExamYear) {
                                      handleNationalExamYearPress(subject.id.replace('national-', ''));
                                    } else {
                                      setSelectedSubject(subject.id);
                                      setSelectedChapter('');
                                      setSelectedChapterName('');
                                      setIsPreSelected(false);
                                      setBooksChapterIntent('either');
                                      setBooksChapterModalStep('grid');
                                      setShowChapterChooser(true);
                                    }
                                  }}
                                  activeOpacity={0.92}
                                  accessibilityRole="button"
                                  accessibilityLabel={t('mcq.subjects.cardTitle', {
                                    grade: gradeDigit,
                                    subject: subject.name,
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
                                          {subject.name}
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
                                    onPress={() => {
                                      const isNationalExamYear = subject.id.startsWith('national-');
                                      if (isNationalExamYear) {
                                        handleNationalExamYearPress(subject.id.replace('national-', ''));
                                      } else {
                                        setSelectedSubject(subject.id);
                                        setSelectedChapter('');
                                        setSelectedChapterName('');
                                        setIsPreSelected(false);
                                        setBooksChapterIntent('either');
                                        setBooksChapterModalStep('grid');
                                        setShowChapterChooser(true);
                                      }
                                    }}
                                  >
                                    <ThemedText
                                      style={[styles.bookRowTitle, { color: booksPrimaryText }]}
                                      numberOfLines={2}
                                    >
                                      {t('mcq.subjects.cardTitle', { grade: gradeDigit, subject: subject.name })}
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
                                      onPress={() => {
                                        const isNationalExamYear = subject.id.startsWith('national-');
                                        if (isNationalExamYear) {
                                          handleNationalExamYearPress(subject.id.replace('national-', ''));
                                        } else {
                                          setSelectedSubject(subject.id);
                                          setSelectedChapter('');
                                          setSelectedChapterName('');
                                          setIsPreSelected(false);
                                          setBooksChapterIntent('practice');
                                          setBooksChapterModalStep('grid');
                                          setShowChapterChooser(true);
                                        }
                                      }}
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
                                        onPress={() => {
                                          setSelectedSubject(subject.id);
                                          setSelectedChapter('');
                                          setSelectedChapterName('');
                                          setIsPreSelected(false);
                                          setBooksChapterIntent('flashcards');
                                          setBooksChapterModalStep('grid');
                                          setShowChapterChooser(true);
                                        }}
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
                      )}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <Modal
          visible={showChapterChooser && !!selectedSubjectData}
          transparent
          animationType="fade"
          onRequestClose={dismissBooksChapterModal}
        >
          <View style={styles.booksChapterModalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={dismissBooksChapterModal}
            />
            <ThemedView
              style={[
                styles.booksChapterModalCard,
                {
                  backgroundColor: booksCardBg,
                  borderColor: booksCardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.booksChapterModalHeader,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)',
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  {booksChapterModalStep !== 'eitherPick' ? (
                    <ThemedText
                      style={[
                        styles.booksChapterModalHeaderTitle,
                        { color: booksMutedText, fontWeight: '600' },
                      ]}
                    >
                      Select Chapter
                    </ThemedText>
                  ) : null}
                  <View style={{ marginTop: booksChapterModalStep === 'eitherPick' ? 0 : 6, gap: 2 }}>
                    <ThemedText
                      style={[styles.booksChapterModalSubject, isDarkMode && { color: '#FFFFFF' }]}
                      numberOfLines={2}
                    >
                      {selectedSubjectData?.name}
                    </ThemedText>
                    {booksChapterModeLabel ? (
                      <ThemedText
                        style={[styles.booksChapterModalSubtitle, { color: colors.tint }]}
                        numberOfLines={2}
                      >
                        {booksChapterModeLabel}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (booksChapterModalStep === 'eitherPick') {
                      setBooksChapterModalStep('grid');
                      setBooksEitherPendingChapter(null);
                    } else {
                      dismissBooksChapterModal();
                    }
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                >
                  <IconSymbol
                    name={booksChapterModalStep === 'eitherPick' ? 'chevron.left' : 'xmark.circle.fill'}
                    size={24}
                    color={booksMutedText}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.booksChapterModalDivider,
                  { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)' },
                ]}
              />

              {booksChapterModalStep === 'eitherPick' && booksEitherPendingChapter ? (
                <View style={styles.booksChapterBody}>
                  <View style={styles.booksChapterEitherActions}>
                  <TouchableOpacity
                    style={[styles.booksChapterEitherPill, { backgroundColor: BRAND_BLUE }]}
                    onPress={() => {
                      if (!selectedSubject) return;
                      void applyBooksChapterAndStartMcq(booksEitherPendingChapter, selectedSubject);
                    }}
                    activeOpacity={0.9}
                  >
                    <IconSymbol name="doc.text.fill" size={20} color="#fff" />
                    <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>
                      {t('mcq.subjects.qaPractice')}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.booksChapterEitherPill, { backgroundColor: BRAND_BLUE }]}
                    onPress={() => {
                      if (!selectedSubjectData) return;
                      void applyBooksChapterAndOpenFlashcards(
                        booksEitherPendingChapter,
                        selectedSubjectData.name
                      );
                    }}
                    activeOpacity={0.9}
                  >
                    <IconSymbol name="rectangle.stack" size={20} color="#fff" />
                    <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>
                      {t('mcq.subjects.flashcards')}
                    </ThemedText>
                  </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <ScrollView
                  style={styles.booksChapterGridScroll}
                  contentContainerStyle={styles.booksChapterGridScrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.booksChapterBody}>
                    <View style={styles.booksChapterGrid}>
                    {booksModalChaptersSorted.length === 0 ? (
                      <ThemedText style={[styles.booksChapterGridEmpty, { color: booksMutedText }]}>
                        No chapters available.
                      </ThemedText>
                    ) : (
                      booksModalChaptersSorted.map((chapter, idx) => (
                        <TouchableOpacity
                          
                          key={`${chapter.id}-${idx}`}
                          style={[
                            styles.booksChapterGridCell,
                            { width: `${100 / chapterGridColumns}%`, maxWidth: `${100 / chapterGridColumns}%` },
                          ]}
                          onPress={() => {
                            if (!selectedSubjectData) return;
                            if (booksChapterIntent === 'either') {
                              setBooksEitherPendingChapter(chapter);
                              setBooksChapterModalStep('eitherPick');
                            } else if (booksChapterIntent === 'flashcards') {
                              void applyBooksChapterAndOpenFlashcards(chapter, selectedSubjectData.name);
                            } else {
                              void applyBooksChapterAndStartMcq(chapter, selectedSubject);
                            }
                          }}
                          activeOpacity={0.85}
                        >
                          <View
                            style={[
                              styles.booksChapterTile,
                              {
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(2,6,23,0.03)',
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)',
                              },
                            ]}
                          >
                            <ThemedText style={[styles.booksChapterGridCellIndexText, { color: isDarkMode ? '#FFFFFF' : BRAND_BLUE }]}>
                              {idx + 1}
                            </ThemedText>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                    </View>
                  </View>
                </ScrollView>
              )}
            </ThemedView>
          </View>
        </Modal>

        
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
            onExit={exitSession}
            reviewLaterLabel={t('mcq.results.reviewLater')}
            finishLabel={t('mcq.finish')}
            nextLabel={t('mcq.next')}
            isLastQuestion={isLastQuestion}
            scrollViewRef={scrollViewRef}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}
