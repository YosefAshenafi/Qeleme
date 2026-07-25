import React, { useEffect, useLayoutEffect } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { localizeSubjectName } from '@/features/common/utils/subjectDisplayName';
import type { Grade, Subject, NationalExamAPIResponse } from '@/features/common/services/practiceService';
import type { BooksCategoryFilter } from '@/features/practice/utils/booksCategory';
import { gradeNeedsExamTypeSelection } from './practiceHelpers';

// The effects in this hook intentionally use curated dependency arrays that
// reproduce the original screen behavior exactly. The setters and refs received
// via props are stable (useState/useRef), so excluding them is safe.
/* eslint-disable react-hooks/exhaustive-deps */

type RouteParams = { [key: string]: string | string[] | undefined };

export interface PracticeLifecycleDeps {
  fetchPracticeData: () => void;
  fetchNationalExamAvailable: () => Promise<void> | void;
  booksCategory: BooksCategoryFilter | 'national';
  selectedGrade: Grade | null;
  userGrade: string | undefined;
  timerRef: MutableRefObject<ReturnType<typeof setInterval> | null>;
  advanceRef: MutableRefObject<() => void>;
  isLastQuestion: boolean;
  handleResult: () => Promise<void> | void;
  handleNextQuestion: () => void;
  clearAutoNext: () => void;
  navigation: any;
  colors: { text: string };
  showTest: boolean;
  showResult: boolean;
  nationalExamQuestions: NationalExamAPIResponse[];
  selectedChapterName: string;
  selectedSubjectData: Subject | undefined;
  t: (key: string, options?: Record<string, unknown>) => string;
  exitSession: () => void;
  params: RouteParams;
  setBooksChapterIntent: Dispatch<SetStateAction<'practice' | 'flashcards' | 'either' | null>>;
  setBooksChapterModalStep: Dispatch<SetStateAction<'grid' | 'eitherPick'>>;
  setBooksEitherPendingChapter: Dispatch<SetStateAction<any>>;
  setUserPhoneNumber: Dispatch<SetStateAction<string | null>>;
  setSelectedGrade: Dispatch<SetStateAction<Grade | null>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setSelectedChapter: Dispatch<SetStateAction<string>>;
  setSelectedChapterName: Dispatch<SetStateAction<string>>;
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  setSelectedAnswer: Dispatch<SetStateAction<string | null>>;
  setShowExplanation: Dispatch<SetStateAction<boolean>>;
  setAnsweredQuestions: Dispatch<SetStateAction<{ [key: number]: string }>>;
  setShowAnswerMessage: Dispatch<SetStateAction<boolean>>;
  setScore: Dispatch<SetStateAction<number>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  setShowTest: Dispatch<SetStateAction<boolean>>;
  setTime: Dispatch<SetStateAction<number>>;
  setIsTimerRunning: Dispatch<SetStateAction<boolean>>;
}

// National exam availability, screen focus refetch, KG redirect, the navigation
// header configuration, auto-next bookkeeping and the route-driven reset — i.e.
// every side-effect that coordinates the screen but is not preselection.
export function usePracticeLifecycle(deps: PracticeLifecycleDeps) {
  const {
    fetchPracticeData,
    fetchNationalExamAvailable,
    booksCategory,
    selectedGrade,
    userGrade,
    timerRef,
    advanceRef,
    isLastQuestion,
    handleResult,
    handleNextQuestion,
    clearAutoNext,
    navigation,
    colors,
    showTest,
    showResult,
    nationalExamQuestions,
    selectedChapterName,
    selectedSubjectData,
    t,
    exitSession,
    params,
    setBooksChapterIntent,
    setBooksChapterModalStep,
    setBooksEitherPendingChapter,
    setUserPhoneNumber,
    setSelectedGrade,
    setSelectedSubject,
    setSelectedChapter,
    setSelectedChapterName,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setShowExplanation,
    setAnsweredQuestions,
    setShowAnswerMessage,
    setScore,
    setShowResult,
    setShowTest,
    setTime,
    setIsTimerRunning,
  } = deps;

  useEffect(() => {
    if (booksCategory === 'national') {
      fetchNationalExamAvailable();
    }
  }, [booksCategory]);

  useEffect(() => {
    if (selectedGrade && gradeNeedsExamTypeSelection(selectedGrade, userGrade)) {
      fetchNationalExamAvailable();
    }
  }, [selectedGrade?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPracticeData();

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setBooksChapterIntent(null);
        setBooksChapterModalStep('grid');
        setBooksEitherPendingChapter(null);
      };
    }, [selectedGrade])
  );

  useEffect(() => {
    const checkPhoneNumber = async () => {
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      setUserPhoneNumber(phoneNumber);

      if (typeof userGrade === 'string' && userGrade.toLowerCase().includes('kg')) {
        router.replace('/early-dashboard');
      }
    };
    checkPhoneNumber();
  }, [userGrade]);

  // Keep advanceRef pointing at the current advance action, and clear any
  // pending auto-next timer on unmount.
  React.useEffect(() => {
    advanceRef.current = () => {
      if (isLastQuestion) {
        void handleResult();
      } else {
        handleNextQuestion();
      }
    };
  });

  React.useEffect(() => clearAutoNext, [clearAutoNext]);

  // Session grade, shown as a small line above the subject in the MCQ header.
  const headerGradeDigit = (selectedGrade?.id || selectedGrade?.name || userGrade || '').replace(
    /\D/g,
    ''
  );

  useLayoutEffect(() => {
    (navigation as any)?.setOptions?.({
      headerLeft: () => (showTest || showResult || nationalExamQuestions.length > 0) ? (
        <TouchableOpacity
          onPress={exitSession}
          style={{ padding: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: 50, height: 44, marginLeft: 8 }}
          resizeMode="contain"
        />
      ),
      headerTitle: () => showResult ? (
        null
      ) : nationalExamQuestions.length > 0 ? (
        <View style={{ alignItems: 'center' }}>
          {headerGradeDigit ? (
            <Text
              style={{
                fontSize: 12,
                lineHeight: 16,
                fontWeight: '600',
                color: colors.text,
                opacity: 0.65,
              }}
            >
              {t('mcq.gradeLabel', { grade: headerGradeDigit })}
            </Text>
          ) : null}
          <Text style={{ fontSize: 16, lineHeight: 22, fontWeight: '600', color: colors.text }}>
            {`${localizeSubjectName(selectedSubjectData?.name, t)}${selectedChapterName ? ` : ${t('mcq.chapterShort')} ${selectedChapterName.replace(/-(\d+)$/, '')}` : ''}`.trim()}
          </Text>
        </View>
      ) : null,
      headerRight: () => (
        <LanguageToggle colors={{ card: '#F3F4F6', text: '#4B5563' }} />
      ),
      headerTitleAlign: 'center',
    });
  }, [navigation, colors.text, showTest, showResult, nationalExamQuestions.length, selectedChapterName, selectedSubjectData?.name, headerGradeDigit, t, exitSession]);

  useEffect(() => {
    if (params.reset === 'true') {
      setSelectedGrade(null);
      setSelectedSubject('');
      setSelectedChapter('');
      setSelectedChapterName('');
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnsweredQuestions({});
      setShowAnswerMessage(false);
      setScore(0);
      setShowResult(false);
      setShowTest(false);
      setTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsTimerRunning(false);
    }
  }, [params.reset]);
}
