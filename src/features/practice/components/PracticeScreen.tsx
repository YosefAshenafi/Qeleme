import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Modal, ActivityIndicator, TextInput, Image, Text, Keyboard, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useAuth } from '@/core/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/features/common/components/ThemedText';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { ThemedView } from '@/features/common/components/ThemedView';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
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
import { BOOK_CARD_IMAGE_HEIGHT, BOOK_CTA_ON, BOOKS_CANVAS, BRAND_BLUE } from '@/features/practice/constants/practiceUi';
import type { BooksCategoryFilter } from '@/features/practice/utils/booksCategory';
import { getSubjectBooksCategory } from '@/features/practice/utils/booksCategory';
import { formatPracticeTime, getTimeParts } from '@/features/practice/utils/practiceTime';
import { toTitleCase } from '@/features/practice/utils/toTitleCase';
import { PracticeLoadingState } from './PracticeLoadingState';
import { PracticeErrorState } from './PracticeErrorState';
import { PracticeNoSubjectsState } from './PracticeNoSubjectsState';
import { PracticeSessionResultsPanel } from './PracticeSessionResultsPanel';
import { PracticeMcqQuestionView } from './PracticeMcqQuestionView';
import { PracticeScreenStyles as styles } from './PracticeScreen.styles';

type BooksChapterIntent = 'practice' | 'flashcards' | 'either' | null;

export default function PracticeScreen() {
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
  
  const [selectedExamType, setSelectedExamType] = useState<string | null>('practice');
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
      ? 'Multiple Questions'
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
      name: `${year} National Exam`,
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

      setSelectedExamType((prev) => {
        if (params.preSelectedExamType === 'national' && params.preSelectedYear) {
          return prev;
        }
        if (prev === 'national') {
          return prev;
        }
        return 'practice';
      });
    }).catch((error) => {
      setError(error instanceof Error ? error.message : 'Failed to load practice data');
    }).finally(() => {
      setLoading(false);
    });
  };

  
  useEffect(() => {
    fetchPracticeData();
  }, []);

  
  useEffect(() => {
    if (selectedGrade && !needsExamTypeSelection(selectedGrade)) {
      setSelectedExamType('practice');
    }
  }, [selectedGrade]);

  
  useEffect(() => {
    if (params.preSelectedSubject && params.preSelectedSubjectId && practiceData) {
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
      
      
      setSelectedChapter('');
      setSelectedChapterName('');
      setSelectedYear(null);
      
      
      setSelectedExamType('practice');
      
      
      const subjectId = params.preSelectedSubjectId as string;
      setSelectedSubject(subjectId);
      setIsPreSelected(true);
    }
  }, [params.preSelectedSubject, params.preSelectedSubjectId, practiceData]);

  
  useEffect(() => {
    if (selectedExamType === 'national' && availableSubjects.length > 0 && booksListScrollRef.current) {
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
    };
  }, [selectedExamType, availableSubjects, booksSubjectRowY]);

  
  useEffect(() => {
    if (selectedExamType !== 'practice') return;
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
  }, [selectedExamType, selectedSubject, displaySubjects]);

  
  useEffect(() => {
    if (params.preSelectedExamType === 'national' && params.preSelectedYear && practiceData) {
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
      
      
      if (params.booksCategory === 'national') {
        setSelectedExamType('practice');
        setBooksCategory('national');
        setSelectedSubject(`national-${params.preSelectedYear}`);
      } else {
        
        setSelectedExamType('national');
        setSelectedYear(params.preSelectedYear as string);
      }
      
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
    if (selectedExamType === 'national') {
      fetchNationalExamAvailable();
    }
  }, [selectedExamType]);

  
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
        router.replace('/kg-dashboard');
      }
    };
    checkPhoneNumber();
  }, [user?.grade]);

  useLayoutEffect(() => {
    
    (navigation as any)?.setOptions?.({
      headerLeft: () => (showResult || nationalExamQuestions.length > 0) ? (
        <TouchableOpacity 
          onPress={() => {
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
            setSelectedExamType('practice');
          }} 
          style={{ padding: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
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
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{selectedSubject}{selectedChapterName ? `: ${selectedChapterName.replace(/-(\d+)$/, '')}` : ''}</Text>
        </View>
      ) : null,
      headerRight: () => (
        <LanguageToggle colors={{ card: '#F3F4F6', text: '#4B5563' }} />
      ),
      headerTitleAlign: 'center',
    });
  }, [navigation, colors.text, showResult, nationalExamQuestions.length]);

  useEffect(() => {
    
    if (params.reset === 'true') {
      setSelectedGrade(null);
      setSelectedExamType('practice');
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
      
      const subjectName = selectedSubjectData?.name || '';
      if (!subjectName) {
        return;
      }

      await trackingService.trackMCQActivity({
        grade: selectedGrade?.id || user?.grade || 'unknown',
        subject: subjectName,
        chapter: selectedChapterData?.name || undefined,
        examType: selectedExamType as 'national' | 'regular' | undefined,
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
        if (selectedExamType === 'national') {
          
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

  const handleStartTest = async () => {
    if (!selectedGrade || !selectedSubject) {
      return;
    }

    if (selectedExamType === 'national') {
      if (!selectedYear) {
        return;
      }

      try {
        const gradeNumber = getGradeNumber(user?.grade);

        const questions = await getNationalExamQuestions(
          gradeNumber,
          parseInt(selectedYear),
          selectedSubject
        );

        const filteredQuestions = questions?.filter(q => 
          !q.question?.toLowerCase().includes('valuing our elders')
        ) || [];

        if (!filteredQuestions || filteredQuestions.length === 0) {
          setError('No questions found for this exam. Please try another year or subject.');
          return;
        }

        
        setNationalExamQuestions(filteredQuestions);

        
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
      } catch (error) {
        setError('Failed to load national exam questions. Please try again.');
      }
    } else {
      if (!selectedChapter) {
        return;
      }

      try {
        const gradeNumber = getGradeNumber(user?.grade);
        const subjectId = selectedSubject;
        const chapterId = selectedChapter;

        const questions = await getRegularPracticeQuestions(gradeNumber, subjectId, chapterId);

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
      } catch (error) {
        setError('Failed to load practice questions. Please try again.');
      }
    }
  };

  const dismissBooksChapterModal = () => {
    setShowChapterChooser(false);
    setBooksChapterIntent(null);
    setBooksChapterModalStep('grid');
    setBooksEitherPendingChapter(null);
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedChapterName('');
    setSelectedExamType('practice');
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
    setSelectedExamType('practice');
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

  
  if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
    return <Redirect href="/kg-dashboard" />;
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
    const correctCount = score;
    const incorrectCount = Math.max(0, totalQuestions - score);
    const accuracy = totalQuestionsSafe > 0 ? Math.round((score / totalQuestionsSafe) * 100) : 0;
    const resultCopy =
      accuracy >= 90
        ? { title: 'Outstanding work.', subtitle: 'You’re performing at a top level — keep it up.' }
        : accuracy >= 75
          ? { title: 'Great job.', subtitle: 'Solid accuracy — a little more practice and you’ll master it.' }
          : accuracy >= 50
            ? { title: 'Good progress.', subtitle: 'You’re getting there — review mistakes and try again.' }
            : { title: 'Keep practising.', subtitle: 'Focus on the explanations and retake the session.' };

    const handleDone = () => {
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

      if (selectedExamType === 'national') {
        setSelectedExamType('national');
      } else {
        setSelectedExamType('practice');
      }

      fetchPracticeData();
    };

    return (
      <PracticeSessionResultsPanel
        backgroundColor={colors.background}
        textColor={colors.text}
        isDarkMode={isDarkMode}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        accuracy={accuracy}
        formattedTime={formatPracticeTime(time)}
        resultCopy={resultCopy}
        performanceLabel={t('mcq.results.performance')}
        retryLabel={t('mcq.results.retrySession')}
        doneLabel={t('mcq.results.done')}
        onRetry={handleRetry}
        onDone={handleDone}
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
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: selectedExamType === 'practice' ? booksCanvasBg : colors.background,
          },
        ]}
        edges={selectedExamType === 'practice' ? ['bottom', 'left', 'right'] : undefined}
      >
        
        {selectedExamType === 'national' && (
            <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setSelectedExamType('practice');
                  setSelectedSubject('');
                  setSelectedChapter('');
                  setSelectedChapterName('');
                  setSelectedYear(null);
                }}
              >
                  <IconSymbol name="chevron.left" size={24} color={isDarkMode ? '#FFFFFF' : colors.tint} />
                </TouchableOpacity>
              <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
                {t('mcq.nationalExam')}
              </ThemedText>
            </View>
          )}
        <ThemedView
          style={[
            styles.container,
            selectedExamType === 'practice' && styles.containerBooks,
            { backgroundColor: selectedExamType === 'practice' ? booksCanvasBg : colors.background },
          ]}
        >
          <ThemedView
            style={[
              selectedExamType === 'practice' ? styles.formContainerBooks : styles.formContainer,
              {
                backgroundColor: selectedExamType === 'practice' ? booksCanvasBg : colors.background,
              },
            ]}
          >
            <ThemedView
              style={[
                styles.formContent,
                selectedExamType === 'practice' && { flex: 1 },
                { backgroundColor: selectedExamType === 'practice' ? booksCanvasBg : colors.background },
              ]}
            >
              
              {selectedExamType && (
                <>
                  
                  {selectedExamType === 'national' && (
                    <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                        {t('mcq.year')}
                      </ThemedText>
                      <TouchableOpacity
                        style={[styles.formInput, { backgroundColor: colors.cardAlt, borderColor: isDarkMode ? '#FFFFFF' : colors.border }]}
                        onPress={() => setShowYearDropdown(!showYearDropdown)}
                      >
                        <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                          {selectedYear || t('mcq.selectYear')}
                        </ThemedText>
                        <IconSymbol name="chevron.right" size={20} color={isDarkMode ? '#FFFFFF' : colors.tint} />
                      </TouchableOpacity>
                      {showYearDropdown && (
                        <Modal
                          visible={showYearDropdown}
                          transparent={true}
                          animationType="fade"
                          onRequestClose={() => setShowYearDropdown(false)}
                        >
                          <TouchableOpacity
                            style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                            activeOpacity={1}
                            onPress={() => setShowYearDropdown(false)}
                          >
                            <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
                              <ScrollView showsVerticalScrollIndicator={false}>
                                {availableYears.map((year) => (
                                  <TouchableOpacity
                                    key={year}
                                    style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                                    onPress={() => {
                                      setSelectedYear(year.toString());
                                      setShowYearDropdown(false);
                                    }}
                                  >
                                    <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{year}</ThemedText>
                                    <IconSymbol name="chevron.right" size={20} color={isDarkMode ? '#FFFFFF' : colors.tint} />
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </ThemedView>
                          </TouchableOpacity>
                        </Modal>
                      )}
                    </ThemedView>
                  )}

                  
                  {selectedExamType === 'national' && (
                    <>
                      <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                        <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                          {t('mcq.subject')}
                          {isPreSelected && (
                            <ThemedText style={[styles.preSelectedLabel, { color: colors.tint }]}> </ThemedText>
                          )}
                        </ThemedText>
                        <TouchableOpacity
                          style={[
                            styles.formInput,
                            {
                              backgroundColor: isPreSelected && isDarkMode ? colors.tint + '20' : colors.cardAlt,
                              borderColor: isPreSelected
                                ? isDarkMode
                                  ? '#FFFFFF'
                                  : colors.tint
                                : isDarkMode
                                  ? '#FFFFFF'
                                  : colors.border,
                              borderWidth: isPreSelected ? 2 : 1,
                            },
                          ]}
                          onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                        >
                          <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                            {selectedSubject ? toTitleCase(selectedSubject) : t('mcq.selectSubject')}
                          </ThemedText>
                          <IconSymbol name="chevron.right" size={20} color={isDarkMode ? '#FFFFFF' : colors.tint} />
                        </TouchableOpacity>
                        {showSubjectDropdown && (
                          <Modal
                            visible={showSubjectDropdown}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setShowSubjectDropdown(false)}
                          >
                            <TouchableOpacity
                              style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                              activeOpacity={1}
                              onPress={() => setShowSubjectDropdown(false)}
                            >
                              <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                  {availableSubjects.map((subject) => (
                                    <TouchableOpacity
                                      key={subject}
                                      style={[
                                        styles.modalItem,
                                        { backgroundColor: colors.background, borderBottomColor: colors.border },
                                      ]}
                                      onPress={() => {
                                        setSelectedSubject(subject);
                                        setSelectedChapter('');
                                        setSelectedChapterName('');
                                        setIsPreSelected(false);
                                        setShowSubjectDropdown(false);
                                      }}
                                    >
                                      <ThemedText style={[styles.modalItemText, { color: colors.text }]}>
                                        {toTitleCase(subject)}
                                      </ThemedText>
                                      <IconSymbol name="chevron.right" size={20} color={isDarkMode ? '#FFFFFF' : colors.tint} />
                                    </TouchableOpacity>
                                  ))}
                                </ScrollView>
                              </ThemedView>
                            </TouchableOpacity>
                          </Modal>
                        )}
                      </ThemedView>

                      <TouchableOpacity
                        style={[
                          styles.startButton,
                          { backgroundColor: colors.tint },
                          (!selectedSubject || !selectedYear) && { opacity: 0.5 },
                        ]}
                        onPress={handleStartTest}
                        disabled={!selectedSubject || !selectedYear}
                      >
                        <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>
                          {t('mcq.startQuiz')}
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  )}

                  
                  {selectedExamType === 'practice' && (
                    <>
                      {loading ? (
                        <View style={styles.booksHubScroll}>
                          <ActivityIndicator size="large" color={BRAND_BLUE} style={{ marginTop: 48 }} />
                        </View>
                      ) : (
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
                                      
                                      const year = subject.id.replace('national-', '');
                                      
                                      handleNationalExamYearPress(year);
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
                                >
                                  <View
                                    style={[
                                      styles.bookRowImageWrap,
                                      { height: BOOK_CARD_IMAGE_HEIGHT },
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
                                          <Text style={styles.bookRowNoImageTitle}>
                                            {subject.name}
                                          </Text>
                                          <Text style={styles.bookRowNoImageSubtitle}>
                                            Grade {gradeDigit}
                                          </Text>
                                        </View>
                                      </>
                                    )}
                                    <View style={styles.bookRowBadge}>
                                      <Text style={styles.bookRowBadgeText}>
                                        {subject.id.startsWith('national-') 
                                          ? t('mcq.subjects.badgeNational', { defaultValue: 'NATIONAL' })
                                          : index % 2 === 0
                                            ? t('mcq.subjects.badgeNew')
                                            : t('mcq.subjects.badgeUpdated')}
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={styles.bookRowBody}>
                                    <ThemedText style={[styles.bookRowTitle, { color: booksPrimaryText }]}>
                                      {t('mcq.subjects.cardTitle', { grade: gradeDigit, subject: subject.name })}
                                    </ThemedText>
                                    <ThemedText
                                      style={[styles.bookRowDesc, { color: booksMutedText }]}
                                      numberOfLines={2}
                                    >
                                      {t('mcq.subjects.cardDescription')}
                                    </ThemedText>
                                  </View>
                                </TouchableOpacity>
                                <View
                                  style={[
                                    styles.bookRowActions,
                                    {
                                      borderTopWidth: 1,
                                      borderColor: booksCardBorder,
                                      backgroundColor: booksChipIdleOnPanel,
                                    },
                                  ]}
                                >
                                  <TouchableOpacity
                                    style={[
                                      styles.bookRowPillFilled,
                                      { backgroundColor: BRAND_BLUE, shadowColor: BRAND_BLUE },
                                    ]}
                                    onPress={() => {
                                      
                                      const isNationalExamYear = subject.id.startsWith('national-');
                                      
                                      if (isNationalExamYear) {
                                        
                                        const year = subject.id.replace('national-', '');
                                        
                                        handleNationalExamYearPress(year);
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
                                    <IconSymbol name="doc.text.fill" size={20} color={BOOK_CTA_ON} />
                                    <Text style={styles.bookRowPillTextOnBlue}>
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
                                      <IconSymbol name="rectangle.stack" size={20} color={BOOK_CTA_ON} />
                                      <Text style={styles.bookRowPillTextOnBlue}>
                                        {t('mcq.subjects.flashcards')}
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            );
                          })}

                          {filteredBooksSubjects.length === 0 && (
                            <ThemedText
                              style={[styles.booksEmpty, { color: booksMutedText }]}
                            >
                              {t('mcq.subjects.empty')}
                            </ThemedText>
                          )}
                          </ScrollView>
                          </View>
                        </View>
                      )}
                    </>
                  )}
                </>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <Modal
          visible={
            showChapterChooser &&
            !!selectedSubjectData &&
            selectedExamType === 'practice'
          }
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
                      Select Chapter Number
                    </ThemedText>
                  ) : null}
                  <View style={{ marginTop: booksChapterModalStep === 'eitherPick' ? 0 : 6, gap: 2 }}>
                    <ThemedText
                      style={styles.booksChapterModalSubject}
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
                            <ThemedText style={[styles.booksChapterGridCellIndexText, { color: BRAND_BLUE }]}>
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
            hoursLabel={t('mcq.results.timeLabels.hours')}
            minutesLabel={t('mcq.results.timeLabels.minutes')}
            secondsLabel={t('mcq.results.timeLabels.seconds')}
            showAnswerMessage={showAnswerMessage}
            selectAnswerHint={t('mcq.selectAnswer')}
            currentQuestion={currentQuestion}
            selectedAnswer={selectedAnswer}
            showExplanation={showExplanation}
            getOptionStyle={getOptionStyle}
            onSelectOption={handleAnswerSelect}
            onAdvance={() => (isLastQuestion ? handleResult() : handleNextQuestion())}
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
