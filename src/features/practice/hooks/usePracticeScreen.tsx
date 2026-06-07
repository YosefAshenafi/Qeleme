import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Image, Text, Keyboard, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useAuth } from '@/core/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { getBookCover } from '@/features/common/services/bookCoverService';
import {
  getPracticeData,
  type PracticeData,
  type Grade,
  type Subject,
  type Chapter,
  type Option,
  getNationalExamQuestions,
  getNationalExamAvailable,
  type NationalExamAPIResponse,
  getRegularPracticeQuestions,
} from '@/features/common/services/practiceService';
import { getFlashcardStructure, getFlashcardsForChapter } from '@/features/common/services/flashcardService';
import { getAuthToken } from '@/features/auth/utils/authStorage';
import { BASE_URL } from '@/config/constants';

import ActivityTrackingService from '@/features/common/services/activityTrackingService';
import { BOOK_CARD_IMAGE_HEIGHT, BOOK_CTA_ON, BOOKS_CANVAS, BRAND_BLUE, SUBJECT_ROW_COVER_WIDTH, SUBJECT_ROW_COVER_HEIGHT } from '@/features/practice/constants/practiceUi';
import type { BooksCategoryFilter } from '@/features/practice/utils/booksCategory';
import { getSubjectBooksCategory } from '@/features/practice/utils/booksCategory';
import { formatPracticeTime, getTimeParts } from '@/features/practice/utils/practiceTime';
import { PracticeScreenStyles as styles } from '../components/PracticeScreen.styles';

type BooksChapterIntent = 'practice' | 'flashcards' | 'either' | null;

export function usePracticeScreen() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);
  const { width: windowWidth } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedChapterName, setSelectedChapterName] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: string }>({});
  const [showAnswerMessage, setShowAnswerMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const booksListScrollRef = useRef<ScrollView>(null);
  const booksSubjectRowY = useRef<Record<string, number>>({});
  const explanationRef = useRef<View>(null);
  // Guards one-shot consumption of route preselection params. A focus refetch
  // refreshes practiceData, so without this the preselect effects would re-run
  // and snap the user back to the originally selected subject/national exam.
  const preSelectionAttempted = useRef(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [nationalExamQuestions, setNationalExamQuestions] = useState<NationalExamAPIResponse[]>([]);
  const [showChapterChooser, setShowChapterChooser] = useState(false);
  const [showNationalExamSubjectChooser, setShowNationalExamSubjectChooser] = useState(false);
  const [isPreSelected, setIsPreSelected] = useState(false);
  const [booksSearchQuery, setBooksSearchQuery] = useState('');
  const [booksCategory, setBooksCategory] = useState<BooksCategoryFilter | 'national'>('all');
  const [booksChapterIntent, setBooksChapterIntent] = useState<BooksChapterIntent>(null);
  
  const [booksChapterModalStep, setBooksChapterModalStep] = useState<'grid' | 'eitherPick'>('grid');
  const [booksEitherPendingChapter, setBooksEitherPendingChapter] = useState<Chapter | null>(null);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const booksChapterModeLabel =
    booksChapterIntent === 'practice'
      ? 'Multiple Choice Questions'
      : booksChapterIntent === 'flashcards'
        ? 'Flashcards'
        : '';
  
  const [booksHubActionLoading, setBooksHubActionLoading] = useState(false);

  
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedGradeData = practiceData?.grades.find((grade: Grade) => grade.id === selectedGrade?.id);
  const selectedSubjectData = selectedGradeData?.subjects.find((subject: Subject) => subject.id === selectedSubject);
  const selectedChapterData = selectedSubjectData?.chapters.find((chapter: Chapter) => chapter.id === selectedChapter);
  const practiceSubjectsSorted = useMemo(() => {
    if (!selectedGradeData?.subjects) return [];
    return [...selectedGradeData.subjects].sort((a, b) => {
      const getSubjectNumber = (name: string) => {
        const match = name.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getSubjectNumber(a.name) - getSubjectNumber(b.name);
    });
  }, [selectedGradeData]);

  const filteredBooksSubjects = useMemo(() => {
    let list = practiceSubjectsSorted;
    const q = booksSearchQuery.trim().toLowerCase();
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q));
    
    
    if (booksCategory !== 'all') {
      list = list.filter((s) => getSubjectBooksCategory(s.name) === booksCategory);
    }
    
    return list;
  }, [practiceSubjectsSorted, booksSearchQuery, booksCategory]);

  
  const nationalExamYears = useMemo(() => {
    if (availableYears.length === 0) return [];
    
    return availableYears.map(year => ({
      id: `national-${year}`,
      name: `${year} National Exam (A.A)`,
      chapters: [] 
    }));
  }, [availableYears]);

  
  const displaySubjects = useMemo(() => {
    if (booksCategory === 'national') {
      return nationalExamYears;
    } else {
      return filteredBooksSubjects;
    }
  }, [booksCategory, filteredBooksSubjects, nationalExamYears]);

  const chapterGridColumns = useMemo(() => {
    
    if (windowWidth < 350) return 3;
    if (windowWidth < 420) return 4;
    return 5;
  }, [windowWidth]);

  const booksModalChaptersSorted = useMemo(() => {
    if (!selectedSubjectData?.chapters?.length) return [];
    return [...selectedSubjectData.chapters].sort((a, b) => {
      const getChapterNumber = (name: string) => {
        const match = name.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getChapterNumber(a.name) - getChapterNumber(b.name);
    });
  }, [selectedSubjectData]);

  const currentQuestion = nationalExamQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (nationalExamQuestions.length - 1);
  const totalQuestions = nationalExamQuestions.length;
  const totalQuestionsSafe = Math.max(1, totalQuestions);

  const startTimer = () => {
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  

  useEffect(() => {
    const shouldRun = showTest && !showResult;

    if (shouldRun) {
      if (!timerRef.current) startTimer();
      return;
    }

    stopTimer();
  }, [showTest, showResult]);

  const normalizeGrade = (gradeString: string | undefined): string => {
    if (!gradeString) return '6'; 
    return gradeString.replace(/^grade\s*/i, '').trim();
  };

  
  const getGradeNumber = (gradeString: string | undefined): number => {
    const normalized = normalizeGrade(gradeString);
    return parseInt(normalized) || 6; 
  };

  
  const needsExamTypeSelection = (grade: Grade | null) => {
    if (!grade) return false;
    
    
    const userGradeNumber = getGradeNumber(user?.grade);
    
    
    if (userGradeNumber !== 6) {
      return [6, 8, 12].includes(userGradeNumber);
    }
    
    
    const gradeNumber = parseInt(grade.id.replace('grade-', ''));
    return [6, 8, 12].includes(gradeNumber);
  };

  
  const fetchPracticeData = async () => {
    setLoading(true);
    setError(null);
    
    
    
    
    
    const normalizedGradeNumber = normalizeGrade(user?.grade);
    const userGrade = `grade-${normalizedGradeNumber}`;
    const gradeToFetch = selectedGrade?.id || userGrade;

    getPracticeData(gradeToFetch).then(data => {
      if (data.grades.length > 0 && !selectedGrade) {
        setSelectedGrade(data.grades[0]);
      }
      
      setPracticeData(data);
    }).catch((error) => {
      setError(error instanceof Error ? error.message : 'Failed to load practice data');
    }).finally(() => {
      setLoading(false);
    });
  };

  
  useEffect(() => {
    fetchPracticeData();
  }, []);

  
  // A new (or changed) preselection arrived from navigation — allow it to be
  // applied exactly once. Param-only dependency means a practiceData refetch
  // does NOT reset this guard.
  useEffect(() => {
    preSelectionAttempted.current = false;
  }, [params.preSelectedSubject, params.preSelectedSubjectId, params.preSelectedExamType, params.preSelectedYear]);

  useEffect(() => {
    if (params.preSelectedSubject && params.preSelectedSubjectId && practiceData && !preSelectionAttempted.current) {
      preSelectionAttempted.current = true;
      setShowTest(false);
      setShowResult(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnsweredQuestions({});
      setShowAnswerMessage(false);
      setScore(0);
      setNationalExamQuestions([]);


      setSelectedChapter('');
      setSelectedChapterName('');
      setSelectedYear(null);

      // Reset the category filter and search so the full subject list shows
      // (they may have been left on 'national'/filtered from a previous selection).
      setBooksCategory('all');
      setBooksSearchQuery('');

      const subjectId = params.preSelectedSubjectId as string;
      setSelectedSubject(subjectId);
      setIsPreSelected(true);

      // Arriving from a Home subject tile: after scrolling to the selected book,
      // open the chapter chooser in "either" mode so the user picks a chapter and
      // then chooses MCQ (Q&A) or Flashcards.
      setBooksEitherPendingChapter(null);
      setBooksChapterIntent('either');
      setBooksChapterModalStep('grid');
      setShowChapterChooser(true);
    }
  }, [params.preSelectedSubject, params.preSelectedSubjectId, practiceData]);

  
  useEffect(() => {
    if (booksCategory === 'national' && availableSubjects.length > 0 && booksListScrollRef.current) {
      const scrollToNationalSubject = () => {
        const firstNationalSubject = availableSubjects[0];
        if (firstNationalSubject && booksSubjectRowY.current[firstNationalSubject]) {
          booksListScrollRef.current.scrollTo({
            y: booksSubjectRowY.current[firstNationalSubject],
            animated: true,
          });
        }
      };

      const timer = setTimeout(scrollToNationalSubject, 500);
      return () => clearTimeout(timer);
    }
  }, [booksCategory, availableSubjects, booksSubjectRowY]);

  
  useEffect(() => {
    if (!selectedSubject) return;
    if (!displaySubjects.some((s) => s.id === selectedSubject)) return;

    const scrollToSelected = () => {
      const scrollNode = booksListScrollRef.current;
      const y = booksSubjectRowY.current[selectedSubject];
      if (!scrollNode) return;
      if (typeof y !== 'number') return;
      scrollNode.scrollTo({ y: Math.max(0, y - 16), animated: true });
    };

    const tmr = setTimeout(scrollToSelected, 250);
    return () => clearTimeout(tmr);
  }, [selectedSubject, displaySubjects]);

  
  useEffect(() => {
    if (params.preSelectedExamType === 'national' && params.preSelectedYear && practiceData && !preSelectionAttempted.current) {
      preSelectionAttempted.current = true;
      setShowTest(false);
      setShowResult(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnsweredQuestions({});
      setShowAnswerMessage(false);
      setScore(0);
      setNationalExamQuestions([]);
      setShowChapterChooser(false);
      
      
      setSelectedSubject('');
      setSelectedChapter('');
      setSelectedChapterName('');

      setBooksCategory('national');
      setSelectedSubject(`national-${params.preSelectedYear}`);
      
      setIsPreSelected(true); 
      
      
      fetchNationalExamAvailable();
    }
  }, [params.preSelectedExamType, params.preSelectedYear, params.booksCategory, practiceData]);

  
  useEffect(() => {
    if (isPreSelected) {
      
      const isFromPreSelection = params.preSelectedSubjectId === selectedSubject || 
        (params.preSelectedExamType === 'national' && params.preSelectedYear === selectedYear);
      
      if (!isFromPreSelection) {
        setIsPreSelected(false);
      }
    }
  }, [selectedSubject, selectedYear, isPreSelected, params.preSelectedSubjectId, params.preSelectedExamType, params.preSelectedYear]);

  
  const fetchNationalExamAvailable = async () => {
    if (!user?.grade) {
      return;
    }
    
    try {
      setLoading(true);
      const gradeNumber = getGradeNumber(user.grade);
      
      if (![6, 8, 12].includes(gradeNumber)) {
        setError('National exams are only available for grades 6, 8, and 12');
        return;
      }
      
      
      const data = await getNationalExamAvailable(gradeNumber);
      setAvailableYears(data.data.years);
      setAvailableSubjects(data.data.subjects);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch available national exam data');
    } finally {
      setLoading(false);
    }
  };

  
  const handleNationalExamYearPress = async (year: string) => {
    try {
      const gradeNumber = getGradeNumber(user?.grade);

      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/national-exams/${gradeNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch national exam data`);
      }

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error('Invalid API response structure');
      }

      const yearData = data.data.years.find((y: { year: number }) => y.year === parseInt(year, 10));

      const subjectsForYear = yearData ? yearData.subjects : [];

      setAvailableSubjects(subjectsForYear);
      setSelectedYear(year);
      setShowNationalExamSubjectChooser(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load subjects');
    }
  };

  
  const handleNationalExamSubjectPress = async (subject: string) => {
    if (!selectedYear) {
      setError('Please select a year first');
      return;
    }

    try {
      setSubjectLoading(true);
      const gradeNumber = getGradeNumber(user?.grade);
      const questions = await getNationalExamQuestions(
        gradeNumber,
        parseInt(selectedYear),
        subject
      );
      
      
      const filteredQuestions = questions?.filter((q) => {
        const questionText = q.question?.toLowerCase() || '';
        const shouldFilter =
          questionText.includes('valuing our elders') ||
          (questionText.includes('valuing') && questionText.includes('elders'));
        return !shouldFilter;
      }) || [];
      
      if (filteredQuestions && filteredQuestions.length > 0) {
        setNationalExamQuestions(filteredQuestions);
        setShowTest(true);
        startTimer();
        setSelectedSubject(subject);
        setIsPreSelected(true);
        setShowNationalExamSubjectChooser(false);
      } else {
        setError('No questions available for this subject');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      setSubjectLoading(false);
    }
  };

  
  useEffect(() => {
    if (booksCategory === 'national') {
      fetchNationalExamAvailable();
    }
  }, [booksCategory]);

  
  useEffect(() => {
    if (selectedGrade && needsExamTypeSelection(selectedGrade)) {
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
      
      
      if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
        router.replace('/early-dashboard');
      }
    };
    checkPhoneNumber();
  }, [user?.grade]);

  const exitSession = React.useCallback(() => {
    setNationalExamQuestions([]);
    setShowResult(false);
    setShowTest(false);
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedChapterName('');
    setSelectedGrade(null);
    setSelectedYear(null);
    setCurrentQuestionIndex(0);
    setAnsweredQuestions({});
    setSelectedAnswer(null);
  }, []);

  useLayoutEffect(() => {

    (navigation as any)?.setOptions?.({
      headerLeft: () => (showResult || nationalExamQuestions.length > 0) ? (
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
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            {`${selectedSubjectData?.name ?? ''}${selectedChapterName ? ` : ${t('mcq.chapterShort')} ${selectedChapterName.replace(/-(\d+)$/, '')}` : ''}`.trim()}
          </Text>
        </View>
      ) : null,
      headerRight: () => (
        <LanguageToggle colors={{ card: '#F3F4F6', text: '#4B5563' }} />
      ),
      headerTitleAlign: 'center',
    });
  }, [navigation, colors.text, showResult, nationalExamQuestions.length, selectedChapterName, selectedSubjectData?.name, t, exitSession]);

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

  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answerId);
    setAnsweredQuestions((prev) => ({ ...prev, [currentQuestionIndex]: answerId }));
    setShowExplanation(true);
    setShowAnswerMessage(false);

    const isCorrect = currentQuestion?.options?.find((opt: Option) => opt.id === answerId)?.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    
    setTimeout(() => {
      explanationRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        scrollViewRef.current?.scrollTo({
          y: pageY - 100,
          animated: true
        });
      });
    }, 100);
  };

  const handleNextQuestion = () => {
    
    if (currentQuestionIndex < nationalExamQuestions.length - 1) {
      if (!selectedAnswer) {
        setShowAnswerMessage(true);
        return;
      }
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowAnswerMessage(false);
    } else {
      setShowResult(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answeredQuestions[currentQuestionIndex - 1] || null);
      setShowExplanation(true);
    }
  };

  const handleResult = async () => {
    stopTimer();
    setShowResult(true);
    
    
    try {
      if (!user?.username) {
        return;
      }
      
      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize(user.username);
      
      const totalQuestions = nationalExamQuestions.length;
      const correctAnswers = score;
      const timeSpent = time; 
      const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      const subjectName = (selectedSubjectData?.name || selectedSubject || '').trim();
      if (!subjectName) {
        return;
      }

      await trackingService.trackMCQActivity({
        grade: selectedGrade?.id || user?.grade || 'unknown',
        subject: subjectName,
        chapter: selectedChapterData?.name || undefined,
        examType: selectedYear ? 'national' : 'regular',
        year: selectedYear ? parseInt(selectedYear) : undefined,
        questionsAnswered: totalQuestions,
        correctAnswers: correctAnswers,
        timeSpent: timeSpent,
        score: scorePercentage,
      });
    } catch {
    }
  };

  const handleCheckOtherQuestions = async () => {
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    
    const isKGStudent = typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg');
    
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowAnswerMessage(false);
    setScore(0);
    setShowResult(false);
    setShowTest(false);
    setAnsweredQuestions({});
    setTime(0);
    setIsTimerRunning(false);
    
    if (isKGStudent) {
      
      if (selectedSubjectData && selectedChapterData) {
        const sortedChapters = [...selectedSubjectData.chapters].sort((a, b) => {
          
          const getChapterNumber = (name: string) => {
            const match = name.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getChapterNumber(a.name) - getChapterNumber(b.name);
        });
        
        const currentChapterIndex = sortedChapters.findIndex((chapter: Chapter) => chapter.id === selectedChapter);
        const nextChapterIndex = currentChapterIndex + 1;
        
        if (nextChapterIndex < sortedChapters.length) {
          const nextChapter = sortedChapters[nextChapterIndex];
          setSelectedChapter(nextChapter.id);
          setSelectedChapterName(nextChapter.name);
        } else {
          
          const firstChapter = sortedChapters[0];
          setSelectedChapter(firstChapter.id);
          setSelectedChapterName(firstChapter.name);
        }
        
        
        setBooksChapterIntent('practice');
        setBooksChapterModalStep('grid');
        setShowChapterChooser(true);
      }
    } else {
      
      try {
        if (selectedYear) {
          if (!selectedYear || !selectedSubject) {
            setError('Missing required parameters for national exam');
            return;
          }
          
          const gradeNumber = getGradeNumber(user?.grade);
          const questions = await getNationalExamQuestions(
            gradeNumber,
            parseInt(selectedYear),
            selectedSubject
          );
          
          
          const filteredQuestions = questions?.filter(q => 
            !q.question?.toLowerCase().includes('valuing our elders')
          ) || [];
          
          if (filteredQuestions && filteredQuestions.length > 0) {
            setNationalExamQuestions(filteredQuestions);
            setShowTest(true);
            startTimer();
          } else {
            setError('No more questions available for this exam');
          }
        } else {
          
          if (!selectedSubject || !selectedChapter) {
            setError('Missing required parameters for MCQ');
            return;
          }
          
          const gradeNumber = getGradeNumber(user?.grade);
          const questions = await getRegularPracticeQuestions(
            gradeNumber,
            selectedSubject,
            selectedChapter
          );
          
          if (questions && questions.length > 0) {
            setNationalExamQuestions(questions);
            setShowTest(true);
            startTimer();
          } else {
            setError('No more questions available for this chapter');
          }
        }
      } catch {
        setError('Failed to load new questions. Please try again.');
      }
    }
  };

  const handleRetry = () => {
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowAnswerMessage(false);
    setScore(0);
    setShowResult(false);
    setShowTest(false);
    setAnsweredQuestions({});
    setTime(0);
    setIsTimerRunning(false);
    
    
    setTimeout(() => {
      startTimer();
    }, 100);
  };

  const dismissBooksChapterModal = () => {
    setShowChapterChooser(false);
    setBooksChapterIntent(null);
    setBooksChapterModalStep('grid');
    setBooksEitherPendingChapter(null);
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedChapterName('');
    setShowSubjectDropdown(false);
    setShowChapterDropdown(false);
    setShowYearDropdown(false);
  };

  const applyBooksChapterAndStartMcq = async (chapter: Chapter, subjectId: string) => {
    if (!subjectId.trim()) return;
    if (!practiceData?.grades?.length) {
      setError('Curriculum is still loading. Please try again.');
      return;
    }

    const userGradeId = `grade-${normalizeGrade(user?.grade)}`;
    const grade =
      selectedGrade ||
      practiceData.grades.find((g) => g.id === userGradeId) ||
      practiceData.grades[0];

    if (!grade) {
      setError('No grade data available.');
      return;
    }

    setBooksHubActionLoading(true);
    setError(null);

    setSelectedGrade(grade);
    setSelectedSubject(subjectId);
    setSelectedChapter(chapter.id);
    setSelectedChapterName(chapter.name);
    setShowChapterChooser(false);
    setBooksChapterIntent(null);
    setBooksChapterModalStep('grid');
    setBooksEitherPendingChapter(null);

    try {
      const gradeNumber = getGradeNumber(user?.grade);
      const questions = await getRegularPracticeQuestions(gradeNumber, subjectId, chapter.id);

      if (!questions || questions.length === 0) {
        setError('No questions found for this chapter. Please try another chapter or contact support.');
        return;
      }

      setNationalExamQuestions(questions);
      setShowTest(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowAnswerMessage(false);
      setScore(0);
      setShowResult(false);
      setAnsweredQuestions({});
      setTime(0);
      startTimer();
    } catch {
      setError('Failed to load practice questions. Please try again.');
    } finally {
      setBooksHubActionLoading(false);
    }
  };

  const applyBooksChapterAndOpenFlashcards = async (chapter: Chapter, subjectName: string) => {
    setShowChapterChooser(false);
    setBooksChapterIntent(null);
    setBooksChapterModalStep('grid');
    setBooksEitherPendingChapter(null);
    setBooksHubActionLoading(true);
    setError(null);

    const normalizedGradeId = user?.grade?.replace(/[^\d]/g, '') || '12';

    try {
      const structure = await getFlashcardStructure(normalizedGradeId);
      const grade = structure[0];
      if (!grade?.subjects?.length) {
        setError(t('flashcards.noFlashcards'));
        return;
      }

      const searchTerm = subjectName.toLowerCase().trim();
      let subject = grade.subjects.find(
        (s) => s.name.toLowerCase().trim() === searchTerm
      );
      if (!subject) {
        subject = grade.subjects.find((s) => {
          const n = s.name.toLowerCase();
          return n.includes(searchTerm) || searchTerm.includes(n);
        });
      }

      if (!subject?.slug) {
        setError(t('flashcards.noFlashcards'));
        return;
      }

      const flashcards = await getFlashcardsForChapter(
        normalizedGradeId,
        subject.slug,
        chapter.name
      );

      if (!flashcards?.length) {
        setError(t('flashcards.noFlashcards'));
        return;
      }

      
      setSelectedChapter(chapter.id);
      setSelectedChapterName(chapter.name);
      router.push({
        pathname: '/(tabs)/flashcards',
        params: {
          preSelectedSubject: subjectName,
          
          
          subjectSlug: subject.slug,
          chapterName: chapter.name,
          gradeId: normalizedGradeId,
          startFlashcards: '1',
        },
      });
    } catch {
      setError(t('errors.network.message'));
    } finally {
      setBooksHubActionLoading(false);
    }
  };

  const getOptionStyle = (optionId: string) => {
    if (!showExplanation) return [styles.optionContainer];

    const isCorrect = currentQuestion?.options?.find((opt: Option) => opt.id === optionId)?.isCorrect;
    const isSelected = selectedAnswer === optionId;
    
    if (isCorrect) {
      return [
        {
          borderColor: BRAND_BLUE,
          borderWidth: 2,
        },
      ];
    }
    if (isSelected && !isCorrect) {
      return [
        {
          borderColor: '#F44336',
          borderWidth: 2,
        },
      ];
    }
    return [styles.optionContainer];
  };

  const { hours: timeHours, minutes: timeMinutes, seconds: timeSeconds } = getTimeParts(time);

  const handleSessionResultsDone = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setShowResult(false);
    setShowTest(false);
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedChapterName('');
    setSelectedYear('');
    setTime(0);
    setIsTimerRunning(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnsweredQuestions({});
    setScore(0);

    fetchPracticeData();
  };

  const sessionCorrectCount = score;
  const sessionIncorrectCount = Math.max(0, totalQuestions - score);
  const sessionAccuracy = totalQuestionsSafe > 0 ? Math.round((score / totalQuestionsSafe) * 100) : 0;
  const resultPanelCopy =
    sessionAccuracy >= 90
      ? { title: 'Outstanding work.', subtitle: 'You’re performing at a top level — keep it up.' }
      : sessionAccuracy >= 75
        ? { title: 'Great job.', subtitle: 'Solid accuracy — a little more practice and you’ll master it.' }
        : sessionAccuracy >= 50
          ? { title: 'Good progress.', subtitle: 'You’re getting there — review mistakes and try again.' }
          : { title: 'Keep practising.', subtitle: 'Focus on the explanations and retake the session.' };

  const isKGStudent = typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg');

  return {
    isKGStudent,
    isDarkMode,
    user,
    colors,
    windowWidth,
    params,
    t,
    navigation,
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
    formattedPracticeTime: formatPracticeTime(time),
    styles,
    BOOK_CARD_IMAGE_HEIGHT,
    SUBJECT_ROW_COVER_WIDTH,
    SUBJECT_ROW_COVER_HEIGHT,
    BOOK_CTA_ON,
    BOOKS_CANVAS,
    BRAND_BLUE,
    getBookCover,
    Keyboard,
    LinearGradient,
    StyleSheet,
  };
}
