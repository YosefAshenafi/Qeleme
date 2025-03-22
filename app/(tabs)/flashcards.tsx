import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import flashcardData from '@/data/flashcardData.json';

interface Flashcard {
  id: number;
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

interface FlashcardData {
  subjects: Subject[];
}

const typedFlashcardData = flashcardData as FlashcardData;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function FlashcardsScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  
  const revealAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  const selectedSubjectData = typedFlashcardData.subjects.find((subject: Subject) => subject.id === selectedSubject);
  const selectedChapterData = selectedSubjectData?.chapters.find((chapter: Chapter) => chapter.id === selectedChapter);
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
        <Header title="Flash Cards" />
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.formTitle, { color: colors.tint }]}>Select Subject and Chapter</ThemedText>
            
            <ThemedView style={[styles.formContent, { backgroundColor: colors.background }]}>
              {/* Subject Selection */}
              <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.formLabel, { color: colors.tint }]}>Subject</ThemedText>
                <TouchableOpacity
                  style={[styles.formInput, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                  onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                >
                  <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                    {selectedSubject ? typedFlashcardData.subjects.find((s: Subject) => s.id === selectedSubject)?.name : 'Select a subject'}
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
                          {typedFlashcardData.subjects.map((subject: Subject) => (
                            <TouchableOpacity
                              key={subject.id}
                              style={[styles.modalItem, { borderBottomColor: colors.border }]}
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
                <ThemedText style={[styles.formLabel, { color: colors.tint }]}>Chapter</ThemedText>
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
                    {selectedChapter ? selectedSubjectData?.chapters.find((c: Chapter) => c.id === selectedChapter)?.name : 'Select a chapter'}
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
                              style={[styles.modalItem, { borderBottomColor: colors.border }]}
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

              {/* Start Flashcards Button */}
              <TouchableOpacity
                style={[
                  styles.startButton,
                  { backgroundColor: colors.tint },
                  (!selectedSubject || !selectedChapter) && {
                    backgroundColor: isDarkMode ? 'rgba(107, 84, 174, 0.3)' : 'rgba(107, 84, 174, 0.5)'
                  }
                ]}
                onPress={handleStartFlashcards}
                disabled={!selectedSubject || !selectedChapter}
              >
                <ThemedText style={[
                  styles.startButtonText,
                  (!selectedSubject || !selectedChapter) && {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)'
                  }
                ]}>Start Flashcards</ThemedText>
                <IconSymbol 
                  name="chevron.right" 
                  size={24} 
                  color={(!selectedSubject || !selectedChapter) 
                    ? (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)') 
                    : '#fff'
                  } 
                />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Flash Cards" />
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Breadcrumb Navigation */}
        <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={[styles.breadcrumbContainer, { backgroundColor: colors.cardAlt }]}>
            <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <ThemedText style={[styles.breadcrumbText, { color: colors.tint }]}>
                {selectedSubjectData?.name || 'Select Subject'}
              </ThemedText>
            </View>
            {selectedSubject && (
              <>
                <IconSymbol name="chevron.right" size={16} color={colors.tint} />
                <View style={[styles.breadcrumbItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <ThemedText style={[styles.breadcrumbText, { color: colors.tint }]}>
                    {selectedChapterData?.name || 'Select Chapter'}
                  </ThemedText>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <ThemedView style={styles.progressContainer}>
          <ThemedView style={[styles.progressBar, { backgroundColor: colors.cardAlt }]}>
            <Animated.View style={[styles.progressFill, progressBarStyle, { backgroundColor: colors.tint }]} />
          </ThemedView>
          <ThemedView style={styles.progressLabels}>
            <ThemedText style={[styles.progressText, { color: colors.tint }]}>
              Card {currentIndex + 1} of {selectedChapterData?.flashcards.length}
            </ThemedText>
            <ThemedText style={[styles.progressText, { color: colors.tint }]}>
              {Math.round(progress)}% completed
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Flashcard */}
        <ThemedView style={styles.cardContainer}>
          <TouchableOpacity onPress={handleReveal} activeOpacity={0.9}>
            <View style={styles.card}>
              <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.cardContent}>
                  <ThemedText style={[styles.questionText, { color: colors.text }]}>{currentCard?.question}</ThemedText>
                  <ThemedText style={[styles.revealHint, { color: colors.text }]}>Tap to reveal answer</ThemedText>
                </View>
              </Animated.View>
              <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.cardContent}>
                  <ThemedText style={[styles.answerText, { color: colors.text }]}>{currentCard?.answer}</ThemedText>
                  <ThemedText style={[styles.revealHint, { color: colors.text }]}>Tap to see question</ThemedText>
                </View>
              </Animated.View>
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* Navigation Buttons */}
        <ThemedView style={styles.navigationContainer}>
          <ThemedView style={styles.navButtonContainer}>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton, { borderColor: colors.border }]}
                onPress={handlePrevious}
              >
                <IconSymbol name="chevron.right" size={24} color={colors.tint} style={{ transform: [{ rotate: '180deg' }] }} />
                <ThemedText style={[styles.prevButtonText, { color: colors.tint }]}>Previous Card</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
          <ThemedView style={styles.navButtonContainer}>
            {currentIndex < (selectedChapterData?.flashcards.length || 0) - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton, { backgroundColor: colors.tint }]}
                onPress={handleNext}
              >
                <ThemedText style={styles.nextButtonText}>Next Card</ThemedText>
                <IconSymbol name="chevron.right" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.finishButton, { backgroundColor: colors.tint }]}
                onPress={() => {
                  setShowFlashcards(false);
                  setSelectedSubject('');
                  setSelectedChapter('');
                }}
              >
                <IconSymbol name="trophy.fill" size={24} color="#fff" />
                <ThemedText style={styles.finishButtonText}>Finish</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
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
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B54AE',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#6B54AE',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 280,
    position: 'relative',
    marginVertical: 20,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(107, 84, 174, 0.1)',
    boxShadow: '10px 10px 5px 0px rgba(170, 170, 170, 0.75)',
  },
  cardFront: {
    borderWidth: 0.5,
    borderColor: '#6B54AE',
    backgroundColor: '#fff',
  },
  cardBack: {
    borderWidth: 0.5,
    borderColor: '#6B54AE',
    backgroundColor: '#fff',
    transform: [{ rotateY: '180deg' }],
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  revealHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    width: CARD_WIDTH,
  },
  navButtonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#6B54AE',
  },
  prevButtonText: {
    color: '#6B54AE',
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#6B54AE',
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
    color: '#6B54AE',
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
    color: '#6B54AE',
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formInputDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  formInputText: {
    fontSize: 16,
    color: '#333333',
  },
  formInputTextDisabled: {
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: '#fff',
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
    borderBottomColor: '#E0E0E0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333333',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6B54AE',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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