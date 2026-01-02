import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import RichText from '@/components/ui/RichText';
import { getFlashcards, getFlashcardStructure, getFlashcardsForChapter, Grade, Subject, Chapter, Flashcard } from '@/services/flashcardService';
import ActivityTrackingService from '@/services/activityTrackingService';

interface RecentActivity {
  type: string;
  grade: string;
  subject: string;
  chapter: string;
  timestamp: number;
  details: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function FlashcardsScreen() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  
  // Debug logging
  console.log('Flashcards params:', params);
  console.log('Pre-selected subject:', params.preSelectedSubject);
  
  const [selectedGradeId, setSelectedGradeId] = useState<string>('1');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [hasAppliedPreSelection, setHasAppliedPreSelection] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [previousLanguage, setPreviousLanguage] = useState(i18n.language);
  const [isPreSelected, setIsPreSelected] = useState(false);
  const preSelectionAttempted = useRef(false);

  const revealAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  const fetchFlashcards = async (gradeLevelId: string = '1') => {
    try {
      setIsLoading(true);
      const data = await getFlashcardStructure(gradeLevelId);
      setFlashcardsData(data);
      setError(null);
    } catch (error) {
      // Ignore specific error messages and show network error
      setError(t('errors.network.message'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize grade from user data
    if (user?.grade) {
      console.log('Setting grade from user data:', user.grade);
      // Extract numeric value from grade string (e.g., "Grade 6" -> "6")
      const gradeNumber = user.grade.replace(/[^\d]/g, '');
      console.log('Extracted grade number:', gradeNumber);
      setSelectedGradeId(gradeNumber || '1');
    } else {
      // Default to grade 1 if no grade is found in user data
      console.log('No grade found in user data, defaulting to grade 1');
      setSelectedGradeId('1');
    }
  }, [user]);

  // Fetch flashcards when grade level changes
  useEffect(() => {
    if (selectedGradeId) {
      fetchFlashcards(selectedGradeId);
    }
  }, [selectedGradeId]);

  // Reset pre-selection tracking when params change
  useEffect(() => {
    if (params.preSelectedSubject) {
      console.log('Pre-selection parameter detected:', params.preSelectedSubject);
      preSelectionAttempted.current = false;
      setHasAppliedPreSelection(false);
    }
  }, [params.preSelectedSubject]);

  // Update the selected grade when flashcards data is loaded
  useEffect(() => {
    if (flashcardsData && flashcardsData.length > 0) {
      const grade = flashcardsData[0];
      if (grade && grade.name) {
        setSelectedGrade(grade.name);

        // Handle pre-selected subject from route parameters
        if (params.preSelectedSubject && !preSelectionAttempted.current) {
          console.log('=== Starting Pre-Selection Process ===');
          console.log('Looking for subject:', params.preSelectedSubject);
          console.log('Available subjects:', grade.subjects?.map(s => ({ id: s.id, name: s.name })));

          // Mark that we've attempted pre-selection
          preSelectionAttempted.current = true;

          // Reset any active flashcard session when navigating from home page
          setShowFlashcards(false);
          setCurrentIndex(0);
          setIsRevealed(false);
          setCurrentFlashcards([]);
          setSessionStartTime(null);

          // Reset animations
          revealAnimation.value = withSpring(0, {
            damping: 12,
            stiffness: 80,
            mass: 0.8,
          });
          progressAnimation.value = withTiming(0);

          // Try exact match first (case-insensitive with trimming)
          const searchTerm = (params.preSelectedSubject as string).toLowerCase().trim();
          let subject = grade.subjects?.find(s =>
            s.name.toLowerCase().trim() === searchTerm
          );

          // If not found, try partial match
          if (!subject) {
            console.log('Exact match not found, trying partial match...');
            subject = grade.subjects?.find(s => {
              const subjectName = s.name.toLowerCase();
              return subjectName.includes(searchTerm) || searchTerm.includes(subjectName);
            });
          }

          if (subject) {
            console.log('✓ Found subject:', { id: subject.id, name: subject.name });
            console.log('Setting selected subject to:', subject.id);
            setSelectedSubject(subject.id);
            setSelectedChapter(''); // Reset chapter when subject changes
            setIsPreSelected(true); // Mark as pre-selected
            setHasAppliedPreSelection(true);
          } else {
            console.warn('✗ Subject not found!');
            console.log('Searched for:', params.preSelectedSubject);
            console.log('Available options:', grade.subjects?.map(s => s.name).join(', '));
            // Don't select anything if not found
            setSelectedSubject('');
            setSelectedChapter('');
            setIsPreSelected(false);
            setHasAppliedPreSelection(true);
          }
          console.log('=== Pre-Selection Process Complete ===');
        } else if (!params.preSelectedSubject && !hasAppliedPreSelection) {
          // Reset subject and chapter when there's no pre-selection
          setSelectedSubject('');
          setSelectedChapter('');
          setHasAppliedPreSelection(true);
        }
      }
    }
  }, [flashcardsData, params.preSelectedSubject]);

  // Reset chapter when subject changes (but don't clear during pre-selection)
  useEffect(() => {
    if (selectedSubject && hasAppliedPreSelection) {
      // Only clear chapter if this is a manual change (after pre-selection has been applied)
      if (isPreSelected) {
        // This is the first time setting from pre-selection, don't clear chapter
        setIsPreSelected(false);
      } else {
        // This is a manual change, clear chapter
        setSelectedChapter('');
      }
    }
  }, [selectedSubject]);

  const selectedGradeData = selectedGrade && flashcardsData ? flashcardsData.find(g => g.name === selectedGrade) : null;
  const selectedSubjectData = selectedSubject && selectedGradeData && selectedGradeData.subjects
    ? selectedGradeData.subjects.find(s => s.id === selectedSubject)
    : null;
  

  const selectedChapterData = selectedChapter && selectedSubjectData && selectedSubjectData.chapters
    ? selectedSubjectData.chapters.find(c => c.id === selectedChapter)
    : null;
  const currentCard = currentFlashcards.length > currentIndex 
    ? currentFlashcards[currentIndex] 
    : null;
  
  // Function to detect if text contains Amharic characters
  const isAmharicText = (text: string): boolean => {
    if (!text) return false;
    // Amharic Unicode range: U+1200-U+137F
    const amharicRegex = /[\u1200-\u137F]/;
    return amharicRegex.test(text);
  };

  // Get question and answer text - always use the same fields regardless of language
  const getQuestionText = (card: typeof currentCard) => {
    if (!card) return 'No question available';
    return card.question;
  };
  
  const getAnswerText = (card: typeof currentCard) => {
    if (!card) return 'No answer available';
    return card.answer;
  };

  // Check if the current language is Amharic
  const isAmharicLanguage = i18n.language === 'am';
  const progress = currentFlashcards.length > 0 
    ? ((currentIndex + 1) / currentFlashcards.length) * 100 
    : 0;

  // Always show questions first when a new card is loaded
  useEffect(() => {
    if (currentCard) {
      setIsRevealed(false);
      
      // Animate to show question (not revealed state)
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
    }
  }, [currentCard]);

  useEffect(() => {
    if (showFlashcards && selectedChapterData?.flashcards && selectedChapterData.flashcards.length > 0) {
      progressAnimation.value = withTiming((1 / selectedChapterData.flashcards.length) * 100);
    }
  }, [showFlashcards, selectedChapterData]);

  // Track language changes for debugging
  useEffect(() => {
    if (previousLanguage !== i18n.language) {
      console.log('Language changed from', previousLanguage, 'to', i18n.language);
      setPreviousLanguage(i18n.language);
    }
  }, [i18n.language, previousLanguage]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [0, 180]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);
    
    return {
      transform: [
        { perspective: 2000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      shadowOpacity,
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [180, 360]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);
    
    return {
      transform: [
        { perspective: 2000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      shadowOpacity,
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value}%`,
    };
  });

  const handleReveal = () => {
    setIsRevealed(!isRevealed);
    revealAnimation.value = withSpring(isRevealed ? 0 : 1, {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    });
  };

  const handleNext = () => {
    if (currentFlashcards.length > 0 && currentIndex < currentFlashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // The useEffect will handle setting the correct reveal state based on Amharic detection
      progressAnimation.value = withTiming(((currentIndex + 2) / currentFlashcards.length) * 100);
      
      // Track activity when reaching the end
      if (currentIndex + 1 === currentFlashcards.length - 1) {
        const trackActivity = async () => {
          try {
            const trackingService = ActivityTrackingService.getInstance();
            await trackingService.initialize();
            
            const cardsReviewed = currentIndex + 1;
            const cardsMastered = currentFlashcards.filter(card => card.isChecked).length;
            const timeSpent = Date.now() - (sessionStartTime || Date.now()); // Approximate time spent
            
            // Get proper names for tracking
            const gradeName = selectedGradeData?.name || selectedGrade || 'Unknown Grade';
            const subjectName = selectedSubjectData?.name || selectedSubject || 'Unknown Subject';
            const chapterName = selectedChapterData?.name || selectedChapter || 'Unknown Chapter';
            
            console.log('Tracking flashcard activity:', {
              grade: gradeName,
              subject: subjectName,
              chapter: chapterName,
              cardsReviewed,
              cardsMastered,
              selectedGrade,
              selectedSubject,
              selectedChapter,
              selectedGradeData: selectedGradeData?.name,
              selectedSubjectData: selectedSubjectData?.name,
              selectedChapterData: selectedChapterData?.name
            });
            
            await trackingService.trackFlashcardActivity({
              grade: gradeName,
              subject: subjectName,
              chapter: chapterName,
              cardsReviewed: cardsReviewed,
              cardsMastered: cardsMastered,
              timeSpent: Math.round(timeSpent / 1000), // Convert to seconds
            });
          } catch (error) {
            console.error('Failed to track flashcard activity:', error);
            // Silently fail - activity tracking is not critical
          }
        };
        
        trackActivity();
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
      if (currentFlashcards.length > 0) {
        progressAnimation.value = withTiming((currentIndex / currentFlashcards.length) * 100);
      }
    }
  };

  const handleStartFlashcards = async () => {
    if (!selectedSubject || !selectedChapter) return;
    
    try {
      setIsLoading(true);
      
      // Find the subject slug
      const grade = flashcardsData.find(g => g.name === selectedGrade);
      const subject = grade?.subjects.find(s => s.id === selectedSubject);
      const subjectSlug = subject?.slug;
      
      if (!subjectSlug) {
        throw new Error('Subject slug not found');
      }
      
      // Get the chapter name for the API call
      const chapterName = selectedChapterData?.name;
      if (!chapterName) {
        throw new Error('Chapter name not found');
      }
      
      // Fetch flashcards directly
      const flashcards = await getFlashcardsForChapter(
        selectedGradeId,
        subjectSlug,
        chapterName
      );
      
      if (!flashcards || flashcards.length === 0) {
        setError(t('flashcards.noFlashcardsAvailable'));
        return;
      }
      
      // Set the current flashcards directly for immediate use
      setCurrentFlashcards(flashcards);
      setSessionStartTime(Date.now()); // Start tracking session time
      
      // Update the state with the flashcards
      const updatedFlashcardsData = flashcardsData.map(g => {
        if (g.name === selectedGrade) {
          return {
            ...g,
            subjects: g.subjects.map(s => {
              if (s.id === selectedSubject) {
                return {
                  ...s,
                  chapters: s.chapters.map(c => {
                    if (c.id === selectedChapter) {
                      return {
                        ...c,
                        flashcards: flashcards
                      };
                    }
                    return c;
                  })
                };
              }
              return s;
            })
          };
        }
        return g;
      });
      
      setFlashcardsData(updatedFlashcardsData);
      
      // Show flashcards immediately
      setShowFlashcards(true);
      setCurrentIndex(0);
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
      
    } catch (error) {
      console.error('Error fetching chapter flashcards:', error);
      setError(t('errors.network.message'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('flashcards.title')} />
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            {t('flashcards.loading')}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('flashcards.title')} />
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
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
              onPress={() => {
                setError(null);
                setIsLoading(true);
                fetchFlashcards(selectedGradeId);
              }}
            >
              <ThemedText style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
                {t('common.tryAgain')}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Show result page after finishing flashcards - CHECK THIS FIRST
  if (showResult) {
    const totalCards = currentFlashcards.length;
    const timeSpent = sessionStartTime ? Date.now() - sessionStartTime : 0;
    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    };

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={[styles.resultTitle, { color: colors.text }]}>
              {t('flashcards.results.title', 'Flashcard Session Complete!')}
            </ThemedText>
            
            <ThemedView style={[styles.resultCard, { backgroundColor: colors.card }]}>
              <LinearGradient
                colors={[colors.cardGradientStart || colors.tint, colors.cardGradientEnd || colors.tint]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              <View style={styles.trophyContainer}>
                <IconSymbol name="trophy.fill" size={80} color={colors.tabIconSelected} />
              </View>
              
              <View style={styles.resultContent}>
                <ThemedText style={[styles.scoreText, { color: colors.text }]}>
                  {t('flashcards.results.cardsReviewed', 'Cards Reviewed: {{count}}', { count: totalCards })}
                </ThemedText>
                
                <View style={[styles.percentageContainer, { backgroundColor: colors.cardAlt, borderColor: isDarkMode ? '#FFFFFF' : colors.border }]}>
                  <ThemedText style={[styles.percentageText, { color: colors.text }]}>
                    {formatTime(timeSpent)}
                  </ThemedText>
                </View>
                
                <View style={[styles.messageContainer, { backgroundColor: colors.cardAlt, borderColor: isDarkMode ? '#FFFFFF' : colors.border }]}>
                  <ThemedText style={[styles.messageText, { color: colors.text }]}>
                    {t('flashcards.results.message', 'Great job! You\'ve completed all flashcards in this chapter.')}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>

            <ThemedView style={[styles.actionButtons, { backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[styles.button, styles.retryButton, { backgroundColor: colors.tint, marginBottom: 12 }]}
                onPress={() => {
                  setShowResult(false);
                  setShowFlashcards(true);
                  setCurrentIndex(0);
                  setIsRevealed(false);
                  setSessionStartTime(Date.now());
                  revealAnimation.value = withSpring(0, {
                    damping: 12,
                    stiffness: 80,
                    mass: 0.8,
                  });
                  progressAnimation.value = withTiming(0);
                }}
              >
                <ThemedText style={[styles.retryButtonText, { color: '#fff' }]}>
                  {t('flashcards.results.reviewAgain', 'Review Again')}
                </ThemedText>
                <IconSymbol name="chevron.right" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.homeButton, { backgroundColor: colors.cardAlt, borderColor: isDarkMode ? '#FFFFFF' : colors.border }]}
                onPress={() => {
                  setShowResult(false);
                  setShowFlashcards(false);
                  setCurrentIndex(0);
                  setIsRevealed(false);
                  setCurrentFlashcards([]);
                  setSessionStartTime(null);
                  revealAnimation.value = withSpring(0, {
                    damping: 12,
                    stiffness: 80,
                    mass: 0.8,
                  });
                  progressAnimation.value = withTiming(0);
                }}
              >
                <ThemedText style={[styles.homeButtonText, { color: colors.text }]}>
                  {t('flashcards.results.chooseAnotherChapter', 'Choose Another Chapter')}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Show selection screen when not showing flashcards
  if (!showFlashcards) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('flashcards.title')} />
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
            <ThemedView style={[styles.formContent, { backgroundColor: colors.background }]}>
              {/* Subject Selection */}
              <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                  {t('flashcards.subject')}
                  {isPreSelected && (
                    <ThemedText style={[styles.preSelectedLabel, { color: colors.tint }]}>
                      {' '}({t('flashcards.preSelected')})
                    </ThemedText>
                  )}
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.formInput, 
                    { 
                      backgroundColor: colors.cardAlt, 
                      borderColor: isPreSelected ? (isDarkMode ? '#FFFFFF' : colors.tint) : (isDarkMode ? '#FFFFFF' : colors.border),
                      borderWidth: isPreSelected ? 2 : 1,
                    }
                  ]}
                  onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                >
                  <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                    {selectedSubject ? selectedGradeData?.subjects?.find((s: Subject) => s.id === selectedSubject)?.name : t('flashcards.selectSubject')}
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
                          {selectedGradeData?.subjects?.sort((a, b) => {
                            // Extract numbers from subject names for proper sorting
                            const getSubjectNumber = (name: string) => {
                              const match = name.match(/(\d+)/);
                              return match ? parseInt(match[1], 10) : 0;
                            };
                            return getSubjectNumber(a.name) - getSubjectNumber(b.name);
                          }).map((subject: Subject, index: number) => (
                            <TouchableOpacity
                              key={`subject-${subject.id}-${index}`}
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

              {/* Chapter Selection */}
              <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                  {t('flashcards.chapter')}
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.formInput,
                    { backgroundColor: colors.cardAlt, borderColor: isDarkMode ? '#FFFFFF' : colors.border },
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
                    {selectedChapter ? selectedSubjectData?.chapters?.find((c: Chapter) => c.id === selectedChapter)?.name : t('flashcards.selectChapter')}
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
                          {selectedSubjectData?.chapters?.sort((a, b) => {
                            // Extract numbers from chapter names for proper sorting
                            const getChapterNumber = (name: string) => {
                              const match = name.match(/(\d+)/);
                              return match ? parseInt(match[1], 10) : 0;
                            };
                            return getChapterNumber(a.name) - getChapterNumber(b.name);
                          }).map((chapter: Chapter, index: number) => (
                            <TouchableOpacity
                              key={`chapter-${chapter.id}-${index}`}
                              style={[styles.modalItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                              onPress={() => {
                                setSelectedChapter(chapter.id);
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

              <TouchableOpacity
                style={[
                  styles.startButton,
                  { backgroundColor: colors.tint },
                  (!selectedSubject || !selectedChapter) && { opacity: 0.5 }
                ]}
                onPress={handleStartFlashcards}
                disabled={!selectedSubject || !selectedChapter}
              >
                <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>
                  {t('flashcards.startFlashcards')}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Safety check: Don't render flashcards if there's no valid data
  if (!currentFlashcards || currentFlashcards.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('flashcards.title')} />
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.emptyStateContainer, { backgroundColor: colors.background }]}>
            <IconSymbol name="rectangle.stack" size={90} color={colors.warning} style={styles.emptyStateIcon} />
            <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>
              {t('flashcards.noFlashcards')}
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtitle, { color: colors.text, opacity: 0.7 }]}>
              No flashcards available for the selected chapter.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.tint, marginTop: 20 }]}
              onPress={() => {
                setShowFlashcards(false);
                setSelectedSubject('');
                setSelectedChapter('');
                setCurrentFlashcards([]);
              }}
            >
              <ThemedText style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
                Choose Different Chapter
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title={t('flashcards.title')} />

      {/* Breadcrumb */}
      <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.breadcrumbContainer, { backgroundColor: colors.cardAlt }]}>
          <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <ThemedText style={[styles.breadcrumbText, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
              {selectedGrade || (user?.grade ? `${t('common.grade')} ${user.grade.replace(/\D/g, '')}` : t('common.grade'))}
            </ThemedText>
          </View>
          {selectedSubject && selectedSubjectData && (
            <>
              <IconSymbol name="chevron.right" size={16} color={isDarkMode ? '#FFFFFF' : colors.tint} />
              <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ThemedText style={[styles.breadcrumbText, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
                  {selectedSubjectData.name}
                </ThemedText>
              </View>
            </>
          )}
          {selectedChapter && selectedChapterData && (
            <>
              <IconSymbol name="chevron.right" size={16} color={isDarkMode ? '#FFFFFF' : colors.tint} />
              <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ThemedText style={[styles.breadcrumbText, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
                  {t('flashcards.chapter')} {selectedChapterData.name}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Ultra-Compact Sticky Header */}
      <View style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        backgroundColor: colors.background,
        paddingVertical: 4,
        paddingHorizontal: 0,
      }}>
        {/* Full-Width Progress Bar */}
        <View style={{
          paddingHorizontal: 20,
          marginBottom: 4,
        }}>
          <View style={{
            height: 4,
            backgroundColor: colors.cardAlt,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <Animated.View style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.tint,
                height: '100%',
                borderRadius: 2,
              },
              progressBarStyle
            ]} />
          </View>
          <ThemedText 
            numberOfLines={1}
            style={[styles.progressText, { 
              color: colors.tint, 
              fontSize: 12, 
              fontWeight: '600',
              textAlign: 'center',
              marginTop: 2,
              flexShrink: 0,
            }]}>
            Card {currentIndex + 1} of {currentFlashcards.length || 0}
          </ThemedText>
        </View>

        {/* Full-Width Navigation Buttons */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          gap: 8,
        }}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.prevButton,
              { 
                borderColor: isDarkMode ? '#FFFFFF' : colors.border,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              },
              currentIndex === 0 && styles.navButtonDisabled
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <IconSymbol name="chevron.left" size={16} color={colors.tint} />
            <ThemedText style={[styles.prevButtonText, { color: colors.tint, fontSize: 12, marginLeft: 4 }]}>
              {t('flashcards.previous')}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              { 
                backgroundColor: colors.tint,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }
            ]}
            onPress={() => {
              if (currentFlashcards.length > 0 && currentIndex === currentFlashcards.length - 1) {
                // Show result page when Finish is clicked
                setShowFlashcards(false);
                setShowResult(true);
              } else {
                handleNext();
              }
            }}
            disabled={false}
          >
            <ThemedText style={[styles.nextButtonText, { color: '#fff', fontSize: 12, marginRight: 4 }]}>
              {currentFlashcards.length > 0 && currentIndex === currentFlashcards.length - 1 ? t('flashcards.finish') : t('flashcards.next')}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          <View style={[styles.cardContainer, { marginHorizontal: 20 }]}>
            <TouchableOpacity
              onPress={handleReveal}
              activeOpacity={0.9}
              style={styles.cardWrapper}
            >
              <Animated.View style={[styles.card, frontAnimatedStyle, { borderColor: isDarkMode ? '#FFFFFF' : colors.border, backgroundColor: colors.cardAlt }]}>
                <ScrollView
                  style={styles.cardScrollView}
                  contentContainerStyle={styles.cardScrollContent}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  bounces={false}
                >
                  <RichText
                    text={getQuestionText(currentCard)}
                    style={styles.cardText}
                    color={isDarkMode ? '#FFFFFF' : colors.tint}
                    fontSize={20}
                    textAlign="center"
                    lineHeight={28}
                  />
                </ScrollView>
              </Animated.View>
              <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle, { borderColor: isDarkMode ? '#FFFFFF' : colors.border, backgroundColor: colors.cardAlt }]}>
                <ScrollView
                  style={styles.cardScrollView}
                  contentContainerStyle={styles.cardScrollContent}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  bounces={false}
                >
                  <RichText
                    text={getAnswerText(currentCard)}
                    style={styles.cardText}
                    color={isDarkMode ? '#FFFFFF' : colors.tint}
                    fontSize={20}
                    textAlign="center"
                    lineHeight={28}
                  />
                </ScrollView>
              </Animated.View>
            </TouchableOpacity>
            
            {/* Instruction Text */}
            <ThemedText style={[styles.instructionText, { 
              color: colors.text, 
              opacity: 0.7,
              textAlign: 'center',
              marginTop: 16,
              fontSize: 14,
            }]}>
              {isRevealed ? t('flashcards.tapToSeeQuestion') : t('flashcards.tapToSeeAnswer')}
            </ThemedText>
          </View>

        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  progressTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    marginTop: 20,
  },
  progressContainer: {
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
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.7,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    padding: 20,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardScrollView: {
    flex: 1,
    width: '100%',
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: '100%',
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
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
    fontSize: 16,
    fontWeight: '700',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContent: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 16,
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
    marginTop: 20,
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -40,
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
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  breadcrumbItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  resultCard: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
  },
  resultContent: {
    gap: 16,
    alignItems: 'center',
  },
  trophyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  scoreText: {
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  percentageContainer: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    width: '100%',
  },
  messageText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
    paddingBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  homeButton: {
    borderWidth: 2,
    // backgroundColor and borderColor set inline
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
}); 