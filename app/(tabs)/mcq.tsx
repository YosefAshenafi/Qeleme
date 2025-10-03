import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Animated, Modal, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { getColors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Redirect } from 'expo-router';

import { Header } from '../../components/Header';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import RichText from '../../components/ui/RichText';
import { getMCQData, MCQData, Grade, Subject, Chapter, Question, Option, ExamType, getNationalExamQuestions, getNationalExamAvailable, NationalExamAPIResponse, getRegularMCQQuestions } from '../../services/mcqService';
import ActivityTrackingService from '../../services/activityTrackingService';
import PictureMCQScreen from '../screens/PictureMCQScreen';
import PictureMCQInstructionScreen from '../screens/PictureMCQInstructionScreen';
import SponsoredBy from '../../components/SponsoredBy';

interface RecentActivity {
  type: string;
  grade: string;
  subject: string;
  chapter: string;
  timestamp: number;
  details: string;
}

export default function MCQScreen() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mcqData, setMcqData] = useState<MCQData | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
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
  const explanationRef = useRef<View>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const [isPictureQuestions, setIsPictureQuestions] = useState(false);
  const [showPictureMCQ, setShowPictureMCQ] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [nationalExamQuestions, setNationalExamQuestions] = useState<NationalExamAPIResponse[]>([]);
  const [showChapterChooser, setShowChapterChooser] = useState(false);
  const [isPreSelected, setIsPreSelected] = useState(false);
  
  // Timer states
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation refs for result screen
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(Array(64).fill(0).map(() => ({
    scale: new Animated.Value(0),
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    opacity: new Animated.Value(1),
    rotate: new Animated.Value(0),
  }))).current;

  // Derived state based on selections
  const selectedGradeData = mcqData?.grades.find((grade: Grade) => grade.id === selectedGrade?.id);
  const selectedSubjectData = selectedGradeData?.subjects.find((subject: Subject) => subject.id === selectedSubject);
  const selectedChapterData = selectedSubjectData?.chapters.find((chapter: Chapter) => chapter.id === selectedChapter);
  const currentQuestion = nationalExamQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (nationalExamQuestions.length - 1);
  const isFirstQuestion = currentQuestionIndex === 0;
  const totalQuestions = nationalExamQuestions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Timer functions (were accidentally removed)
  const startTimer = () => {
    // Clear any existing timer first
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to normalize grade strings and extract the number
  const normalizeGrade = (gradeString: string | undefined): string => {
    if (!gradeString) return '6'; // default
    return gradeString.replace(/^grade\s*/i, '').trim();
  };

  // Helper function to get grade number from grade string
  const getGradeNumber = (gradeString: string | undefined): number => {
    const normalized = normalizeGrade(gradeString);
    return parseInt(normalized) || 6; // default to 6 if parsing fails
  };

  // Function to check if exam type selection is needed
  const needsExamTypeSelection = (grade: Grade | null) => {
    if (!grade) return false;
    
    // Get the grade number from the user's profile if available
    const userGradeNumber = getGradeNumber(user?.grade);
    
    // If we have the user's grade, use that
    if (userGradeNumber !== 6) { // 6 is our default, so if it's not 6, we have a real grade
      // Only show exam type selection for grades 6, 8, and 12
      return [6, 8, 12].includes(userGradeNumber);
    }
    
    // Fallback to checking the UI grade if user grade is not available
    const gradeNumber = parseInt(grade.id.replace('grade-', ''));
    return [6, 8, 12].includes(gradeNumber);
  };

  // Fetch MCQ data from API
  const fetchMCQData = async () => {
    setLoading(true);
    setError(null);
    
    // If no grade is selected, use the user's grade or default to grade-6
    // Normalize the user's grade to ensure it's in the correct format
    // This prevents issues where user.grade might already contain "grade" prefix
    // (e.g., "Grade 6" from server) which would create "grade-Grade-6" when concatenated
    const normalizedGradeNumber = normalizeGrade(user?.grade);
    const userGrade = `grade-${normalizedGradeNumber}`;
    console.log('🔧 Grade Normalization:', {
      originalGrade: user?.grade,
      extractedNumber: normalizedGradeNumber,
      normalizedGrade: userGrade
    });
    const gradeToFetch = selectedGrade?.id || userGrade;
    console.log('🔧 Final Grade to Fetch:', gradeToFetch);
    

    getMCQData(gradeToFetch).then(data => {
      console.log('DATA:', data);
      
      // Reset selections first
      setSelectedSubject('');
      setSelectedChapter('');
      setSelectedChapterName('');
      
      // Set the grade if not already set
      if (data.grades.length > 0 && !selectedGrade) {
        setSelectedGrade(data.grades[0]);
      }
      
      // Set MCQ data after setting the grade to ensure they're in sync
      setMcqData(data);

      // For non-national exam students, automatically set exam type to 'mcq'
      if (selectedGrade && !needsExamTypeSelection(selectedGrade)) {
        setSelectedExamType('mcq');
      }
    }).catch(error => {
      console.log('ERROR:', error);
      setError(error instanceof Error ? error.message : 'Failed to load MCQ data');
    }).finally(() => {
      setLoading(false);
    });
  };

  // Add useEffect to handle initial data loading and grade changes
  useEffect(() => {
    fetchMCQData();
  }, []);

  // Add useEffect to handle exam type selection based on grade
  useEffect(() => {
    if (selectedGrade && !needsExamTypeSelection(selectedGrade)) {
      setSelectedExamType('mcq');
    }
  }, [selectedGrade]);

  // Handle pre-selected subject from URL parameters
  useEffect(() => {
    if (params.preSelectedSubject && params.preSelectedSubjectId && mcqData) {
      console.log('🎯 Pre-selected subject detected:', {
        subject: params.preSelectedSubject,
        subjectId: params.preSelectedSubjectId
      });
      
      // Reset any active MCQ session when navigating from home page
      setShowTest(false);
      setShowResult(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnsweredQuestions({});
      setShowAnswerMessage(false);
      setScore(0);
      setShowPictureMCQ(false);
      setIsPictureQuestions(false);
      setNationalExamQuestions([]);
      setShowChapterChooser(false);
      
      // Clear chapter and year selections
      setSelectedChapter('');
      setSelectedChapterName('');
      setSelectedYear(null);
      
      // Set the exam type to 'mcq' for regular MCQ
      setSelectedExamType('mcq');
      
      // Find and set the pre-selected subject
      const subjectId = params.preSelectedSubjectId as string;
      setSelectedSubject(subjectId);
      setIsPreSelected(true); // Mark as pre-selected
      
      console.log('✅ Pre-selected subject set:', subjectId);
      console.log('✅ Active MCQ session reset');
    }
  }, [params.preSelectedSubject, params.preSelectedSubjectId, mcqData]);

  // Clear pre-selected flag when user manually changes subject
  useEffect(() => {
    if (isPreSelected && selectedSubject) {
      // Check if this is a manual change (not from pre-selection)
      const isFromPreSelection = params.preSelectedSubjectId === selectedSubject;
      if (!isFromPreSelection) {
        setIsPreSelected(false);
      }
    }
  }, [selectedSubject, isPreSelected, params.preSelectedSubjectId]);

  // Function to fetch available national exam data
  const fetchNationalExamAvailable = async () => {
    if (!user?.grade) {
      return;
    }
    
    try {
      // Normalize the grade to extract just the number
      const gradeNumber = getGradeNumber(user.grade);
      
      if (![6, 8, 12].includes(gradeNumber)) {
        setError('National exams are only available for grades 6, 8, and 12');
        return;
      }
      
      const response = await getNationalExamAvailable(gradeNumber);
      
      if (response.success) {
        setAvailableSubjects(response.data.subjects);
        setAvailableYears(response.data.years);
      } else {
        setError('Failed to fetch available national exam data');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch available national exam data');
    }
  };

  // Add useEffect for fetching national exam data
  useEffect(() => {
    if (selectedExamType === 'national') {
      fetchNationalExamAvailable();
    }
  }, [selectedExamType]);

  useFocusEffect(
    React.useCallback(() => {
      // Fetch data and reset states when tab is focused
      fetchMCQData();
      
      return () => {
        // Clean up the timer when the screen loses focus
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [selectedGrade]) // Add selectedGrade as a dependency to refetch when grade changes
  );

  useEffect(() => {
    // Check phone number when component mounts
    const checkPhoneNumber = async () => {
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      setUserPhoneNumber(phoneNumber);
      
      // If user is a KG student, redirect to KG dashboard
      if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
        router.replace('/kg-dashboard');
      }
    };
    checkPhoneNumber();
  }, [user?.grade]);

  useEffect(() => {
    // Handle reset parameters
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

  // Cleanup effect to clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (showResult) {
      // Celebration animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showResult]);

  // Debug logging for current question - removed for performance

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const confettiScale = confettiAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const explosionScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.5],
  });

  const getMessage = () => {
    if (percentage >= 90) return t('mcq.results.message.genius');
    if (percentage >= 70) return t('mcq.results.message.doingWell');
    if (percentage >= 50) return t('mcq.results.message.notBad');
    return t('mcq.results.message.canDoBetter');
  };

  const handleAnswerSelect = (answerId: string) => {
    console.log('🎯 Answer Selected:', {
      answerId,
      currentQuestion: currentQuestion?.id,
      hasExplanation: !!currentQuestion?.explanation,
      explanation: currentQuestion?.explanation
    });
    
    if (selectedAnswer) return; // Prevent multiple selections
    setSelectedAnswer(answerId);
    setAnsweredQuestions(prev => ({ ...prev, [currentQuestionIndex]: answerId }));
    setShowExplanation(true);
    setShowAnswerMessage(false);
    
    console.log('🎯 Explanation should now be shown:', true);
    
    // Update score if answer is correct
    const isCorrect = currentQuestion?.options?.find((opt: Option) => opt.id === answerId)?.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Scroll to explanation after a short delay to ensure it's rendered
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
        console.log('❌ No answer selected, showing message');
        setShowAnswerMessage(true);
        return;
      }
      console.log('✅ Moving to next question');
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowAnswerMessage(false);
    } else {
      console.log('🏁 Last question reached, showing results');
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
    
    // Track activity using the new tracking service
    try {
      const trackingService = ActivityTrackingService.getInstance();
      await trackingService.initialize();
      
      const totalQuestions = nationalExamQuestions.length;
      const correctAnswers = score;
      const timeSpent = time; // time in seconds
      const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      await trackingService.trackMCQActivity({
        grade: selectedGrade?.id || user?.grade || 'unknown',
        subject: selectedSubjectData?.name || selectedSubject || 'unknown',
        chapter: selectedChapterData?.name || selectedChapter,
        examType: selectedExamType as 'national' | 'regular' | undefined,
        year: selectedYear ? parseInt(selectedYear) : undefined,
        questionsAnswered: totalQuestions,
        correctAnswers: correctAnswers,
        timeSpent: timeSpent,
        score: scorePercentage,
      });
    } catch (error) {
      console.error('Failed to track MCQ activity:', error);
      // Silently fail - activity tracking is not critical
    }
  };

  const handleRetry = () => {
    // Clear existing timer first
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
    
    // Start timer after a small delay to ensure state is reset
    setTimeout(() => {
      startTimer();
    }, 100);
  };

  const handleStartTest = async () => {
    console.log('=== START QUIZ DEBUG ===');
    console.log('Selected Grade:', selectedGrade);
    console.log('Selected Subject:', selectedSubject);
    console.log('Selected Chapter:', selectedChapter);
    console.log('Selected Exam Type:', selectedExamType);
    console.log('Selected Year:', selectedYear);
    console.log('User Grade:', user?.grade);
    
    if (!selectedGrade || !selectedSubject) {
      console.log('❌ Missing grade or subject selection');
      return;
    }

    if (selectedExamType === 'national') {
      console.log('🔄 Starting National Exam...');
      if (!selectedYear) {
        console.log('❌ Missing year selection for national exam');
        return;
      }

      try {
        // Use the user's grade number directly since we've already validated it
        const gradeNumber = getGradeNumber(user?.grade);
        console.log('📊 National Exam Parameters:', {
          gradeNumber,
          year: selectedYear,
          subject: selectedSubject
        });
        
        const questions = await getNationalExamQuestions(
          gradeNumber,
          parseInt(selectedYear),
          selectedSubject
        );

        console.log('✅ National Exam Questions Received:', questions?.length || 0);

        if (!questions || questions.length === 0) {
          console.log('❌ No national exam questions found');
          setError('No questions found for this exam. Please try another year or subject.');
          return;
        }

        // Store the questions in state
        setNationalExamQuestions(questions);

        // Start the test with national exam questions
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
        console.log('✅ National Exam Started Successfully');
      } catch (error) {
        setError('Failed to load national exam questions. Please try again.');
      }
    } else {
      console.log('🔄 Starting Regular MCQ...');
      // Regular MCQ logic
      if (!selectedChapter) {
        console.log('❌ Missing chapter selection for regular MCQ');
        return;
      }

      try {
        // Use the user's grade number directly
        const gradeNumber = getGradeNumber(user?.grade);
        
        // Get the subject ID from the selected subject
        const subjectId = selectedSubject;
        
        // Get the chapter ID from the selected chapter
        const chapterId = selectedChapter;
        
        console.log('📊 Regular MCQ Parameters:', {
          gradeNumber,
          subjectId,
          chapterId
        });
        
        const questions = await getRegularMCQQuestions(
          gradeNumber,
          subjectId,
          chapterId
        );

        console.log('✅ Regular MCQ Questions Received:', questions?.length || 0);

        if (!questions || questions.length === 0) {
          console.log('❌ No regular MCQ questions found');
          setError('No questions found for this chapter. Please try another chapter or contact support.');
          return;
        }

        // Store the questions in state for regular MCQ
        setNationalExamQuestions(questions); // Reuse this state for regular MCQ questions

        // Start the test
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
        console.log('✅ Regular MCQ Started Successfully');
      } catch (error) {
        console.error('❌ Regular MCQ Error:', error);
        setError('Failed to load MCQ questions. Please try again.');
      }
    }
    console.log('=== END START QUIZ DEBUG ===');
  };

  const getOptionStyle = (optionId: string) => {
    if (!showExplanation) return [styles.optionContainer];
    
    const isCorrect = currentQuestion?.options?.find((opt: Option) => opt.id === optionId)?.isCorrect;
    const isSelected = selectedAnswer === optionId;
    
    if (isCorrect) {
      return [
        styles.optionContainer,
        {
          borderColor: '#4CAF50',
          borderWidth: 2,
        }
      ];
    }
    if (isSelected && !isCorrect) {
      return [
        styles.optionContainer,
        {
          borderColor: '#F44336',
          borderWidth: 2,
        }
      ];
    }
    return [styles.optionContainer];
  };

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Handle starting the picture MCQ
  const handleStartPictureMCQ = () => {
    setShowPictureMCQ(true);
  };

  // Handle going back to instructions
  const handleBackToInstructions = () => {
    // Only allow going back to instructions if we're not in the middle of a test
    if (!currentQuestionIndex) {
      setShowPictureMCQ(false);
    }
  };

  // If showing picture questions, always show instruction screen first
  if (isPictureQuestions && !showPictureMCQ) {
    return <PictureMCQInstructionScreen onStart={handleStartPictureMCQ} />;
  }

  // If user has clicked start, show picture MCQ screen
  if (showPictureMCQ) {
    return <PictureMCQScreen onBackToInstructions={handleBackToInstructions} />;
  }

  // Redirect KG students to KG dashboard
  if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
    return <Redirect href="/kg-dashboard" />;
  }

  // Loading state rendering
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('mcq.title')} />
        <ThemedView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={{ marginTop: 20, color: colors.text }}>
            {t('common.loading')}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Error state rendering
  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title={t('mcq.title')} />
        <ThemedView style={[styles.mainContainer, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <ThemedView style={[styles.emptyStateContainer, { backgroundColor: colors.background }]}>
            <IconSymbol name="globe" size={90} color={colors.warning} style={styles.emptyStateIcon} />
            <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>
              {t('errors.network.title')}
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtitle, { color: colors.text, opacity: 0.7 }]}>
              {t('errors.network.message')}
            </ThemedText>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.tint, marginTop: 20 }]}
              onPress={fetchMCQData}
            >
              <ThemedText style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
                {t('common.tryAgain')}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  }
  
  // Debug state for empty subjects
  if (mcqData && mcqData.grades.length > 0 && (!selectedGradeData?.subjects || (selectedGradeData?.subjects?.length || 0) === 0)) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('mcq.title')} />
        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="warning-outline" size={60} color={colors.warning} />
            <ThemedText style={{ color: colors.error, fontWeight: 'bold', fontSize: 18, marginTop: 10, textAlign: 'center' }}>
              {t('mcq.noSubjectsFound.title')}
            </ThemedText>
          </View>
          
          <ThemedText style={{ color: colors.text, marginBottom: 20, textAlign: 'center', lineHeight: 22 }}>
            {t('mcq.noSubjectsFound.description', { gradeName: selectedGradeData?.name })}
          </ThemedText>
          
          <View style={{ marginBottom: 20, paddingHorizontal: 10 }}>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <ThemedText style={{ color: colors.text, marginRight: 5 }}>•</ThemedText>
              <ThemedText style={{ color: colors.text, flex: 1 }}>{t('mcq.noSubjectsFound.reasons.accountUpdate')}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <ThemedText style={{ color: colors.text, marginRight: 5 }}>•</ThemedText>
              <ThemedText style={{ color: colors.text, flex: 1 }}>{t('mcq.noSubjectsFound.reasons.serverUnavailable')}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <ThemedText style={{ color: colors.text, marginRight: 5 }}>•</ThemedText>
              <ThemedText style={{ color: colors.text, flex: 1 }}>{t('mcq.noSubjectsFound.reasons.contentBeingAdded')}</ThemedText>
            </View>
          </View>
          
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.tint, marginBottom: 15 }]}
              onPress={fetchMCQData}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <ThemedText style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 10 }}>
                {t('common.tryAgain')}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Ionicons name="home" size={20} color={colors.text} />
              <ThemedText style={{ color: colors.text, fontWeight: 'bold', marginLeft: 10 }}>
                {t('home.goto')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showResult) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            {t('mcq.results.title')}
          </ThemedText>
          <View style={[styles.timerContainer, { backgroundColor: colors.tint }]}>
            <ThemedText style={[styles.timerText, { color: '#fff' }]}>
              {t('mcq.results.timeTaken', { time: formatTime(time) })}
            </ThemedText>
          </View>
          {percentage >= 90 && (
            <View style={styles.fireworkContainer}>
              {particleAnims.map((anim, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.particle,
                    {
                      transform: [
                        { scale: anim.scale },
                        { translateX: anim.translateX },
                        { translateY: anim.translateY },
                        { rotate: anim.rotate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })},
                      ],
                      opacity: anim.opacity,
                    },
                  ]}
                >
                  <IconSymbol 
                    name="trophy.fill" 
                    size={36} 
                    color={index % 4 === 0 ? '#FFD700' : 
                           index % 4 === 1 ? '#FFA500' : 
                           index % 4 === 2 ? '#FF69B4' : '#FF1493'} 
                  />
                </Animated.View>
              ))}
            </View>
          )}
          <ThemedView style={[styles.resultCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[colors.cardGradientStart, colors.cardGradientEnd]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.trophyContainer}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate: spin }] }}>
                <IconSymbol name="trophy.fill" size={80} color={percentage >= 90 ? '#FFD700' : colors.tint} />
              </Animated.View>
            </View>
            
            <View style={styles.resultContent}>
              <ThemedText style={[styles.scoreText, { color: colors.text }]}>
                {t('mcq.results.score', { score: score, total: totalQuestions })}
              </ThemedText>
              
              <View style={[styles.percentageContainer, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                <ThemedText style={[styles.percentageText, { color: colors.text }]}>
                  {t('mcq.results.percentage', { percentage: percentage })}
                </ThemedText>
              </View>
              
              <View style={[styles.messageContainer, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                <ThemedText style={[styles.messageText, { color: colors.text }]}>
                  {getMessage()}
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton, { backgroundColor: colors.tint, marginBottom: 12 }]}
              onPress={handleRetry}
            >
              <ThemedText style={[styles.retryButtonText, { color: '#fff' }]}>{t('mcq.results.tryAgain')}</ThemedText>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.homeButton, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
              onPress={() => {
                // Clear timer first
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                
                setShowResult(false);
                setShowTest(false);
                setSelectedSubject('');
                setSelectedChapter('');
                setSelectedChapterName('');
                setTime(0);
                setIsTimerRunning(false);
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setShowExplanation(false);
                setAnsweredQuestions({});
                setScore(0);
                fetchMCQData();
              }}
            >
              <ThemedText style={[styles.homeButtonText, { color: colors.text }]}>{t('mcq.results.chooseAnotherSubject')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Sponsored By Section */}
          <SponsoredBy />
        </ScrollView>
      </ThemedView>
    );
  }

  // Chapter Chooser Interface - Show when subject is pre-selected from home page
  if (showChapterChooser && selectedSubject && selectedSubjectData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setShowChapterChooser(false);
              setSelectedSubject('');
              setSelectedChapter('');
              setSelectedChapterName('');
              // Reset to show the MCQ subject and chapter chooser
              setSelectedExamType('mcq');
              // Reset dropdown states
              setShowSubjectDropdown(false);
              setShowChapterDropdown(false);
              setShowYearDropdown(false);
            }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.tint} />
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
            Choose Chapter
          </ThemedText>
        </View>
        
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
            {/* Subject Info */}
            <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                Selected Subject
              </ThemedText>
              <View style={[styles.selectedSubjectContainer, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                <ThemedText style={[styles.selectedSubjectText, { color: colors.text }]}>
                  {selectedSubjectData.name}
                </ThemedText>
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
              </View>
            </ThemedView>

            {/* Chapter Selection */}
            <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                Select Chapter
              </ThemedText>
              <ScrollView style={styles.chapterList} showsVerticalScrollIndicator={false}>
                {selectedSubjectData.chapters?.sort((a, b) => {
                  // Extract numbers from chapter names for proper sorting
                  const getChapterNumber = (name: string) => {
                    const match = name.match(/(\d+)/);
                    return match ? parseInt(match[1], 10) : 0;
                  };
                  return getChapterNumber(a.name) - getChapterNumber(b.name);
                }).map((chapter: Chapter) => (
                  <TouchableOpacity
                    key={chapter.id}
                    style={[styles.chapterItem, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                    onPress={() => {
                      setSelectedChapter(chapter.id);
                      setSelectedChapterName(chapter.name);
                      setShowChapterChooser(false);
                      // Start the test after a short delay to ensure state is updated
                      setTimeout(() => {
                        handleStartTest();
                      }, 100);
                    }}
                  >
                    <View style={styles.chapterItemContent}>
                      <View style={[styles.chapterIcon, { backgroundColor: colors.tint }]}>
                        <IconSymbol name="doc.text.fill" size={20} color="#fff" />
                      </View>
                      <View style={styles.chapterTextContainer}>
                        <ThemedText style={[styles.chapterTitle, { color: colors.text }]}>
                          {chapter.name}
                        </ThemedText>
                        <ThemedText style={[styles.chapterSubtitle, { color: colors.text, opacity: 0.7 }]}>
                          {Math.floor(Math.random() * 50) + 10} questions
                        </ThemedText>
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                  </TouchableOpacity>
                )) || (
                  <View style={[styles.chapterItem, { backgroundColor: colors.cardAlt, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                    <ThemedText style={[styles.chapterTitle, { color: colors.text, opacity: 0.7 }]}>
                      No chapters available
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!showTest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {/* Only show the MCQ header if NOT on the exam type selection page */}
        {!(selectedGrade && needsExamTypeSelection(selectedGrade) && !selectedExamType) && (
          <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            {/* Only show back button for users who have national exam access */}
            {selectedGrade && needsExamTypeSelection(selectedGrade) && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setSelectedExamType(null);
                  setSelectedSubject('');
                  setSelectedChapter('');
                  setSelectedChapterName('');
                  setSelectedYear(null);
                }}
              >
                <IconSymbol name="chevron.left" size={24} color={colors.tint} />
              </TouchableOpacity>
            )}
            <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
              {selectedExamType === 'national' ? t('mcq.nationalExam') : t('mcq.mcqExam')}
            </ThemedText>
          </View>
        )}
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.formTitle, { color: colors.tint, marginTop: (selectedGrade && needsExamTypeSelection(selectedGrade) && !selectedExamType) ? 40 : 0 }]}>
              {selectedGrade && needsExamTypeSelection(selectedGrade) && !selectedExamType 
                ? t('mcq.selectExamType')
                : selectedExamType === 'national'
                ? t('mcq.nationalExam')
                : t('mcq.mcqExam')}
            </ThemedText>
            
            <ThemedView style={[styles.formContent, { backgroundColor: colors.background }]}>
              {/* Exam Type Selection for grades 6, 8, and 12 */}
              {selectedGrade && needsExamTypeSelection(selectedGrade) && !selectedExamType && (
                <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                  <View style={styles.examTypeContainer}>
                    <TouchableOpacity
                      style={[styles.examTypeButton, { backgroundColor: colors.cardAlt }]}
                      onPress={() => setSelectedExamType('national')}
                    >
                      <View style={styles.examTypeContent}>
                        <IconSymbol name="trophy.fill" size={40} color={colors.tint} style={styles.examTypeIcon} />
                        <View style={styles.examTypeTextContainer}>
                          <ThemedText style={[styles.examTypeText, { color: colors.text }]}>
                            {t('mcq.nationalExam')}
                          </ThemedText>
                          <ThemedText style={[styles.examTypeDescription, { color: colors.text, opacity: 0.7 }]}>
                            {t('mcq.nationalExamDescription')}
                          </ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.examTypeButton, { backgroundColor: colors.cardAlt }]}
                      onPress={() => setSelectedExamType('mcq')}
                    >
                      <View style={styles.examTypeContent}>
                        <IconSymbol name="questionmark.circle.fill" size={40} color={colors.tint} style={styles.examTypeIcon} />
                        <View style={styles.examTypeTextContainer}>
                          <ThemedText style={[styles.examTypeText, { color: colors.text }]}>
                            {t('mcq.mcqExam')}
                          </ThemedText>
                          <ThemedText style={[styles.examTypeDescription, { color: colors.text, opacity: 0.7 }]}>
                            {t('mcq.mcqExamDescription')}
                          </ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </ThemedView>
              )}

              {/* Subject and Chapter Selection - Only show after exam type is selected */}
              {selectedExamType && (
                <>
                  {/* Subject Selection */}
                  <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                    <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                      {t('mcq.subject')}
                      {isPreSelected && (
                        <ThemedText style={[styles.preSelectedLabel, { color: colors.tint }]}>
                          {' '}
                        </ThemedText>
                      )}
                    </ThemedText>
                    <TouchableOpacity
                      style={[
                        styles.formInput, 
                        { 
                          backgroundColor: colors.cardAlt, 
                          borderColor: isPreSelected ? colors.tint : colors.border,
                          borderWidth: isPreSelected ? 2 : 1,
                        }
                      ]}
                      onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    >
                      <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                        {selectedSubject ? (selectedExamType === 'national' ? toTitleCase(selectedSubject) : selectedGradeData?.subjects.find((s: Subject) => s.id === selectedSubject)?.name) : t('mcq.selectSubject')}
                      </ThemedText>
                      <IconSymbol name="chevron.right" size={20} color={colors.tint} />
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
                              {selectedExamType === 'national' ? (
                                availableSubjects.map((subject) => (
                                  <TouchableOpacity
                                    key={subject}
                                    style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                                    onPress={() => {
                                      setSelectedSubject(subject);
                                      setSelectedChapter('');
                                      setSelectedChapterName('');
                                      setIsPreSelected(false); // Clear pre-selected flag
                                      setShowSubjectDropdown(false);
                                    }}
                                  >
                                    <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{toTitleCase(subject)}</ThemedText>
                                    <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                                  </TouchableOpacity>
                                ))
                              ) : (
                                selectedGradeData?.subjects.sort((a, b) => {
                                  // Extract numbers from subject names for proper sorting
                                  const getSubjectNumber = (name: string) => {
                                    const match = name.match(/(\d+)/);
                                    return match ? parseInt(match[1], 10) : 0;
                                  };
                                  return getSubjectNumber(a.name) - getSubjectNumber(b.name);
                                }).map((subject: Subject) => (
                                  <TouchableOpacity
                                    key={subject.id}
                                    style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                                    onPress={() => {
                                      setSelectedSubject(subject.id);
                                      setSelectedChapter('');
                                      setSelectedChapterName('');
                                      setIsPreSelected(false); // Clear pre-selected flag
                                      setShowSubjectDropdown(false);
                                    }}
                                  >
                                    <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{subject.name}</ThemedText>
                                    <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                                  </TouchableOpacity>
                                ))
                              )}
                            </ScrollView>
                          </ThemedView>
                        </TouchableOpacity>
                      </Modal>
                    )}
                  </ThemedView>

                  {/* Year Selection for National Exams */}
                  {selectedExamType === 'national' && (
                    <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                        {t('mcq.year')}
                      </ThemedText>
                      <TouchableOpacity
                        style={[styles.formInput, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                        onPress={() => setShowYearDropdown(!showYearDropdown)}
                      >
                        <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                          {selectedYear || t('mcq.selectYear')}
                        </ThemedText>
                        <IconSymbol name="chevron.right" size={20} color={colors.tint} />
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
                                    <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </ThemedView>
                          </TouchableOpacity>
                        </Modal>
                      )}
                    </ThemedView>
                  )}

                  {/* Chapter Selection - Only show for MCQ exam type */}
                  {selectedExamType === 'mcq' && (
                    <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                        {t('mcq.chapter')}
                      </ThemedText>
                      <TouchableOpacity
                        style={[
                          styles.formInput,
                          { backgroundColor: colors.cardAlt, borderColor: colors.border },
                          !selectedSubject && { 
                            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        ]}
                        onPress={() => selectedSubject && setShowChapterDropdown(!showChapterDropdown)}
                        disabled={!selectedSubject}
                      >
                        <ThemedText 
                          style={[
                            styles.formInputText, 
                            { color: colors.text }, 
                            !selectedSubject && { 
                              color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                            }
                          ]}
                        >
                          {selectedChapter ? selectedSubjectData?.chapters?.find((c: Chapter) => c.id === selectedChapter)?.name : t('mcq.selectChapter')}
                        </ThemedText>
                        <IconSymbol 
                          name="chevron.right" 
                          size={20} 
                          color={!selectedSubject ? (isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)') : colors.tint} 
                        />
                      </TouchableOpacity>
                      {showChapterDropdown && selectedSubject && (
                        <Modal
                          visible={showChapterDropdown}
                          transparent={true}
                          animationType="fade"
                          onRequestClose={() => setShowChapterDropdown(false)}
                        >
                          <TouchableOpacity
                            style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                            activeOpacity={1}
                            onPress={() => setShowChapterDropdown(false)}
                          >
                            <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
                              <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedSubjectData?.chapters?.sort((a, b) => {
                                  // Extract numbers from chapter names for proper sorting
                                  const getChapterNumber = (name: string) => {
                                    const match = name.match(/(\d+)/);
                                    return match ? parseInt(match[1], 10) : 0;
                                  };
                                  return getChapterNumber(a.name) - getChapterNumber(b.name);
                                }).map((chapter: Chapter) => (
                                  <TouchableOpacity
                                    key={chapter.id}
                                    style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                                    onPress={() => {
                                      setSelectedChapter(chapter.id);
                                      setSelectedChapterName(chapter.name);
                                      setShowChapterDropdown(false);
                                    }}
                                  >
                                    <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{chapter.name}</ThemedText>
                                    <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                                  </TouchableOpacity>
                                )) || (
                                  <View style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                                    <ThemedText style={[styles.modalItemText, { color: colors.text, opacity: 0.7 }]}>
                                      No chapters available
                                    </ThemedText>
                                  </View>
                                )}
                              </ScrollView>
                            </ThemedView>
                          </TouchableOpacity>
                        </Modal>
                      )}
                    </ThemedView>
                  )}

                  {/* Start Quiz Button - Only show when all required selections are made */}
                  <TouchableOpacity
                    style={[
                      styles.startButton,
                      { backgroundColor: colors.tint },
                      (!selectedSubject || (selectedExamType === 'mcq' && !selectedChapter) || (selectedExamType === 'national' && !selectedYear)) && { opacity: 0.5 }
                    ]}
                    onPress={handleStartTest}
                    disabled={!selectedSubject || (selectedExamType === 'mcq' && !selectedChapter) || (selectedExamType === 'national' && !selectedYear)}
                  >
                    <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>
                      {t('mcq.startQuiz')}
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Timer in top right */}
      <View style={{
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 1000,
      }}>
        <View style={[styles.timerContainer, { 
          backgroundColor: colors.tint,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }]}>
          <ThemedText style={[styles.timerText, { 
            color: '#fff',
            fontSize: 18,
            fontWeight: '700',
          }]}>{formatTime(time)}</ThemedText>
        </View>
      </View>

      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.content, { backgroundColor: colors.background }]}>
          <ThemedText style={{ fontSize: 30, fontWeight: 'bold', color: colors.text, marginBottom: 16, marginTop: -20, paddingTop: 5 }}>
            {selectedExamType === 'national' ? 'National Exam' : 'MCQ'}
          </ThemedText>
          {!showResult ? (
            <>
              <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <View style={[styles.breadcrumbContainer, { backgroundColor: colors.cardAlt }]}>
                  <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <ThemedText style={[styles.breadcrumbText, { color: colors.tint }]}>
                      {user?.grade ? user.grade.charAt(0).toUpperCase() + user.grade.slice(1) : 'Select Grade'}
                    </ThemedText>
                  </View>
                  {selectedGrade && (
                    <>
                      <IconSymbol name="chevron.right" size={16} color={colors.tint} />
                      <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <ThemedText style={[styles.breadcrumbText, { color: colors.tint }]}>
                          {selectedSubject ? selectedGradeData?.subjects.find((s: Subject) => s.id === selectedSubject)?.name : 'Select Subject'}
                        </ThemedText>
                      </View>
                    </>
                  )}
                  {selectedSubject && (
                    <>
                      <IconSymbol name="chevron.right" size={16} color={colors.tint} />
                      <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <ThemedText style={[styles.breadcrumbText, { color: colors.tint }]}>
                          {selectedChapter ? `Chapter ${selectedSubjectData?.chapters?.find((c: Chapter) => c.id === selectedChapter)?.name || selectedChapterName}` : 'Select Chapter'}
                        </ThemedText>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Compact Sticky Header */}
              <View style={{
                position: 'sticky',
                top: 0,
                zIndex: 999,
                backgroundColor: colors.background,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Progress Bar */}
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={[styles.progressBar, { backgroundColor: colors.cardAlt, height: 6 }]}>
                    <View style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: colors.tint,
                        width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
                      }
                    ]} />
                  </View>
                  <ThemedText style={[styles.progressText, { 
                    color: colors.tint, 
                    fontSize: 12, 
                    textAlign: 'center',
                    marginTop: 4,
                  }]}>
                    {currentQuestionIndex + 1}/{totalQuestions}
                  </ThemedText>
                </View>

                {/* Navigation Buttons */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.navButton, 
                      styles.prevButton, 
                      { 
                        borderColor: colors.border, 
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        minWidth: 80,
                      }, 
                      isFirstQuestion && styles.navButtonDisabled
                    ]}
                    onPress={handlePreviousQuestion}
                    disabled={isFirstQuestion}
                  >
                    <IconSymbol name="chevron.left" size={18} color={colors.tint} />
                    <ThemedText style={[styles.prevButtonText, { color: colors.tint, fontSize: 14 }]}>
                      {t('mcq.previous')}
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.navButton, 
                      styles.nextButton, 
                      { 
                        backgroundColor: colors.tint,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        minWidth: 80,
                      }
                    ]}
                    onPress={isLastQuestion ? handleResult : handleNextQuestion}
                  >
                    <ThemedText style={[styles.nextButtonText, { color: '#fff', fontSize: 14 }]}>
                      {isLastQuestion ? t('mcq.finish') : t('mcq.next')}
                    </ThemedText>
                    <IconSymbol name="chevron.right" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Answer Message - Only show when needed */}
              {showAnswerMessage && (
                <View style={{
                  backgroundColor: colors.warning + '20',
                  borderLeftWidth: 4,
                  borderLeftColor: colors.warning,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginHorizontal: 16,
                  marginTop: 8,
                  borderRadius: 8,
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <ThemedText style={{
                      fontSize: 14,
                      color: colors.warning,
                      marginRight: 6,
                    }}>
                      ⚠️
                    </ThemedText>
                    <ThemedText style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: colors.warning,
                      flex: 1,
                    }}>
                      {t('mcq.selectAnswer')}
                    </ThemedText>
                  </View>
                </View>
              )}

              <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>

                <View style={styles.questionContainer}>
                  <RichText 
                    text={currentQuestion?.question || 'Question not available'}
                    style={styles.questionText}
                    color={colors.text}
                    fontSize={18}
                    textAlign="left"
                    lineHeight={26}
                    image_url={currentQuestion?.image_url}
                  />
                </View>

                <View style={styles.optionsContainer}>
                  {currentQuestion?.options?.filter((option: Option) => option.text && option.text.trim() !== '')?.map((option: Option, index: number) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionContainer,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        getOptionStyle(String(option.id))
                      ]}
                      onPress={() => handleAnswerSelect(String(option.id))}
                      disabled={!!selectedAnswer}
                    >
                      <View style={styles.optionContent}>
                        <View style={[styles.optionId, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                          <ThemedText style={[styles.optionIdText, { color: colors.tint }]}>
                            {selectedExamType === 'national' ? String.fromCharCode(65 + index) : String(option.id)}
                          </ThemedText>
                        </View>
                        <RichText 
                          text={option.text}
                          style={styles.optionText}
                          color={colors.text}
                          fontSize={16}
                          textAlign="left"
                          lineHeight={22}
                        />
                      </View>
                    </TouchableOpacity>
                  )) || (
                    <View style={[styles.optionContainer, { backgroundColor: colors.background, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                      <ThemedText style={[styles.optionText, { color: colors.text, opacity: 0.7 }]}>
                        No options available
                      </ThemedText>
                    </View>
                  )}
                </View>

                {showExplanation && currentQuestion?.explanation && currentQuestion.explanation.trim() !== '' && currentQuestion.explanation !== 'No explanation available' && (
                  <View ref={explanationRef} style={[styles.explanationContainer, { backgroundColor: colors.cardAlt }]}>
                    <ThemedText style={[styles.explanationTitle, { color: colors.tint }]}>Explanation:</ThemedText>
                    
                    <View style={styles.explanationContent}>
                      {/* Colored answer letter */}
                      <View style={styles.answerLetterContainer}>
                        <ThemedText style={[styles.answerLetter, { color: '#4CAF50' }]}>
                          {(() => {
                            const correctOption = currentQuestion?.options?.find((opt: Option) => opt.isCorrect);
                            return correctOption?.id || '';
                          })()}.
                        </ThemedText>
                      </View>
                      
                      {/* Explanation text */}
                      <View style={styles.explanationTextContainer}>
                        <RichText 
                          text={currentQuestion.explanation}
                          style={styles.explanationText}
                          color={colors.text}
                          fontSize={16}
                          textAlign="left"
                          lineHeight={24}
                          image_url={currentQuestion?.image_url}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            </>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={[colors.cardGradientStart, colors.cardGradientEnd]}
                  style={StyleSheet.absoluteFill}
                />
                
                <View style={styles.trophyContainer}>
                  <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate: spin }] }}>
                    <IconSymbol name="trophy.fill" size={80} color={percentage >= 90 ? '#FFD700' : colors.tint} />
                  </Animated.View>
                </View>
                
                <ThemedText style={[styles.scoreText, { color: colors.text }]}>
                  {t('mcq.results.score', { score: score, total: totalQuestions })}
                </ThemedText>
                
                <View style={[styles.percentageContainer, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                  <ThemedText style={[styles.percentageText, { color: colors.text }]}>
                    {percentage}%
                  </ThemedText>
                </View>
                
                <View style={[styles.messageContainer, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                  <ThemedText style={[styles.messageText, { color: colors.text }]}>
                    {getMessage()}
                  </ThemedText>
                </View>
              </View>

              <ThemedView style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.retryButton, { backgroundColor: colors.tint, marginBottom: 12 }]}
                  onPress={handleRetry}
                >
                  <ThemedText style={[styles.retryButtonText, { color: '#fff' }]}>{t('mcq.results.tryAgain')}</ThemedText>
                  <Ionicons name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.homeButton, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                  onPress={() => {
                    // Clear timer first
                    if (timerRef.current) {
                      clearInterval(timerRef.current);
                      timerRef.current = null;
                    }
                    
                    setShowResult(false);
                    setShowTest(false);
                    setSelectedSubject('');
                    setSelectedChapter('');
                    setSelectedChapterName('');
                    setTime(0);
                    setIsTimerRunning(false);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    setAnsweredQuestions({});
                    setScore(0);
                    fetchMCQData();
                  }}
                >
                  <ThemedText style={[styles.homeButtonText, { color: colors.text }]}>{t('mcq.results.chooseAnotherSubject')}</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ScrollView>
          )}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60, // Increased padding for small screens to ensure Zemen Bank logo is fully visible
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  formContent: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  formTitle: {
    paddingTop: 5,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  preSelectedLabel: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  formInputText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: -20,
    gap: 8,
  },
  breadcrumbItem: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  questionContainer: {
    marginBottom: 30,
    marginTop: 20,
  },
  questionText: {
    fontSize: 24,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  optionContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    paddingRight: 50,
    paddingLeft: 16,
    paddingVertical: 20,
  },
  optionId: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 10,
  },
  optionIdText: {
    flex: 1,
    flexWrap: 'wrap',
    fontWeight: '600',
    fontSize: 14,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  explanationContainer: {
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  explanationTitle: {
    marginBottom: 10,
  },
  explanationContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  answerLetterContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  answerLetter: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  explanationTextContainer: {
    flex: 1,
    width: '100%',
  },
  explanationText: {
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 0,
  },
  navButtonContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  navButtonContainerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  prevButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  nextButton: {
    backgroundColor: '#6B54AE',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  prevButtonText: {
    fontWeight: '700',
  },
  nextButtonText: {
    fontWeight: '700',
  },
  progressTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  progressContainer: {
    marginTop: 10,
    width: '100%',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionLabelContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  answerMessageContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  answerMessageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultCard: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  resultContent: {
    gap: 16,
  },
  trophyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  scoreText: {
    paddingVertical: 35,
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  percentageContainer: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 2,
  },
  percentageText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  timerContainer: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: -8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fireworkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateIcon: {
    marginBottom: 25,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  homeButton: {
    borderWidth: 2,
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  examTypeContainer: {
    gap: 16,
    marginTop: 8,
  },
  examTypeButton: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  examTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  examTypeIcon: {
    flexShrink: 0,
  },
  examTypeTextContainer: {
    flex: 1,
  },
  examTypeText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  examTypeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  // Chapter chooser styles
  selectedSubjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedSubjectText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chapterList: {
    maxHeight: 400,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  chapterItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterTextContainer: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chapterSubtitle: {
    fontSize: 14,
  },
});

// Helper function to convert string to Title Case
const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}; 