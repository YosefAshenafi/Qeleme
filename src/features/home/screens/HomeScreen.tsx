import { StyleSheet, ScrollView, TouchableOpacity, View, Dimensions, RefreshControl, Modal, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol, IconSymbolName } from '@/shared/components/ui/IconSymbol';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/shared/components/ThemedText';
import { ThemedView } from '@/shared/components/ThemedView';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/shared/constants/Colors';
import { BookCover } from '@/shared/components/ui/BookCover';
import { getBookCover } from '@/shared/services/bookCoverService';
import { getMCQData, getNationalExamAvailable } from '@/shared/services/mcqService';
import { BASE_URL } from '@/shared/config/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_SPACING = 16;

/** Canvas + welcome card for the MegaTest home screen. */
const HOME_CANVAS = { light: '#F1F2F4', dark: '#101216' } as const;
const WELCOME_CARD_BG = { light: '#E8F0FE', dark: '#1E2A3D' } as const;
const GRID_GAP = 12;
const BOOK_GRID_CARD_WIDTH = (SCREEN_WIDTH - 40 - GRID_GAP) / 2;
/** Inset book cover (not full tile width); ~1.36:1 like `BookCover`. */
const SUBJECT_COVER_INNER_WIDTH = Math.min(120, Math.round(BOOK_GRID_CARD_WIDTH * 0.62));
const SUBJECT_COVER_INNER_HEIGHT = Math.round(SUBJECT_COVER_INNER_WIDTH * 1.36);
const SUBJECT_GRID_TOP_BAND_HEIGHT = SUBJECT_COVER_INNER_HEIGHT + 32;
const BOOK_CARD_WIDTH = (SCREEN_WIDTH - 60) / 2.2;

const BRAND_BLUE_RGB = '15,75,215';

/**
 * Quiet light-blue panel (like the earlier soft brand tint), with a subtle sheen on top —
 * not a strong “themed” gradient.
 */
function SubjectCoverAtmosphere({ dark }: { dark: boolean }) {
  return (
    <View style={styles.subjectGridAtmosphereRoot} pointerEvents="none">
      <LinearGradient
        colors={dark ? ['#1A2838', '#1F3044', '#243A4D'] : ['#D8EAF9', '#E8F3FC', '#F4F9FE']}
        locations={[0, 0.52, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          dark
            ? [`rgba(${BRAND_BLUE_RGB},0.2)`, `rgba(${BRAND_BLUE_RGB},0.07)`, 'transparent']
            : [`rgba(${BRAND_BLUE_RGB},0.12)`, `rgba(${BRAND_BLUE_RGB},0.045)`, 'transparent']
        }
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          dark
            ? ['rgba(186,230,253,0.14)', 'transparent', 'transparent']
            : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.06)', 'transparent']
        }
        locations={[0, 0.38, 1]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 0.78 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const GRADIENTS = {
  purple: ['#8E6FFF', '#9577FF', '#9C7FFF'] as const,
  blue: ['#5478FF', '#5B80FF', '#6288FF'] as const,
  green: ['#00BA88', '#0AC090', '#14C698'] as const,
  orange: ['#FF8F6B', '#FF9775', '#FF9F7F'] as const,
} as const;

type ReportCard = {
  title: string;
  number: string;
  subtitle: string;
  gradient: keyof typeof GRADIENTS;
  icon: 'chart.bar' | 'trophy.fill' | 'clock.fill';
  stats: Array<{ label: string; value: string }>;
};

type BookItem = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  subject: string;
  grade: string;
  progress?: number;
  chapterCount: number;
};



export default function HomeScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user, login } = useAuth();
  const colors = getColors(isDarkMode);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [homeMcqSubjects, setHomeMcqSubjects] = useState<BookItem[]>([]);
  const [isMCQLoading, setIsMCQLoading] = useState(false);
  const [nationalExamYears, setNationalExamYears] = useState<number[]>([]);
  const [isNationalExamLoading, setIsNationalExamLoading] = useState(false);
  const [showNationalExamYearChooser, setShowNationalExamYearChooser] = useState(false);

  // Check if user is KG student
  const isKGStudent = typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg');

  // Check if current grade has national exams (grades 6, 8, 12)
  const hasNationalExams = () => {
    if (!user?.grade) return false;
    const gradeNumber = user.grade.replace(/[^\d]/g, '');
    return ['6', '8', '12'].includes(gradeNumber);
  };

  // Fetch national exam years for the current grade
  const fetchNationalExamYears = async () => {
    if (!hasNationalExams()) return;
    
    try {
      setIsNationalExamLoading(true);
      const gradeNumber = user?.grade?.replace(/[^\d]/g, '');
      if (gradeNumber) {
        const data = await getNationalExamAvailable(parseInt(gradeNumber));
        setNationalExamYears(data.data.years);
      }
    } catch (error) {
      console.error('Failed to fetch national exam years:', error);
      setNationalExamYears([]);
    } finally {
      setIsNationalExamLoading(false);
    }
  };

  const fetchHomeMcqSubjects = async () => {
    setIsMCQLoading(true);
    try {
      const gradeNumber = user?.grade?.replace(/[^0-9]/g, '') || '6';
      const mcqData = await getMCQData(`grade-${gradeNumber}`);
      if (mcqData.grades && mcqData.grades.length > 0) {
        const grade = mcqData.grades[0];
        const tiles: BookItem[] = grade.subjects.map((subject: any) => ({
          id: `mcq-${subject.id}`,
          title: subject.name,
          subtitle: `Grade ${gradeNumber}`,
          image_url: subject.image_url || '',
          subject: subject.name,
          grade: gradeNumber,
          progress: Math.floor(Math.random() * 100),
          chapterCount: Array.isArray(subject.chapters) ? subject.chapters.length : 0,
        }));
        setHomeMcqSubjects(tiles);
      }
    } catch (error) {
      console.log('Failed to fetch MCQ subjects from API:', error);
      const gradeNumber = user?.grade?.replace(/[^0-9]/g, '') || '6';
      const fallbackSubjects = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'Amharic',
        'History',
        'Geography',
      ];
      setHomeMcqSubjects(
        fallbackSubjects.map((subject, index) => ({
          id: `mcq-${index}`,
          title: subject,
          subtitle: `Grade ${gradeNumber}`,
          image_url: '',
          subject,
          grade: gradeNumber,
          progress: Math.floor(Math.random() * 100),
          chapterCount: 12,
        }))
      );
    } finally {
      setIsMCQLoading(false);
    }
  };

  useEffect(() => {
    if (!isKGStudent) {
      fetchHomeMcqSubjects();
      if (hasNationalExams()) {
        fetchNationalExamYears();
      }
    }
  }, [isKGStudent, user?.grade]);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        if (!isKGStudent) {
          await loadReportData();
          await fetchHomeMcqSubjects();
          if (hasNationalExams()) {
            await fetchNationalExamYears();
          }
        }
      };
      loadData();
    }, [isKGStudent])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Get stored credentials
      const storedUsername = await AsyncStorage.getItem('@username');
      const storedPassword = await AsyncStorage.getItem('@password');
      
      if (storedUsername && storedPassword) {
        // Login to get fresh user data
        const response = await fetch(`${BASE_URL}/api/auth/student/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            username: storedUsername,
            password: storedPassword,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          await login(data);
        }
      }

      await Promise.all([
        !isKGStudent ? loadReportData() : Promise.resolve(),
        !isKGStudent ? fetchHomeMcqSubjects() : Promise.resolve(),
        !isKGStudent && hasNationalExams() ? fetchNationalExamYears() : Promise.resolve()
      ]);
    } catch (error) {
      // Silently handle refresh error
    }
    setRefreshing(false);
  }, [isKGStudent]);

  const loadReportData = async () => {
    try {
      const activitiesJson = await AsyncStorage.getItem('recentActivities');
      let activities: any[] = [];
      if (activitiesJson) {
        activities = JSON.parse(activitiesJson);
      }

      // Initialize with zeros if no activities
      if (activities.length === 0) {
        const cards: ReportCard[] = [
          {
            title: t('home.reportCards.performance.title'),
            number: '0%',
            subtitle: t('home.reportCards.performance.subtitle'),
            gradient: 'purple',
            icon: 'chart.bar',
            stats: [
              { label: t('home.reportCards.performance.stats.quizzesTaken'), value: '0' },
              { label: t('home.reportCards.performance.stats.successRate'), value: '0%' }
            ]
          },
          {
            title: t('home.reportCards.studyProgress.title'),
            number: '0h',
            subtitle: t('home.reportCards.studyProgress.subtitle'),
            gradient: 'blue',
            icon: 'clock.fill',
            stats: [
              { label: t('home.reportCards.studyProgress.stats.dailyGoal'), value: '0h' },
              { label: t('home.reportCards.studyProgress.stats.weeklyGoal'), value: '0h' }
            ]
          },
          {
            title: t('home.reportCards.learningStreak.title'),
            number: '0d',
            subtitle: t('home.reportCards.learningStreak.subtitle'),
            gradient: 'green',
            icon: 'trophy.fill',
            stats: [
              { label: t('home.reportCards.learningStreak.stats.currentStreak'), value: '0d' },
              { label: t('home.reportCards.learningStreak.stats.bestStreak'), value: '0d' }
            ]
          },
          {
            title: t('home.reportCards.studyFocus.title'),
            number: '0',
            subtitle: t('home.reportCards.studyFocus.subtitle'),
            gradient: 'orange',
            icon: 'chart.bar',
            stats: [
              { label: t('home.reportCards.studyFocus.stats.topSubject'), value: '-' },
              { label: t('home.reportCards.studyFocus.stats.hoursPerSubject'), value: '0h' }
            ]
          }
        ];
        setReportCards(cards);
        return;
      }

      // Calculate report data from activities
      const calculatedCards = calculateReportData(activities);
      setReportCards(calculatedCards);
    } catch (error) {
      // Silently handle report data loading error
      const cards: ReportCard[] = [
        {
          title: t('home.reportCards.performance.title'),
          number: '0%',
          subtitle: t('home.reportCards.performance.subtitle'),
          gradient: 'purple',
          icon: 'chart.bar',
          stats: [
            { label: t('home.reportCards.performance.stats.quizzesTaken'), value: '0' },
            { label: t('home.reportCards.performance.stats.successRate'), value: '0%' }
          ]
        },
        {
          title: t('home.reportCards.studyProgress.title'),
          number: '0h',
          subtitle: t('home.reportCards.studyProgress.subtitle'),
          gradient: 'blue',
          icon: 'clock.fill',
          stats: [
            { label: t('home.reportCards.studyProgress.stats.dailyGoal'), value: '0h' },
            { label: t('home.reportCards.studyProgress.stats.weeklyGoal'), value: '0h' }
          ]
        },
        {
          title: t('home.reportCards.learningStreak.title'),
          number: '0d',
          subtitle: t('home.reportCards.learningStreak.subtitle'),
          gradient: 'green',
          icon: 'trophy.fill',
          stats: [
            { label: t('home.reportCards.learningStreak.stats.currentStreak'), value: '0d' },
            { label: t('home.reportCards.learningStreak.stats.bestStreak'), value: '0d' }
          ]
        },
        {
          title: t('home.reportCards.studyFocus.title'),
          number: '0',
          subtitle: t('home.reportCards.studyFocus.subtitle'),
          gradient: 'orange',
          icon: 'chart.bar',
          stats: [
            { label: t('home.reportCards.studyFocus.stats.topSubject'), value: '-' },
            { label: t('home.reportCards.studyFocus.stats.hoursPerSubject'), value: '0h' }
          ]
        }
      ];
      setReportCards(cards);
    }
  };

  const calculateReportData = (activities: any[]): ReportCard[] => {
    // Filter activities for the current user
    const userActivities = activities.filter((activity: any) => activity.username === user?.username);
    
    // Calculate performance metrics
    const mcqActivities = userActivities.filter((activity: any) => activity.type === 'mcq');
    const totalMCQs = mcqActivities.length;
    const completedMCQs = mcqActivities.filter((activity: any) => activity.status === 'Completed').length;
    const performancePercentage = totalMCQs > 0 ? Math.round((completedMCQs / totalMCQs) * 100) : 0;
    
    // Calculate study hours
    const studyActivities = userActivities.filter((activity: any) => activity.type === 'study');
    const totalStudyHours = studyActivities.reduce((total: number, activity: any) => {
      const duration = activity.duration || '0h';
      const hours = parseInt(duration.replace('h', '')) || 0;
      return total + hours;
    }, 0);
    
    // Calculate learning streak (simplified)
    const today = new Date();
    const lastActivity = userActivities.length > 0 ? new Date(Math.max(...userActivities.map((a: any) => a.timestamp))) : null;
    const daysSinceLastActivity = lastActivity ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const currentStreak = daysSinceLastActivity === 0 ? 1 : 0;
    
    // Calculate study focus
    const subjectCounts: { [key: string]: number } = {};
    userActivities.forEach((activity: any) => {
      if (activity.subject) {
        subjectCounts[activity.subject] = (subjectCounts[activity.subject] || 0) + 1;
      }
    });
    const topSubject = Object.keys(subjectCounts).length > 0 
      ? Object.keys(subjectCounts).reduce((a, b) => subjectCounts[a] > subjectCounts[b] ? a : b)
      : '-';
    
    return [
      {
        title: t('home.reportCards.performance.title'),
        number: `${performancePercentage}%`,
        subtitle: t('home.reportCards.performance.subtitle'),
        gradient: 'purple',
        icon: 'chart.bar',
        stats: [
          { label: t('home.reportCards.performance.stats.quizzesTaken'), value: totalMCQs.toString() },
          { label: t('home.reportCards.performance.stats.successRate'), value: `${performancePercentage}%` }
        ]
      },
      {
        title: t('home.reportCards.studyProgress.title'),
        number: `${totalStudyHours}h`,
        subtitle: t('home.reportCards.studyProgress.subtitle'),
        gradient: 'blue',
        icon: 'clock.fill',
        stats: [
          { label: t('home.reportCards.studyProgress.stats.dailyGoal'), value: '2h' },
          { label: t('home.reportCards.studyProgress.stats.weeklyGoal'), value: '14h' }
        ]
      },
      {
        title: t('home.reportCards.learningStreak.title'),
        number: `${currentStreak}d`,
        subtitle: t('home.reportCards.learningStreak.subtitle'),
        gradient: 'green',
        icon: 'trophy.fill',
        stats: [
          { label: t('home.reportCards.learningStreak.stats.currentStreak'), value: `${currentStreak}d` },
          { label: t('home.reportCards.learningStreak.stats.bestStreak'), value: '7d' }
        ]
      },
      {
        title: t('home.reportCards.studyFocus.title'),
        number: Object.keys(subjectCounts).length.toString(),
        subtitle: t('home.reportCards.studyFocus.subtitle'),
        gradient: 'orange',
        icon: 'chart.bar',
        stats: [
          { label: t('home.reportCards.studyFocus.stats.topSubject'), value: topSubject },
          { label: t('home.reportCards.studyFocus.stats.hoursPerSubject'), value: `${Math.round(totalStudyHours / Math.max(Object.keys(subjectCounts).length, 1))}h` }
        ]
      }
    ];
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  const handleBookPress = (type: 'mcq' | 'flashcard', book: BookItem) => {
    console.log('Book pressed:', { type, book });
    if (type === 'mcq') {
      // Pass the subject information to the MCQ screen
      router.push({
        pathname: '/(tabs)/mcq',
        params: {
          preSelectedSubject: book.subject,
          preSelectedSubjectId: book.id.replace('mcq-', '') // Extract the subject ID
        }
      });
    } else {
      // Pass the subject information to the Flashcards screen
      console.log('Navigating to flashcards with subject:', book.subject);
      router.push({
        pathname: '/(tabs)/flashcards',
        params: {
          preSelectedSubject: book.subject
        }
      });
    }
  };

  const handleNationalExamYearPress = () => {
    console.log('National exam clicked - show year chooser');
    // Show year chooser modal instead of directly navigating
    setShowNationalExamYearChooser(true);
  };

  const handleYearSelect = (year: number) => {
    console.log('Year selected:', year);
    // Navigate to MCQ screen with national exam type and pre-selected year
    router.push({
      pathname: '/(tabs)/mcq',
      params: {
        preSelectedExamType: 'national',
        preSelectedYear: year.toString()
      }
    });
    setShowNationalExamYearChooser(false);
  };

  const canvasBg = isDarkMode ? HOME_CANVAS.dark : HOME_CANVAS.light;
  const welcomeCardBg = isDarkMode ? WELCOME_CARD_BG.dark : WELCOME_CARD_BG.light;
  const welcomeTitleColor = isDarkMode ? '#F9FAFB' : '#111827';
  const welcomeSubtitleColor = isDarkMode ? '#93C5FD' : '#1E40AF';
  const gradeDigit = user?.grade?.replace(/\D/g, '') || '12';
  const quickCardBg = isDarkMode ? '#252A32' : '#FFFFFF';
  const quickCardBorder = isDarkMode ? '#2C3340' : '#E5E7EB';
  const sectionHeading = isDarkMode ? '#F3F4F6' : '#111827';
  const metaMuted = isDarkMode ? '#9AA2AF' : '#6B7280';

  const formatChapters = (n: number) =>
    n === 1 ? t('home.gradeSubjects.chaptersCountOne') : t('home.gradeSubjects.chaptersCount', { count: n });

  const renderSubjectTile = (book: BookItem) => {
    const coverData = getBookCover(book.subject);
    return (
      <View
        key={book.id}
        style={[styles.subjectGridCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
      >
        <View
          style={[
            styles.subjectGridCoverWrap,
            { minHeight: SUBJECT_GRID_TOP_BAND_HEIGHT, backgroundColor: quickCardBg },
          ]}
        >
          <SubjectCoverAtmosphere dark={isDarkMode} />
          <View style={styles.subjectGridCoverLift}>
            <BookCover
              title={book.title}
              subtitle={book.subtitle}
              coverColor={coverData.coverColor}
              coverGradient={coverData.coverGradient}
              icon={coverData.icon as IconSymbolName}
              imageUrl={book.image_url}
              onPress={() => handleBookPress('mcq', book)}
              coverWidth={SUBJECT_COVER_INNER_WIDTH}
              coverHeight={SUBJECT_COVER_INNER_HEIGHT}
              compact
            />
          </View>
        </View>
        <View style={styles.subjectGridCardBody}>
          <ThemedText numberOfLines={2} style={[styles.subjectGridTitle, { color: sectionHeading }]}>
            {book.title}
          </ThemedText>
          <ThemedText style={[styles.subjectGridChapters, { color: metaMuted }]}>{formatChapters(book.chapterCount)}</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: canvasBg }]} edges={['bottom']}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: canvasBg }]}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: canvasBg }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0F4BD7"
            colors={['#0F4BD7']}
            progressBackgroundColor={colors.cardAlt}
          />
        }
      >
        <ThemedView style={[styles.container, { backgroundColor: canvasBg }]}>
          <View style={[styles.welcomeCard, { backgroundColor: welcomeCardBg }]}>
            <ThemedText style={[styles.welcomeTitle, { color: welcomeTitleColor }]}>
              {isKGStudent
                ? t('home.welcomeCard.titleKg', { grade: t('common.kindergarten') })
                : t('home.welcomeCard.title', { grade: gradeDigit })}
            </ThemedText>
            <ThemedText style={[styles.welcomeSubtitle, { color: welcomeSubtitleColor }]}>
              {t('home.welcomeCard.subtitle')}
            </ThemedText>
          </View>

          {!isKGStudent ? (
            <>
              <ThemedText style={[styles.quickAccessHeading, { color: sectionHeading }]}>
                {t('home.quickAccess.sectionTitle')}
              </ThemedText>
              <View style={styles.quickAccessRow}>
                <TouchableOpacity
                  style={[styles.quickAccessCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
                  onPress={() => router.push('/(tabs)/mcq')}
                  activeOpacity={0.88}
                >
                  <View style={[styles.quickAccessIconCircle, { backgroundColor: isDarkMode ? '#1E3A5F' : '#E3F2FD' }]}>
                    <IconSymbol name="questionmark.circle.fill" size={26} color="#0F4BD7" />
                  </View>
                  <ThemedText style={[styles.quickAccessLabel, { color: sectionHeading }]}>
                    {t('home.quickAccess.practiceLabel')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAccessCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
                  onPress={() => router.push('/(tabs)/flashcards')}
                  activeOpacity={0.88}
                >
                  <View style={[styles.quickAccessIconCircle, { backgroundColor: isDarkMode ? '#1B3328' : '#E8F5E9' }]}>
                    <IconSymbol name="rectangle.stack.fill" size={26} color="#2E7D32" />
                  </View>
                  <ThemedText style={[styles.quickAccessLabel, { color: sectionHeading }]}>
                    {t('home.quickAccess.flashcardsLabel')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAccessCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
                  onPress={() => router.push('/(tabs)/reports')}
                  activeOpacity={0.88}
                >
                  <View style={[styles.quickAccessIconCircle, { backgroundColor: isDarkMode ? '#3D2E1F' : '#FFF3E0' }]}>
                    <IconSymbol name="chart.bar.fill" size={26} color="#ED6C02" />
                  </View>
                  <ThemedText style={[styles.quickAccessLabel, { color: sectionHeading }]}>
                    {t('home.quickAccess.reportsLabel')}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.subjectsSectionHeader}>
                <ThemedText style={[styles.subjectsSectionTitle, { color: sectionHeading }]}>
                  {t('home.gradeSubjects.title', { grade: gradeDigit })}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push('/(tabs)/mcq')} hitSlop={12}>
                  <ThemedText style={styles.viewAllLink}>{t('home.viewAll')}</ThemedText>
                </TouchableOpacity>
              </View>

              {isMCQLoading ? (
                <View style={styles.subjectGrid}>
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={[styles.subjectGridCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
                    >
                      <View
                        style={[
                          styles.subjectGridCoverWrap,
                          { minHeight: SUBJECT_GRID_TOP_BAND_HEIGHT, backgroundColor: quickCardBg },
                        ]}
                      >
                        <SubjectCoverAtmosphere dark={isDarkMode} />
                        <View
                          style={[
                            styles.subjectGridCoverLift,
                            styles.subjectGridSkeletonCover,
                            { backgroundColor: metaMuted + '45' },
                          ]}
                        />
                      </View>
                      <View style={styles.subjectGridCardBody}>
                        <View style={[styles.skeletonLine, { backgroundColor: metaMuted + '40' }]} />
                        <View style={[styles.skeletonLineShort, { backgroundColor: metaMuted + '30' }]} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.subjectGrid}>{homeMcqSubjects.map(renderSubjectTile)}</View>
              )}

              {hasNationalExams() && nationalExamYears.length > 0 && (
                <ThemedView style={[styles.bookCarouselSection, { backgroundColor: canvasBg }]}>
                  <View style={styles.bookCarouselHeader}>
                    <ThemedText style={[styles.bookCarouselTitle, { color: sectionHeading }]}>
                      {t('home.quickActions.nationalExams.title')}
                    </ThemedText>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/mcq')}>
                      <ThemedText style={styles.viewAllLink}>{t('home.viewAll')}</ThemedText>
                    </TouchableOpacity>
                  </View>
                  {isNationalExamLoading ? (
                    <View style={styles.bookCarouselSkeleton}>
                      {[1, 2, 3, 4].map((index) => (
                        <View key={index} style={styles.bookSkeletonItem}>
                          <View style={[styles.bookSkeletonCover, { backgroundColor: colors.text + '20' }]} />
                          <View style={[styles.bookSkeletonTitle, { backgroundColor: colors.text + '20' }]} />
                          <View style={[styles.bookSkeletonSubtitle, { backgroundColor: colors.text + '20' }]} />
                        </View>
                      ))}
                    </View>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.bookCarouselContainer}
                    >
                      {nationalExamYears.map((year) => {
                        const coverData = getBookCover('National Exam');
                        return (
                          <BookCover
                            key={year}
                            title={t('home.quickActions.nationalExams.yearExam', { year })}
                            subtitle={t('home.quickActions.nationalExams.grade', {
                              grade: user?.grade?.replace(/[^\d]/g, '') ?? '',
                            })}
                            coverColor={coverData.coverColor}
                            coverGradient={coverData.coverGradient}
                            icon={coverData.icon as any}
                            imageUrl=""
                            onPress={() => handleNationalExamYearPress()}
                            questionCount={Math.floor(Math.random() * 100) + 50}
                          />
                        );
                      })}
                    </ScrollView>
                  )}
                </ThemedView>
              )}
            </>
          ) : (
            <View style={styles.carouselSection}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {reportCards.map((card, index) => (
                  <ThemedView key={index} style={styles.reportCard}>
                    <LinearGradient
                      colors={GRADIENTS[card.gradient]}
                      style={styles.reportCardContent}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.reportCardHeader}>
                        <View style={styles.reportCardIconContainer}>
                          <IconSymbol name={card.icon} size={24} color="#fff" />
                        </View>
                        <ThemedText style={styles.reportCardTitle}>{card.title}</ThemedText>
                        <View style={styles.paginationDots}>
                          {reportCards.map((_, dotIndex) => (
                            <View
                              key={dotIndex}
                              style={[
                                styles.paginationDot,
                                dotIndex === activeIndex && styles.paginationDotActive,
                              ]}
                            />
                          ))}
                        </View>
                      </View>
                      <View style={styles.reportCardMain}>
                        <ThemedText style={styles.reportCardNumber}>{card.number}</ThemedText>
                        <ThemedText style={styles.reportCardSubtitle}>{card.subtitle}</ThemedText>
                      </View>
                      <View style={styles.reportCardStats}>
                        {card.stats.map((stat, statIndex) => (
                          <View key={statIndex} style={styles.reportStatItem}>
                            <ThemedText style={styles.reportStatValue}>{stat.value}</ThemedText>
                            <ThemedText style={styles.reportStatLabel}>{stat.label}</ThemedText>
                          </View>
                        ))}
                      </View>
                    </LinearGradient>
                  </ThemedView>
                ))}
              </ScrollView>
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* National Exam Year Chooser Modal */}
      <Modal
        visible={showNationalExamYearChooser}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNationalExamYearChooser(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowNationalExamYearChooser(false)}
          />
          <View style={{
            backgroundColor: '#0F4BD7',
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
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.2)'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>
                  Select Year
                </Text>
                <TouchableOpacity
                  onPress={() => setShowNationalExamYearChooser(false)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
                Choose a national exam year
              </Text>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16 }}
            >
              {nationalExamYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8
                  }}
                  onPress={() => handleYearSelect(year)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}>
                    {year} National Exam
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 22,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  quickAccessHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  quickAccessIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  subjectsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  subjectsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 12,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4BD7',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: 8,
  },
  subjectGridCard: {
    width: BOOK_GRID_CARD_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  subjectGridCoverWrap: {
    width: BOOK_GRID_CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  subjectGridAtmosphereRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  subjectGridCoverLift: {
    zIndex: 1,
  },
  subjectGridSkeletonCover: {
    width: SUBJECT_COVER_INNER_WIDTH,
    height: SUBJECT_COVER_INNER_HEIGHT,
    borderRadius: 12,
  },
  subjectGridCardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  subjectGridTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  subjectGridChapters: {
    fontSize: 12,
    fontWeight: '500',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 6,
    width: '90%',
    marginBottom: 8,
  },
  skeletonLineShort: {
    height: 12,
    borderRadius: 5,
    width: '55%',
  },
  quickActionsSection: {
    marginTop: 8,
    marginBottom: 50,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    padding: 2,
    marginTop: 8,
  },
  gridItem: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridItemContent: {
    padding: 16,
    height: 140,
    borderRadius: 16,
    justifyContent: 'flex-start',
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridTextContainer: {
    flex: 1,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridItemSubtitle: {
    fontSize: 13,
  },
  gridDecoration: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
  },
  decorationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 4,
    opacity: 0.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
  },
  activityProgress: {
    height: 2,
    borderRadius: 1,
    marginTop: 8,
    width: '100%',
  },
  activityProgressBar: {
    height: '100%',
    width: '80%',
    borderRadius: 1,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  carouselSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  carouselContainer: {
    paddingHorizontal: 20,
  },
  reportCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginRight: 40,
    marginLeft: -20,
  },
  reportCardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between',
  },
  reportCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  reportCardMain: {
    marginTop: 10,
  },
  reportCardNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  reportCardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  reportCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  reportStatItem: {
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  reportStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 18,
  },
  bookCarouselSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  bookCarouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  bookCarouselTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  bookCarouselContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  bookCard: {
    width: BOOK_CARD_WIDTH,
    height: 220,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bookCardContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
    position: 'relative',
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 1,
  },
  bookCover: {
    width: '100%',
    height: 140,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
    lineHeight: 16,
  },
  bookSubtitle: {
    fontSize: 11,
    marginBottom: 8,
    opacity: 0.7,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  progressBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    marginRight: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  progressText: {
    fontSize: 9,
    fontWeight: '600',
    minWidth: 20,
  },
  bookCarouselSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  bookSkeletonItem: {
    width: BOOK_CARD_WIDTH,
    alignItems: 'center',
  },
  bookSkeletonCover: {
    width: BOOK_CARD_WIDTH - 10,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookSkeletonTitle: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  bookSkeletonSubtitle: {
    width: '60%',
    height: 12,
    borderRadius: 3,
  },
}); 
