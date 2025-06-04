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
import { getMCQData, MCQData, Grade, Subject, Chapter, Question, Option, ExamType, getNationalExamQuestions } from '../../services/mcqService';
import PictureMCQScreen from '../screens/PictureMCQScreen';
import PictureMCQInstructionScreen from '../screens/PictureMCQInstructionScreen';

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
  
  // Timer states
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
  const currentQuestion = selectedChapterData?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (selectedChapterData?.questions.length || 0) - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const percentage = Math.round((score / (selectedChapterData?.questions.length || 0)) * 100);

  // Timer functions (were accidentally removed)
  const startTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to check if exam type selection is needed
  const needsExamTypeSelection = (grade: Grade | null) => {
    if (!grade) return false;
    
    // Get the grade number from the user's profile if available
    const userGradeNumber = user?.grade ? parseInt(user.grade) : null;
    
    // If we have the user's grade, use that
    if (userGradeNumber !== null) {
      console.log('🔍 Checking exam type selection for user grade:', userGradeNumber);
      return [6, 8, 12].includes(userGradeNumber);
    }
    
    // Fallback to checking the UI grade if user grade is not available
    const gradeNumber = parseInt(grade.id.replace('grade-', ''));
    console.log('🔍 Checking exam type selection for UI grade:', gradeNumber);
    return [6, 8, 12].includes(gradeNumber);
  };

  // Fetch MCQ data from API
  const fetchMCQData = async () => {
    setLoading(true);
    setError(null);
    try {
      // If no grade is selected, use the user's grade or default to grade-6
      const userGrade = user?.grade ? `grade-${user.grade}` : 'grade-6';
      const gradeToFetch = selectedGrade?.id || userGrade;
      console.log(`🚀 Starting MCQ data fetch for grade ${gradeToFetch}...`);
      
      const data = await getMCQData(gradeToFetch);
      
      // Reset selections first
      setSelectedSubject('');
      setSelectedChapter('');
      
      // Log the grade's structure
      if (data.grades.length > 0) {
        const grade = data.grades[0];
        // Set the grade if not already set
        if (!selectedGrade) {
          setSelectedGrade(grade);
        }
      } else {
        console.log('⚠️ No grades found in API response');
      }
      
      // Set MCQ data after setting the grade to ensure they're in sync
      setMcqData(data);
    } catch (error) {
      console.error('❌ Error fetching MCQ data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load MCQ data');
    } finally {
      setLoading(false);
    }
  };

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
      if (user?.grade === 'KG') {
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
      }
      setIsTimerRunning(false);
    }
  }, [params.reset]);

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

      if (percentage >= 90) {
        // Start confetti animation for high scores
        Animated.loop(
          Animated.sequence([
            Animated.timing(confettiAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(confettiAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        // Get screen dimensions
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;
        const maxDistance = Math.sqrt(Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)) / 2;

        // Start firework animation
        const createParticleAnimation = (anim: any, index: number) => {
          const angle = (index * 5.625) * (Math.PI / 180); // Distribute particles in a circle (64 particles)
          const distance = maxDistance; // Travel to screen edges
          const burstDuration = 3000; // Slower movement (3 seconds)
          const rotationDuration = 2000 + Math.random() * 1000; // Random rotation duration

          return Animated.parallel([
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: burstDuration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: burstDuration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: burstDuration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 100, // Very quick fade out
              delay: burstDuration - 100, // Start fading just before reaching the edge
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: 1,
              duration: rotationDuration,
              useNativeDriver: true,
            }),
          ]);
        };

        // Create a single explosion with all particles
        const explosion = particleAnims.map((anim, index) => 
          createParticleAnimation(anim, index)
        );

        // Start all particles simultaneously
        Animated.parallel(explosion).start();

        // Create a second explosion after a longer delay
        setTimeout(() => {
          const secondExplosion = particleAnims.map((anim, index) => 
            createParticleAnimation(anim, index)
          );
          Animated.parallel(secondExplosion).start();
        }, 3500); // Start second explosion after 3.5 seconds
      }
    }
  }, [showResult]);

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
    if (percentage >= 90) return "Outstanding! You're a genius!";
    if (percentage >= 70) return "Great job! You're doing well!";
    if (percentage >= 50) return "Not bad! Keep practicing!";
    return "Keep learning! You can do better!";
  };

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswer) return; // Prevent multiple selections
    setSelectedAnswer(answerId);
    setAnsweredQuestions(prev => ({ ...prev, [currentQuestionIndex]: answerId }));
    setShowExplanation(true);
    setShowAnswerMessage(false);
    
    // Update score if answer is correct
    const isCorrect = currentQuestion?.options.find((opt: Option) => opt.id === answerId)?.isCorrect;
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
    if (currentQuestionIndex < (selectedChapterData?.questions.length || 0) - 1) {
      if (!selectedAnswer) {
        setShowAnswerMessage(true);
        return;
      }
      setCurrentQuestionIndex(prev => prev + 1);
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

  const handleResult = () => {
    stopTimer();
    setShowResult(true);
    
    // Track activity
    const trackActivity = async () => {
      try {
        const activity: RecentActivity = {
          type: 'mcq',
          grade: selectedGrade?.id || '',
          subject: selectedSubjectData?.name || '',
          chapter: selectedChapterData?.name || '',
          timestamp: Date.now(),
          details: `Completed ${score} out of ${selectedChapterData?.questions.length || 0} questions`
        };
        
        // Get existing activities
        const existingActivities = await AsyncStorage.getItem('recentActivities');
        let activities: RecentActivity[] = [];
        
        if (existingActivities) {
          activities = JSON.parse(existingActivities);
        }
        
        // Add new activity and keep only last 20
        activities.unshift(activity);
        if (activities.length > 20) {
          activities = activities.slice(0, 20);
        }
        
        // Save updated activities
        await AsyncStorage.setItem('recentActivities', JSON.stringify(activities));
      } catch (error) {
        console.error('Error tracking activity:', error);
      }
    };
    
    trackActivity();
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowAnswerMessage(false);
    setScore(0);
    setShowResult(false);
    setShowTest(false);
    setAnsweredQuestions({});
    setTime(0);
    startTimer();
  };

  const handleStartTest = async () => {
    if (!selectedGrade || !selectedSubject) {
      console.log('❌ Cannot start test: Missing selections', {
        grade: selectedGrade,
        subject: selectedSubject,
        examType: selectedExamType
      });
      return;
    }

    if (selectedExamType === 'national') {
      if (!selectedYear) {
        console.log('❌ Cannot start national exam: Missing year selection');
        return;
      }

      try {
        const gradeNumber = parseInt(selectedGrade.id.replace('grade-', ''));
        const questions = await getNationalExamQuestions(
          gradeNumber,
          parseInt(selectedYear),
          selectedSubject
        );

        if (!questions || questions.length === 0) {
          setError('No questions found for this exam. Please try another year or subject.');
          return;
        }

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
      } catch (error) {
        console.error('Error starting national exam:', error);
        setError('Failed to load national exam questions. Please try again.');
      }
    } else {
      // Original MCQ logic
      if (!selectedChapter) {
        console.log('❌ Cannot start test: Missing chapter selection');
        return;
      }

      // Verify that we have questions for this chapter
      if (!selectedChapterData || !selectedChapterData.questions || selectedChapterData.questions.length === 0) {
        console.log('❌ Cannot start test: No questions found for this chapter', {
          chapterId: selectedChapter,
          chapterName: selectedChapterData?.name,
          hasQuestions: !!selectedChapterData?.questions,
          questionCount: selectedChapterData?.questions?.length || 0
        });
        
        setError('No questions found for this chapter. Please try another chapter or contact support.');
        return;
      }
      
      console.log(`✅ Starting test: ${selectedGradeData?.name} > ${selectedSubjectData?.name} > ${selectedChapterData?.name}`);
      console.log(`📚 Found ${selectedChapterData.questions.length} questions for this chapter`);
      
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
    }
  };

  const getOptionStyle = (optionId: string) => {
    if (!showExplanation) return [styles.optionContainer];
    
    const isCorrect = currentQuestion?.options.find((opt: Option) => opt.id === optionId)?.isCorrect;
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

  const totalQuestions = selectedChapterData?.questions.length || 0;
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
  if (user?.grade === 'KG') {
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
  if (mcqData && mcqData.grades.length > 0 && (!selectedGradeData?.subjects || selectedGradeData.subjects.length === 0)) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('mcq.title')} />
        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="warning-outline" size={60} color={colors.warning} />
            <ThemedText style={{ color: colors.error, fontWeight: 'bold', fontSize: 18, marginTop: 10, textAlign: 'center' }}>
              No subjects found for your grade
            </ThemedText>
          </View>
          
          <ThemedText style={{ color: colors.text, marginBottom: 20, textAlign: 'center', lineHeight: 22 }}>
            We couldn't find any subjects for grade {selectedGradeData?.name}. This could be because:
          </ThemedText>
          
          <View style={{ marginBottom: 20, paddingHorizontal: 10 }}>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <ThemedText style={{ color: colors.text, marginRight: 5 }}>•</ThemedText>
              <ThemedText style={{ color: colors.text, flex: 1 }}>Your account might need to be updated with the correct grade</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <ThemedText style={{ color: colors.text, marginRight: 5 }}>•</ThemedText>
              <ThemedText style={{ color: colors.text, flex: 1 }}>The server is temporarily unavailable</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <ThemedText style={{ color: colors.text, marginRight: 5 }}>•</ThemedText>
              <ThemedText style={{ color: colors.text, flex: 1 }}>Content for your grade is still being added</ThemedText>
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
          
          <TouchableOpacity 
            style={{ marginTop: 30, padding: 10 }}
            onPress={() => console.log('Debug info:', JSON.stringify(mcqData, null, 2))}
          >
            <ThemedText style={{ color: colors.tint, fontSize: 14, textAlign: 'center' }}>
              Show Debug Information
            </ThemedText>
          </TouchableOpacity>
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

          <ThemedView style={[styles.actionButtons, { backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton, { backgroundColor: colors.tint }]}
              onPress={handleRetry}
            >
              <ThemedText style={[styles.retryButtonText, { color: '#fff' }]}>
                {t('mcq.results.tryAgain')}
              </ThemedText>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.homeButton, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
              onPress={() => {
                setShowResult(false);
                setShowTest(false);
                setSelectedSubject('');
                setSelectedChapter('');
                fetchMCQData();
              }}
            >
              <ThemedText style={[styles.homeButtonText, { color: colors.text }]}>
                {t('mcq.results.chooseAnotherSubject')}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  }

  if (!showTest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {/* Only show the MCQ header if NOT on the exam type selection page */}
        {!(selectedGrade && needsExamTypeSelection(selectedGrade) && !selectedExamType) && (
          <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedExamType(null);
                setSelectedSubject('');
                setSelectedChapter('');
                setSelectedYear(null);
              }}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            </TouchableOpacity>
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
                      <IconSymbol name="trophy.fill" size={32} color={colors.tint} style={styles.examTypeIcon} />
                      <ThemedText style={[styles.examTypeText, { color: colors.text }]}>
                        {t('mcq.nationalExam')}
                      </ThemedText>
                      <ThemedText style={[styles.examTypeDescription, { color: colors.text, opacity: 0.7 }]}>
                        {t('mcq.nationalExamDescription')}
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.examTypeButton, { backgroundColor: colors.cardAlt }]}
                      onPress={() => setSelectedExamType('mcq')}
                    >
                      <IconSymbol name="questionmark.circle.fill" size={32} color={colors.tint} style={styles.examTypeIcon} />
                      <ThemedText style={[styles.examTypeText, { color: colors.text }]}>
                        {t('mcq.mcqExam')}
                      </ThemedText>
                      <ThemedText style={[styles.examTypeDescription, { color: colors.text, opacity: 0.7 }]}>
                        {t('mcq.mcqExamDescription')}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedView>
              )}

              {/* Subject and Chapter Selection - Only show after exam type is selected */}
              {selectedExamType && (
                <>
                  {/* Subject Selection */}
                  <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                      style={[styles.formInput, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                      onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    >
                      <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                        {selectedSubject ? selectedGradeData?.subjects.find((s: Subject) => s.id === selectedSubject)?.name : t('mcq.selectSubject')}
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
                            <ScrollView>
                              {selectedGradeData?.subjects.map((subject: Subject) => (
                                <TouchableOpacity
                                  key={subject.id}
                                  style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                                  onPress={() => {
                                    setSelectedSubject(subject.id);
                                    setSelectedChapter('');
                                    setShowSubjectDropdown(false);
                                  }}
                                >
                                  <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{subject.name}</ThemedText>
                                  <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                                </TouchableOpacity>
                              ))}
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
                              <ScrollView>
                                {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map((year) => (
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
                          {selectedChapter ? selectedSubjectData?.chapters.find((c: Chapter) => c.id === selectedChapter)?.name : t('mcq.selectChapter')}
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
                              <ScrollView>
                                {selectedSubjectData?.chapters.map((chapter: Chapter) => (
                                  <TouchableOpacity
                                    key={chapter.id}
                                    style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                                    onPress={() => {
                                      setSelectedChapter(chapter.id);
                                      setShowChapterDropdown(false);
                                    }}
                                  >
                                    <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{chapter.name}</ThemedText>
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
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.content, { backgroundColor: colors.background }]}>
          <ThemedText style={{ fontSize: 30, fontWeight: 'bold', color: colors.text, marginBottom: 16, marginTop: -20, paddingTop: 5 }}>
            {selectedExamType === 'national' ? 'National Exam' : 'MCQ Test'}
          </ThemedText>
          {!showResult ? (
            <>
              <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <View style={[styles.breadcrumbContainer, { backgroundColor: colors.cardAlt }]}>
                  <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <ThemedText style={[styles.breadcrumbText, { color: colors.tint }]}>
                      {user?.grade ? `Grade ${user.grade}` : 'Select Grade'}
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
                          {selectedChapter ? selectedSubjectData?.chapters.find((c: Chapter) => c.id === selectedChapter)?.name : 'Select Chapter'}
                        </ThemedText>
                      </View>
                    </>
                  )}
                </View>
              </View>

              <ScrollView ref={scrollViewRef} style={styles.scrollView}>
                <View style={styles.progressTimeContainer}>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.cardAlt }]}>
                      <View style={[styles.progressFill, { backgroundColor: colors.tint }]} />
                    </View>
                    <View style={styles.progressLabels}>
                      <View style={[styles.questionLabelContainer]}>
                        <ThemedText style={[styles.progressText, { color: colors.tint }]}>
                          Question {currentQuestionIndex + 1} of {totalQuestions}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.timerContainer, { backgroundColor: colors.tint }]}>
                    <ThemedText style={[styles.timerText, { color: '#fff' }]}>{formatTime(time)}</ThemedText>
                  </View>
                </View>

                <View style={styles.questionContainer}>
                  <ThemedText style={[styles.questionText, { color: colors.text }]}>
                    {currentQuestion?.question}
                  </ThemedText>
                </View>

                <View style={styles.optionsContainer}>
                  {currentQuestion?.options.map((option: Option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionContainer,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        getOptionStyle(option.id)
                      ]}
                      onPress={() => handleAnswerSelect(option.id)}
                      disabled={!!selectedAnswer}
                    >
                      <View style={styles.optionContent}>
                        <View style={[styles.optionId, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                          <ThemedText style={[styles.optionIdText, { color: colors.tint }]}>{option.id}</ThemedText>
                        </View>
                        <ThemedText style={[styles.optionText, { color: colors.text }]}>{option.text}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {showAnswerMessage && (
                  <View style={[styles.answerMessageContainer, { backgroundColor: colors.cardAlt }]}>
                    <ThemedText style={[styles.answerMessageText, { color: colors.warning }]}>
                      {t('mcq.selectAnswer')}
                    </ThemedText>
                  </View>
                )}

                {showExplanation && (
                  <View ref={explanationRef} style={[styles.explanationContainer, { backgroundColor: colors.cardAlt }]}>
                    <ThemedText style={[styles.explanationTitle, { color: colors.tint }]}>Explanation:</ThemedText>
                    <ThemedText style={[styles.explanationText, { color: colors.text }]}>
                      {currentQuestion?.explanation}
                    </ThemedText>
                  </View>
                )}

                <View style={[styles.navigationContainer, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.navButton, styles.prevButton, { borderColor: colors.border }, isFirstQuestion && styles.navButtonDisabled]}
                    onPress={handlePreviousQuestion}
                    disabled={isFirstQuestion}
                  >
                    <IconSymbol name="chevron.left" size={24} color={colors.tint} />
                    <ThemedText style={[styles.prevButtonText, { color: colors.tint }]}>{t('mcq.previous')}</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, styles.nextButton, { backgroundColor: colors.tint }]}
                    onPress={isLastQuestion ? handleResult : handleNextQuestion}
                  >
                    <ThemedText style={[styles.nextButtonText, { color: '#fff' }]}>
                      {isLastQuestion ? t('mcq.finish') : t('mcq.next')}
                    </ThemedText>
                    <IconSymbol name="chevron.right" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          ) : (
            <ScrollView>
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
                  {score}/{totalQuestions}
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
                  style={[styles.button, styles.retryButton, { backgroundColor: colors.tint }]}
                  onPress={handleRetry}
                >
                  <ThemedText style={[styles.retryButtonText, { color: '#fff' }]}>Try Again</ThemedText>
                  <Ionicons name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.homeButton, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                  onPress={() => {
                    setShowResult(false);
                    setShowTest(false);
                    setSelectedSubject('');
                    setSelectedChapter('');
                    fetchMCQData();
                  }}
                >
                  <ThemedText style={[styles.homeButtonText, { color: colors.text }]}>Choose Another Subject</ThemedText>
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
    paddingBottom: 20,
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
  },
  questionText: {
    fontSize: 24,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 30,
    paddingHorizontal: 16,
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
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  optionId: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  optionIdText: {
    fontWeight: '600',
    fontSize: 14,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  explanationContainer: {
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  explanationTitle: {
    marginBottom: 10,
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
    width: '75%',
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
    paddingTop: 30,
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
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  homeButton: {
    borderWidth: 2,
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  examTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 16,
  },
  examTypeButton: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
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
  examTypeIcon: {
    marginBottom: 16,
  },
  examTypeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  examTypeDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
}); 