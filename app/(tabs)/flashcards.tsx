import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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
import flashcardData from '@/data/flashcardData.json';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Chapter {
  id: string;
  name: string;
  flashcards: Flashcard[];
}

interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

interface Grade {
  name: string;
  subjects: Subject[];
}

interface FlashcardData {
  grades: {
    [key: string]: Grade;
  };
}

interface RecentActivity {
  type: string;
  grade: string;
  subject: string;
  chapter: string;
  timestamp: number;
  details: string;
}

const typedFlashcardData = flashcardData as FlashcardData;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function FlashcardsScreen() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const colors = getColors(isDarkMode);
  
  const [selectedGrade] = useState<string>('grade-12');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  
  const revealAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    // Check phone number when component mounts
    const checkPhoneNumber = async () => {
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      setUserPhoneNumber(phoneNumber);
      
      // If phone number starts with 911, set grade to 9
      if (phoneNumber?.startsWith('+251911')) {
        setSelectedGrade('grade-9');
      }
    };
    checkPhoneNumber();
  }, []);

  const selectedGradeData = selectedGrade ? typedFlashcardData.grades[selectedGrade] : null;
  const selectedSubjectData = selectedSubject && selectedGradeData
    ? selectedGradeData.subjects.find(s => s.id === selectedSubject)
    : null;
  const selectedChapterData = selectedChapter && selectedSubjectData
    ? selectedSubjectData.chapters.find(c => c.id === selectedChapter)
    : null;
  const currentCard = selectedChapterData?.flashcards[currentIndex];
  const progress = ((currentIndex + 1) / (selectedChapterData?.flashcards.length || 0)) * 100;

  useEffect(() => {
    if (showFlashcards && selectedChapterData?.flashcards.length) {
      progressAnimation.value = withTiming((1 / selectedChapterData.flashcards.length) * 100);
    }
  }, [showFlashcards]);

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
    if (currentIndex < (selectedChapterData?.flashcards.length || 0) - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      revealAnimation.value = withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      });
      progressAnimation.value = withTiming(((currentIndex + 2) / (selectedChapterData?.flashcards.length || 0)) * 100);
      
      // Track activity when reaching the end
      if (currentIndex + 1 === (selectedChapterData?.flashcards.length || 0) - 1) {
        const trackActivity = async () => {
          try {
            const activity: RecentActivity = {
              type: 'flashcard',
              grade: selectedGrade,
              subject: selectedSubjectData?.name || '',
              chapter: selectedChapterData?.name || '',
              timestamp: Date.now(),
              details: `Reviewed ${selectedChapterData?.flashcards.length || 0} flashcards`
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
      progressAnimation.value = withTiming((currentIndex / (selectedChapterData?.flashcards.length || 0)) * 100);
    }
  };

  const handleStartFlashcards = () => {
    if (!selectedSubject || !selectedChapter) return;
    setShowFlashcards(true);
    setCurrentIndex(0);
    setIsRevealed(false);
    revealAnimation.value = withSpring(0, {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    });
  };

  if (!showFlashcards) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('flashcards.title')} />
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.formTitle, { color: colors.tint }]}>
              {t('flashcards.selectSubjectAndChapter')}
            </ThemedText>
            
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
                    {selectedSubject ? selectedGradeData?.subjects.find((s: Subject) => s.id === selectedSubject)?.name : t('flashcards.selectSubject')}
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
                    {selectedChapter ? selectedSubjectData?.chapters.find((c: Chapter) => c.id === selectedChapter)?.name : t('flashcards.selectChapter')}
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title={t('flashcards.title')} />
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.progressTimeContainer}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.cardAlt }]}>
              <Animated.View style={[styles.progressFill, progressBarStyle, { backgroundColor: colors.tint }]} />
            </View>
            <View style={styles.progressLabels}>
              <View style={[styles.questionLabelContainer]}>
                <ThemedText style={[styles.progressText, { color: colors.tint }]}>
                  {t('flashcards.cardProgress', { current: currentIndex + 1, total: selectedChapterData?.flashcards.length || 0 })}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={handleReveal} activeOpacity={0.9} style={styles.cardWrapper}>
            <Animated.View style={[styles.card, frontAnimatedStyle, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
              <ThemedText style={[styles.cardText, { color: colors.text }]}>{currentCard?.question}</ThemedText>
            </Animated.View>
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
              <ThemedText style={[styles.cardText, { color: colors.text }]}>{currentCard?.answer}</ThemedText>
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
              if (currentIndex === (selectedChapterData?.flashcards.length || 0) - 1) {
                // Reset everything when Finish is clicked
                setShowFlashcards(false);
                setSelectedSubject('');
                setSelectedChapter('');
                setCurrentIndex(0);
                setIsRevealed(false);
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
              {currentIndex === (selectedChapterData?.flashcards.length || 0) - 1 ? t('flashcards.finish') : t('flashcards.next')}
            </ThemedText>
            <IconSymbol name="chevron.right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
    padding: 20,
    backgroundColor: '#fff',
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
    flex: 1,
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
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardText: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
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
    fontWeight: '700',
  },
  nextButtonText: {
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
    marginTop: -70,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginLeft: -20,
    gap: 8,
  },
  breadcrumbItem: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  breadcrumbText: {
    color: '#6B54AE',
    fontSize: 14,
    fontWeight: '600',
  },
}); 