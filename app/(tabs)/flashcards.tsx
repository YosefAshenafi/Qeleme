import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(true);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [hasAppliedPreSelection, setHasAppliedPreSelection] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Update the selected grade when flashcards data is loaded
  useEffect(() => {
    if (flashcardsData && flashcardsData.length > 0) {
      const grade = flashcardsData[0];
      if (grade && grade.name) {
        setSelectedGrade(grade.name);
        
        // Handle pre-selected subject from route parameters
        if (params.preSelectedSubject && !hasAppliedPreSelection) {
          console.log('Looking for subject:', params.preSelectedSubject);
          console.log('Available subjects:', grade.subjects?.map(s => s.name));
          
          // Try exact match first
          let subject = grade.subjects?.find(s => 
            s.name.toLowerCase() === (params.preSelectedSubject as string).toLowerCase()
          );
          
          // If not found, try partial match
          if (!subject) {
            console.log('Exact match not found, trying partial match...');
            subject = grade.subjects?.find(s => 
              s.name.toLowerCase().includes((params.preSelectedSubject as string).toLowerCase()) ||
              (params.preSelectedSubject as string).toLowerCase().includes(s.name.toLowerCase())
            );
          }
          
          console.log('Found subject:', subject);
          if (subject) {
            console.log('Setting selected subject to:', subject.id);
            setSelectedSubject(subject.id);
            setSelectedChapter(''); // Reset chapter when subject changes
            setHasAppliedPreSelection(true);
          } else {
            console.log('Subject not found, resetting selection');
            // Reset subject and chapter if pre-selected subject not found
            setSelectedSubject('');
            setSelectedChapter('');
            setHasAppliedPreSelection(true);
          }
        } else if (!params.preSelectedSubject) {
          // Reset subject and chapter when grade changes (no pre-selection)
          setSelectedSubject('');
          setSelectedChapter('');
        }
      }
    }
  }, [flashcardsData, params.preSelectedSubject, hasAppliedPreSelection]);

  // Reset chapter when subject changes
  useEffect(() => {
    if (selectedSubject) {
      setSelectedChapter('');
    }
  }, [selectedSubject]);

  // Reset pre-selection flag when parameters change
  useEffect(() => {
    setHasAppliedPreSelection(false);
  }, [params.preSelectedSubject]);

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
  const progress = currentFlashcards.length > 0 
    ? ((currentIndex + 1) / currentFlashcards.length) * 100 
    : 0;

  useEffect(() => {
    if (showFlashcards && selectedChapterData?.flashcards && selectedChapterData.flashcards.length > 0) {
      progressAnimation.value = withTiming((1 / selectedChapterData.flashcards.length) * 100);
    }
  }, [showFlashcards, selectedChapterData]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [0, 180]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);
    const shadowOffset = interpolate(revealAnimation.value, [0, 0.5, 1], [2, 20, 2]);
    
    return {
      transform: [
        { perspective: 2000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      shadowOpacity,
      shadowOffset: { width: 0, height: shadowOffset },
      shadowRadius: interpolate(revealAnimation.value, [0, 0.5, 1], [8, 24, 8]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(revealAnimation.value, [0, 1], [180, 360]);
    const scale = interpolate(revealAnimation.value, [0, 0.5, 1], [1, 1.1, 1]);
    const shadowOpacity = interpolate(revealAnimation.value, [0, 0.5, 1], [0.1, 0.5, 0.1]);
    const shadowOffset = interpolate(revealAnimation.value, [0, 0.5, 1], [2, 20, 2]);
    
    return {
      transform: [
        { perspective: 2000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      shadowOpacity,
      shadowOffset: { width: 0, height: shadowOffset },
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
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
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
                </ThemedText>
                <TouchableOpacity
                  style={[styles.formInput, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
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
                          }).map((subject: Subject) => (
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

              {/* Chapter Selection */}
              <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
                  {t('flashcards.chapter')}
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
                          }).map((chapter: Chapter) => (
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
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressTimeContainer}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.cardAlt }]}>
                <Animated.View style={[styles.progressFill, progressBarStyle, { backgroundColor: colors.tint }]} />
              </View>
              <View style={styles.progressLabels}>
                <View style={[styles.questionLabelContainer]}>
                  <ThemedText style={[styles.progressText, { color: colors.tint }]}>
                    {t('flashcards.cardProgress', { current: currentIndex + 1, total: currentFlashcards.length || 0 })}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardContainer}>
            <ThemedText style={[styles.instructionText, { color: colors.tint }]}>
              {t('flashcards.clickToReveal')}
            </ThemedText>
            <TouchableOpacity onPress={handleReveal} activeOpacity={0.9} style={styles.cardWrapper}>
              <Animated.View style={[styles.card, frontAnimatedStyle, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
                <RichText 
                  text={currentCard?.question || 'No question available'}
                  style={styles.cardText}
                  color={isDarkMode ? '#FFFFFF' : colors.tint}
                  fontSize={20}
                  textAlign="center"
                  lineHeight={28}
                />
              </Animated.View>
              <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
                <RichText 
                  text={currentCard?.answer || 'No answer available'}
                  style={styles.cardText}
                  color={isDarkMode ? '#FFFFFF' : colors.tint}
                  fontSize={20}
                  textAlign="center"
                  lineHeight={28}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={[styles.navigationContainer, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.prevButton,
              { borderColor: colors.border },
              currentIndex === 0 && styles.navButtonDisabled
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.tint} />
            <ThemedText style={[styles.prevButtonText, { color: colors.tint }]}>
              {t('flashcards.previous')}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, { backgroundColor: colors.tint }]}
            onPress={() => {
              if (currentFlashcards.length > 0 && currentIndex === currentFlashcards.length - 1) {
                // Reset everything when Finish is clicked
                setShowFlashcards(false);
                setSelectedSubject('');
                setSelectedChapter('');
                setCurrentIndex(0);
                setIsRevealed(false);
                setCurrentFlashcards([]);
                revealAnimation.value = withSpring(0, {
                  damping: 12,
                  stiffness: 80,
                  mass: 0.8,
                });
              } else {
                handleNext();
              }
            }}
            disabled={false}
          >
            <ThemedText style={[styles.nextButtonText, { color: '#fff' }]}>
              {currentFlashcards.length > 0 && currentIndex === currentFlashcards.length - 1 ? t('flashcards.finish') : t('flashcards.next')}
            </ThemedText>
            <IconSymbol name="chevron.right" size={24} color="#fff" />
          </TouchableOpacity>
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
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
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
    justifyContent: 'center',
    alignItems: 'center',
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
}); 