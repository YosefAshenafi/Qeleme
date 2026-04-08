import { ScrollView } from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { getPracticeData, getNationalExamAvailable } from '@/features/common/services/practiceService';
import { BASE_URL } from '@/config/constants';
import { useAuth } from '@/core/providers/AuthProvider';
import { HOME_CANVAS, HOME_CARD_SPACING, HOME_CARD_WIDTH } from '@/features/home/constants/homeUi';
import type { BookItem, ReportCard } from '@/features/home/types/home';
import { calculateReportData, getDefaultReportCards } from '@/features/home/utils/homeReportData';

export function useHomeScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user, login } = useAuth();
  const colors = getColors(isDarkMode);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [homeMcqSubjects, setHomeMcqSubjects] = useState<BookItem[]>([]);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [nationalExamYears, setNationalExamYears] = useState<number[]>([]);
  const [isNationalExamLoading, setIsNationalExamLoading] = useState(false);

  const isKGStudent = typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg');

  const hasNationalExams = () => {
    if (!user?.grade) return false;
    const gradeNumber = user.grade.replace(/[^\d]/g, '');
    return ['6', '8', '12'].includes(gradeNumber);
  };

  const loadReportData = async () => {
    try {
      const activitiesJson = await AsyncStorage.getItem('recentActivities');
      let activities: unknown[] = [];
      if (activitiesJson) {
        activities = JSON.parse(activitiesJson);
      }

      if (activities.length === 0) {
        setReportCards(getDefaultReportCards(t));
        return;
      }

      setReportCards(calculateReportData(activities, user?.username, t));
    } catch {
      setReportCards(getDefaultReportCards(t));
    }
  };

  const fetchNationalExamYears = async () => {
    if (!hasNationalExams()) return;

    try {
      setIsNationalExamLoading(true);
      const gradeNumber = user?.grade?.replace(/[^\d]/g, '');
      if (gradeNumber) {
        const data = await getNationalExamAvailable(parseInt(gradeNumber, 10));
        setNationalExamYears(data.data.years);
      }
    } catch {
      setNationalExamYears([]);
    } finally {
      setIsNationalExamLoading(false);
    }
  };

  const fetchHomeMcqSubjects = async () => {
    setIsPracticeLoading(true);
    try {
      const gradeNumber = user?.grade?.replace(/[^0-9]/g, '') || '6';
      const practiceData = await getPracticeData(`grade-${gradeNumber}`);
      if (practiceData.grades && practiceData.grades.length > 0) {
        const grade = practiceData.grades[0];
        const tiles: BookItem[] = grade.subjects.map((subject: { id: string; name: string; image_url?: string; chapters?: unknown[] }) => ({
          id: `practice-${subject.id}`,
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
    } catch {
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
          id: `practice-${index}`,
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
      setIsPracticeLoading(false);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const storedUsername = await AsyncStorage.getItem('@username');
      const storedPassword = await AsyncStorage.getItem('@password');

      if (storedUsername && storedPassword) {
        const response = await fetch(`${BASE_URL}/api/auth/student/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
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
        !isKGStudent && hasNationalExams() ? fetchNationalExamYears() : Promise.resolve(),
      ]);
    } catch {
    }
    setRefreshing(false);
  }, [isKGStudent, login, user?.grade]);

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (HOME_CARD_WIDTH + HOME_CARD_SPACING));
    setActiveIndex(index);
  };

  const handleBookPress = (type: 'practice' | 'flashcard', book: BookItem) => {
    if (type === 'practice') {
      router.push({
        pathname: '/(tabs)/practice',
        params: {
          preSelectedSubject: book.subject,
          preSelectedSubjectId: book.id.replace(/^practice-/, ''),
        },
      });
    } else {
      router.push({
        pathname: '/(tabs)/flashcards',
        params: {
          preSelectedSubject: book.subject,
        },
      });
    }
  };

  const canvasBg = isDarkMode ? HOME_CANVAS.dark : HOME_CANVAS.light;
  const welcomeTitleColor = isDarkMode ? '#F9FAFB' : '#111827';
  const welcomeSubtitleColor = isDarkMode ? '#93C5FD' : '#1E40AF';
  const gradeDigit = user?.grade?.replace(/\D/g, '') || '12';
  const quickCardBg = isDarkMode ? '#252A32' : '#FFFFFF';
  const quickCardBorder = isDarkMode ? '#2C3340' : '#E5E7EB';
  const sectionHeading = isDarkMode ? '#F3F4F6' : '#111827';
  const metaMuted = isDarkMode ? '#9AA2AF' : '#6B7280';

  const formatChapterLabel = (n: number) =>
    n === 1 ? t('home.gradeSubjects.chaptersCountOne') : t('home.gradeSubjects.chaptersCount', { count: n });

  return {
    t,
    isDarkMode,
    user,
    colors,
    activeIndex,
    refreshing,
    scrollViewRef,
    reportCards,
    homeMcqSubjects,
    isPracticeLoading,
    nationalExamYears,
    isNationalExamLoading,
    isKGStudent,
    hasNationalExams,
    onRefresh,
    handleScroll,
    handleBookPress,
    canvasBg,
    welcomeTitleColor,
    welcomeSubtitleColor,
    gradeDigit,
    quickCardBg,
    quickCardBorder,
    sectionHeading,
    metaMuted,
    formatChapterLabel,
  };
}
